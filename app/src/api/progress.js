// Loads and saves each account's progress on the server, so progress belongs
// to the signed-in student instead of to the browser.
const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3000";
const TIMEOUT_MS = 15000;

async function request(userId, options = {}) {
  const response = await fetch(
    `${API_URL}/api/students/${encodeURIComponent(userId)}/progress-record`,
    { ...options, signal: AbortSignal.timeout(TIMEOUT_MS) }
  );
  if (!response.ok) throw new Error(`Progress request failed (${response.status})`);
  return response.json();
}

// The saved record, or null when this student has no progress yet.
export async function fetchProgress(userId) {
  const body = await request(userId);
  return body.progress ?? null;
}

export async function saveProgress(userId, progress) {
  await request(userId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress }),
  });
}
