-- Add email_type column to distinguish between inbox and sent emails
ALTER TABLE public.emails 
ADD COLUMN email_type TEXT DEFAULT 'inbox' CHECK (email_type IN ('inbox', 'sent'));

-- Create index for faster filtering
CREATE INDEX idx_emails_email_type ON public.emails(email_type);
CREATE INDEX idx_emails_user_type ON public.emails(user_id, email_type);