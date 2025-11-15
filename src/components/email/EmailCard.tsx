import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CategoryBadge } from "./CategoryBadge";
import { EmailResponseDialog } from "./EmailResponseDialog";
import type { Email } from "@/types/email";
import { 
  Mail, 
  MailOpen, 
  Star, 
  Trash2, 
  Reply, 
  Forward, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";

interface EmailCardProps {
  email: Email;
  onToggleRead?: (emailId: string) => void;
  onToggleStar?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
  onEmailSent?: () => void;
}

export const EmailCard = ({ email, onToggleRead, onToggleStar, onDelete, onEmailSent }: EmailCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBorder = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'border-l-4 border-l-red-500';
      case 'high': return 'border-l-4 border-l-orange-500';
      case 'trash': return 'opacity-60';
      default: return '';
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${getPriorityBorder(email.priority)} ${!email.read ? 'bg-blue-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {!email.read ? (
                <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
              ) : (
                <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <CardTitle className="text-lg truncate">{email.subject}</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{email.from}</span>
              <span className="text-xs">•</span>
              <span className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(email.date, 'MMM d, yyyy h:mm a')}
              </span>
            </CardDescription>
          </div>
          
          <div className="flex items-start gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleStar?.(email.id)}
              className="h-8 w-8"
            >
              <Star className={`h-4 w-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleRead?.(email.id)}
              className="h-8 w-8"
            >
              {!email.read ? (
                <MailOpen className="h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete?.(email.id)}
              className="h-8 w-8 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Categories and Priority */}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {email.category && email.priority && (
            <CategoryBadge category={email.category} priority={email.priority} />
          )}
          {email.actionRequired && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Action Required
            </Badge>
          )}
          {email.confidence && email.confidence > 0.9 && (
            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
              High Confidence
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* AI Summary */}
        {email.summary && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                  AI Summary
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {email.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email Body Preview */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full justify-between mb-2 h-auto py-2"
          >
            <span className="text-sm font-medium">Email Content</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {expanded ? (
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              {email.body}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {email.body}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <Separator />
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setResponseDialogOpen(true)}
          >
            <Reply className="h-4 w-4" />
            AI Reply
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Forward className="h-4 w-4" />
            Forward
          </Button>
        </div>
      </CardContent>

      <EmailResponseDialog
        open={responseDialogOpen}
        onOpenChange={setResponseDialogOpen}
        emailId={email.id}
        emailSubject={email.subject}
        emailFrom={email.from}
        onSent={onEmailSent}
      />
    </Card>
  );
};

