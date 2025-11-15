import { Badge } from "@/components/ui/badge";
import type { EmailCategory, EmailPriority } from "@/types/email";
import { 
  AlertCircle, 
  Star, 
  Briefcase, 
  User, 
  Tag, 
  Trash2, 
  Newspaper, 
  Users,
  HelpCircle,
  Flame,
  AlertTriangle
} from "lucide-react";

interface CategoryBadgeProps {
  category: EmailCategory;
  priority?: EmailPriority;
  className?: string;
}

export const CategoryBadge = ({ category, priority, className = "" }: CategoryBadgeProps) => {
  const categoryConfig: Record<EmailCategory, { label: string; color: string; icon: any }> = {
    urgent: { label: "Urgent", color: "bg-red-500 hover:bg-red-600", icon: AlertCircle },
    important: { label: "Important", color: "bg-orange-500 hover:bg-orange-600", icon: Star },
    work: { label: "Work", color: "bg-blue-500 hover:bg-blue-600", icon: Briefcase },
    personal: { label: "Personal", color: "bg-purple-500 hover:bg-purple-600", icon: User },
    promotions: { label: "Promotions", color: "bg-yellow-500 hover:bg-yellow-600", icon: Tag },
    spam: { label: "Spam", color: "bg-gray-500 hover:bg-gray-600", icon: Trash2 },
    newsletter: { label: "Newsletter", color: "bg-teal-500 hover:bg-teal-600", icon: Newspaper },
    social: { label: "Social", color: "bg-pink-500 hover:bg-pink-600", icon: Users },
    uncategorized: { label: "Uncategorized", color: "bg-gray-400 hover:bg-gray-500", icon: HelpCircle },
  };

  const priorityConfig: Record<EmailPriority, { icon: any; color: string }> = {
    critical: { icon: Flame, color: "text-red-600" },
    high: { icon: AlertTriangle, color: "text-orange-600" },
    medium: { icon: AlertCircle, color: "text-blue-600" },
    low: { icon: HelpCircle, color: "text-gray-600" },
    trash: { icon: Trash2, color: "text-gray-400" },
  };

  const config = categoryConfig[category];
  const Icon = config.icon;
  const PriorityIcon = priority ? priorityConfig[priority].icon : null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
      {priority && priority !== 'medium' && PriorityIcon && (
        <PriorityIcon className={`h-4 w-4 ${priorityConfig[priority].color}`} />
      )}
    </div>
  );
};

