// You must install the Google Generative AI SDK in your backend directory:
// npm install @google/generative-ai
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google AI client with your API key from environment variables.
// Make sure to set GEMINI_API_KEY in your .env file or server environment.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Handles requests from the frontend, sends them to the Gemini API,
 * and proxies the response back.
 */
exports.proxyRequest = async (req, res) => {
    try {
        // The frontend now sends a structured payload, not just a simple prompt.
        const { prompt, history, systemInstruction } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Use a stable and widely available model that supports system instructions.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction || "You are a helpful assistant." // Use provided system instruction or a default
        });

        // If history is provided, start a chat session for context.
        if (history && history.length > 0) {
            const chat = model.startChat({ history });
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();
            return res.status(200).json(text);
        }

        // Otherwise, make a simple, single-turn request.
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json(text);

    } catch (error) {
        console.error('Error in Gemini proxy controller:', error);
        res.status(500).json({ message: 'Failed to get response from AI service' });
    }
};