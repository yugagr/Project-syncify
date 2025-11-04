export async function askGemini(prompt: string, systemContext?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const parts = [];
  if (systemContext?.trim()) parts.push({ text: systemContext.trim() });
  parts.push({ text: prompt.trim() });

  const body = JSON.stringify({
    contents: [
      {
        role: "user",
        parts,
      },
    ],
  });

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini HTTP ${resp.status} ${resp.statusText}: ${text}`);
  }

  const data = await resp.json();
  const content =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p?.text)
      ?.filter(Boolean)
      ?.join("\n");

  return content?.trim() || "I couldn’t find a good answer. Try rephrasing or adding more details.";
}

export const defaultSystemContext = `
You are Syncify's in-app assistant for a collaborative team and task management platform.
Be concise, actionable, and friendly. Focus on:
- Onboarding flow: Create Team → Create Project → Add Boards (To Do / In Progress / Done) → Invite teammates → Assign tasks → Track progress.
- Efficiency: batching tasks, WIP limits, keyboard shortcuts, recurring reminders, weekly reviews, cycle time, throughput.
- Features: Projects, Boards, Calendar, Teams & permissions, Files, Analytics.
When appropriate, reply with short step-by-step guidance.
`;
