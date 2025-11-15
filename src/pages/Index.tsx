import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailCard, Email } from "@/components/EmailCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Mail, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockEmails: Email[] = [
    {
      id: "1",
      from: "John Doe",
      subject: "Q4 Budget Review Meeting",
      snippet: "Hi team, I'd like to schedule a meeting to review our Q4 budget allocations...",
      date: "2h ago",
      category: "Work",
      summary: "Meeting request to review Q4 budget with the team",
      isRead: false,
    },
    {
      id: "2",
      from: "Sarah Smith",
      subject: "Weekend Plans",
      snippet: "Hey! Are you free this weekend? I was thinking we could...",
      date: "5h ago",
      category: "Personal",
      summary: "Casual weekend hangout invitation from a friend",
      isRead: false,
    },
    {
      id: "3",
      from: "Bank of America",
      subject: "Your Monthly Statement is Ready",
      snippet: "Your statement for November 2024 is now available...",
      date: "1d ago",
      category: "Finance",
      summary: "Monthly bank statement notification with account summary",
      isRead: true,
    },
    {
      id: "4",
      from: "TechCrunch Newsletter",
      subject: "The latest in AI and startups",
      snippet: "Today's top stories: New AI breakthrough, funding rounds...",
      date: "2d ago",
      category: "Newsletter",
      summary: "Tech news digest covering AI developments and startup funding",
      isRead: true,
    },
  ];

  const handleConnectGmail = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Gmail OAuth connection
      toast({
        title: "Gmail Connection",
        description: "Gmail OAuth integration coming soon!",
      });
      
      // For now, load mock data
      setTimeout(() => {
        setEmails(mockEmails);
        setIsLoading(false);
        toast({
          title: "Success",
          description: "Loaded sample emails with AI summaries!",
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Gmail",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setEmails(mockEmails);
    toast({
      title: "Refreshed",
      description: "Email list updated",
    });
  };

  const categories = Array.from(new Set(emails.map((e) => e.category).filter(Boolean))) as string[];
  const filteredEmails = selectedCategory
    ? emails.filter((e) => e.category === selectedCategory)
    : emails;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-lg">
                <Mail className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Email Intelligence
                </h1>
                <p className="text-muted-foreground">
                  AI-powered email summaries and categorization
                </p>
              </div>
            </div>
            {emails.length > 0 && (
              <Button onClick={handleRefresh} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="text-center max-w-md">
              <div className="mb-6 p-6 bg-primary/10 rounded-full inline-block">
                <Sparkles className="h-16 w-16 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                Get Started with Email Intelligence
              </h2>
              <p className="text-muted-foreground mb-8">
                Connect your Gmail account to start receiving AI-powered email summaries
                and automatic categorization powered by Gemini.
              </p>
              <Button
                size="lg"
                onClick={handleConnectGmail}
                disabled={isLoading}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Connect Gmail Account
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Email List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-semibold">
                  {selectedCategory ? `${selectedCategory} Emails` : "All Emails"} ({filteredEmails.length})
                </h2>
              </div>
              {filteredEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => {
                    toast({
                      title: "Email Details",
                      description: "Full email view coming soon!",
                    });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
