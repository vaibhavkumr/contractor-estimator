import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 199,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      '50 estimates per month',
      'PDF export',
      'Email quotes to customers',
      'Basic branding',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 349,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited estimates',
      'PDF export + custom branding',
      'Email quotes to customers',
      'Customer management',
      'Priority support',
      'Estimate analytics',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 599,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      'Everything in Pro',
      'Multiple team members',
      'White-label PDFs',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
}
