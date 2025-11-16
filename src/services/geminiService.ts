/**
 * ============================================================================
 * GEMINI AI SERVICE
 * ============================================================================
 * 
 * This service handles all interactions with Google's Gemini AI model.
 * It provides methods for analyzing emails, categorizing content,
 * extracting key information, and generating summaries.
 * 
 * The service uses the Gemini 2.0 Flash model for fast and efficient
 * email analysis with high accuracy.
 * ============================================================================
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '@/config/gemini';
import type { Email, EmailAnalysis, EmailCategory, EmailPriority } from '@/types/email';

/**
 * Service class for interacting with Google's Gemini AI model.
 * 
 * This class encapsulates all AI-related functionality for email analysis.
 * It handles:
 * - Single email analysis
 * - Batch email processing with rate limiting
 * - Response parsing and validation
 * - Error handling and fallback behavior
 * 
 * The service is implemented as a singleton pattern, with a single
 * instance exported for use throughout the application.
 * 
 * @class GeminiService
 */
class GeminiService {
  /** Google Generative AI client instance */
  private genAI: GoogleGenerativeAI;
  /** Configured Gemini model instance for content generation */
  private model: any;

  /**
   * Initializes the Gemini AI client with the configured API key and model.
   * 
   * This constructor sets up the connection to Google's Gemini API using
   * the configuration from GEMINI_CONFIG. It creates both the client
   * instance and the specific model instance that will be used for
   * all subsequent AI operations.
   * 
   * The model is configured to use 'gemini-2.0-flash-exp' which provides
   * fast response times and high-quality analysis.
   */
  constructor() {
    // Initialize the Google Generative AI client with the API key
    this.genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
    // Get the specific model instance (Gemini 2.0 Flash)
    this.model = this.genAI.getGenerativeModel({ model: GEMINI_CONFIG.model });
  }

  /**
   * Analyzes a single email and returns structured analysis data.
   * 
   * This method takes an email object, sends it to the Gemini AI model
   * for analysis, and returns a structured EmailAnalysis object containing
   * categorization, priority, sentiment, and other insights.
   * 
   * The analysis process:
   * 1. Builds a detailed prompt with email content and analysis instructions
   * 2. Sends the prompt to the Gemini AI model
   * 3. Receives the AI response
   * 4. Parses and validates the response into a structured format
   * 5. Returns the analysis result
   * 
   * @param {Email} email - The email object to analyze (must have from, subject, body)
   * @returns {Promise<EmailAnalysis>} Promise resolving to email analysis results
   * @throws {Error} If the AI analysis fails (network error, API error, etc.)
   * 
   * @example
   * const analysis = await geminiService.analyzeEmail(email);
   * console.log(analysis.category); // 'work', 'personal', etc.
   * console.log(analysis.priority); // 'high', 'medium', etc.
   */
  async analyzeEmail(email: Email): Promise<EmailAnalysis> {
    // Build the analysis prompt with email details and instructions
    const prompt = this.buildAnalysisPrompt(email);
    
    try {
      // Send the prompt to Gemini AI and wait for response
      const result = await this.model.generateContent(prompt);
      // Extract the response object
      const response = await result.response;
      // Get the text content from the response
      const text = response.text();
      
      // Parse the text response into a structured EmailAnalysis object
      // This handles JSON parsing, validation, and error cases
      return this.parseAnalysisResponse(text);
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error analyzing email with Gemini:', error);
      // Re-throw the error so the caller can handle it appropriately
      throw error;
    }
  }

