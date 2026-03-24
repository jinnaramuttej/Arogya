import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Arogya, an intelligent healthcare assistant.
Your goal is to help users understand their symptoms.
First, ask 1 or 2 follow-up questions to gather more specific details.
Then provide a structured response with:
1. Possible conditions (brief list)
2. Urgency level (Low / Medium / High)
3. Next action (e.g., Book an appointment, Go to Emergency)
4. Disclaimer: "This is an AI analysis, not professional medical advice."
Keep responses concise and compassionate.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Filter to only valid Anthropic message roles
  const anthropicMessages = (messages as Array<{ role: string; content: string }>)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const stream = await client.messages.stream({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: anthropicMessages,
  });

  // Return as a native ReadableStream (text/event-stream) that useChat can consume
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          const data = `0:${JSON.stringify(chunk.delta.text)}\n`;
          controller.enqueue(new TextEncoder().encode(data));
        }
      }
      controller.enqueue(new TextEncoder().encode("0:\"\"\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
