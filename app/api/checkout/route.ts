import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPriceIdFromType } from "@/lib/plans";

export async function POST(request: NextRequest) {
  /// PASS USER ID FROM FRONTEND
  const { plan = "month", userId, email } = await request.json();
  const priceId = getPriceIdFromType(plan);
  if (!priceId) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const origin = "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: userId, plan },

    success_url: `${origin}/select`,
    cancel_url: `http://localhost:3000/subscribe`,
    customer_email: email,
  });

  return NextResponse.json({ url: session.url });
}
