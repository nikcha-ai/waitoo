// This file contains a Netlify serverless function to securely call the Gemini API.
// It acts as a proxy, so your API key is never exposed on the front-end.

// IMPORTANT: This is a simplified example. In a real application, you would
// configure your API key as a Netlify Environment Variable for maximum security.
// For this example, we'll use a placeholder.

const API_KEY = process.env.GEMINI_API_KEY || ""; // Placeholder for your API key

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        // Parse the request body to get the prompt from the front-end
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: 'Prompt is required.',
            };
        }

        // Construct the payload for the Gemini API call
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
        };

        // Make the call to the Gemini API using gemini-2.5-flash-preview-05-20
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Handle errors from the API
        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Gemini API Error:", errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to get a response from the AI model.' }),
            };
        }

        // Parse the response from the Gemini API
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";

        // Return the generated text back to the front-end
        return {
            statusCode: 200,
            body: JSON.stringify({ text }),
        };

    } catch (error) {
        console.error("Internal Server Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
