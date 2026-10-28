import { useCallback, useEffect, useState } from "react";
import {
  addPurchase,
  deletePurchase,
  fetchPurchases,
  getErrorMessage,
  isCanceled,
  updatePurchase,
} from "../api";

// Вся работа со списком складчин: загрузка + CRUD с оптимистичным обновлением.
// notify(text, type) - функция показа уведомлений.
export function usePurchases(search, notify) {
  const [items, setItems] = useState([]);
  // Результат последнего завершённого запроса: для какого ключа и с какой ошибкой.
  // loading считаем из него, а не храним отдельно (так меньше лишних состояний).
  const [result, setResult] = useState({ key: null, error: null });
  // Меняем reloadKey, чтобы повторить загрузку по кнопке «Повторить»
  const [reloadKey, setReloadKey] = useState(0);

  const requestKey = `${reloadKey}:${search}`;
  const loading = result.key !== requestKey;
  const error = loading ? null : result.error;

  // GET: загрузка (и повторная загрузка при смене поиска).
  // AbortController отменяет устаревший запрос, если пользователь
  // успел изменить поиск или компонент размонтировался.
  useEffect(() => {
    const controller = new AbortController();

    fetchPurchases({ search }, controller.signal)
      .then((list) => {
        setItems(list);
        setResult({ key: requestKey, error: null });
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        setResult({ key: requestKey, error: getErrorMessage(err) });
      });

    return () => controller.abort();
  }, [search, requestKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // POST: сначала показываем элемент (в конце списка, как на сервере) с временным id, потом подменяем ответом сервера
  const add = async (data) => {
    const tempId = `tmp-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      { id: tempId, ...data, status: "active", pending: true },
    ]);
    try {
      const created = await addPurchase({ ...data, status: "active" });
      setItems((prev) => prev.map((i) => (i.id === tempId ? created : i)));
      notify("Складчина добавлена", "success");
    } catch (err) {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
      notify(`Не удалось добавить: ${getErrorMessage(err)}`, "error");
    }
  };

  // PUT: меняем сразу, при ошибке возвращаем старую версию
  const update = async (id, changes) => {
    const before = items.find((i) => i.id === id);
    if (!before) return;
    const next = { ...before, ...changes };

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...next, pending: true } : i)),
    );
    try {
      const saved = await updatePurchase(id, next);
      setItems((prev) => prev.map((i) => (i.id === id ? saved : i)));
    } catch (err) {
      setItems((prev) => prev.map((i) => (i.id === id ? before : i)));
      notify(`Не удалось сохранить: ${getErrorMessage(err)}`, "error");
    }
  };

  // DELETE: убираем сразу, при ошибке возвращаем на то же место
  const remove = async (id) => {
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return;
    const removed = items[index];

    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deletePurchase(id);
    } catch (err) {
      setItems((prev) => {
        const copy = [...prev];
        copy.splice(Math.min(index, copy.length), 0, removed);
        return copy;
      });
      notify(`Не удалось удалить: ${getErrorMessage(err)}`, "error");
    }
  };

  return { items, loading, error, reload, add, update, remove };
}
