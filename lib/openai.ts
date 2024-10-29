import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getCourseRecommendations(messages: Message[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful academic advisor for an MBA program. Based on the student's responses, recommend specific courses from our catalog. Format your response with course codes (e.g., MBA501) and brief explanations."
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get course recommendations');
  }
}