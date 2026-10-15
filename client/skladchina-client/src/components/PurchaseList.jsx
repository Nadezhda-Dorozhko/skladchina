import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialPurchases } from "../data/initialPurchases";
import { progressPercent, withStatus } from "../utils/format";
import PurchaseForm from "./PurchaseForm";
import PurchaseCard from "./PurchaseCard";
import Filters from "./Filters";
import Stats from "./Stats";

const STORAGE_KEY = "skladchina:purchases";
const LOAD_DELAY_MS = 1000; // имитация загрузки с сервера

const DEFAULT_FILTERS = { search: "", status: "all", category: "all", sort: "newest" };

const sorters = {
  newest: (a, b) => b.id - a.id,
  deadline: (a, b) => a.deadline.localeCompare(b.deadline),
  progress: (a, b) => progressPercent(b) - progressPercent(a),
  target: (a, b) => b.targetAmount - a.targetAmount,
};

const isValidList = (data) => Array.isArray(data) && data.every((i) => i && typeof i === "object");

/** Главный компонент: список складчин с добавлением, редактированием, удалением, фильтрами и статистикой. */
export default function PurchaseList() {
  const [items, setItems, isLoaded] = useLocalStorage(STORAGE_KEY, initialPurchases, {
    loadDelay: LOAD_DELAY_MS,
    validate: isValidList,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [editingId, setEditingId] = useState(null);

  // Побочный эффект: заголовок страницы зависит от количества складчин
  useEffect(() => {
    if (!isLoaded) {
      document.title = "Загрузка… — Складчины";
      return;
    }
    const active = items.filter((i) => i.status === "active").length;
    document.title = `Складчины: ${items.length} (активных: ${active})`;
  }, [items, isLoaded]);

  // Фильтрация и сортировка — производные данные, их не нужно хранить в state
  const visibleItems = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return items
      .filter((i) => filters.status === "all" || i.status === filters.status)
      .filter((i) => filters.category === "all" || i.category === filters.category)
      .filter(
        (i) =>
          !query ||
          i.title.toLowerCase().includes(query) ||
          i.organizer.toLowerCase().includes(query),
      )
      .sort(sorters[filters.sort]);
  }, [items, filters]);

  const editingItem = items.find((i) => i.id === editingId) ?? null;

  const handleSubmit = (data) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? withStatus({ ...i, ...data }) : i)),
      );
      setEditingId(null);
    } else {
      const newItem = withStatus({
        ...data,
        id: Date.now(),
        currentAmount: 0,
        status: "active",
        participants: [],
      });
      setItems((prev) => [newItem, ...prev]);
    }
  };

  const handleDelete = (id) => {
    const item = items.find((i) => i.id === id);
    if (!window.confirm(`Удалить складчину «${item.title}»?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleAddParticipant = (id, { name, contribution }) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? withStatus({
              ...i,
              participants: [...i.participants, { id: Date.now(), name, contribution }],
              currentAmount: i.currentAmount + contribution,
            })
          : i,
      ),
    );
  };

  const handleRemoveParticipant = (id, participantId) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const removed = i.participants.find((p) => p.id === participantId);
        return withStatus({
          ...i,
          participants: i.participants.filter((p) => p.id !== participantId),
          currentAmount: i.currentAmount - (removed?.contribution ?? 0),
        });
      }),
    );
  };

  const handleReset = () => {
    if (!window.confirm("Вернуть демонстрационные данные? Текущий список будет заменён.")) return;
    setItems(initialPurchases);
    setFilters(DEFAULT_FILTERS);
    setEditingId(null);
  };

  return (
    <>
      <Stats items={items} />

      <div className="layout">
        <aside>
          <PurchaseForm
            key={editingId ?? "new"}
            editingItem={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => setEditingId(null)}
          />
        </aside>

        <section aria-live="polite">
          <Filters filters={filters} onChange={setFilters} />

          {!isLoaded ? (
            <p className="state-message">
              <span className="spinner" aria-hidden="true" /> Загружаем складчины…
            </p>
          ) : visibleItems.length === 0 ? (
            <div className="state-message">
              {items.length === 0 ? (
                <>
                  <p>Список пуст. Создайте первую складчину в форме слева.</p>
                  <button className="btn" onClick={handleReset}>
                    Загрузить демо-данные
                  </button>
                </>
              ) : (
                <>
                  <p>По выбранным условиям ничего не найдено.</p>
                  <button className="btn" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Сбросить фильтры
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="list-count">
                Показано {visibleItems.length} из {items.length}
              </p>
              <ul className="cards">
                {visibleItems.map((item) => (
                  <PurchaseCard
                    key={item.id}
                    item={item}
                    onEdit={setEditingId}
                    onDelete={handleDelete}
                    onAddParticipant={handleAddParticipant}
                    onRemoveParticipant={handleRemoveParticipant}
                  />
                ))}
              </ul>
            </>
          )}

          {isLoaded && items.length > 0 && (
            <button className="link-btn reset-btn" onClick={handleReset}>
              Вернуть демо-данные
            </button>
          )}
        </section>
      </div>
    </>
  );
}
