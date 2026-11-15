// Saves account details (currently the student number) on the server.
const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3000";
const TIMEOUT_MS = 15000;

// Resolves to the saved student number (null when cleared). Rejects with an
// Error whose message can be shown to the student as-is.
export async function saveStudentNumber(userId, studentNumber) {
  let response;
  try {
    response = await fetch(`${API_URL}/api/students/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentNumber }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new Error("Couldn't reach the server, so your student number wasn't saved. Try again.");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ? `${body.error}.` : "Your student number couldn't be saved. Try again.");
  }
  return body.studentNumber ?? null;
}
