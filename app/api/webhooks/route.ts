import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe"; // your Stripe client
import { createClient } from "@/lib/supabase/server";

const webhookSecret =
  "whsec_bc9c0db4602707b75f6c5ea6496cb9124750971f0cb337c6734bf55b7b5dd3d4";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  const supabase = await createClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      // fetch the Subscription object to get current_period_*, price, status, etc.
      const subscription = (await stripe.subscriptions.retrieve(
        subscriptionId,
        {
          expand: ["items.data.price.product"],
        }
      )) as Stripe.Subscription;

      const priceId = subscription.items.data[0].price.id;
      const now = new Date(
        subscription.items.data[0].current_period_start * 1000
      ).toISOString();
      const end = new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString();

      // user lookup: assuming you’ve stored stripe_customer_id → auth.users.id mapping elsewhere
      // if you don’t, you can look it up via metadata on the Checkout Session or Customer
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error("Could not find supabase user for customer:", customerId);
        break;
      }

      console.log("userId", userId);

      // upsert into subscriptions table
      const { error: dbErr } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          status: subscription.status,
          current_period_start: now,
          current_period_end: end,
          cancel_at_period_end: subscription.cancel_at_period_end || false,
        },
        { onConflict: "user_id" }
      );

      if (dbErr) console.error("Error upserting subscription:", dbErr);
      break;
    }

    // optionally handle invoice.payment_succeeded, customer.subscription.updated, etc.
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
