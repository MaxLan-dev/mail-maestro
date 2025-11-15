import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Send } from "lucide-react";

interface ComposeEmailProps {
  onEmailSent: () => void;
}

export const ComposeEmail = ({ onEmailSent }: ComposeEmailProps) => {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert email into database
      const { data: emailData, error: insertError } = await supabase
        .from("emails")
        .insert({
          user_id: user.id,
          from_email: from,
          to_email: to,
          subject,
          body,
          date: new Date().toISOString(),
          email_type: 'sent',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger AI analysis
      const { error: analysisError } = await supabase.functions.invoke("analyze-email", {
        body: { 
          emailIds: [emailData.id],
        },
      });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        toast({
          title: "Email sent",
          description: "Email sent successfully, but AI analysis failed. It will be categorized as uncategorized.",
        });
      } else {
        toast({
          title: "Success",
          description: "Email sent and analyzed successfully!",
        });
      }

      setFrom("");
      setTo("");
      setSubject("");
      setBody("");
      setOpen(false);
      onEmailSent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Compose Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose New Email</DialogTitle>
          <DialogDescription>
            Send a new email and it will be automatically categorized by AI.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="email"
              placeholder="your-email@example.com"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              placeholder="Email content..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Sending..." : "Send Email"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
