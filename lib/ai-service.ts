export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export const getAIResponse = async (messages: Message[], language: string = "English") => {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        messages: [
          {
            role: "system",
            content: `You are Arogya AI, a friendly medical health assistant. Respond in ${language}. Keep responses SHORT and conversational.

RULES:
- For greetings or casual messages → reply naturally and briefly (1-2 sentences max).
- ONLY when the user describes a HEALTH SYMPTOM (fever, pain, cough, etc.) → give structured advice in this format:
  💊 Medicine: [name, dosage, frequency]
  🏥 Hospital: [Apollo General / KIMS / Yashoda Medical Center]
  👨‍⚕️ Doctor: [Dr. Anil Sharma - General / Dr. Rajesh Kumar - Heart / Dr. Sneha Reddy - Skin / Dr. Priya Desai - Kids]
  ✅ Home tip: [1-2 simple tips]
- Never apply the medical format to non-medical questions.
- For emergencies (chest pain, breathing difficulty, heavy bleeding) → say "Call 108 immediately or use the SOS button."
- Always respond in the same language the user writes in.
- End medical responses with: "⚠️ See a real doctor for proper diagnosis."`
          },
          ...messages
        ],
        stream: false
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.message.content as string;
  } catch (error) {
    console.error("AI Error:", error);
    return "⚠️ Cannot connect to Ollama. Make sure it's running: open terminal and type `ollama run phi3`";
  }
};
