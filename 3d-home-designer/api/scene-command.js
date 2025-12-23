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

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { command, currentScene, referenceImage } = await req.json();

        if (!command) {
            return new Response(JSON.stringify({ error: 'No command provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Build messages array
        const messages = [
            {
                role: 'system',
                content: `You are a 3D scene editor for a home design application.

Given the current scene state and a user command, generate operations to modify the scene.

Available operations:
- add_object: { action: "add_object", type: string, position: [x, y, z], rotation: number }
- remove_object: { action: "remove_object", objectId: string }
- update_material: { action: "update_material", surfaceId: string, material: { type: string, color?: string, texture?: string } }
- add_wall: { action: "add_wall", from: [x, z], to: [x, z], height: number }
- add_room: { action: "add_room", name: string, bounds: [[x1, z1], [x2, z2]], height: number }

Furniture types available: sofa, armchair, dining_chair, coffee_table, dining_table, desk, bookshelf, cabinet, queen_bed, single_bed

Material types: paint, wood, tile, carpet, wallpaper

Respond with JSON:
{
  "explanation": "Brief description of what will change",
  "operations": [array of operations]
}`
            },
            {
                role: 'user',
                content: []
            }
        ];

        // Add current scene context
        messages[1].content.push({
            type: 'text',
            text: `Current scene:\n${JSON.stringify(currentScene, null, 2)}\n\nCommand: ${command}`
        });

        // Add reference image if provided
        if (referenceImage) {
            messages[1].content.push({
                type: 'image_url',
                image_url: {
                    url: referenceImage.startsWith('data:') ? referenceImage : `data:image/jpeg;base64,${referenceImage}`
                }
            });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            max_tokens: 1500,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Scene command error:', error);
        return new Response(JSON.stringify({
            error: 'Command processing failed',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
