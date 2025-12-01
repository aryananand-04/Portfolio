# Portfolio Website

A personal portfolio website built with Next.js 14, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── data/            # Static data (skills, projects)
├── lib/             # Utilities and database connections
├── public/          # Static assets (images, icons)
└── .claude/         # Development notes (not committed)
```

## Database Setup

This project uses Vercel Postgres for data storage.

### Tables:
- **projects**: Store project information
- **metrics**: Track portfolio metrics

### Setup Database:
1. Create a Postgres database on Vercel
2. Copy the connection strings to your `.env` file
3. Run the schema:
   - Copy contents of `lib/schema.sql`
   - Execute in Vercel Postgres dashboard
4. (Optional) Run `lib/seed.sql` for sample data

## Deployment

### Deploy to Vercel:
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

Environment variables needed:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- Other database connection strings (see `.env.example`)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **Deployment**: Vercel

## License

MIT
