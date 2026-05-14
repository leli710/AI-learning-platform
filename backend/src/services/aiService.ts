import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateLearningPlan = async (topic: string) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", 
            messages: [
                {
                    role: "system",
                    content: `You are an expert teacher. 
                              Create a structured 3-step learning plan for the given topic. 
                              Return a JSON object with exactly three keys: step1, step2, and step3.
                              Each value should be a string containing clear learning instructions.`
                },
                {
                    role: "user",
                    content: `Create a learning plan for the following topic: ${topic}`
                }
            ],
            response_format: { type: "json_object" }
        });

      return response.choices[0].message.content;
    } catch (error: any) {
        console.error("OpenAI Service Error:", error.message);
        throw error;
    }
};