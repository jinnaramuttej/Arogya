import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-3-5-haiku-20241022"),
    system: `You are Arogya, an intelligent healthcare assistant. 
    Your goal is to help users understand their symptoms.
    First, ask 1 or 2 follow-up questions to gather more specific details about their symptoms.
    Then, provide a structured response containing:
    1. Possible conditions (brief list)
    2. Urgency level (Low/Medium/High)
    3. Next action (e.g., Book an appointment, Go to Emergency)
    4. Disclaimer: "This is an AI analysis, not professional medical advice."
    Keep responses concise and compassionate. Avoid long paragraphs.`,
    messages,
  });

  return result.toDataStreamResponse();
}
