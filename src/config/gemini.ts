/**
 * ============================================================================
 * GEMINI API CONFIGURATION
 * ============================================================================
 * 
 * This file contains the configuration for Google's Gemini AI model integration.
 * 
 * IMPORTANT SECURITY NOTE:
 * - The API key should ALWAYS be set via environment variable in production
 * - The fallback API key is for development/testing only
 * - Never commit real API keys to version control
 * - Use environment variables: VITE_GEMINI_API_KEY
 * 
 * Configuration includes:
 * - API Key: Used to authenticate with Google's Gemini API
 * - Model: The specific Gemini model to use (gemini-2.0-flash-exp)
 * 
 * The model 'gemini-2.0-flash-exp' is Google's latest experimental Flash model
 * that provides fast response times and high-quality analysis.
 * ============================================================================
 */

/**
 * Gemini API Configuration Object
 * 
 * This configuration object is used by the GeminiService to initialize
 * the connection to Google's Gemini AI API.
 * 
 * @constant {Object} GEMINI_CONFIG
 * @property {string} apiKey - Gemini API key (from env variable or fallback for dev)
 * @property {string} model - Model identifier (gemini-2.0-flash-exp)
 * 
 * @example
 * // In production, set environment variable:
 * // VITE_GEMINI_API_KEY=your_actual_api_key_here
 * 
 * // The service will automatically use the env variable if available
 * import { geminiService } from '@/services/geminiService';
 * 
 * @note In production, always use environment variables instead of hardcoding API keys
 * @warning The fallback API key is for development only. Never use in production.
 */
export const GEMINI_CONFIG = {
  // API key from environment variable, with fallback for development
  // In production, VITE_GEMINI_API_KEY should always be set
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBZfgYw-PMFpEQeSLaWUIYyImd3ZD4lqco',
  // Using Gemini 2.0 Flash experimental model (latest available)
  // This model provides fast response times and high-quality analysis
  model: 'gemini-2.0-flash-exp', // Using Gemini 2.0 Flash (latest available)
};

