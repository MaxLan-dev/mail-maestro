import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

export interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  category?: string;
  summary?: string;
  isRead?: boolean;
}

interface EmailCardProps {
  email: Email;
  onClick?: () => void;
}

const getCategoryColor = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "work":
      return "bg-primary text-primary-foreground";
    case "personal":
      return "bg-accent text-accent-foreground";
    case "finance":
      return "bg-green-500 text-white";
    case "newsletter":
      return "bg-purple-500 text-white";
    case "promotional":
      return "bg-orange-500 text-white";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const EmailCard = ({ email, onClick }: EmailCardProps) => {
  return (
    <Card
      className="p-4 cursor-pointer transition-all duration-200 hover:shadow-hover animate-fade-in"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${email.isRead ? "text-muted-foreground" : "text-primary"}`}>
          <Mail className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold truncate ${email.isRead ? "text-foreground" : "text-foreground font-bold"}`}>
                {email.from}
              </h3>
              <p className={`text-sm truncate ${email.isRead ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                {email.subject}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{email.date}</span>
              {email.category && (
                <Badge className={`${getCategoryColor(email.category)} text-xs`}>
                  {email.category}
                </Badge>
              )}
            </div>
          </div>
          
          {email.summary && (
            <div className="mt-2 p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground italic">
                <span className="font-semibold text-foreground">AI Summary:</span> {email.summary}
              </p>
            </div>
          )}
          
          {!email.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {email.snippet}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
