'use server'

export async function generateHeroImage(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '16:9' }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorData}`);
  }

  const data = await response.json();
  if (!data.predictions || !data.predictions[0] || !data.predictions[0].bytesBase64Encoded) {
    throw new Error('Invalid response format from Gemini API');
  }

  return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
}
