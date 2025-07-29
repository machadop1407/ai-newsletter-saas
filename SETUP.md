# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Copy the example file and add your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
INGEST_SIGNING_KEY=your_inngest_signing_key_here
NEWS_API_KEY=your_news_api_key_here
```

## 3. Get API Keys

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to `.env.local`

### News API Key

1. Go to [NewsAPI.org](https://newsapi.org/register)
2. Sign up for a free account
3. Get your API key
4. Add it to `.env.local`

### Inngest Signing Key

1. Go to [Inngest Cloud](https://cloud.inngest.com/)
2. Create a free account
3. Create a new app
4. Get your signing key
5. Add it to `.env.local`

## 4. Run the Application

### Option A: Run Both Servers (Recommended)

```bash
npm run dev:all
```

### Option B: Run Servers Separately

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npx inngest dev
```

## 5. Access the Application

- **Demo Page**: http://localhost:3000 (shows UI without API keys)
- **Full App**: http://localhost:3000/select (requires API keys)
- **Inngest Dev UI**: http://localhost:8288

## 6. Test the Application

1. Visit http://localhost:3000 to see the demo
2. Go to http://localhost:3000/select to use the full version
3. Select categories and generate a newsletter
4. Watch the real-time progress on the newsletter page

## Troubleshooting

- **"Module not found" errors**: Run `npm install`
- **API key errors**: Check your `.env.local` file
- **Inngest connection issues**: Make sure `npx inngest dev` is running
- **News API rate limits**: Free tier has 1000 requests/day limit

## Next Steps

- Customize the AI prompts in `inngest/functions/newsletter.ts`
- Add more categories in `app/select/page.tsx`
- Deploy to Vercel for production use
