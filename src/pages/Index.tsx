import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmailCard, Email } from "@/components/EmailCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Mail, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");
  const [googleClientId, setGoogleClientId] = useState<string>("");

  // Fetch Google Client ID on mount
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-client-id');
        if (error) throw error;
        setGoogleClientId(data.clientId);
      } catch (error) {
        console.error('Failed to fetch Google Client ID:', error);
        toast.error('Failed to initialize Gmail connection');
      }
    };
    
    fetchClientId();
  }, []);

  // Check for OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && !accessToken) {
      handleAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleAuthCallback = async (code: string) => {
    try {
      setIsLoading(true);
      toast.loading('Connecting to Gmail...');
      
      const redirectUri = `${window.location.origin}/`;
      
      const { data, error } = await supabase.functions.invoke('gmail-auth', {
        body: { code, redirectUri }
      });

      if (error) throw error;
      
      setAccessToken(data.accessToken);
      toast.dismiss();
      toast.success('Successfully connected to Gmail!');
      
      // Auto-fetch emails after connection
      await fetchEmails(data.accessToken);
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.dismiss();
      toast.error('Failed to connect to Gmail: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGmail = () => {
    if (!googleClientId) {
      toast.error('Gmail connection not initialized');
      return;
    }
    
    const redirectUri = `${window.location.origin}/`;
    const scope = 'https://www.googleapis.com/auth/gmail.readonly';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    
    window.location.href = authUrl;
  };

  const fetchEmails = async (token?: string) => {
    const tokenToUse = token || accessToken;
    if (!tokenToUse) {
      toast.error('Please connect to Gmail first');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Fetching emails...');

      const { data: fetchData, error: fetchError } = await supabase.functions.invoke('fetch-emails', {
        body: { accessToken: tokenToUse, maxResults: 20 }
      });

      if (fetchError) throw fetchError;

      toast.dismiss();
      
      if (!fetchData.emails || fetchData.emails.length === 0) {
        toast.info('No emails found');
        return;
      }

      toast.loading('Analyzing emails with AI...');

      const { data: summarizeData, error: summarizeError } = await supabase.functions.invoke('summarize-emails', {
        body: { emails: fetchData.emails }
      });

      if (summarizeError) throw summarizeError;

      setEmails(summarizeData.summarizedEmails);
      toast.dismiss();
      toast.success(`Successfully processed ${summarizeData.summarizedEmails.length} emails!`);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.dismiss();
      toast.error('Failed to fetch emails: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEmails();
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
                    toast.info("Full email view coming soon!");
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
