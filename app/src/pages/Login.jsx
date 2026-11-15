import { useRef, useState } from "react";
import { Hash, LogIn, UserPlus } from "lucide-react";
import { AuthError, login, register } from "../api/auth";

const ERROR_ID = "login-error";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // { message, field, action } or null
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);
  const surnameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const user = isRegister
        ? await register({ name, surname, email, password })
        : await login(email, password);
      onLogin(user);
    } catch (err) {
      const known = err instanceof AuthError;
      setError({
        message: known
          ? err.message
          : `We couldn't ${isRegister ? "create your account" : "log you in"} right now. Please try again in a moment.`,
        field: known ? err.field : null,
        action: known ? err.action : null,
      });
      const fieldRefs = { name: nameRef, surname: surnameRef, email: emailRef, password: passwordRef };
      if (known && err.field) fieldRefs[err.field]?.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError(null);
  }

  // Editing the field an error is about clears that error.
  function edit(field, setter) {
    return (event) => {
      setter(event.target.value);
      if (error?.field === field) setError(null);
    };
  }

  // Props that mark a field as the one the current error is about.
  function errorProps(field) {
    return error?.field === field ? { "aria-invalid": true, "aria-describedby": ERROR_ID } : {};
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
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
          <div className="login-row">
            <label className="login-field">
              <span>Name</span>
              <input
                type="text"
                ref={nameRef}
                value={name}
                onChange={edit("name", setName)}
                {...errorProps("name")}
                autoComplete="given-name"
                maxLength={100}
                required
              />
            </label>

            <label className="login-field">
              <span>Surname</span>
              <input
                type="text"
                ref={surnameRef}
                value={surname}
                onChange={edit("surname", setSurname)}
                {...errorProps("surname")}
                autoComplete="family-name"
                maxLength={100}
                required
              />
            </label>
          </div>
        )}

        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            ref={emailRef}
            value={email}
            onChange={edit("email", setEmail)}
            {...errorProps("email")}
            autoComplete="email"
            required
          />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            ref={passwordRef}
            value={password}
            onChange={edit("password", setPassword)}
            {...errorProps("password")}
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            required
          />
        </label>

        {error && (
          <div className="login-error" id={ERROR_ID} role="alert">
            <span>{error.message}</span>
            {error.action === "login" && (
              <button type="button" className="text-button login-error-action" onClick={switchMode}>
                Log in instead
              </button>
            )}
          </div>
        )}

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
