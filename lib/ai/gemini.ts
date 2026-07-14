// lib/ai/gemini.ts
// Thin wrapper around Google Gemini generateContent (free-tier friendly).
// Server-only — never import from client components.

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

// Fallbacks help when a free model is overloaded (HTTP 503 high demand)
// or has quota 0 for this key.
const MODEL_FALLBACKS = [
  PRIMARY_MODEL,
  'gemini-flash-lite-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest',
].filter((m, i, arr) => arr.indexOf(m) === i);

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiOnce(
  model: string,
  apiKey: string,
  prompt: string,
  responseMimeType?: 'application/json' | 'text/plain',
): Promise<{ ok: true; text: string } | { ok: false; status: number; message: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.2,
  };
  if (responseMimeType === 'application/json') {
    generationConfig.responseMimeType = 'application/json';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: data?.error?.message ?? `Gemini request failed (${res.status})`,
    };
  }

  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || typeof text !== 'string') {
    return { ok: false, status: 502, message: 'Gemini returned an empty response.' };
  }

  return { ok: true, text: text.trim() };
}

async function callGemini(
  prompt: string,
  responseMimeType?: 'application/json' | 'text/plain',
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  let lastMessage = 'Gemini request failed.';

  for (const model of MODEL_FALLBACKS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGeminiOnce(
        model,
        apiKey,
        prompt,
        responseMimeType,
      );

      if (result.ok) {
        return result.text;
      }

      lastMessage = result.message;
      console.warn(
        `[gemini] model=${model} attempt=${attempt + 1} status=${result.status} | ${result.message.slice(0, 180)}`,
      );

      if (!isRetryableStatus(result.status)) {
        break; // try next model for 404/400, don't burn retries
      }

      if (attempt === 0) {
        await sleep(600);
      }
    }
  }

  throw new Error(lastMessage);
}

export async function generateJsonText(prompt: string): Promise<string> {
  return callGemini(prompt, 'application/json');
}

export async function generatePlainText(prompt: string): Promise<string> {
  return callGemini(prompt);
}
