# Contractor Estimator

A web app for contractors to turn a job description into a priced, branded
estimate PDF and email it to the customer — with subscription billing behind it.

## What it does

- **AI estimate drafting** — describe the job in plain language and Claude
  drafts the line items, which the contractor then edits rather than writing
  from scratch (`app/api/ai/generate`, `lib/anthropic.ts`).
- **Customer and estimate records** — dashboard for customers, estimate list,
  and a per-estimate detail view (`app/(dashboard)/`).
- **PDF generation** — renders an estimate to a downloadable PDF via
  `@react-pdf/renderer` (`app/api/estimates/[id]/pdf`).
- **Quote delivery** — sends the finished quote to the customer
  (`app/api/send-quote`).
- **Subscription billing** — Stripe Checkout with starter/pro/enterprise price
  tiers and a webhook to keep subscription state in sync
  (`app/api/stripe/`).
- **Auth** — Supabase email auth with a route-guarded dashboard layout and
  middleware (`app/(auth)/`, `middleware.ts`).

## Stack

Next.js (App Router) · TypeScript · Supabase (Postgres + auth) ·
Stripe · Anthropic Claude API · react-pdf · react-hook-form + zod ·
Tailwind with class-variance-authority

## Layout

```
app/(auth)/          login, signup
app/(dashboard)/     dashboard, customers, estimates (list / new / [id]), settings
app/api/ai/          Claude estimate generation
app/api/estimates/   PDF rendering
app/api/stripe/      checkout session + webhook
app/api/send-quote/  quote delivery
lib/                 supabase (browser + server), stripe, anthropic clients
middleware.ts        auth gating
```

## Running it

```bash
npm install
cp .env.local.example .env.local   # then fill in your own keys
npm run dev
```

Requires your own Supabase project, Stripe account (test mode is fine), and an
Anthropic API key. `.env.local` is gitignored and contains a Supabase service
role key — never commit it.

## Status

Feature-complete through the core loop: sign up, create a customer, generate an
estimate, render the PDF, send it, and subscribe. Not deployed publicly, and
the Stripe integration has only been exercised in test mode.

## Timeline

Written April 2026 (30 source files).

Dates come from file modification times on disk, not from commit history - this repository was initialised later, so the commit dates are all from when it was published rather than when the code was written.
