// AI helper. If a Gemini/Firebase AI Logic endpoint is configured through an
// environment variable, we call it. Otherwise we return a friendly demo reply
// so the page still works during the defense.
//
// To go live, set VITE_AI_ENDPOINT to a small server (or App Check + AI Logic)
// that holds the API key. Never put a provider key in the browser.
export function aiAvailable() {
  return !!import.meta.env.VITE_AI_ENDPOINT;
}

const DEMO_REPLIES = [
  "I'm a demo assistant. Once the AI service is connected, I'll answer for real.",
  "Great question! This is a placeholder reply until Firebase AI Logic is wired up.",
  "I can help with that soon. For now, this is a simulated response for the demo.",
];

export async function askAI(prompt) {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT;
  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 500));
    return `${DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)]} You said: "${prompt}"`;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("The AI service could not be reached.");
  const data = await res.json();
  return data.reply || data.text || "(no reply)";
}
