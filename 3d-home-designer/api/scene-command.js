/**
 * Scene Command API
 *
 * Processes natural language commands to modify the 3D scene:
 * - Add/remove furniture
 * - Change materials/colors
 * - Modify layout
 *
 * @security
 * - API key stored in environment variable only
 * - TODO: Add rate limiting before production
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
    const { command, currentScene, referenceImage } = await req.json();

    if (
      typeof command !== "string" ||
      !command.trim() ||
      command.length > 4000
    ) {
      return new Response(
        JSON.stringify({
          message: "Provide a command between 1 and 4000 characters",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Build messages array
    const messages = [
      {
        role: "system",
        content: `You are a 3D scene editor for a home design application.

Given the current scene state and a user command, generate operations to modify the scene.

All scene positions and dimensions are in METERS. Do not change units. Only propose supported operations.

Available operations:
- add_object: { action: "add_object", type: string, position: [x, y, z], rotation: number }
- remove_object: { action: "remove_object", objectId: string }
- update_material: { action: "update_material", surfaceId: string, material: { type: string, color?: string, texture?: string } }

Furniture types available: sofa, armchair, dining_chair, coffee_table, dining_table, desk, bookshelf, cabinet, queen_bed, single_bed

Material types: paint, wood, tile, carpet, wallpaper

Respond with JSON:
{
  "explanation": "Brief description of what will change",
  "operations": [array of operations]
}`,
      },
      {
        role: "user",
        content: [],
      },
    ];

    // Add current scene context
    messages[1].content.push({
      type: "text",
      text: `Current scene:\n${JSON.stringify(currentScene, null, 2)}\n\nCommand: ${command}`,
    });

    // Add reference image if provided
    if (referenceImage) {
      messages[1].content.push({
        type: "image_url",
        image_url: {
          url: referenceImage.startsWith("data:")
            ? referenceImage
            : `data:image/jpeg;base64,${referenceImage}`,
        },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Scene command error:", error);
    return new Response(
      JSON.stringify({
        error: "Command processing failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
