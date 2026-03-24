export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export const getAIResponse = async (messages: Message[], language: string = "English") => {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "phi3",
        messages: [
          {
            role: "system",
            content: `You are the advanced AI Health Assistant for Arogya Zenith.
            Current language: ${language}. Please respond in this language.
            
            SITE CAPABILITIES:
            You have the power to help users navigate the website. If a user wants to go somewhere, mention the page name (e.g., "Taking you to the Store") and our system will handle the redirection.
            Key pages:
            - Dashboard (Patient data and overview)
            - Store (Medicines and healthcare products)
            - Symptoms (AI Symptom Checker)
            - SOS/Emergency (Ambulance booking)
            - Blood Donor Network (Search and registration)
            - Health Records (Personal history)
            - E-Prescription (Digital prescriptions)
            - Profile (Settings)

            TONE: Professional, medical, yet accessible. 
            LANGUAGE RULE: ALWAYS respond in the SAME language the user addresses you in. If they speak Hindi, respond in Hindi. If they speak English, respond in English.
            ALWAYS include a disclaimer that you are an AI and not a substitute for professional medical advice.
            If a user mentions a medical emergency, prioritize advising them to use the SOS feature or call emergency services immediately.`
          },
          ...messages
        ],
        stream: false
      })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm sorry, I'm having trouble connecting to the local Ollama instance (phi3). Please ensure Ollama is running or consult a doctor directly.";
  }
};
