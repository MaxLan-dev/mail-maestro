import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { EmailCard } from "@/components/email/EmailCard";
import { EmailFilters } from "@/components/email/EmailFilters";
import { supabase } from "@/integrations/supabase/client";
import type { Email, EmailCategory, EmailPriority } from "@/types/email";
import { Search, Loader2, Sparkles, LogOut, Database, Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ComposeEmail } from "@/components/email/ComposeEmail";
import { AuthForm } from "@/components/auth/AuthForm";
import { mockEmails } from "@/data/mockEmails";
import { Link } from "react-router-dom";

export const EmailInbox = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | 'all' | 'starred' | 'sent'>('all');
  const [selectedPriority, setSelectedPriority] = useState<EmailPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch emails from database when user is authenticated
  useEffect(() => {
    if (user) {
      fetchEmails();
    }
  }, [user]);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;

      const emailsWithDates = (data || []).map((email: any) => ({
        id: email.id,
        from: email.from_email,
        to: email.to_email,
        subject: email.subject,
        body: email.body,
        date: new Date(email.date),
        read: email.read,
        starred: email.starred,
        email_type: (email.email_type || 'inbox') as 'inbox' | 'sent',
        summary: email.summary,
        category: (email.category || 'uncategorized') as EmailCategory,
        priority: (email.priority || 'medium') as EmailPriority,
        sentiment: (email.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative',
        actionRequired: email.action_required || false,
        confidence: email.confidence ? parseFloat(email.confidence) : 0,
      }));

      setEmails(emailsWithDates);
      setFilteredEmails(emailsWithDates);
      updateCategoryCounts(emailsWithDates);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch emails: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Analyze all emails with AI
  const analyzeAllEmails = async () => {
    if (emails.length === 0) {
      toast({
        title: "No emails",
        description: "Add some emails first before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    toast({
      title: "Analyzing emails...",
      description: "Using AI to categorize and summarize your emails.",
    });

    try {
      const emailIds = emails.map(e => e.id);

      const { error } = await supabase.functions.invoke('analyze-email', {
        body: { emailIds }
      });

      if (error) throw error;

      // Refresh emails from database after analysis
      await fetchEmails();

      toast({
        title: "Analysis complete!",
        description: `Successfully analyzed ${emails.length} emails.`,
      });
    } catch (error: any) {
      console.error('Failed to analyze emails:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "There was an error analyzing your emails. Please try again.",
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
    category: EmailCategory | 'all' | 'starred' | 'sent',
    priority: EmailPriority | 'all',
    search: string
  ) => {
    let filtered = [...emailList];

    // Category filter
    if (category === 'starred') {
      filtered = filtered.filter(email => email.starred);
    } else if (category === 'sent') {
      filtered = filtered.filter(email => email.email_type === 'sent');
    } else if (category !== 'all') {
      filtered = filtered.filter(email => email.category === category && email.email_type === 'inbox');
    } else {
      // 'all' shows inbox emails only by default
      filtered = filtered.filter(email => email.email_type === 'inbox');
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
          email.body.toLowerCase().includes(query)
      );
    }

    setFilteredEmails(filtered);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters(emails, selectedCategory, selectedPriority, searchQuery);
  }, [emails, selectedCategory, selectedPriority, searchQuery]);

  const handleCategoryChange = (category: EmailCategory | 'all' | 'starred' | 'sent') => {
    setSelectedCategory(category);
  };

  const handlePriorityChange = (priority: EmailPriority | 'all') => {
    setSelectedPriority(priority);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleRead = async (id: string) => {
    const email = emails.find(e => e.id === id);
    if (!email) return;

    try {
      const { error } = await supabase
        .from("emails")
        .update({ read: !email.read })
        .eq("id", id);

      if (error) throw error;

      setEmails(emails.map(e => 
        e.id === id ? { ...e, read: !e.read } : e
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    }
  };

  const handleToggleStar = async (id: string) => {
    const email = emails.find(e => e.id === id);
    if (!email) return;

    try {
      const { error } = await supabase
        .from("emails")
        .update({ starred: !email.starred })
        .eq("id", id);

      if (error) throw error;

      const updatedEmails = emails.map(e => 
        e.id === id ? { ...e, starred: !e.starred } : e
      );
      setEmails(updatedEmails);
      updateCategoryCounts(updatedEmails);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("emails")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const updatedEmails = emails.filter(e => e.id !== id);
      setEmails(updatedEmails);
      updateCategoryCounts(updatedEmails);
      
      toast({
        title: "Email Deleted",
        description: "The email has been moved to trash.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete email",
        variant: "destructive",
      });
    }
  };

  const handleInsertTestEmails = async () => {
    setIsInserting(true);
    toast({
      title: "Inserting test emails...",
      description: "Adding 30 test emails to your inbox.",
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Prepare test emails for insertion
      const testEmailsData = mockEmails.map((email) => ({
        user_id: user.id,
        from_email: email.from,
        to_email: email.to,
        subject: email.subject,
        body: email.body,
        date: new Date(email.date).toISOString(),
        read: email.read,
        starred: email.starred,
        email_type: 'inbox',
      }));

      const { error: insertError } = await supabase
        .from("emails")
        .insert(testEmailsData);

      if (insertError) throw insertError;

      // Refresh the email list
      await fetchEmails();

      toast({
        title: "Success!",
        description: "30 test emails have been added to your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to insert test emails: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsInserting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <ComposeEmail onEmailSent={fetchEmails} />
            <Button 
              onClick={handleInsertTestEmails}
              disabled={isInserting}
              className="w-full"
              variant="outline"
            >
              {isInserting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              {isInserting ? "Adding..." : "Add 30 Test Emails"}
            </Button>
            <Button 
              onClick={analyzeAllEmails}
              disabled={isAnalyzing}
              className="w-full"
              variant="secondary"
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze All"}
            </Button>
            <Link to="/calendar" className="block">
              <Button 
                variant="outline"
                className="w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
            </Link>
            <Link to="/tasks" className="block">
              <Button 
                variant="outline"
                className="w-full"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Tasks
              </Button>
            </Link>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          <Separator />

          <EmailFilters
            selectedCategory={selectedCategory}
            selectedPriority={selectedPriority}
            onCategoryChange={handleCategoryChange}
            onPriorityChange={handlePriorityChange}
            categoryCounts={categoryCounts}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Email Inbox</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredEmails.length} emails</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>

        {/* Email List */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-3">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {emails.length === 0 
                    ? selectedCategory === 'sent'
                      ? "No sent emails yet."
                      : "No emails yet. Compose a new email to get started!"
                    : "No emails match your filters."}
                </p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onToggleRead={handleToggleRead}
                  onToggleStar={handleToggleStar}
                  onDelete={handleDelete}
                  onEmailSent={fetchEmails}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
