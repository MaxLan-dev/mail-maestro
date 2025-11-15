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
    const { accessToken, maxResults = 20 } = await req.json();

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    console.log('Fetching emails from Gmail...');

    // Fetch message list
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error('Failed to fetch message list:', errorText);
      throw new Error(`Failed to fetch messages: ${errorText}`);
    }

    const listData = await listResponse.json();
    
    if (!listData.messages || listData.messages.length === 0) {
      return new Response(
        JSON.stringify({ emails: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching details for ${listData.messages.length} emails...`);

    // Fetch details for each message
    const emailPromises = listData.messages.map(async (message: any) => {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!detailResponse.ok) {
        console.error(`Failed to fetch message ${message.id}`);
        return null;
      }

      const detail = await detailResponse.json();
      
      // Extract relevant information
      const headers = detail.payload?.headers || [];
      const getHeader = (name: string) => 
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const from = getHeader('From');
      const subject = getHeader('Subject');
      const date = getHeader('Date');
      
      // Get email body
      let body = '';
      if (detail.payload?.body?.data) {
        body = atob(detail.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (detail.payload?.parts) {
        const textPart = detail.payload.parts.find((part: any) => 
          part.mimeType === 'text/plain' || part.mimeType === 'text/html'
        );
        if (textPart?.body?.data) {
          body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }

      // Strip HTML tags if present
      body = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      // Limit body length for AI processing
      body = body.substring(0, 2000);

      return {
        id: message.id,
        from,
        subject,
        date,
        body,
        snippet: detail.snippet || '',
      };
    });

    const emails = (await Promise.all(emailPromises)).filter(email => email !== null);
    
    console.log(`Successfully fetched ${emails.length} emails`);

    return new Response(
      JSON.stringify({ emails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-emails:', error);
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
