import { useEffect, useRef, useState } from "react";

/**
 * Хук для хранения состояния в localStorage.
 *
 * Возвращает [value, setValue, isLoaded]:
 *  - value     — текущее значение (до загрузки равно пустому значению `emptyValue`);
 *  - setValue  — как у useState (поддерживает функциональное обновление);
 *  - isLoaded  — false, пока идёт «загрузка с сервера» (имитация задержки).
 *
 * Эффект с пустым массивом зависимостей загружает данные при монтировании:
 * если ключа нет в localStorage или данные повреждены — берутся initialValue.
 * Эффект с зависимостью [value] сохраняет данные при каждом изменении.
 */
export function useLocalStorage(key, initialValue, { emptyValue = [], loadDelay = 0, validate } = {}) {
  const [value, setValue] = useState(emptyValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // initialValue и validate хранятся в ref, чтобы не перезапускать эффект загрузки
  const initialRef = useRef(initialValue);
  const validateRef = useRef(validate);

  // 1. Загрузка при монтировании
  useEffect(() => {
    const timer = setTimeout(() => {
      let loaded = initialRef.current;
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          const parsed = JSON.parse(raw);
          const ok = validateRef.current ? validateRef.current(parsed) : true;
          if (ok) loaded = parsed;
          else console.warn(`localStorage["${key}"]: неверный формат данных, использованы начальные`);
        }
      } catch (err) {
        console.warn(`localStorage["${key}"]: не удалось прочитать данные`, err);
      }
      setValue(loaded);
      setIsLoaded(true);
    }, loadDelay);

    // Очистка нужна, в том числе, из-за двойного монтирования в React.StrictMode
    return () => clearTimeout(timer);
    // key и loadDelay в приложении не меняются, поэтому массив зависимостей пустой
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Сохранение при каждом изменении (но только после загрузки,
  //    иначе пустое начальное значение затёрло бы сохранённые данные)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`localStorage["${key}"]: не удалось сохранить данные`, err);
    }
  }, [value, isLoaded, key]);

  return [value, setValue, isLoaded];
}
