// lib/ai/gemini.ts
// Thin wrapper around Google Gemini generateContent (free-tier friendly).
// Server-only — never import from client components.

// gemini-2.0-flash often returns free-tier quota 0 for new AI Studio keys.
// gemini-flash-latest tracks Google's current free Flash model.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function generateJsonText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.error?.message ?? `Gemini request failed (${res.status})`;
    throw new Error(message);
  }

  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || typeof text !== 'string') {
    throw new Error('Gemini returned an empty response.');
  }

  return text.trim();
}
