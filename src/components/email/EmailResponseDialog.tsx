import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailId: string;
  emailSubject: string;
  emailFrom: string;
  onSent?: () => void;
}

export const EmailResponseDialog = ({
  open,
  onOpenChange,
  emailId,
  emailSubject,
  emailFrom,
  onSent,
}: EmailResponseDialogProps) => {
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const generateResponse = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email-response", {
        body: { emailId },
      });

      if (error) throw error;

      setSubject(data.subject);
      setBody(data.body);
      setDraftId(data.id);
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate response: " + error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert the sent email
      const { error: insertError } = await supabase.from("emails").insert({
        user_id: user.id,
        from_email: user.email || "me@example.com",
        to_email: emailFrom,
        subject,
        body,
        read: true,
        starred: false,
        email_type: 'sent',
      });

      if (insertError) throw insertError;

      // Delete the draft if it exists
      if (draftId) {
        await supabase.from("email_drafts").delete().eq("id", draftId);
      }

      toast({
        title: "Success",
        description: "Email sent successfully",
      });

      onOpenChange(false);
      onSent?.();
      
      // Reset state
      setSubject("");
      setBody("");
      setDraftId(null);
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send email: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reply to: {emailSubject}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!body && !generating && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Generate an AI-powered response to this email
              </p>
              <Button onClick={generateResponse}>
                Generate Response
              </Button>
            </div>
          )}

          {generating && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Generating response...</p>
            </div>
          )}

          {body && !generating && (
            <>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  disabled={!isEditing}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2 justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Preview" : "Edit"}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={generateResponse}
                    disabled={generating}
                  >
                    Regenerate
                  </Button>
                  <Button onClick={handleSend} disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
