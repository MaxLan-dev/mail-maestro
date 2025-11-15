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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const analyzedEmails = [];

    // Process emails in batches of 5
    for (let i = 0; i < emails.length; i += 5) {
      const batch = emails.slice(i, i + 5);
      
      const batchPromises = batch.map(async (email: any) => {
        const systemPrompt = `You are an advanced email analysis assistant. Analyze emails and provide comprehensive assessments in JSON format.

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

        const userPrompt = `Analyze this email:

From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}`;

        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              tools: [{
                type: 'function',
                function: {
                  name: 'analyze_email',
                  description: 'Analyze email and return structured data',
                  parameters: {
                    type: 'object',
                    properties: {
                      summary: { type: 'string', description: 'A concise 1-2 sentence summary' },
                      category: { 
                        type: 'string', 
                        enum: ['urgent', 'important', 'work', 'personal', 'promotions', 'spam', 'newsletter', 'social', 'uncategorized']
                      },
                      priority: { 
                        type: 'string', 
                        enum: ['critical', 'high', 'medium', 'low', 'trash']
                      },
                      sentiment: { 
                        type: 'string', 
                        enum: ['positive', 'neutral', 'negative']
                      },
                      actionRequired: { type: 'boolean' },
                      confidence: { type: 'number', description: 'Confidence score 0-1' }
                    },
                    required: ['summary', 'category', 'priority', 'sentiment', 'actionRequired', 'confidence'],
                    additionalProperties: false
                  }
                }
              }],
              tool_choice: { type: 'function', function: { name: 'analyze_email' } }
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Lovable AI error:', response.status, errorText);
            throw new Error('Failed to analyze email');
          }

          const data = await response.json();
          const toolCall = data.choices[0]?.message?.tool_calls?.[0];
          
          if (!toolCall) {
            throw new Error('No tool call in response');
          }

          const analysis = JSON.parse(toolCall.function.arguments);

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
