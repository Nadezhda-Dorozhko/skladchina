import { useEffect, useState } from "react";

// Возвращает value с задержкой: обновляется, только когда
// пользователь перестал менять значение на delay миллисекунд
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
