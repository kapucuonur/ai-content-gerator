import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// ✅ CORRECTED MODEL NAMES
const MODELS = [
  'gemini-2.0-flash',           // Latest stable flash
  'gemini-1.5-flash-latest',    // Fallback flash
  'gemini-1.5-pro-latest',      // Pro fallback
  'gemini-pro',                 // Legacy fallback
];

const MAX_RETRIES = 3;
const BASE_DELAY = 1500; // Slightly longer initial delay

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

const isModelNotFoundError = (error) => {
  const message = error.message || '';
  return message.includes('404') || message.includes('not found');
};

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

  for (const modelName of MODELS) {
    console.log(`🔄 Trying model: ${modelName}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;

        console.log(`✅ Success with ${modelName} on attempt ${attempt}`);
        return response.text();

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt}/${MAX_RETRIES} failed for ${modelName}:`, error.message);

        // If model not found, skip to next model immediately (no retry)
        if (isModelNotFoundError(error)) {
          console.log(`🚫 Model ${modelName} not available, trying next...`);
          break;
        }

        // If retryable and attempts left, wait and retry
        if (isRetryableError(error) && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue;
        }

        // Otherwise, try next model
        break;
      }
    }
  }

  console.error('❌ All models failed:', lastError);

  if (isRetryableError(lastError)) {
    throw new Error('All AI models are currently busy. Please wait a minute and try again.');
  }

  if (isModelNotFoundError(lastError)) {
    throw new Error('No available AI models found. Please check your API key permissions.');
  }

  throw new Error('Failed to generate content. Please try again.');
};