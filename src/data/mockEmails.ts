import type { Email } from "@/types/email";

export const mockEmails: Omit<Email, 'summary' | 'category' | 'priority' | 'sentiment' | 'actionRequired' | 'confidence'>[] = [
  {
    id: '1',
    from: 'boss@company.com',
    to: 'you@company.com',
    subject: 'URGENT: Q4 Report Due Tomorrow + Team Meeting',
    body: `Hi,

I need the Q4 financial report on my desk by 9 AM tomorrow. This is critical for the board meeting at 10 AM. Please prioritize this above everything else.

The report should include:
- Revenue breakdown by product
- Cost analysis
- Profit margins
- Growth projections for Q1

Also, please review the draft presentation by end of day today and have John update the sales figures by 5 PM.

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
    from: 'hr@company.com',
    to: 'you@company.com',
    subject: 'Team Building Event - Next Friday',
    body: `Hi Team,

We're organizing a team building event next Friday, November 22nd at 2:00 PM at the Downtown Convention Center.

Event Details:
- Date: Friday, November 22, 2025
- Time: 2:00 PM - 5:00 PM
- Location: Downtown Convention Center, Room 301
- Attendees: All engineering team members (you, Sarah, Mike, Jennifer, David)

Please RSVP by Wednesday so we can finalize catering arrangements. Also, if anyone has dietary restrictions, please let me know by tomorrow.

Looking forward to seeing everyone there!

Best,
HR Team`,
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
    subject: 'Project Alpha Sprint Planning - Action Items',
    body: `Hi Team,

Sprint planning completed! Here are the action items from today's meeting:

Action Items:
1. Complete API documentation by Friday (assigned to Mike)
2. Review and approve UI designs by end of week (assigned to you)
3. Set up CI/CD pipeline ASAP - this is blocking deployment (assigned to Jennifer)
4. Write unit tests for authentication module by next Monday (assigned to David)
5. Schedule client demo for next Wednesday at 3 PM

The sprint review meeting is scheduled for:
- Date: Monday, November 25, 2025
- Time: 10:00 AM - 11:30 AM
- Location: Conference Room B
- Attendees: Engineering team, Product team, Stakeholders

Please update your task status in Jira by end of day tomorrow.

Best,
Project Manager`,
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

Hope you're doing well! Dad and I were wondering if you'd like to come over for dinner this Sunday, November 17th at 6:30 PM. I'm making your favorite lasagna!

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
    body: `Today's Top Stories:

1. New AI model breaks benchmarks across multiple categories
2. Tech giants announce massive cloud infrastructure investments
3. Startup funding hits record high in Q4
4. Regulatory changes coming to social media platforms

Read the full stories on our website.

TechCrunch Team`,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    read: true,
    starred: false,
  },
  {
    id: '8',
    from: 'client@enterprise.com',
    to: 'you@company.com',
    subject: 'Re: Implementation Timeline and Deliverables',
    body: `Hi,

Thank you for the proposal. We need to discuss a few changes to the timeline:

Immediate Actions Needed:
1. Please send us the updated technical specification document by Wednesday
2. Can you have your team prepare a demo of the authentication module by Friday?
3. We need to schedule a kickoff meeting for next week - preferably Tuesday at 2 PM

Also, our CTO wants to review the security architecture. Can you prepare a security audit report by Monday?

The official kickoff meeting will be:
- Date: Tuesday, November 19, 2025
- Time: 2:00 PM - 4:00 PM
- Location: Virtual (Zoom link to follow)
- Attendees: Your team leads, our CTO, Product Manager, and Security team

Please confirm your availability.

Best regards,
Michael Chen
Enterprise Solutions`,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    read: false,
    starred: true,
  },
  {
    id: '9',
    from: 'recruiter@techcorp.com',
    to: 'you@company.com',
    subject: 'Exciting Senior Developer Opportunity at TechCorp',
    body: `Hi there,

I came across your profile and wanted to reach out about an exciting opportunity at TechCorp. We're looking for a Senior Full Stack Developer to join our growing team.

What we offer:
- Competitive salary ($150K - $200K)
- Remote work options
- Stock options
- Comprehensive benefits
- Amazing team culture

Would you be interested in a quick 15-minute call to discuss this opportunity? I have availability this week on Tuesday or Thursday.

Best regards,
Lisa Thompson
Senior Technical Recruiter`,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    read: true,
    starred: false,
  },
  {
    id: '10',
    from: 'support@github.com',
    to: 'you@company.com',
    subject: 'GitHub Security Alert: Dependency Vulnerability Detected',
    body: `Security Alert

A high-severity vulnerability has been detected in one of your repository dependencies.

Repository: company/project-alpha
Vulnerability: CVE-2024-12345 in lodash@4.17.20
Severity: High

Recommended Actions:
1. Update lodash to version 4.17.21 or higher immediately
2. Run security audit on all dependencies by end of this week
3. Review and update your security policy

This vulnerability could allow remote code execution. Please address this as soon as possible.

View full details: [Link to GitHub]

GitHub Security Team`,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    read: false,
    starred: true,
  },
  {
    id: '11',
    from: 'events@conference.com',
    to: 'you@company.com',
    subject: 'Confirmed: Tech Summit 2025 Registration',
    body: `Registration Confirmed!

You're all set for Tech Summit 2025!

Event Details:
- Event: Tech Summit 2025 - AI & Cloud Track
- Date: December 5-7, 2025
- Time: 9:00 AM - 6:00 PM (all three days)
- Location: San Francisco Convention Center, Hall A
- Badge Name: Your Name

Important Reminders:
- Please arrive 30 minutes early for badge pickup on Day 1
- Download the conference app for the full schedule
- Network reception on December 5th at 7 PM (same venue)

We look forward to seeing you there!

Tech Summit Team`,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    read: true,
    starred: false,
  },
  {
    id: '12',
    from: 'manager@company.com',
    to: 'you@company.com',
    subject: 'Q4 Performance Review Scheduled',
    body: `Hi,

Your Q4 performance review has been scheduled. Please prepare the following before our meeting:

Preparation Tasks:
1. Complete self-assessment form by November 20th
2. Gather examples of key achievements and projects from this quarter
3. Prepare your goals and development areas for Q1 2026
4. Have Sarah provide peer feedback by November 18th

Review Meeting:
- Date: Wednesday, November 20, 2025
- Time: 3:00 PM - 4:00 PM
- Location: My Office (or Zoom if you prefer)
- Attendees: You, me, HR representative

This is also a good opportunity to discuss your career development plans and any concerns you might have.

Looking forward to our discussion!

Best,
Your Manager`,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    read: true,
    starred: true,
  },
];
