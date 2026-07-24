import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSupabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const planMap = {
  'prod_vanthex_pro': 'pro',
  'prod_vanthex_agency': 'agency',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.mode === 'subscription') {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )

      const productId = subscription.items.data[0].price.product as string
      const userId = session.metadata?.userId

      if (userId) {
        const plan = planMap[productId as keyof typeof planMap] || 'pro'

        await supabase
          .from('users')
          .update({ plan, credits: plan === 'pro' ? 9999 : 9999 })
          .eq('id', userId)

        await supabase.from('subscriptions').insert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_product_id: productId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
        })
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription

    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.id)

    const { data: subData } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (subData) {
      await supabase
        .from('users')
        .update({ plan: 'free', credits: 5 })
        .eq('id', subData.user_id)
    }
  }

  return NextResponse.json({ received: true })
}
