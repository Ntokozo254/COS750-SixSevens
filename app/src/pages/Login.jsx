import { useState } from "react";
import { Hash, LogIn, UserPlus } from "lucide-react";
import { login, register } from "../api/auth";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = isRegister
        ? await register(email, password, name)
        : await login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError("");
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="brand-mark"><Hash size={20} color="#fff" /></div>
          <div>
            <div className="login-brand-name">HashLab</div>
            <div className="login-brand-sub">COS212 · DATA STRUCTURES</div>
          </div>
        </div>

        <h1>{isRegister ? "Create an account" : "Welcome back"}</h1>
        <p className="login-subtitle">
          {isRegister
            ? "Sign up to save your progress."
            : "Log in to continue learning."}
        </p>

        {isRegister && (
          <label className="login-field">
            <span>Name (optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
        )}

        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            required
          />
        </label>

        {error && <div className="login-error" role="alert">{error}</div>}

        <button className="primary-button login-submit" type="submit" disabled={busy}>
          {isRegister ? <UserPlus size={15} /> : <LogIn size={15} />}
          {busy ? "Please wait…" : isRegister ? "Sign up" : "Log in"}
        </button>

        <p className="login-switch">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button type="button" className="text-button" onClick={switchMode}>
            {isRegister ? "Log in" : "Create an account"}
          </button>
        </p>
      </form>
    </div>
  );
}
