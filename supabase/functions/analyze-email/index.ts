import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json();
    const GEMINI_API = Deno.env.get('GEMINI_API');

    if (!GEMINI_API) {
      throw new Error('GEMINI_API key not configured');
    }

    const analyzedEmails = [];

    // Process emails in batches of 5
    for (let i = 0; i < emails.length; i += 5) {
      const batch = emails.slice(i, i + 5);
      
      const batchPromises = batch.map(async (email: any) => {
        const prompt = `You are an advanced email analysis assistant. Analyze the following email and provide a comprehensive assessment.

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
  "keyPoints": ["key point 1", "key point 2"],
  "suggestedResponse": "A brief suggested response if action is required, or empty string if not",
  "confidence": 0.95
}

Category Guidelines:
- "urgent": Time-sensitive emails requiring immediate attention
- "important": Significant emails from important contacts
- "work": Work-related correspondence, meetings, projects
- "personal": Personal emails from friends, family
- "promotions": Marketing emails, sales, advertisements
- "spam": Unwanted emails, suspicious content, phishing attempts
- "newsletter": Subscribed newsletters, updates, digests
- "social": Social media notifications
- "uncategorized": Doesn't fit other categories

Priority Guidelines:
- "critical": Urgent + Important (requires immediate action)
- "high": Important emails that need attention soon
- "medium": Regular emails
- "low": FYI emails, newsletters
- "trash": Spam, non-essential content`;

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }]
              })
            }
          );

          if (!response.ok) {
            console.error('Gemini API error:', await response.text());
            throw new Error('Failed to analyze email');
          }

          const data = await response.json();
          const text = data.candidates[0].content.parts[0].text;
          
          // Clean markdown if present
          let cleanedText = text.trim();
          if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
          }

          const analysis = JSON.parse(cleanedText);

          return {
            id: email.id,
            ...email,
            summary: analysis.summary || 'No summary available',
            category: analysis.category || 'uncategorized',
            priority: analysis.priority || 'medium',
            sentiment: analysis.sentiment || 'neutral',
            actionRequired: Boolean(analysis.actionRequired),
            confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.8,
          };
        } catch (error) {
          console.error(`Error analyzing email ${email.id}:`, error);
          return {
            id: email.id,
            ...email,
            summary: 'Unable to analyze email',
            category: 'uncategorized',
            priority: 'medium',
            sentiment: 'neutral',
            actionRequired: false,
            confidence: 0.5,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      analyzedEmails.push(...batchResults);

      // Small delay between batches
      if (i + 5 < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return new Response(JSON.stringify({ analyzedEmails }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-email function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
