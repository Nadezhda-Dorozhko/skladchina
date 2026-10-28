import { useState } from "react";
import { getErrorMessage, login, register, saveToken } from "../api";

// Форма входа / регистрации. После успеха сохраняет JWT и зовёт onAuth().
export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const token = await (isLogin ? login : register)(email.trim(), password);
      if (!token) throw new Error("Сервер не вернул токен");
      saveToken(token);
      onAuth();
    } catch (err) {
      setError(err.response ? getErrorMessage(err) : err.message);
      setBusy(false);
    }
  };

  return (
    <form className="card auth" onSubmit={handleSubmit}>
      <h2>{isLogin ? "Вход" : "Регистрация"}</h2>
      <label>
        Почта
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </label>
      <label>
        Пароль
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="primary" disabled={busy}>
        {busy ? "Подождите…" : isLogin ? "Войти" : "Создать аккаунт"}
      </button>
      <p className="auth-switch">
        {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(isLogin ? "register" : "login");
            setError("");
          }}
        >
          {isLogin ? "Зарегистрироваться" : "Войти"}
        </button>
      </p>
    </form>
  );
}
