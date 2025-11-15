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
  {
    id: '13',
    from: 'sale@bestbuy.com',
    to: 'you@company.com',
    subject: '🔥 MEGA SALE: Electronics Up to 80% OFF + Free Shipping!',
    body: `BEST BUY MEGA ELECTRONICS SALE!

Unbeatable prices on top brands! Limited quantities available!

🎮 Gaming Consoles - Save $200
💻 Laptops - Up to 70% off
📱 Smartphones - Huge discounts
🎧 Audio Equipment - 60% off
📺 TVs - Black Friday prices now!

FREE SHIPPING on all orders over $35!
Plus, get an extra 10% off with code: MEGA10

Sale ends Sunday at midnight! Shop now before items sell out!

[SHOP NOW]

Best Buy Deals Team`,
    date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    read: false,
    starred: false,
  },
  {
    id: '14',
    from: 'cfo@company.com',
    to: 'you@company.com',
    subject: 'URGENT: Budget Approval Needed by EOD',
    body: `Hi,

I need your approval on the Q1 budget proposal by end of day today. This is blocking the entire department's planning process.

The proposal includes:
- Marketing budget: $500K
- Engineering resources: $1.2M
- Operations overhead: $300K

Please review the attached spreadsheet and provide your sign-off. If you have concerns, let's jump on a call immediately.

This cannot wait until tomorrow.

Thanks,
David Chen
CFO`,
    date: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: false,
    starred: true,
  },
  {
    id: '15',
    from: 'no-reply@facebook.com',
    to: 'you@company.com',
    subject: 'You have 12 new notifications',
    body: `Hi there,

You have 12 new notifications on Facebook:

• Sarah Johnson commented on your post
• Mike Williams tagged you in a photo
• 5 people liked your recent update
• New friend request from Alex Thompson
• Your friend posted for the first time in a while
• And more...

See what's happening now!

The Facebook Team`,
    date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    read: true,
    starred: false,
  },
  {
    id: '16',
    from: 'deals@walmart.com',
    to: 'you@company.com',
    subject: 'Grocery Deals: Save $50 on Your Next Order!',
    body: `Walmart Grocery Savings!

Get $50 OFF your next grocery order of $150 or more!

Fresh Produce - Up to 40% off
Meat & Seafood - Buy 1 Get 1 Free
Dairy Products - Special pricing
Pantry Staples - Stock up and save

Use code: GROCERY50 at checkout

Offer valid through this weekend. Free same-day pickup available!

[START SHOPPING]

Walmart Grocery Team`,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: false,
    starred: false,
  },
  {
    id: '17',
    from: 'legal@company.com',
    to: 'you@company.com',
    subject: 'URGENT: Contract Signature Required - Deadline Tomorrow',
    body: `URGENT - ACTION REQUIRED

The vendor contract for our new software implementation requires your signature by tomorrow 5 PM.

Contract value: $2.5M
Term: 3 years
Legal review: Completed

Delay will result in:
- Project postponement by 2 months
- Loss of negotiated pricing ($300K penalty)
- Vendor may withdraw from agreement

Please review and sign via DocuSign immediately. Link: [SIGN NOW]

If you have any concerns, call me directly at ext. 4567.

Jennifer Martinez
General Counsel`,
    date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    starred: true,
  },
  {
    id: '18',
    from: 'rewards@starbucks.com',
    to: 'you@company.com',
    subject: '⭐ Congrats! You earned a FREE drink!',
    body: `Hey Coffee Lover!

Great news! You've earned 150 Stars and qualified for a FREE drink of your choice!

Your reward is ready to redeem:
🌟 Any size beverage
🌟 Any customizations
🌟 Valid for 30 days

Plus, this week only:
- Double Stars on all purchases
- Bonus 50 Stars for trying our new holiday drinks

Visit any Starbucks location and enjoy your free drink!

Happy Sipping!
Starbucks Rewards Team`,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    starred: false,
  },
  {
    id: '19',
    from: 'colleague@company.com',
    to: 'you@company.com',
    subject: 'Quick question about the presentation',
    body: `Hey,

Quick question - are you using the updated slide deck for tomorrow's client presentation? I made some changes to the revenue projections on slides 8-12.

Also, did you want me to present the competitive analysis section, or are you covering that?

Let me know when you have a sec.

Thanks!
Jessica`,
    date: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    read: true,
    starred: false,
  },
  {
    id: '20',
    from: 'travel-deals@expedia.com',
    to: 'you@company.com',
    subject: '✈️ Flash Sale: Flights to Paris from $299! 24 Hours Only!',
    body: `INCREDIBLE TRAVEL DEAL!

Fly to Paris for just $299 roundtrip!

✈️ Routes from major US cities
🏨 Hotel packages starting at $89/night
🎫 Free cancellation up to 48 hours
⭐ 4 & 5 star hotels included

Plus exclusive bonuses:
- Free airport lounge access
- Priority boarding
- Extra baggage allowance

This price won't last! Book within 24 hours to secure this amazing deal!

Departures available: March - May

[BOOK NOW]

Expedia Travel Deals`,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: false,
    starred: false,
  },
  {
    id: '21',
    from: 'security@company.com',
    to: 'you@company.com',
    subject: 'CRITICAL: Security Breach Detected - Immediate Action Required',
    body: `SECURITY ALERT - CRITICAL PRIORITY

We have detected unusual access attempts on your company account from an unrecognized location.

Details:
- Location: Moscow, Russia
- Time: 2:34 AM EST
- Device: Unknown Windows PC
- Failed login attempts: 15

IMMEDIATE ACTION REQUIRED:
1. Change your password immediately
2. Enable two-factor authentication
3. Review recent account activity
4. Report any suspicious emails

If this was not you, your account may be compromised. Please contact IT Security immediately at ext. 9999.

Do not ignore this message.

IT Security Team`,
    date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    read: false,
    starred: true,
  },
  {
    id: '22',
    from: 'newsletter@medium.com',
    to: 'you@company.com',
    subject: 'Your Weekly Digest: Top Stories in Tech',
    body: `Medium Daily Digest

Here are today's top stories curated for you:

📱 "The Future of AI in Mobile Apps" by Sarah Chen
5 min read | 2.3K claps

💼 "How I Built a $10M SaaS Business" by Mike Johnson  
8 min read | 5.1K claps

🚀 "Startup Lessons from Failed Founders" by Tech Insider
6 min read | 3.8K claps

🤖 "ChatGPT vs Google Gemini: A Deep Dive" by AI Weekly
10 min read | 4.2K claps

Read these stories and more on Medium.

Happy reading!
The Medium Team`,
    date: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
    read: true,
    starred: false,
  },
  {
    id: '23',
    from: 'offers@target.com',
    to: 'you@company.com',
    subject: '🎯 Today Only: Extra 30% Off Clearance + Free Shipping!',
    body: `TARGET CLEARANCE BLOWOUT!

Extra 30% OFF already reduced clearance items!

Categories included:
🏠 Home & Furniture - Up to 70% off
👕 Clothing & Accessories - Up to 80% off
🎮 Toys & Games - Up to 60% off
💄 Beauty & Personal Care - Up to 50% off
🍽️ Kitchen & Dining - Up to 65% off

Plus FREE SHIPPING - No minimum!

Use code: CLEAR30 at checkout

Hurry! Quantities are limited and selling fast!
Sale ends tonight at 11:59 PM!

[SHOP CLEARANCE]

Target Deals`,
    date: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
    read: false,
    starred: false,
  },
  {
    id: '24',
    from: 'recruiter@techcorp.com',
    to: 'you@company.com',
    subject: 'Exciting Senior Engineer Opportunity - $180K-$220K',
    body: `Hi,

I came across your profile and I'm impressed with your background. I'm recruiting for a Senior Software Engineer position at TechCorp that I think would be a great fit.

Position Details:
- Title: Senior Full Stack Engineer
- Salary: $180K - $220K + equity
- Location: Remote or San Francisco
- Team: 12 engineers, fast-growing startup

Tech Stack:
- React, TypeScript, Node.js
- AWS, Kubernetes, PostgreSQL
- Modern DevOps practices

Benefits:
- Unlimited PTO
- Top-tier health insurance
- $5K annual learning budget
- Latest equipment of your choice

Would you be open to a quick 15-minute call to discuss?

Best regards,
Rachel Kim
Technical Recruiter, TechCorp`,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: false,
    starred: true,
  },
  {
    id: '25',
    from: 'notifications@twitter.com',
    to: 'you@company.com',
    subject: 'Your tweet is trending!',
    body: `Hi there!

Great news! Your recent tweet is getting a lot of attention:

"Just shipped a new feature at work and it feels amazing! 🚀"

📊 Stats so far:
- 1,247 likes
- 189 retweets
- 56 replies
- Trending in #TechTwitter

Keep the conversation going and engage with your audience!

See what people are saying: [VIEW TWEET]

Twitter`,
    date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: true,
    starred: false,
  },
  {
    id: '26',
    from: 'billing@company.com',
    to: 'you@company.com',
    subject: 'URGENT: Payment Failed - Service Suspension in 24 Hours',
    body: `URGENT: PAYMENT ISSUE

Your last payment of $12,450.00 has failed to process.

Account: Premium Enterprise Plan
Due Date: Yesterday
Amount Due: $12,450.00

If payment is not received within 24 hours:
- All services will be suspended
- Data access will be restricted
- Additional late fees will apply ($500)

Update your payment method immediately to avoid service interruption.

[UPDATE PAYMENT METHOD]

This is an automated system notice. Reply to this email for assistance.

Billing Department`,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: false,
    starred: true,
  },
  {
    id: '27',
    from: 'fitness@myfitnesspal.com',
    to: 'you@company.com',
    subject: 'You hit your weekly goal! 🎉',
    body: `Congratulations! 🎉

You've completed your weekly fitness goal!

This week's achievements:
✅ 5 workouts completed
✅ 12,500 steps daily average
✅ Calorie goal met 6/7 days
✅ 56 oz water intake daily

You're on fire! Keep up the amazing work!

Next week's challenge:
- Increase to 6 workouts
- Add 15 min strength training
- Try a new healthy recipe

Your consistency is inspiring! 💪

MyFitnessPal Team`,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    starred: false,
  },
  {
    id: '28',
    from: 'insurance@scammer.ru',
    to: 'you@company.com',
    subject: 'You have unclaimed insurance money! Claim $5,000 NOW!',
    body: `URGENT NOTIFICATION!!!

Our records show you have UNCLAIMED INSURANCE MONEY!!!

Amount: $5,000.00
Reference: INS-8842-XYZ
Expires in: 48 HOURS!!!

You are entitled to this money from an old policy. This is 100% LEGITIMATE and FREE!!!

To claim your money:
1. Click here immediately: [SUSPICIOUS LINK]
2. Enter your social security number
3. Provide bank account details
4. Pay small processing fee of $99

DON'T MISS OUT!!! This offer expires soon!!!

Insurance Claims Department
(Not affiliated with any real insurance company)`,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    read: false,
    starred: false,
  },
  {
    id: '29',
    from: 'events@company.com',
    to: 'you@company.com',
    subject: 'You\'re invited: Annual Company Holiday Party',
    body: `You're Invited! 🎉

Annual Company Holiday Party
Friday, December 20th, 6:00 PM - 11:00 PM
The Grand Hotel, Downtown

Join us for an evening of:
- Dinner and open bar
- Live entertainment
- Awards ceremony
- Secret Santa gift exchange
- Dancing and celebration

Dress code: Semi-formal
Plus-one welcome!

Please RSVP by December 10th: [RSVP LINK]

Looking forward to celebrating with you!

Events Team`,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    read: true,
    starred: false,
  },
  {
    id: '30',
    from: 'alerts@bankofamerica.com',
    to: 'you@company.com',
    subject: 'Unusual Activity Detected on Your Account',
    body: `Bank of America Security Alert

We've detected unusual activity on your account ending in ****4892.

Suspicious Transaction:
Date: Today, 10:45 AM
Amount: $2,847.92
Merchant: Electronics Store (Russia)
Location: Moscow

Was this you?

If YES: No action needed, ignore this message.

If NO: Take immediate action:
1. Call us at 1-800-XXX-XXXX
2. Lock your card through mobile app
3. Review recent transactions

To help protect you, we've temporarily limited your account until we hear from you.

Your security is our priority.

Bank of America Fraud Prevention`,
    date: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    read: false,
    starred: true,
  },
];

