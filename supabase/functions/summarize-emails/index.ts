import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categories = [
  'Work', 'Personal', 'Finance', 'Newsletter', 
  'Social', 'Promotions', 'Updates', 'Other'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json();

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ summarizedEmails: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Processing ${emails.length} emails with AI...`);

    // Process emails in batches to avoid token limits
    const batchSize = 5;
    const summarizedEmails: any[] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const emailsForAI = batch.map((email: any, idx: number) => 
        `Email ${idx + 1}:\nFrom: ${email.from}\nSubject: ${email.subject}\nContent: ${email.snippet || email.body}`
      ).join('\n\n---\n\n');

      const prompt = `Analyze these emails and for each one provide:
1. A brief summary (1-2 sentences)
2. A category from: ${categories.join(', ')}

Format your response as JSON array with objects containing: emailIndex (0-based), summary, category

Emails:
${emailsForAI}`;

      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are an email categorization assistant. Respond only with valid JSON arrays.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI request failed:', errorText);
        
        // Fallback: add emails without AI processing
        batch.forEach((email: any) => {
          summarizedEmails.push({
            ...email,
            summary: email.snippet || 'No summary available',
            category: 'Other'
          });
        });
        continue;
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || '[]';
      
      // Parse AI response
      let aiResults = [];
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || 
                         content.match(/(\[[\s\S]*?\])/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content;
        aiResults = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError, content);
        aiResults = [];
      }

      // Merge AI results with original emails
      batch.forEach((email: any, idx: number) => {
        const aiResult = aiResults.find((r: any) => r.emailIndex === idx) || {};
        summarizedEmails.push({
          ...email,
          summary: aiResult.summary || email.snippet || 'No summary available',
          category: aiResult.category || 'Other'
        });
      });
    }

    console.log(`Successfully processed ${summarizedEmails.length} emails`);

    return new Response(
      JSON.stringify({ summarizedEmails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-emails:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
