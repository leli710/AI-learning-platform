import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export const generateAIResponse = async (prompt: string): Promise<string> => {
    if (!openai) {
        console.log('OpenAI API key missing, using fallback...');
        return getFallbackResponse(prompt);
    }
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            
        });
        return response.choices[0]?.message?.content || 'No response from AI.';
    } catch (error: any) {
        console.error('OpenAI API Error:', error.message);
        if (error.status === 403 || error.status === 429) {
            console.log('OpenAI access denied or quota exceeded, using fallback...');
            return getFallbackResponse(prompt);
        }
        throw error;
    }
};

const getFallbackResponse = (prompt: string): string => {
    return `# Lesson: ${prompt}\n\nThis is a simulated lesson.\n\nTo receive live AI responses, please ensure your OpenAI API key is active and has a valid balance (minimum $5 loaded in OpenAI Billing).`;
};
