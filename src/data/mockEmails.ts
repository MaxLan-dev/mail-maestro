import type { Email } from "@/types/email";

export const mockEmails: Omit<Email, 'summary' | 'category' | 'priority' | 'sentiment' | 'actionRequired' | 'confidence'>[] = [
  {
    id: '1',
    from: 'boss@company.com',
    to: 'you@company.com',
    subject: 'URGENT: Q4 Report Due Tomorrow',
    body: `Hi,

I need the Q4 financial report on my desk by 9 AM tomorrow. This is critical for the board meeting at 10 AM. Please prioritize this above everything else.

The report should include:
- Revenue breakdown by product
- Cost analysis
- Profit margins
- Growth projections for Q1

Let me know if you have any issues.

Best regards,
Sarah Johnson
CEO`,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    starred: false,
  },
  {
    id: '2',
    from: 'notifications@linkedin.com',
    to: 'you@company.com',
    subject: 'You have 5 new connection requests',
    body: `Hi there!

You have 5 new connection requests on LinkedIn. Connect with them to expand your professional network.

View your pending invitations now!

Best,
LinkedIn Team`,
    date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: true,
    starred: false,
  },
  {
    id: '3',
    from: 'deals@amazon.com',
    to: 'you@company.com',
    subject: '🎉 Black Friday Sale! Up to 70% OFF - Limited Time Only!',
    body: `BLACK FRIDAY MEGA SALE!

Get up to 70% off on thousands of items! This is the biggest sale of the year!

✅ Electronics - Up to 60% off
✅ Fashion - Up to 70% off
✅ Home & Kitchen - Up to 50% off
✅ Books - Up to 40% off

Sale ends in 24 hours! Shop now before items sell out!

Click here to browse all deals: [Shop Now]

Happy Shopping!
Amazon Deals Team`,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: false,
    starred: false,
  },
  {
    id: '4',
    from: 'team@project.com',
    to: 'you@company.com',
    subject: 'Project Alpha Update - Meeting Notes',
    body: `Hi Team,

Here are the notes from today's Project Alpha meeting:

Completed:
- Frontend UI mockups approved
- Database schema finalized
- API endpoints designed

In Progress:
- Backend implementation (60% done)
- Frontend development starting next week

Blockers:
- Waiting on design assets from the design team
- Need approval for additional cloud resources

Next meeting: Friday at 2 PM

Best,
Project Team`,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    starred: true,
  },
  {
    id: '5',
    from: 'mom@family.com',
    to: 'you@company.com',
    subject: 'Dinner this Sunday?',
    body: `Hi sweetie,

Hope you're doing well! Dad and I were wondering if you'd like to come over for dinner this Sunday. I'm making your favorite lasagna!

Let me know if you can make it. It would be great to catch up.

Love,
Mom`,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    starred: true,
  },
  {
    id: '6',
    from: 'phishing@suspicious.ru',
    to: 'you@company.com',
    subject: 'Your account has been compromised! Act now!',
    body: `URGENT SECURITY ALERT!!!

Your account has been compromised. Click here immediately to verify your identity and secure your account: [SUSPICIOUS LINK]

If you don't act within 24 hours, your account will be permanently deleted!

Enter your password and credit card details here: [MALICIOUS LINK]

Security Team`,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: false,
    starred: false,
  },
  {
    id: '7',
    from: 'newsletter@techcrunch.com',
    to: 'you@company.com',
    subject: 'TechCrunch Daily: AI Revolution Continues',
    body: `Good morning!

Here's what's happening in tech today:

🔥 Top Stories:
- New AI model breaks performance records
- Tech giant announces major layoffs
- Startup raises $100M Series B
- New regulations for social media platforms

💡 Featured Article:
"The Future of AI in Healthcare" - How artificial intelligence is transforming medical diagnosis and treatment.

📊 Market Update:
Tech stocks mixed as investors await Fed decision.

Read the full newsletter on our website.

Best,
TechCrunch Team`,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    read: true,
    starred: false,
  },
  {
    id: '8',
    from: 'client@bigcorp.com',
    to: 'you@company.com',
    subject: 'Important: Contract Renewal Discussion',
    body: `Dear Partner,

I hope this email finds you well. I wanted to reach out regarding our upcoming contract renewal scheduled for next month.

We've been very satisfied with your services over the past year and would like to discuss:
1. Extending the contract for another 2 years
2. Expanding the scope of services
3. Updated pricing structure

Could we schedule a call next week to discuss these items? Please let me know your availability.

Looking forward to continuing our partnership.

Best regards,
Michael Chen
VP of Operations, BigCorp Inc.`,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    read: false,
    starred: true,
  },
  {
    id: '9',
    from: 'hr@company.com',
    to: 'you@company.com',
    subject: 'Annual Performance Review Scheduled',
    body: `Hi,

Your annual performance review has been scheduled for next Friday, November 22nd at 3:00 PM in Conference Room B.

Please prepare:
- Self-assessment form (attached)
- List of accomplishments from the past year
- Goals for next year
- Any questions or concerns you'd like to discuss

If this time doesn't work for you, please let me know ASAP so we can reschedule.

Best,
HR Department`,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    read: true,
    starred: false,
  },
  {
    id: '10',
    from: 'updates@github.com',
    to: 'you@company.com',
    subject: '[Repository] New pull request requires your review',
    body: `Hello,

A new pull request has been opened in repository "awesome-project" and your review has been requested.

Pull Request #142: "Add new authentication feature"
Author: john.doe
Files changed: 15
Lines added: +342
Lines removed: -87

Description:
Implements OAuth 2.0 authentication with Google and GitHub providers. Includes tests and documentation updates.

Please review at your earliest convenience.

GitHub`,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    read: true,
    starred: false,
  },
  {
    id: '11',
    from: 'marketing@spam-company.com',
    to: 'you@company.com',
    subject: 'Make $10,000 per month working from home!!!',
    body: `AMAZING OPPORTUNITY!!!

Want to make $10,000 per month working from home in your spare time???

No experience needed! No investment required! Start earning TODAY!!!

This is a LIMITED TIME offer! Only 50 spots available!!!

CLICK HERE NOW to claim your spot: [SPAM LINK]

Don't miss out on this life-changing opportunity!!!

Best regards,
Success Team`,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    read: false,
    starred: false,
  },
  {
    id: '12',
    from: 'support@company.com',
    to: 'you@company.com',
    subject: 'System Maintenance Tonight',
    body: `Dear Team,

This is to inform you that we will be performing system maintenance tonight from 11:00 PM to 2:00 AM EST.

During this time:
- Email services may be intermittent
- File server will be unavailable
- VPN access may be affected

Please save your work and log out before 11:00 PM. The system should be fully operational by 2:00 AM.

We apologize for any inconvenience.

IT Support Team`,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    read: true,
    starred: false,
  },
];

