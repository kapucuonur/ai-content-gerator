import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export const generateContent = async ({ prompt, tone, length }) => {
  if (!API_KEY) {
    throw new Error('API Key is missing. Please check your .env file.');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Construct a more structured prompt
  const fullPrompt = `
    Write a ${length.toLowerCase()} piece of content with a ${tone.toLowerCase()} tone.
    Topic: ${prompt}
    
    Please provide ONLY the content, no meta-commentary.
  `;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
};
