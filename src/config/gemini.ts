// Gemini API Configuration
// In production, use environment variables instead of hardcoding
export const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBZfgYw-PMFpEQeSLaWUIYyImd3ZD4lqco',
  model: 'gemini-2.0-flash-exp', // Using Gemini 2.0 Flash (latest available)
};

