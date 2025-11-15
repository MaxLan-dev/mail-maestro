import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { EmailCard } from "@/components/email/EmailCard";
import { EmailFilters } from "@/components/email/EmailFilters";
import { mockEmails } from "@/data/mockEmails";
import { supabase } from "@/integrations/supabase/client";
import type { Email, EmailCategory, EmailPriority } from "@/types/email";
import { RefreshCw, Search, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const EmailInbox = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | 'all' | 'starred'>('all');
  const [selectedPriority, setSelectedPriority] = useState<EmailPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Initialize emails with mock data
  useEffect(() => {
    const initialEmails = mockEmails.map(email => ({
      ...email,
      summary: undefined,
      category: 'uncategorized' as EmailCategory,
      priority: 'medium' as EmailPriority,
      sentiment: 'neutral' as const,
      actionRequired: false,
      confidence: 0,
    }));
    setEmails(initialEmails);
    setFilteredEmails(initialEmails);
    updateCategoryCounts(initialEmails);
  }, []);

  // Analyze all emails with Gemini AI
  const analyzeAllEmails = async () => {
    setIsAnalyzing(true);
    toast({
      title: "Analyzing emails...",
      description: "Using Gemini AI to categorize and summarize your emails.",
    });

    try {
      const { data, error } = await supabase.functions.invoke('analyze-email', {
        body: { emails }
      });

      if (error) throw error;

      const analyzedEmails = data.analyzedEmails;
      setEmails(analyzedEmails);
      applyFilters(analyzedEmails, selectedCategory, selectedPriority, searchQuery);
      updateCategoryCounts(analyzedEmails);

      toast({
        title: "Analysis complete!",
        description: `Successfully analyzed ${analyzedEmails.length} emails.`,
      });
    } catch (error) {
      console.error('Failed to analyze emails:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update category counts
  const updateCategoryCounts = (emailList: Email[]) => {
    const counts: Record<string, number> = {
      all: emailList.length,
      starred: emailList.filter(e => e.starred).length,
    };

    emailList.forEach(email => {
      if (email.category) {
        counts[email.category] = (counts[email.category] || 0) + 1;
      }
    });

    setCategoryCounts(counts);
  };

  // Apply filters to emails
  const applyFilters = (
    emailList: Email[],
    category: EmailCategory | 'all' | 'starred',
    priority: EmailPriority | 'all',
    search: string
  ) => {
    let filtered = [...emailList];

    // Category filter
    if (category === 'starred') {
      filtered = filtered.filter(email => email.starred);
    } else if (category !== 'all') {
      filtered = filtered.filter(email => email.category === category);
    }

    // Priority filter
    if (priority !== 'all') {
      filtered = filtered.filter(email => email.priority === priority);
    }

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        email =>
          email.subject.toLowerCase().includes(query) ||
          email.from.toLowerCase().includes(query) ||
          email.body.toLowerCase().includes(query) ||
          email.summary?.toLowerCase().includes(query)
      );
    }

    setFilteredEmails(filtered);
  };

  // Handle filter changes
  useEffect(() => {
    applyFilters(emails, selectedCategory, selectedPriority, searchQuery);
  }, [selectedCategory, selectedPriority, searchQuery, emails]);

  // Email actions
  const handleToggleRead = (emailId: string) => {
    setEmails(prev =>
      prev.map(email =>
        email.id === emailId ? { ...email, read: !email.read } : email
      )
    );
  };

  const handleToggleStar = (emailId: string) => {
    setEmails(prev =>
      prev.map(email =>
        email.id === emailId ? { ...email, starred: !email.starred } : email
      )
    );
  };

  const handleDelete = (emailId: string) => {
    setEmails(prev => prev.filter(email => email.id !== emailId));
    toast({
      title: "Email deleted",
      description: "The email has been moved to trash.",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar with filters */}
      <div className="w-64 border-r bg-gray-50/50 dark:bg-gray-900/50 p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Mail Maestro
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-Powered Email
          </p>
        </div>

        <Button
          onClick={analyzeAllEmails}
          disabled={isAnalyzing}
          className="w-full mb-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze with AI
            </>
          )}
        </Button>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-240px)]">
          <EmailFilters
            selectedCategory={selectedCategory}
            selectedPriority={selectedPriority}
            onCategoryChange={setSelectedCategory}
            onPriorityChange={setSelectedPriority}
            categoryCounts={categoryCounts}
          />
        </ScrollArea>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Email list */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-5xl mx-auto">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No emails found matching your filters.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'}
                  </p>
                  {selectedCategory !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
                {filteredEmails.map(email => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    onToggleRead={handleToggleRead}
                    onToggleStar={handleToggleStar}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default EmailInbox;

