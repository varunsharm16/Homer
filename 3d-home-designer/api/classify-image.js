/**
 * Image Classification API
 * 
 * Classifies uploaded images into categories:
 * - floor_plan: Architectural floor plans
 * - furniture: Photos of furniture items
 * - material: Textures, materials, swatches
 * - room_photo: Photos of rooms/interiors
 * - other: Unrecognized
 * 
 * @security
 * - API key stored in environment variable only
 * - TODO: Add rate limiting before production
 * - TODO: Add input validation for file size/type
 */

import OpenAI from 'openai';

// Initialize OpenAI client (API key from env)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    // Only allow POST
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { image } = await req.json();

        // TODO: Validate image size and format
        if (!image) {
            return new Response(JSON.stringify({ error: 'No image provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Use GPT-4o-mini for fast, cheap classification
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an image classifier for a home design application. 
Classify the image into exactly one category:
- floor_plan: Architectural floor plans, blueprints, 2D layouts
- furniture: Photos of furniture items (sofas, tables, chairs)
- material: Textures, materials, color swatches, fabrics
- room_photo: Photos of actual rooms or interior spaces
- other: Anything else

Respond with JSON only: {"type": "<category>", "confidence": <0.0-1.0>, "details": "<brief description>"}`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 150,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Classification error:', error);
        return new Response(JSON.stringify({
            error: 'Classification failed',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
