import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// ✅ UPDATED MODEL NAMES (based on your available models)
const MODELS = [
  'gemini-2.5-flash',           // Latest and best
  'gemini-2.0-flash',           // Stable fallback
  'gemini-flash-latest',        // Auto-updates to latest
  'gemini-2.0-flash-lite',      // Lighter, faster fallback
];

const MAX_RETRIES = 3;
const BASE_DELAY = 1500;

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

const isAPIKeyError = (error) => {
  const message = error.message || '';
  return message.includes('API key expired') || message.includes('API_KEY_INVALID');
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

        // API key expired - no point retrying other models
        if (isAPIKeyError(error)) {
          throw new Error('⚠️ Your API key has expired. Get a new one at: https://aistudio.google.com/app/apikey');
        }

        // Model not found - skip to next model
        if (isModelNotFoundError(error)) {
          console.log(`🚫 Model ${modelName} not available, trying next...`);
          break;
        }

        // Retryable error - wait and retry
        if (isRetryableError(error) && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue;
        }

        break;
      }
    }
  }

  console.error('❌ All models failed:', lastError);

  if (isRetryableError(lastError)) {
    throw new Error('All AI models are currently busy. Please wait a minute and try again.');
  }

  throw new Error('Failed to generate content. Please try again.');
};