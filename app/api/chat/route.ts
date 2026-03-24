export const maxDuration = 60;

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

const SYSTEM_PROMPT_ANALYZE = `You are a medical assistant for Arogya, a healthcare app in India.
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

const SYSTEM_PROMPT_CHAT = `You are a medical assistant for Arogya, a healthcare app in India.
The user has already received a symptom analysis and is now asking follow-up questions.
Be helpful, concise, and conservative in your medical advice.
Always remind users that this is not a substitute for professional medical advice.
Respond in plain text, not JSON.`;

const SYSTEM_PROMPT_FILE = `You are a medical assistant for Arogya, a healthcare app in India.
The user has uploaded a medical report. Analyze the text content and provide:
1. A brief summary
2. Key issues or findings
3. Recommended next steps

Respond in a conversational manner. Be clear and concise.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  mode?: "analyze" | "chat" | "file";
  symptom?: string;
  age?: number;
  gender?: string;
  duration?: string;
  severity?: string;
  messages?: ChatMessage[];
  fileText?: string;
  language?: string;
}

async function callOllama(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const ollamaMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3",
      messages: ollamaMessages,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.message?.content || "";
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const mode = body.mode || "analyze";
    const langSuffix = body.language && body.language !== "en"
      ? `\nRespond in ${body.language === "hi" ? "Hindi" : body.language === "te" ? "Telugu" : "English"}.`
      : "";

    let responseText = "";

    if (mode === "analyze") {
      const userMessage = `Symptoms: ${body.symptom}
Age: ${body.age}
Gender: ${body.gender}
Duration: ${body.duration}
Severity: ${body.severity}`;

      responseText = await callOllama(
        SYSTEM_PROMPT_ANALYZE + langSuffix,
        [{ role: "user", content: userMessage }]
      );
    } else if (mode === "chat") {
      const messages = body.messages || [];
      responseText = await callOllama(
        SYSTEM_PROMPT_CHAT + langSuffix,
        messages
      );
    } else if (mode === "file") {
      const fileText = body.fileText || "No content provided";
      responseText = await callOllama(
        SYSTEM_PROMPT_FILE + langSuffix,
        [{ role: "user", content: `Medical report content:\n${fileText}` }]
      );
    }

    return new Response(responseText, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
