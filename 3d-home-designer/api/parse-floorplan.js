/**
 * Floor Plan Parsing API
 *
 * Converts a floor plan image into Scene DSL format:
 * - Extracts rooms with dimensions
 * - Identifies walls and their positions
 * - Detects doors and windows
 *
 * @security
 * - API key stored in environment variable only
 * - TODO: Add rate limiting before production
 * - TODO: Add input validation
 */

import OpenAI from "openai";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.OPENAI_API_KEY)
    return Response.json(
      {
        message: "AI is not connected. Configure a server-side OpenAI API key.",
      },
      { status: 503 },
    );

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { image } = await req.json();

    if (
      typeof image !== "string" ||
      image.length > 1500000 ||
      !/^data:image\/(png|jpeg|webp);base64,/.test(image)
    ) {
      return new Response(
        JSON.stringify({
          message: "Provide a PNG, JPEG or WebP data URL under 1 MB",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Use GPT-4o for accurate floor plan parsing
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a floor plan analyzer that converts 2D floor plans into 3D scene data.

Analyze the floor plan image and extract:
1. All rooms with their names and approximate dimensions
2. Wall positions forming the room boundaries
3. Door and window locations

Output a JSON object with:
- preview: Quick summary for user confirmation
- sceneDsl: Structured data for 3D rendering

For coordinates, use a normalized grid where 1 unit = 1 foot.
Place the floor plan with bottom-left corner at origin (0,0).
Default wall height is 9 feet, thickness is 0.5 feet.

Be thorough but approximate - we need a buildable 3D model, not exact CAD measurements.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this floor plan and generate the Scene DSL:",
            },
            {
              type: "image_url",
              image_url: {
                url: image.startsWith("data:")
                  ? image
                  : `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    if (!result.sceneDsl?.rooms?.length || !result.sceneDsl?.walls?.length) {
      return Response.json(
        {
          message: "No usable geometry was detected. Try a clearer floor plan.",
        },
        { status: 422 },
      );
    }

    // Add default properties if missing
    result.sceneDsl.version = result.sceneDsl.version || "1.0";
    result.sceneDsl.objects = result.sceneDsl.objects || [];
    result.sceneDsl.materials = result.sceneDsl.materials || {};

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Floor plan parsing error:", error);
    return new Response(
      JSON.stringify({
        error: "Parsing failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
