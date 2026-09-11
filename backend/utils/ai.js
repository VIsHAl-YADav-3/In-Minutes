/**
 * Vishal AI support assistant.
 * Uses OpenRouter API if AI_API_KEY is configured,
 * otherwise falls back to a lightweight rule-based responder.
 */

const SYSTEM_PROMPT = `You are Vishal, the friendly and efficient AI support assistant for "In Minutes", a food delivery platform.
You help customers with: order status, delayed orders, Razorpay payment issues, COD questions, failed payments,
restaurant issues, and delivery issues. Be warm, concise (2-4 sentences), and practical. If you don't have enough
information (e.g. no order data provided), ask a clarifying question or tell them how to find it in the app
(Orders tab). Never make up an order status you weren't given. Sign off with your name only if it fits naturally.`;

const buildContext = (context = {}) => {
  const parts = [];

  if (context.recentOrders?.length) {
    parts.push(
      "User's recent orders:\n" +
      context.recentOrders
        .map(
          (o) =>
            `- Order #${o._id}: status=${o.status}, payment=${o.paymentMethod}/${o.paymentStatus}, total=₹${o.totalAmount}, restaurant=${o.restaurantName || "N/A"}`
        )
        .join("\n")
    );
  }

  return parts.join("\n\n");
};

const fallbackReply = (message) => {
  const m = message.toLowerCase();

  if (m.includes("where is my order") || m.includes("track")) {
    return "You can track your order live from the Orders tab. Tap any active order to see its current status.";
  }

  if (m.includes("payment") && (m.includes("fail") || m.includes("not placed"))) {
    return "Sorry about that! If money was deducted but the order wasn't placed, please wait a few minutes while payment verification completes.";
  }

  if (m.includes("cod") || m.includes("cash on delivery")) {
    return "Yes, Cash on Delivery is available for most restaurants. You can select COD during checkout.";
  }

  if (m.includes("delay")) {
    return "Sorry for the wait! Please check your order status in the Orders tab. You can also share your order ID with me.";
  }

  if (m.includes("cancel")) {
    return "You can cancel an order from the Orders tab if the restaurant hasn't started preparing it yet.";
  }

  return "I'm here to help with orders, payments, deliveries, and restaurant issues. Could you tell me more about your problem?";
};

export const getVishalReply = async ({ message, context }) => {
  const provider = process.env.AI_PROVIDER || "openrouter";
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey.includes("your_")) {
    return fallbackReply(message);
  }

  try {
    if (provider === "openrouter") {

      // OPENROUTER API
      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,

            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "In Minutes",
          },

          body: JSON.stringify({
            // FREE MODEL
            model: "openrouter/free",

            max_tokens: 400,

            messages: [
              {
                role: "system",
                content:
                  SYSTEM_PROMPT +
                  "\n\n" +
                  buildContext(context),
              },
              {
                role: "user",
                content: message,
              },
            ],
          }),
        }
      );

      const data = await res.json();

      console.log("OpenRouter Response:", data);

      if (!res.ok) {
        console.error(
          "OpenRouter Error:",
          data?.error?.message || data
        );

        return fallbackReply(message);
      }

      const text =
        data?.choices?.[0]?.message?.content;

      return text || fallbackReply(message);
    }

    return fallbackReply(message);

  } catch (err) {
    console.error("Vishal AI error:", err.message);

    return fallbackReply(message);
  }
};