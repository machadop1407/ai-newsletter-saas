# Personalized AI Newsletter SaaS

A Next.js 15+ application that generates personalized weekly newsletters using AI. Users can select their interests from various categories, and the system fetches recent news articles and creates a custom summary using OpenAI.

## Features

- 🎯 **Category Selection**: Choose from 8 different news categories
- 🤖 **AI-Powered Summarization**: Uses OpenAI GPT-4 to create engaging newsletters
- ⚡ **Real-time Progress**: Live updates during newsletter generation
- 🔄 **Durable Workflows**: Built with Inngest for reliable background processing
- 📱 **Responsive Design**: Beautiful, mobile-friendly UI with Tailwind CSS
- 🚀 **Modern Stack**: Next.js 15+ with App Router and TypeScript

## Tech Stack

- **Frontend**: Next.js 15+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Workflows**: Inngest (durable background jobs)
- **AI**: OpenAI GPT-4
- **News API**: NewsAPI.org

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- API keys for:
  - [OpenAI](https://platform.openai.com/api-keys)
  - [NewsAPI](https://newsapi.org/register)
  - [Inngest](https://cloud.inngest.com/) (sign up for free)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd personalized-newsletter
npm install
```

### 2. Environment Variables

Copy the example environment file and add your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# OpenAI API Key for AI summarization
OPENAI_API_KEY=your_openai_api_key_here

# Inngest signing key for webhook verification
INGEST_SIGNING_KEY=your_inngest_signing_key_here

# News API key for fetching articles
NEWS_API_KEY=your_news_api_key_here
```

### 3. Run the Development Servers

You need to run two development servers:

**Terminal 1 - Next.js App:**

```bash
npm run dev
```

**Terminal 2 - Inngest Dev Server:**

```bash
npx inngest dev
```

### 4. Access the Application

- **Next.js App**: http://localhost:3000
- **Inngest Dev UI**: http://localhost:8288

## How It Works

1. **Category Selection** (`/select`): Users choose their interests from 8 categories
2. **Workflow Trigger** (`/api/generate`): Sends an Inngest event with selected categories
3. **Background Processing**: Inngest function fetches news articles and generates AI summary
4. **Real-time Updates** (`/newsletter`): Frontend polls for progress and displays results
5. **Newsletter Display**: Shows the final AI-generated newsletter with article count and categories

## Project Structure

```
personalized-newsletter/
├── app/
│   ├── select/
│   │   └── page.tsx              # Category selection UI
│   ├── newsletter/
│   │   └── page.tsx              # Newsletter display & progress
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts          # Triggers newsletter generation
│   │   ├── inngest/
│   │   │   └── route.ts          # Inngest webhook receiver
│   │   └── newsletter/
│   │       └── status/
│   │           └── route.ts      # Checks generation status
│   └── page.tsx                  # Redirects to /select
├── inngest/
│   ├── client.ts                 # Inngest client configuration
│   └── functions/
│       └── newsletter.ts         # Newsletter generation workflow
├── lib/
│   └── news.ts                   # News API helper functions
└── env.example                   # Environment variables template
```

## API Endpoints

- `POST /api/generate` - Start newsletter generation
- `GET /api/newsletter/status?runId=<id>` - Check generation status
- `POST /api/inngest` - Inngest webhook receiver

## Available Categories

- Technology
- Business
- Sports
- Entertainment
- Science
- Health
- Politics
- Environment

## Development

### Adding New Categories

1. Update the `categories` array in `app/select/page.tsx`
2. The system will automatically fetch news for new categories

### Customizing AI Prompts

Edit the system prompt in `inngest/functions/newsletter.ts` to change the newsletter style and format.

### Styling

The app uses Tailwind CSS. Customize styles in `tailwind.config.js` or modify the component classes.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your production environment:

- `OPENAI_API_KEY`
- `INGEST_SIGNING_KEY`
- `NEWS_API_KEY`

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Run `npm install` to ensure all dependencies are installed
2. **API key errors**: Verify your environment variables are correctly set
3. **Inngest connection issues**: Check that the Inngest dev server is running
4. **News API rate limits**: Free tier has 1000 requests/day limit

### Debug Mode

Enable debug logging by setting `DEBUG=inngest:*` in your environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Check the [Inngest documentation](https://www.inngest.com/docs)
- Review [Next.js documentation](https://nextjs.org/docs)
- Open an issue in this repository
