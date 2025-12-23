/**
 * API Client for Scene AI Services
 * 
 * Provides functions to call serverless API endpoints
 * for image classification, floor plan parsing, and scene commands.
 * 
 * @security All API calls go through serverless functions.
 * No API keys are exposed to the client.
 */

const API_BASE = '/api';

/**
 * Classify an uploaded image
 * @param {string} imageBase64 - Base64 encoded image (with or without data: prefix)
 * @returns {Promise<{type: string, confidence: number, details: string}>}
 */
export async function classifyImage(imageBase64) {
    const response = await fetch(`${API_BASE}/classify-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Classification failed');
    }

    return response.json();
}

/**
 * Parse a floor plan image into Scene DSL
 * @param {string} imageBase64 - Base64 encoded floor plan image
 * @returns {Promise<{preview: object, sceneDsl: object}>}
 */
export async function parseFloorplan(imageBase64) {
    const response = await fetch(`${API_BASE}/parse-floorplan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Floor plan parsing failed');
    }

    return response.json();
}

/**
 * Execute a natural language command on the scene
 * @param {string} command - Natural language command
 * @param {object} currentScene - Current scene state
 * @param {string} [referenceImage] - Optional reference image (base64)
 * @returns {Promise<{explanation: string, operations: array}>}
 */
export async function executeSceneCommand(command, currentScene, referenceImage = null) {
    const body = { command, currentScene };
    if (referenceImage) {
        body.referenceImage = referenceImage;
    }

    const response = await fetch(`${API_BASE}/scene-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Command execution failed');
    }

    return response.json();
}

/**
 * Apply operations to the scene store
 * @param {array} operations - Array of scene operations
 * @param {object} store - Zustand store with scene actions
 */
export function applyOperations(operations, store) {
    for (const op of operations) {
        switch (op.action) {
            case 'add_object':
                store.addObject({
                    type: op.type,
                    position: op.position,
                    rotation: op.rotation || 0
                });
                break;
            case 'remove_object':
                store.removeObject(op.objectId);
                break;
            case 'update_material':
                store.updateMaterial(op.surfaceId, op.material);
                break;
            case 'add_wall':
                store.addWall({
                    from: op.from,
                    to: op.to,
                    height: op.height || 9,
                    thickness: op.thickness || 0.5
                });
                break;
            case 'add_room':
                store.addRoom({
                    name: op.name,
                    bounds: op.bounds,
                    height: op.height || 9
                });
                break;
            default:
                console.warn('Unknown operation:', op.action);
        }
    }
}
