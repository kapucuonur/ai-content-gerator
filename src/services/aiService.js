import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Model configuration with fallbacks
const MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

// Helper: Sleep function for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Check if error is retryable (503, 429, etc.)
const isRetryableError = (error) => {
  const message = error.message || '';
  return (
    message.includes('503') ||
    message.includes('overloaded') ||
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('RESOURCE_EXHAUSTED')
  );
};

// Main generation function with retry logic
export const generateContent = async ({ prompt, tone, length }) => {
  if (!API_KEY) {
    throw new Error('API Key is missing. Please check your .env file.');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  const fullPrompt = `
    Write a ${length.toLowerCase()} piece of content with a ${tone.toLowerCase()} tone.
    Topic: ${prompt}
    
    Please provide ONLY the content, no meta-commentary.
  `;

  let lastError;

  // Try each model
  for (const modelName of MODELS) {
    console.log(`Trying model: ${modelName}`);
    
    // Retry logic for each model
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        
        console.log(`✅ Success with ${modelName} on attempt ${attempt}`);
        return response.text();

      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt}/${MAX_RETRIES} failed for ${modelName}:`, error.message);

        // If it's a retryable error and we have attempts left
        if (isRetryableError(error) && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue;
        }

        // If not retryable or out of retries, try next model
        break;
      }
    }
    
    console.log(`❌ All retries failed for ${modelName}, trying next model...`);
  }

  // All models and retries failed
  console.error('All models failed:', lastError);
  
  // Return user-friendly error message
  if (isRetryableError(lastError)) {
    throw new Error('All AI models are currently busy. Please wait a moment and try again.');
  }
  
  throw new Error('Failed to generate content. Please try again.');
};