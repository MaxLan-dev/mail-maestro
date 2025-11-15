import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '@/config/gemini';
import type { Email, EmailAnalysis, EmailCategory, EmailPriority } from '@/types/email';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: GEMINI_CONFIG.model });
  }

  async analyzeEmail(email: Email): Promise<EmailAnalysis> {
    const prompt = this.buildAnalysisPrompt(email);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAnalysisResponse(text);
    } catch (error) {
      console.error('Error analyzing email with Gemini:', error);
      throw error;
    }
  }

  async analyzeBatchEmails(emails: Email[]): Promise<Map<string, EmailAnalysis>> {
    const analysisMap = new Map<string, EmailAnalysis>();
    
    // Process in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const promises = batch.map(email => 
        this.analyzeEmail(email)
          .then(analysis => ({ emailId: email.id, analysis }))
          .catch(error => {
            console.error(`Failed to analyze email ${email.id}:`, error);
            return null;
          })
      );
      
      const results = await Promise.all(promises);
      results.forEach(result => {
        if (result) {
          analysisMap.set(result.emailId, result.analysis);
        }
      });
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return analysisMap;
  }

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

  private parseAnalysisResponse(responseText: string): EmailAnalysis {
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      
      const analysis = JSON.parse(cleanedText);
      
      // Validate and set defaults
      return {
        summary: analysis.summary || 'No summary available',
        category: this.validateCategory(analysis.category),
        priority: this.validatePriority(analysis.priority),
        sentiment: analysis.sentiment || 'neutral',
        actionRequired: Boolean(analysis.actionRequired),
        keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
        suggestedResponse: analysis.suggestedResponse || '',
        confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.8,
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      // Return default analysis on parse error
      return {
        summary: 'Unable to analyze email',
        category: 'uncategorized',
        priority: 'medium',
        sentiment: 'neutral',
        actionRequired: false,
        keyPoints: [],
        confidence: 0.5,
      };
    }
  }

  private validateCategory(category: string): EmailCategory {
    const validCategories: EmailCategory[] = [
      'urgent', 'important', 'work', 'personal', 'promotions', 
      'spam', 'newsletter', 'social', 'uncategorized'
    ];
    return validCategories.includes(category as EmailCategory) 
      ? (category as EmailCategory) 
      : 'uncategorized';
  }

  private validatePriority(priority: string): EmailPriority {
    const validPriorities: EmailPriority[] = ['critical', 'high', 'medium', 'low', 'trash'];
    return validPriorities.includes(priority as EmailPriority) 
      ? (priority as EmailPriority) 
      : 'medium';
  }

  async generateEmailSummary(emailBody: string): Promise<string> {
    const prompt = `Summarize the following email in 1-2 concise sentences:\n\n${emailBody}`;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Unable to generate summary';
    }
  }
}

export const geminiService = new GeminiService();

