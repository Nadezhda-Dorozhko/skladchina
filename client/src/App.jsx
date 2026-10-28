import { useCallback, useEffect, useState } from "react";
import { clearToken, getToken, setUnauthorizedHandler } from "./api";
import AuthForm from "./components/AuthForm";
import PurchaseList from "./components/PurchaseList";
import Toasts from "./components/Toasts";

export default function App() {
  const [authorized, setAuthorized] = useState(() => Boolean(getToken()));
  const [toasts, setToasts] = useState([]);

  const closeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const notify = useCallback(
    (text, type = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => closeToast(id), 4500);
    },
    [closeToast],
  );

  // Если сервер ответил 401 - возвращаем пользователя на форму входа
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthorized(false);
      notify("Сессия истекла, войдите снова", "error");
    });
  }, [notify]);

  const logout = () => {
    clearToken();
    setAuthorized(false);
  };

  return (
    <div className="app">
      <header>
        <div>
          <h1>Складчины</h1>
          <p>Совместные покупки: собираем сумму вместе</p>
        </div>
        {authorized && (
          <button className="link" onClick={logout}>
            Выйти
          </button>
        )}
      </header>

      {authorized ? (
        <PurchaseList notify={notify} />
      ) : (
        <AuthForm onAuth={() => setAuthorized(true)} />
      )}

      <Toasts toasts={toasts} onClose={closeToast} />
    </div>
  );
}
