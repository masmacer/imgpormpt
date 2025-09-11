import { NextResponse, type NextRequest } from "next/server";

// Temporarily disable stripe webhooks to avoid database connection issues
// import { handleEvent, stripe, type Stripe } from "@saasfly/stripe";

import { env } from "~/env.mjs";

const handler = async (req: NextRequest) => {
  // Temporarily return a simple response to avoid database connection issues
  console.log("⚠️ Stripe webhooks temporarily disabled");
  return NextResponse.json({ 
    message: "Stripe webhooks temporarily disabled",
    received: true 
  }, { status: 200 });

  /* Original code - temporarily commented out
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    ) as Stripe.DiscriminatedEvent;
    await handleEvent(event);

    console.log("✅ Handled Stripe Event", event.type);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Error when handling Stripe Event: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }
  */
};

export { handler as GET, handler as POST };