  /**
   * Analyzes multiple emails in batches to avoid rate limiting.
   * 
   * This method processes multiple emails efficiently by:
   * 1. Splitting emails into batches (5 emails per batch)
   * 2. Processing each batch in parallel for speed
   * 3. Adding delays between batches to respect API rate limits
   * 4. Handling individual email failures gracefully
   * 5. Returning a map of email IDs to their analysis results
   * 
   * The batch processing approach balances performance with API constraints.
   * If one email fails to analyze, it doesn't stop the entire batch.
   * 
   * @param {Email[]} emails - Array of email objects to analyze
   * @returns {Promise<Map<string, EmailAnalysis>>} Map where keys are email IDs
   *          and values are the corresponding EmailAnalysis objects
   * 
   * @example
   * const emails = [email1, email2, email3];
   * const results = await geminiService.analyzeBatchEmails(emails);
   * const email1Analysis = results.get(email1.id);
   */
  async analyzeBatchEmails(emails: Email[]): Promise<Map<string, EmailAnalysis>> {
    // Create a map to store results: email ID -> analysis result
    const analysisMap = new Map<string, EmailAnalysis>();
    
    // ========================================================================
    // BATCH PROCESSING WITH RATE LIMITING
    // ========================================================================
    // Process emails in batches to avoid hitting API rate limits
    // Batch size of 5 balances performance and API rate limits
    // This prevents overwhelming the API while still processing efficiently
    const batchSize = 5;
    
    // Process emails in batches
    for (let i = 0; i < emails.length; i += batchSize) {
      // Extract the current batch of emails (up to batchSize emails)
      const batch = emails.slice(i, i + batchSize);
      
      // Process all emails in the current batch in parallel
      // Each email analysis is independent, so parallel processing is safe
      const promises = batch.map(email => 
        // Analyze the email
        this.analyzeEmail(email)
          // On success, return the email ID and analysis result
          .then(analysis => ({ emailId: email.id, analysis }))
          // On error, log it and return null (don't fail the entire batch)
          .catch(error => {
            console.error(`Failed to analyze email ${email.id}:`, error);
            return null; // Return null to indicate failure, but continue processing
          })
      );
      
      // Wait for all emails in the current batch to complete
      // This waits for all parallel requests to finish before moving to next batch
      const results = await Promise.all(promises);
      
      // Add successful results to the map
      // Filter out null results (failed analyses)
      results.forEach(result => {
        if (result) {
          // Store the analysis result with the email ID as the key
          analysisMap.set(result.emailId, result.analysis);
        }
      });
      
      // ====================================================================
      // RATE LIMITING DELAY
      // ====================================================================
      // Add a delay between batches to avoid hitting API rate limits
      // 500ms delay provides a good balance between speed and API limits
      // Only add delay if there are more batches to process
      if (i + batchSize < emails.length) {
        // Wait 500ms before processing the next batch
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Return the complete map of all successful analyses
    return analysisMap;
  }

  /**
   * Builds the analysis prompt for the Gemini AI model.
   * 
   * This method constructs a detailed prompt that instructs the AI model
   * on how to analyze the email. The prompt includes:
   * - The email content (from, subject, body)
   * - Instructions for the analysis format (JSON)
   * - Guidelines for categorization
   * - Guidelines for priority assignment
   * 
   * The prompt is carefully crafted to ensure consistent, structured
   * responses from the AI model that can be easily parsed.
   * 
   * @private
   * @param {Email} email - The email object to build the prompt for
   * @returns {string} The complete formatted prompt string to send to Gemini
   */
  private buildAnalysisPrompt(email: Email): string {
    return `You are an advanced email analysis assistant. Analyze the following email and provide a comprehensive assessment.

Email Details:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Please provide your analysis in the following JSON format (return ONLY valid JSON, no markdown formatting):
{
  "summary": "A concise 1-2 sentence summary of the email",
  "category": "one of: urgent, important, work, personal, promotions, spam, newsletter, social, uncategorized",
  "priority": "one of: critical, high, medium, low, trash",
  "sentiment": "one of: positive, neutral, negative",
  "actionRequired": true or false,
  "keyPoints": ["key point 1", "key point 2", "..."],
  "suggestedResponse": "A brief suggested response if action is required, or empty string if not",
  "confidence": 0.95
}

Category Guidelines:
- "urgent": Time-sensitive emails requiring immediate attention (deadlines, emergencies)
- "important": Significant emails from important contacts or about important topics
- "work": Work-related correspondence, meetings, projects
- "personal": Personal emails from friends, family
- "promotions": Marketing emails, sales, advertisements, promotional content
- "spam": Unwanted emails, suspicious content, phishing attempts
- "newsletter": Subscribed newsletters, updates, digests
- "social": Social media notifications, social networking
- "uncategorized": Doesn't fit other categories

Priority Guidelines:
- "critical": Urgent + Important (requires immediate action)
- "high": Important emails that need attention soon
- "medium": Regular emails that can be addressed in normal workflow
- "low": FYI emails, newsletters, low-priority notifications
- "trash": Spam, promotions, or non-essential content that can be archived/deleted

Analyze carefully and provide accurate categorization.`;
  }

  /**
   * Parses the AI response text into a structured EmailAnalysis object.
   * 
   * This method handles the raw text response from the Gemini AI model
   * and converts it into a structured, validated EmailAnalysis object.
   * 
   * The parsing process:
   * 1. Removes markdown code blocks if present (Gemini sometimes wraps JSON)
   * 2. Parses the JSON string into a JavaScript object
   * 3. Validates all fields and applies defaults for missing/invalid values
   * 4. Returns a fully validated EmailAnalysis object
   * 
   * If parsing fails, returns a safe default analysis object to prevent
   * application crashes. This ensures the UI can still function even if
   * the AI response is malformed.
   * 
   * @private
   * @param {string} responseText - Raw response text from the AI model
   * @returns {EmailAnalysis} Parsed and validated analysis object with all required fields
   */
  private parseAnalysisResponse(responseText: string): EmailAnalysis {
    try {
      // ====================================================================
      // CLEAN THE RESPONSE TEXT
      // ====================================================================
      // Remove markdown code blocks if present
      // Gemini sometimes wraps JSON responses in markdown code blocks like:
      // ```json
      // { ... }
      // ```
      // We need to remove these before parsing
      let cleanedText = responseText.trim();
      
      // Check if response starts with ```json (most common case)
      if (cleanedText.startsWith('```json')) {
        // Remove ```json at the start and ``` at the end
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        // Handle case where it's just ``` without json identifier
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      
      // ====================================================================
      // PARSE JSON RESPONSE
      // ====================================================================
      // Parse the cleaned text as JSON
      // This will throw an error if the JSON is invalid
      const analysis = JSON.parse(cleanedText);
      
      // ====================================================================
      // VALIDATE AND SET DEFAULTS
      // ====================================================================
      // Validate all fields and provide safe defaults for missing/invalid values
      // This ensures we always return a valid EmailAnalysis object
      return {
        // Use provided summary or default message
        summary: analysis.summary || 'No summary available',
        // Validate category (ensures it's a valid EmailCategory type)
        category: this.validateCategory(analysis.category),
        // Validate priority (ensures it's a valid EmailPriority type)
        priority: this.validatePriority(analysis.priority),
        // Default to neutral sentiment if not provided or invalid
        sentiment: analysis.sentiment || 'neutral',
        // Convert to boolean (handles truthy/falsy values)
        actionRequired: Boolean(analysis.actionRequired),
        // Ensure keyPoints is an array (default to empty array if not)
        keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
        // Use provided suggested response or empty string
        suggestedResponse: analysis.suggestedResponse || '',
        // Ensure confidence is a number (default to 0.8 if not)
        confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.8,
      };
    } catch (error) {
      // ====================================================================
      // ERROR HANDLING - RETURN SAFE DEFAULT
      // ====================================================================
      // Log the error for debugging purposes
      console.error('Error parsing Gemini response:', error);
      
      // Return default analysis on parse error to prevent app crashes
      // This ensures the UI can still display the email even if analysis fails
      // The email will be marked as uncategorized with medium priority
      return {
        summary: 'Unable to analyze email',
        category: 'uncategorized',
        priority: 'medium',
        sentiment: 'neutral',
        actionRequired: false,
        keyPoints: [],
        confidence: 0.5, // Low confidence since analysis failed
      };
    }
  }

  /**
   * Validates that the category string is a valid EmailCategory.
   * 
   * This method ensures type safety by checking if the provided category
   * string matches one of the valid EmailCategory values. If the category
   * is invalid or unrecognized, it returns 'uncategorized' as a safe fallback.
   * 
   * This prevents runtime errors from invalid category values that might
   * come from the AI model or database.
   * 
   * @private
   * @param {string} category - Category string to validate (from AI response)
   * @returns {EmailCategory} Valid category type, or 'uncategorized' if invalid
   */
  private validateCategory(category: string): EmailCategory {
    // Define all valid category values
    // This list must match the EmailCategory type definition
    const validCategories: EmailCategory[] = [
      'urgent', 'important', 'work', 'personal', 'promotions', 
      'spam', 'newsletter', 'social', 'uncategorized'
    ];
    
    // Check if the provided category is in the valid list
    // If yes, return it as EmailCategory type
    // If no, return 'uncategorized' as safe fallback
    return validCategories.includes(category as EmailCategory) 
      ? (category as EmailCategory) 
      : 'uncategorized';
  }

  /**
   * Validates that the priority string is a valid EmailPriority.
   * 
   * This method ensures type safety by checking if the provided priority
   * string matches one of the valid EmailPriority values. If the priority
   * is invalid or unrecognized, it returns 'medium' as a safe fallback.
   * 
   * 'medium' is chosen as the default because it's a neutral priority level
   * that won't incorrectly highlight or hide emails.
   * 
   * @private
   * @param {string} priority - Priority string to validate (from AI response)
   * @returns {EmailPriority} Valid priority type, or 'medium' if invalid
   */
  private validatePriority(priority: string): EmailPriority {
    // Define all valid priority values
    // This list must match the EmailPriority type definition
    const validPriorities: EmailPriority[] = ['critical', 'high', 'medium', 'low', 'trash'];
    
    // Check if the provided priority is in the valid list
    // If yes, return it as EmailPriority type
    // If no, return 'medium' as safe fallback (neutral priority)
    return validPriorities.includes(priority as EmailPriority) 
      ? (priority as EmailPriority) 
      : 'medium';
  }

  /**
   * Generates a concise summary of an email body.
   * 
   * This method creates a brief, readable summary of email content
   * that can be displayed in email list views or preview panes.
   * The summary is typically 1-2 sentences and captures the main
   * points of the email.
   * 
   * This is useful for:
   * - Email list previews
   * - Quick scanning of email content
   * - Mobile views where space is limited
   * 
   * @param {string} emailBody - The full email body text to summarize
   * @returns {Promise<string>} Promise resolving to a 1-2 sentence summary
   * 
   * @example
   * const summary = await geminiService.generateEmailSummary(email.body);
   * console.log(summary); // "Meeting scheduled for Friday at 2pm..."
   */
  async generateEmailSummary(emailBody: string): Promise<string> {
    // Build a simple prompt asking for a concise summary
    // The prompt explicitly requests 1-2 sentences for consistency
    const prompt = `Summarize the following email in 1-2 concise sentences:\n\n${emailBody}`;
    
    try {
      // Send the prompt to Gemini AI
      const result = await this.model.generateContent(prompt);
      // Extract the response
      const response = await result.response;
      // Return the summary text
      return response.text();
    } catch (error) {
      // Log error for debugging
      console.error('Error generating summary:', error);
      // Return a safe default message if summary generation fails
      // This prevents the UI from breaking if the AI service is unavailable
      return 'Unable to generate summary';
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================
// Export a singleton instance of GeminiService for use throughout the application
// This ensures we only create one instance and reuse it, which is more efficient
// than creating new instances for each operation
export const geminiService = new GeminiService();

