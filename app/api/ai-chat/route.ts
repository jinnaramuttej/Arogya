import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
  language?: string;
}

const SYSTEM_PROMPT = (language: string) => `You are Arogya AI, a friendly medical health assistant. Respond in ${language}. Keep responses EXTREMELY SHORT and conversational.

RULES:
- If the user provides a NON-MEDICAL document, code, or assignment: DO NOT guess. Simply say: "This does not appear to be a medical report or health query. I can only assist with medical questions and reports."
- NEVER repeat the same greeting or phrase multiple times in a single response.
- For greetings or casual messages → reply naturally and briefly (1 sentence max).
- ONLY when the user describes a HEALTH SYMPTOM (fever, pain, cough, etc.) → give structured advice in this exact format, with NO filler text before or after:
  💊 Medicine: [name, dosage, frequency]
  🏥 Hospital: [Apollo General / KIMS / Yashoda Medical Center]
  👨‍⚕️ Doctor: [Dr. Anil Sharma - General / Dr. Rajesh Kumar - Heart / Dr. Sneha Reddy - Skin / Dr. Priya Desai - Kids]
  ✅ Home tip: [1-2 simple tips]
  ⚠️ See a real doctor for proper diagnosis.
- Never apply the medical format to non-medical questions.
- For emergencies (chest pain, breathing difficulty, heavy bleeding) → say "Call 108 immediately or use the SOS button."
- DO NOT hallucinate. Do not provide walls of text. Stop generating after the structured advice.`;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, language = "English" } = body;

    const systemMessage: Message = {
      role: "system",
      content: SYSTEM_PROMPT(language),
    };

    const fullMessages = [systemMessage, ...messages];

    // Use Ollama (local development)
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        messages: fullMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { content: "⚠️ Cannot connect to Ollama. Open a terminal and run: ollama run phi3" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const content = data.message?.content ?? "Sorry, I could not generate a response.";
    return NextResponse.json({ content });

  } catch (error) {
    console.error("[Arogya AI] Route error:", error);
    return NextResponse.json(
      { content: "⚠️ AI service error. Please try again shortly." },
      { status: 200 }
    );
  }
}
