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
    const { emailIds } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch emails from database
    const { data: emails, error: fetchError } = await supabaseClient
      .from('emails')
      .select('*')
      .in('id', emailIds);

    if (fetchError) {
      console.error('Error fetching emails:', fetchError);
      throw fetchError;
    }

    if (!emails || emails.length === 0) {
      throw new Error('No emails found with provided IDs');
    }

    console.log(`Analyzing ${emails.length} emails...`);

    // Process emails in batches of 5
    for (let i = 0; i < emails.length; i += 5) {
      const batch = emails.slice(i, i + 5);
      
      const batchPromises = batch.map(async (email: any) => {
        const systemPrompt = `You are an advanced email analysis assistant. Analyze emails and provide comprehensive assessments in JSON format.

Category Guidelines (BE VERY STRICT):
- "work": ONLY emails from current colleagues, managers, or team members about ongoing work projects, internal meetings, work tasks, and internal company communications. DO NOT use for recruiting, job offers, or external business proposals.
- "promotions": ALL marketing emails, sales pitches, recruiting emails, job opportunities, business development outreach, advertisements, and promotional content from companies. This includes recruiting emails even if they mention technical roles.
- "urgent": Time-sensitive emails requiring immediate attention from known contacts
- "important": Significant emails from important known contacts about critical matters
- "personal": Personal emails from friends, family, or personal contacts
- "spam": Unwanted emails, suspicious content, phishing attempts, obvious scams
- "newsletter": Subscribed newsletters, updates, digests, automated reports
- "social": Social media notifications, social network updates
- "uncategorized": Doesn't fit other categories

Priority Guidelines:
- "critical": Urgent + Important (requires immediate action from known contacts)
- "high": Important emails that need attention soon
- "medium": Regular emails from known contacts
- "low": FYI emails, newsletters, non-urgent updates
- "trash": Spam, promotional content, recruiting emails, non-essential content

Meeting Detection:
- Detect if the email contains meeting/event information
- Extract meeting details: title, start time, end time, location, attendees

Task Extraction:
- Identify actionable items that require someone to DO something
- Extract clear action items with titles like "Review document", "Submit report", "Call client"
- Infer due dates from phrases like "by Friday", "end of week", "ASAP", "within 3 days"
- Identify assignees from mentions like "John should...", "please have Sarah...", "you need to..."
- Set urgency based on email priority and language (urgent words, deadlines, importance)
- Each task should be specific and actionable`;

        const userPrompt = `Analyze this email:

From: ${email.from_email}
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
                      confidence: { type: 'number', description: 'Confidence score 0-1' },
                      hasMeeting: { type: 'boolean', description: 'Whether email contains meeting/event information' },
                      meetingDetails: {
                        type: 'object',
                        description: 'Meeting details if hasMeeting is true',
                        properties: {
                          title: { type: 'string' },
                          startTime: { type: 'string', description: 'ISO 8601 datetime' },
                          endTime: { type: 'string', description: 'ISO 8601 datetime' },
                          location: { type: 'string' },
                          attendees: { type: 'array', items: { type: 'string' } }
                        }
                      },
                      hasTasks: { type: 'boolean', description: 'Whether email contains actionable tasks' },
                      tasks: {
                        type: 'array',
                        description: 'Extracted tasks if hasTasks is true',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string', description: 'Short action item title' },
                            description: { type: 'string', description: 'Snippet from email explaining the task' },
                            dueDate: { type: 'string', description: 'ISO 8601 datetime if due date mentioned or can be inferred, null otherwise' },
                            assignee: { type: 'string', description: 'Person assigned if mentioned, null otherwise' },
                            urgency: { type: 'string', enum: ['critical', 'high', 'medium', 'low'], description: 'Task urgency based on email priority and content' }
                          },
                          required: ['title', 'urgency']
                        }
                      }
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
            throw new Error(`AI request failed: ${response.status}`);
          }

          const result = await response.json();
          const toolCall = result.choices[0]?.message?.tool_calls?.[0];
          
          if (!toolCall) {
            throw new Error('No tool call in response');
          }

          const analysis = JSON.parse(toolCall.function.arguments);

          // Update email in database
          const { error: updateError } = await supabaseClient
            .from('emails')
            .update({
              summary: analysis.summary,
              category: analysis.category,
              priority: analysis.priority,
              sentiment: analysis.sentiment,
              action_required: analysis.actionRequired,
              confidence: analysis.confidence
            })
            .eq('id', email.id);

          if (updateError) {
            console.error(`Failed to update email ${email.id}:`, updateError);
          } else {
            console.log(`Successfully analyzed email ${email.id}`);
          }

          // Create calendar event if meeting detected
          if (analysis.hasMeeting && analysis.meetingDetails) {
            const meetingData = analysis.meetingDetails;
            try {
              const { error: calendarError } = await supabaseClient
                .from('calendar_events')
                .insert({
                  user_id: email.user_id,
                  email_id: email.id,
                  title: meetingData.title || email.subject,
                  description: email.body,
                  start_time: meetingData.startTime,
                  end_time: meetingData.endTime,
                  location: meetingData.location || '',
                  attendees: meetingData.attendees || [],
                  status: 'pending'
                });

              if (calendarError) {
                console.error(`Failed to create calendar event for email ${email.id}:`, calendarError);
              } else {
                console.log(`Created calendar event for email ${email.id}`);
              }
            } catch (calError) {
              console.error(`Error creating calendar event:`, calError);
            }
          }

          // Create tasks if detected
          if (analysis.hasTasks && analysis.tasks && analysis.tasks.length > 0) {
            try {
              const tasksToInsert = analysis.tasks.map((task: any) => ({
                user_id: email.user_id,
                email_id: email.id,
                title: task.title,
                description: task.description || email.body.substring(0, 300),
                due_date: task.dueDate || null,
                assignee: task.assignee || null,
                urgency: task.urgency,
                ai_confidence: analysis.confidence,
                status: 'pending'
              }));

              const { error: tasksError } = await supabaseClient
                .from('tasks')
                .insert(tasksToInsert);

              if (tasksError) {
                console.error(`Failed to create tasks for email ${email.id}:`, tasksError);
              } else {
                console.log(`Created ${tasksToInsert.length} task(s) for email ${email.id}`);
              }
            } catch (taskError) {
              console.error(`Error creating tasks:`, taskError);
            }
          }

          return { id: email.id, success: true };
        } catch (error) {
          console.error(`Error analyzing email ${email.id}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return { id: email.id, success: false, error: errorMessage };
        }
      });

      await Promise.all(batchPromises);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully analyzed ${emails.length} emails`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in analyze-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
