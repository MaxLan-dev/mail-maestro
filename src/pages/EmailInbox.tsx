/**
 * ============================================================================
 * EMAIL INBOX COMPONENT
 * ============================================================================
 * 
 * This is the main email inbox component that provides the core email
 * management interface. It handles:
 * 
 * - Email display and organization
 * - Filtering by category and priority
 * - Search functionality
 * - AI-powered email analysis
 * - Email actions (read, star, delete)
 * - Authentication state management
 * 
 * The component uses Supabase for data storage and authentication,
 * and integrates with the Gemini AI service for intelligent email analysis.
 * ============================================================================
 */

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

/**
 * Main Email Inbox component.
 * 
 * This is the primary component for the email management interface.
 * It provides a complete email inbox experience with:
 * 
 * Features:
 * - Email list display with cards
 * - Category and priority filtering
 * - Real-time search
 * - AI-powered email analysis
 * - Email actions (read/unread, star, delete)
 * - Compose new emails
 * - Test data insertion
 * - Navigation to Calendar and Tasks
 * 
 * The component manages its own state and handles all user interactions
 * related to email management.
 * 
 * @component
 * @returns {JSX.Element} The complete email inbox interface
 */
export const EmailInbox = () => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  // All component state variables are defined here
  
  /** Current authenticated user object (null if not logged in) */
  const [user, setUser] = useState<any>(null);
  /** Loading state for initial authentication check */
  const [loading, setLoading] = useState(true);
  /** Complete list of all emails for the current user */
  const [emails, setEmails] = useState<Email[]>([]);
  /** Filtered list of emails based on current filters/search */
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  /** Currently selected category filter ('all', 'starred', 'sent', or specific category) */
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | 'all' | 'starred' | 'sent'>('all');
  /** Currently selected priority filter ('all' or specific priority) */
  const [selectedPriority, setSelectedPriority] = useState<EmailPriority | 'all'>('all');
  /** Current search query string */
  const [searchQuery, setSearchQuery] = useState('');
  /** Whether AI analysis is currently in progress */
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  /** Whether test emails are currently being inserted */
  const [isInserting, setIsInserting] = useState(false);
  /** Count of emails in each category (for sidebar display) */
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  
  /** Toast notification hook for user feedback */
  const { toast } = useToast();

  // ========================================================================
  // AUTHENTICATION SETUP
  // ========================================================================
  // Check authentication status on component mount
  // Sets up auth state listener for real-time updates
  // This effect runs once when the component mounts
  useEffect(() => {
    // Get the current session immediately
    // This checks if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Set the user state (null if no session exists)
      setUser(session?.user ?? null);
      // Mark loading as complete
      setLoading(false);
    });

    // Set up a listener for auth state changes
    // This will fire when user logs in, logs out, or session expires
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Update user state whenever auth state changes
      setUser(session?.user ?? null);
    });

    // Cleanup: unsubscribe from auth state changes when component unmounts
    // This prevents memory leaks
    return () => subscription.unsubscribe();
  }, []); // Empty dependency array means this runs only once on mount

  // ========================================================================
  // EMAIL FETCHING
  // ========================================================================
  // Fetch emails from database when user is authenticated
  // Re-fetches whenever user state changes (login, logout, etc.)
  // This ensures emails are loaded when user logs in and cleared when they log out
  useEffect(() => {
    // Only fetch emails if user is authenticated
    if (user) {
      fetchEmails();
    }
  }, [user]); // Re-run whenever user state changes

  /**
   * Fetches all emails for the authenticated user from Supabase.
   * 
   * This function:
   * 1. Queries the Supabase database for all emails
   * 2. Orders them by date (newest first)
   * 3. Transforms database records into Email objects
   * 4. Handles date conversion and type casting
   * 5. Updates component state with the fetched emails
   * 6. Updates category counts for the sidebar
   * 
   * The transformation step is necessary because:
   * - Database field names use snake_case (from_email, to_email)
   * - Application uses camelCase (from, to)
   * - Dates need to be converted from ISO strings to Date objects
   * - Type casting ensures TypeScript type safety
   */
  const fetchEmails = async () => {
    try {
      // Query Supabase for all emails, ordered by date (newest first)
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("date", { ascending: false }); // Most recent emails first

      // If there's an error, throw it to be caught by the catch block
      if (error) throw error;

      // Transform database records into Email objects
      // This mapping converts database field names to application field names
      // and handles type conversions
      const emailsWithDates = (data || []).map((email: any) => ({
        // Direct field mappings
        id: email.id,
        from: email.from_email,        // Database: from_email -> App: from
        to: email.to_email,            // Database: to_email -> App: to
        subject: email.subject,
        body: email.body,
        // Convert ISO date string to Date object
        date: new Date(email.date),
        read: email.read,
        starred: email.starred,
        // Default to 'inbox' if email_type is not set
        email_type: (email.email_type || 'inbox') as 'inbox' | 'sent',
        // AI-generated fields with defaults
        summary: email.summary,
        category: (email.category || 'uncategorized') as EmailCategory,
        priority: (email.priority || 'medium') as EmailPriority,
        sentiment: (email.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative',
        actionRequired: email.action_required || false,
        // Convert confidence string to number if it exists
        confidence: email.confidence ? parseFloat(email.confidence) : 0,
      }));

      // Update state with fetched emails
      setEmails(emailsWithDates);
      // Initially, filtered emails are the same as all emails
      setFilteredEmails(emailsWithDates);
      // Update category counts for sidebar display
      updateCategoryCounts(emailsWithDates);
    } catch (error: any) {
      // Show error toast notification to user
      toast({
        title: "Error",
        description: "Failed to fetch emails: " + error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * Triggers AI analysis for all emails in the inbox.
   * Uses Supabase Edge Function to process emails in batches.
   * Shows loading state and toast notifications for user feedback.
   */
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

  /**
   * Updates the category count statistics for the sidebar filters.
   * Calculates counts for each category and special filters (all, starred).
   * 
   * @param {Email[]} emailList - List of emails to count
   */
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

  /**
   * Applies category, priority, and search filters to the email list.
   * Filters are applied in sequence: category -> priority -> search.
   * 
   * @param {Email[]} emailList - The full list of emails to filter
   * @param {EmailCategory | 'all' | 'starred' | 'sent'} category - Category filter value
   * @param {EmailPriority | 'all'} priority - Priority filter value
   * @param {string} search - Search query string
   */
  const applyFilters = (
    emailList: Email[],
    category: EmailCategory | 'all' | 'starred' | 'sent',
    priority: EmailPriority | 'all',
    search: string
  ) => {
    let filtered = [...emailList];

    // Category filter - handles special cases (starred, sent) and regular categories
    if (category === 'starred') {
      filtered = filtered.filter(email => email.starred);
    } else if (category === 'sent') {
      filtered = filtered.filter(email => email.email_type === 'sent');
    } else if (category !== 'all') {
      // Filter by specific category, only show inbox emails
      filtered = filtered.filter(email => email.category === category && email.email_type === 'inbox');
    } else {
      // 'all' shows inbox emails only by default (excludes sent emails)
      filtered = filtered.filter(email => email.email_type === 'inbox');
    }

    // Priority filter - further narrows results by priority level
    if (priority !== 'all') {
      filtered = filtered.filter(email => email.priority === priority);
    }

    // Search filter - searches across subject, sender, and body content
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

  // Apply filters automatically when emails, category, priority, or search query changes
  // This ensures the filtered list stays in sync with user interactions
  useEffect(() => {
    applyFilters(emails, selectedCategory, selectedPriority, searchQuery);
  }, [emails, selectedCategory, selectedPriority, searchQuery]);

  // ========================================================================
  // FILTER HANDLERS
  // ========================================================================
  // These handlers update filter state when user interacts with filter controls
  // The actual filtering is done by the applyFilters function via useEffect
  
  /**
   * Handles category filter changes from the sidebar.
   * Updates the selected category state, which triggers filtering.
   * 
   * @param {EmailCategory | 'all' | 'starred' | 'sent'} category - The selected category
   */
  const handleCategoryChange = (category: EmailCategory | 'all' | 'starred' | 'sent') => {
    setSelectedCategory(category);
  };

  /**
   * Handles priority filter changes from the sidebar.
   * Updates the selected priority state, which triggers filtering.
   * 
   * @param {EmailPriority | 'all'} priority - The selected priority
   */
  const handlePriorityChange = (priority: EmailPriority | 'all') => {
    setSelectedPriority(priority);
  };

  /**
   * Handles search input changes.
   * Updates the search query state, which triggers filtering.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // ========================================================================
  // EMAIL ACTION HANDLERS
  // ========================================================================
  // These functions handle user actions on individual emails
  
  /**
   * Toggles the read/unread status of an email.
   * 
   * This function:
   * 1. Finds the email by ID
   * 2. Updates the read status in the database
   * 3. Updates the local state to reflect the change
   * 
   * @param {string} id - The ID of the email to toggle
   */
  const handleToggleRead = async (id: string) => {
    // Find the email in the current emails array
    const email = emails.find(e => e.id === id);
    // If email not found, exit early (shouldn't happen, but safety check)
    if (!email) return;

    try {
      // Update the email's read status in the database
      // Toggle the current read value (true -> false, false -> true)
      const { error } = await supabase
        .from("emails")
        .update({ read: !email.read })
        .eq("id", id); // Only update the email with matching ID

      // If there's an error, throw it
      if (error) throw error;

      // Update local state to reflect the change immediately
      // This provides instant UI feedback without waiting for a refetch
      setEmails(emails.map(e => 
        e.id === id ? { ...e, read: !e.read } : e  // Toggle read status for matching email
      ));
    } catch (error: any) {
      // Show error notification if update fails
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    }
  };

  /**
   * Toggles the starred/favorited status of an email.
   * 
   * This function:
   * 1. Finds the email by ID
   * 2. Updates the starred status in the database
   * 3. Updates the local state to reflect the change
   * 4. Updates category counts (since starred count changes)
   * 
   * @param {string} id - The ID of the email to toggle
   */
  const handleToggleStar = async (id: string) => {
    // Find the email in the current emails array
    const email = emails.find(e => e.id === id);
    // If email not found, exit early
    if (!email) return;

    try {
      // Update the email's starred status in the database
      // Toggle the current starred value
      const { error } = await supabase
        .from("emails")
        .update({ starred: !email.starred })
        .eq("id", id);

      // If there's an error, throw it
      if (error) throw error;

      // Update local state with the new starred status
      const updatedEmails = emails.map(e => 
        e.id === id ? { ...e, starred: !e.starred } : e
      );
      setEmails(updatedEmails);
      // Update category counts because starred count may have changed
      updateCategoryCounts(updatedEmails);
    } catch (error: any) {
      // Show error notification if update fails
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    }
  };

  /**
   * Deletes an email from the database.
   * 
   * This function:
   * 1. Deletes the email from the Supabase database
   * 2. Removes it from the local state
   * 3. Updates category counts
   * 4. Shows a success notification
   * 
   * Note: This is a permanent delete. The email is removed from the database.
   * 
   * @param {string} id - The ID of the email to delete
   */
  const handleDelete = async (id: string) => {
    try {
      // Delete the email from the database
      const { error } = await supabase
        .from("emails")
        .delete()
        .eq("id", id); // Only delete the email with matching ID

      // If there's an error, throw it
      if (error) throw error;

      // Remove the email from local state
      // Filter out the deleted email from the emails array
      const updatedEmails = emails.filter(e => e.id !== id);
      setEmails(updatedEmails);
      // Update category counts since total email count changed
      updateCategoryCounts(updatedEmails);
      
      // Show success notification
      toast({
        title: "Email Deleted",
        description: "The email has been moved to trash.",
      });
    } catch (error: any) {
      // Show error notification if delete fails
      toast({
        title: "Error",
        description: "Failed to delete email",
        variant: "destructive",
      });
    }
  };

  /**
   * Inserts test emails into the database for development/testing purposes.
   * 
   * This function:
   * 1. Gets the current authenticated user
   * 2. Transforms mock email data into database format
   * 3. Inserts all test emails into the database
   * 4. Refreshes the email list to show the new emails
   * 
   * This is useful for:
   * - Testing the application with sample data
   * - Demonstrating features with realistic email content
   * - Development and debugging
   * 
   * The test emails come from the mockEmails data file.
   */
  const handleInsertTestEmails = async () => {
    // Set loading state to show progress indicator
    setIsInserting(true);
    // Show notification that insertion has started
    toast({
      title: "Inserting test emails...",
      description: "Adding 30 test emails to your inbox.",
    });

    try {
      // Get the current authenticated user
      // We need the user ID to associate emails with the user
      const { data: { user } } = await supabase.auth.getUser();
      // If no user, throw error (shouldn't happen if UI is correct)
      if (!user) throw new Error("Not authenticated");

      // Prepare test emails for insertion
      // Transform mock email objects into database format
      const testEmailsData = mockEmails.map((email) => ({
        user_id: user.id,                    // Associate with current user
        from_email: email.from,              // Map 'from' to 'from_email'
        to_email: email.to,                  // Map 'to' to 'to_email'
        subject: email.subject,
        body: email.body,
        date: new Date(email.date).toISOString(), // Convert Date to ISO string
        read: email.read,
        starred: email.starred,
        email_type: 'inbox',                 // All test emails are inbox emails
      }));

      // Insert all test emails into the database in a single operation
      const { error: insertError } = await supabase
        .from("emails")
        .insert(testEmailsData);

      // If insertion fails, throw error
      if (insertError) throw insertError;

      // Refresh the email list to show the newly inserted emails
      await fetchEmails();

      // Show success notification
      toast({
        title: "Success!",
        description: "30 test emails have been added to your inbox.",
      });
    } catch (error: any) {
      // Show error notification if insertion fails
      toast({
        title: "Error",
        description: "Failed to insert test emails: " + error.message,
        variant: "destructive",
      });
    } finally {
      // Always reset loading state, even if there was an error
      setIsInserting(false);
    }
  };

  /**
   * Handles user logout.
   * 
   * Signs the user out of their session and shows a confirmation message.
   * After logout, the component will automatically show the AuthForm
   * because the user state will become null.
   */
  const handleLogout = async () => {
    // Sign out the current user
    await supabase.auth.signOut();
    // Show confirmation message
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    // Note: The useEffect hook will detect the user state change
    // and the component will re-render showing the AuthForm
  };

  // ========================================================================
  // RENDER CONDITIONS
  // ========================================================================
  // Handle different rendering states based on authentication and loading
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not authenticated, show the login/signup form
  if (!user) {
    return <AuthForm />;
  }
  
  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  // User is authenticated, show the full email inbox interface

  return (
    <div className="flex h-screen bg-background">
      {/* ====================================================================
          SIDEBAR
          ====================================================================
          Left sidebar containing:
          - Compose email button
          - Test data insertion button
          - AI analysis button
          - Navigation links (Calendar, Tasks)
          - Logout button
          - Email filters (category and priority)
      */}
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

      {/* ====================================================================
          MAIN CONTENT AREA
          ====================================================================
          Right side containing:
          - Header with title and email count
          - Search bar
          - Scrollable email list
      */}
      <div className="flex-1 flex flex-col">
        {/* Header section with title and search */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Email Inbox</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredEmails.length} emails</span>
            </div>
          </div>

          {/* Search input with icon */}
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

        {/* Scrollable email list container */}
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
