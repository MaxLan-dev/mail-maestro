import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EmailCategory, EmailPriority } from "@/types/email";
import { 
  Inbox, 
  Star, 
  AlertCircle, 
  Briefcase, 
  User, 
  Tag, 
  Trash2, 
  Newspaper, 
  Users,
  Mail,
  Filter,
  Send
} from "lucide-react";

interface EmailFiltersProps {
  selectedCategory: EmailCategory | 'all' | 'starred' | 'sent';
  selectedPriority: EmailPriority | 'all';
  onCategoryChange: (category: EmailCategory | 'all' | 'starred' | 'sent') => void;
  onPriorityChange: (priority: EmailPriority | 'all') => void;
  categoryCounts: Record<string, number>;
}

export const EmailFilters = ({
  selectedCategory,
  selectedPriority,
  onCategoryChange,
  onPriorityChange,
  categoryCounts,
}: EmailFiltersProps) => {
  const categories: Array<{ value: EmailCategory | 'all' | 'starred' | 'sent'; label: string; icon: any }> = [
    { value: 'all', label: 'All Mail', icon: Inbox },
    { value: 'starred', label: 'Starred', icon: Star },
    { value: 'sent', label: 'Sent', icon: Send },
    { value: 'urgent', label: 'Urgent', icon: AlertCircle },
    { value: 'important', label: 'Important', icon: Star },
    { value: 'work', label: 'Work', icon: Briefcase },
    { value: 'personal', label: 'Personal', icon: User },
    { value: 'promotions', label: 'Promotions', icon: Tag },
    { value: 'newsletter', label: 'Newsletter', icon: Newspaper },
    { value: 'social', label: 'Social', icon: Users },
    { value: 'spam', label: 'Spam', icon: Trash2 },
  ];

  const priorities: Array<{ value: EmailPriority | 'all'; label: string }> = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'trash', label: 'Trash' },
  ];

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Categories</h3>
        </div>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = categoryCounts[category.value] || 0;
            
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => onCategoryChange(category.value)}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{category.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Priority Filters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Priority</h3>
        </div>
        <div className="space-y-1">
          {priorities.map((priority) => (
            <Button
              key={priority.value}
              variant={selectedPriority === priority.value ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onPriorityChange(priority.value)}
            >
              {priority.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

