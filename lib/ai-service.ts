export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export const getAIResponse = async (messages: Message[], language: string = "English"): Promise<string> => {
  try {
    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, language }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.content as string;
  } catch (error) {
    console.error("[Arogya AI] Service error:", error);
    return "⚠️ Could not reach the AI service. Please try again.";
  }
};
