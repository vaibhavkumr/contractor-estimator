import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { plan } = await req.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]

  if (!planConfig) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/settings?tab=billing`,
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
