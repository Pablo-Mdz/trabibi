const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

const TRANSLATION_SYSTEM_PROMPT = `You are an expert Egyptian Arabic translator and phonetics guide. Given a phrase in Spanish or English, return ONLY a JSON object with these fields:
- arabic: the phrase written in Arabic script (Egyptian dialect)
- phonetic: pronunciation in Latin characters as an Egyptian would say it (e.g. 'Bikam da?')
- literal: a brief literal meaning in Spanish
- tips: one short cultural tip if relevant (optional, can be null)
- category: classify as one of: greeting, food, transport, shopping, emergency, smalltalk, other
Return ONLY valid JSON, no markdown, no explanation.`;

const REVERSE_SYSTEM_PROMPT = `You are an expert Egyptian Arabic translator. Translate the given Egyptian Arabic phrase to Spanish. Return ONLY a JSON object with these fields:
- spanish: the Spanish translation
- phonetic: how the Arabic sounds in Latin characters
- notes: any brief cultural or contextual note (can be null)
Return ONLY valid JSON, no markdown, no explanation.`;

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text.trim();
  return JSON.parse(text);
}

export async function translateToArabic(phrase) {
  return callClaude(TRANSLATION_SYSTEM_PROMPT, phrase);
}

export async function translateFromArabic(arabicPhrase) {
  return callClaude(REVERSE_SYSTEM_PROMPT, arabicPhrase);
}
