# Mail Maestro - AI-Powered Email Management

An intelligent email management application powered by Google's Gemini 2.0 Flash AI model.

## Features

### 🤖 AI-Powered Email Analysis
- **Smart Categorization**: Automatically categorizes emails into:
  - Urgent (time-sensitive, requires immediate attention)
  - Important (significant correspondence)
  - Work (business-related emails)
  - Personal (friends & family)
  - Promotions (marketing & advertisements)
  - Spam (unwanted/suspicious content)
  - Newsletter (subscribed updates)
  - Social (social media notifications)

### 📊 Priority-Based Organization
- **Critical**: Urgent + Important emails requiring immediate action
- **High**: Important emails needing attention soon
- **Medium**: Regular emails for normal workflow
- **Low**: FYI emails, newsletters, low-priority notifications
- **Trash**: Spam, promotions, non-essential content

### ✨ Smart Features
- **AI Summaries**: Concise 1-2 sentence summaries of each email
- **Sentiment Analysis**: Detects positive, neutral, or negative tone
- **Action Detection**: Identifies emails requiring responses
- **Confidence Scores**: Shows AI confidence in categorization
- **Key Points Extraction**: Highlights important information
- **Suggested Responses**: AI-generated response suggestions

### 🎨 Modern UI
- Clean, responsive design with shadcn/ui components
- Dark mode support
- Real-time filtering and search
- Category-based navigation
- Visual priority indicators

## Project info

**URL**: https://lovable.dev/projects/c89f4c9f-6eea-4b49-98ba-ae93663bb3a5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c89f4c9f-6eea-4b49-98ba-ae93663bb3a5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **Google Generative AI** - Gemini 2.0 Flash model for AI analysis
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

## Configuration

The Gemini API key is configured in `src/config/gemini.ts`. For production use, it's recommended to use environment variables:

1. Create a `.env` file in the root directory
2. Add your API key: `VITE_GEMINI_API_KEY=your_api_key_here`
3. The application will automatically use the environment variable if available

## Usage

1. Click the **"Analyze with AI"** button to process all emails with Gemini AI
2. Use the sidebar filters to view emails by category or priority
3. Use the search bar to find specific emails
4. Click on emails to expand and view full content
5. Mark emails as read/unread, star important ones, or delete unwanted emails

## AI Model

This application uses **Gemini 2.0 Flash**, Google's latest and fastest AI model, optimized for:
- Quick response times
- High-quality text analysis
- Cost-effective processing
- Accurate categorization and summarization

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c89f4c9f-6eea-4b49-98ba-ae93663bb3a5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
