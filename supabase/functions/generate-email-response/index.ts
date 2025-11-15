import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the email
    const { data: email, error: fetchError } = await supabaseClient
      .from('emails')
      .select('*')
      .eq('id', emailId)
      .single();

    if (fetchError || !email) {
      throw new Error('Email not found');
    }

    console.log('Generating response for email:', emailId);

    const systemPrompt = `You are a professional email assistant. Generate appropriate, professional email responses based on the email content and context provided.

Response Guidelines:
- Match the tone and formality of the original email
- Be concise and clear
- Address all points mentioned in the original email
- Use appropriate greetings and sign-offs
- For work emails, maintain professional language
- For meeting requests, confirm availability or suggest alternatives
- For questions, provide helpful answers
- Keep responses between 50-200 words unless more detail is needed`;

    const userPrompt = `Generate an appropriate email response for this email:

From: ${email.from_email}
Subject: ${email.subject}
Body: ${email.body}

${email.summary ? `AI Summary: ${email.summary}` : ''}
${email.category ? `Category: ${email.category}` : ''}
${email.action_required ? 'Action Required: Yes' : ''}`;

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
            name: 'generate_email_response',
            description: 'Generate an email response',
            parameters: {
              type: 'object',
              properties: {
                subject: { 
                  type: 'string', 
                  description: 'The subject line for the response email (usually Re: original subject)' 
                },
                body: { 
                  type: 'string', 
                  description: 'The body of the response email' 
                }
              },
              required: ['subject', 'body'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_email_response' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate response');
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No response generated');
    }

    const responseData = JSON.parse(toolCall.function.arguments);
    
    // Save the draft
    const { data: draft, error: draftError } = await supabaseClient
      .from('email_drafts')
      .insert({
        user_id: email.user_id,
        reply_to_email_id: emailId,
        subject: responseData.subject,
        body: responseData.body,
        ai_generated: true
      })
      .select()
      .single();

    if (draftError) {
      console.error('Error saving draft:', draftError);
      throw draftError;
    }

    console.log('Response generated and saved as draft:', draft.id);

    return new Response(JSON.stringify(draft), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-email-response:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
