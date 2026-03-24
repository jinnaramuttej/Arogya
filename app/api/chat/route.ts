import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a medical assistant for Arogya, a healthcare app in India.
The user will provide symptoms, age, gender, duration, and severity.

Respond ONLY with a valid JSON object in this exact structure:
{
  "emergency": boolean,
  "conditions": [
    {
      "name": "Disease name",
      "probability": "High | Medium | Low",
      "description": "One sentence explanation",
      "doctor_type": "e.g. Cardiologist, General Physician",
      "action": "home | book | emergency"
    }
  ],
  "immediate_warning": "string or null",
  "general_advice": "One sentence of general advice",
  "disclaimer": "This analysis is for preliminary guidance only and not a substitute for professional medical advice."
}

Return 2-3 conditions maximum. Be conservative — when in doubt mark higher risk.
If any symptom suggests cardiac, respiratory, or neurological emergency, set emergency: true.
Do NOT wrap the JSON in markdown code fences. Return ONLY the raw JSON object.`;

interface SymptomInput {
  symptom: string;
  age: number;
  gender: string;
  duration: string;
  severity: string;
}

export async function POST(req: Request) {
  const body: SymptomInput = await req.json();

  const userMessage = `Symptoms: ${body.symptom}
Age: ${body.age}
Gender: ${body.gender}
Duration: ${body.duration}
Severity: ${body.severity}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const text = textBlock && "text" in textBlock ? textBlock.text : "";

  return new Response(text, {
    headers: { "Content-Type": "application/json" },
  });
}
