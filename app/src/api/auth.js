// Talks to the server's /api/auth routes.
// Set VITE_API_URL in app/.env if the server isn't on localhost:3000.
const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3000";
const STORAGE_KEY = "hashlab-user";
const TIMEOUT_MS = 15000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_NAME = 100;

// An error the login form can show as-is. `field` says which input it is about
// (so the form can highlight and focus it); `action` offers a next step.
export class AuthError extends Error {
  constructor(message, { field = null, action = null } = {}) {
    super(message);
    this.name = "AuthError";
    this.field = field;
    this.action = action;
  }
}

// ---- Checks before anything is sent (same rules as the server) ----

export function validateLogin({ email, password }) {
  if (!EMAIL.test(email.trim())) {
    return new AuthError("Enter a valid email address, like name@example.com.", { field: "email" });
  }
  if (!password) return new AuthError("Enter your password.", { field: "password" });
  return null;
}

export function validateRegistration({ name, surname, email, password }) {
  if (!name.trim()) return new AuthError("Enter your name.", { field: "name" });
  if (!surname.trim()) return new AuthError("Enter your surname.", { field: "surname" });
  if (name.trim().length > MAX_NAME) {
    return new AuthError(`Your name can be at most ${MAX_NAME} characters.`, { field: "name" });
  }
  if (surname.trim().length > MAX_NAME) {
    return new AuthError(`Your surname can be at most ${MAX_NAME} characters.`, { field: "surname" });
  }
  if (!EMAIL.test(email.trim())) {
    return new AuthError("Enter a valid email address, like name@example.com.", { field: "email" });
  }
  if (password.length < MIN_PASSWORD) {
    return new AuthError(`Use at least ${MIN_PASSWORD} characters for your password.`, { field: "password" });
  }
  return null;
}

// ---- Turning a failed request into a helpful message ----

// The server's 400 messages are already written for people; this just links
// each one to the field it is about.
function fieldForServerMessage(message) {
  const text = message.toLowerCase();
  if (text.includes("surname")) return "surname";
  if (text.includes("name")) return "name";
  if (text.includes("email")) return "email";
  if (text.includes("password")) return "password";
  return null;
}

const UNAVAILABLE = {
  login: "We couldn't log you in right now. Please try again in a moment.",
  register: "We couldn't create your account right now. Please try again in a moment.",
};

export function errorFromResponse(status, data, kind) {
  const serverMessage = typeof data?.error === "string" ? data.error.trim() : "";

  if (status === 400 && serverMessage) {
    const message = /[.!?]$/.test(serverMessage) ? serverMessage : `${serverMessage}.`;
    return new AuthError(message, { field: fieldForServerMessage(serverMessage) });
  }
  if (status === 401) {
    // One message for unknown email and wrong password, so the form never
    // reveals which emails have accounts.
    return new AuthError("Email and password does not match an account. Check them and try again.", {
      field: "password",
    });
  }
  if (status === 409) {
    return new AuthError("An account with this email already exists.", { field: "email", action: "login" });
  }
  if (status === 429) {
    return new AuthError("Too many attempts. Wait a minute, then try again.");
  }
  return new AuthError(UNAVAILABLE[kind]);
}

function isValidUser(data) {
  return Boolean(data && typeof data === "object" && data.id !== undefined && typeof data.email === "string");
}

async function post(path, body, kind, fetchImpl = fetch) {
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  if (offline) {
    throw new AuthError("You appear to be offline. Check your internet connection and try again.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetchImpl(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new AuthError("This is taking longer than usual. Please try again.");
    }
    throw new AuthError("We couldn't connect to HashLab. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw errorFromResponse(res.status, data, kind);
  if (!isValidUser(data)) throw new AuthError(UNAVAILABLE[kind]);
  return data;
}

export function login(email, password, fetchImpl) {
  const invalid = validateLogin({ email, password });
  if (invalid) return Promise.reject(invalid);
  return post("/api/auth/login", { email: email.trim(), password }, "login", fetchImpl);
}

export function register({ name, surname, email, password }, fetchImpl) {
  const invalid = validateRegistration({ name, surname, email, password });
  if (invalid) return Promise.reject(invalid);
  return post(
    "/api/auth/register",
    { name: name.trim(), surname: surname.trim(), email: email.trim(), password },
    "register",
    fetchImpl,
  );
}

export function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}
