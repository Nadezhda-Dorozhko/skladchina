import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { usePurchases } from "../hooks/usePurchases";
import PurchaseForm from "./PurchaseForm";
import PurchaseItem from "./PurchaseItem";

export default function PurchaseList({ notify }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [editingId, setEditingId] = useState(null);

  // Поиск идёт на сервер, но не на каждую букву, а когда пользователь
  // 400 мс ничего не печатает (debounce)
  const debouncedSearch = useDebounce(search.trim(), 400);

  const { items, loading, error, reload, add, update, remove } = usePurchases(
    debouncedSearch,
    notify,
  );

  const editingItem = items.find((i) => i.id === editingId) ?? null;

  useEffect(() => {
    document.title = loading ? "Загрузка…" : `Складчины (${items.length})`;
  }, [items.length, loading]);

  const handleSubmit = (data) => {
    if (editingItem) {
      update(editingItem.id, data);
      setEditingId(null);
    } else {
      add(data);
    }
  };

  const handleDelete = (id) => {
    if (editingId === id) setEditingId(null);
    remove(id);
  };

  // Фильтр по статусу и сортировка - на клиенте
  const visibleItems = items
    .filter((i) => statusFilter === "all" || i.status === statusFilter)
    .sort((a, b) =>
      sortBy === "target" ? b.targetAmount - a.targetAmount : 0,
    );

  const firstLoad = loading && items.length === 0;

  let content;
  if (firstLoad) {
    content = <p className="message loading">Загружаем складчины…</p>;
  } else if (error) {
    content = (
      <div className="message error-box">
        <p>Не получилось загрузить список: {error}</p>
        <button className="primary" onClick={reload}>
          Повторить
        </button>
      </div>
    );
  } else if (visibleItems.length === 0) {
    content = (
      <p className="message">
        {debouncedSearch ? "По вашему запросу ничего нет" : "Пока пусто"}
      </p>
    );
  } else {
    content = (
      <ul className={`list${loading ? " refreshing" : ""}`}>
        {visibleItems.map((item) => (
          <PurchaseItem
            key={item.id}
            item={item}
            onToggle={() =>
              update(item.id, {
                status: item.status === "active" ? "completed" : "active",
              })
            }
            onEdit={() => setEditingId(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </ul>
    );
  }

  return (
    <div>
      <PurchaseForm
        key={editingItem?.id ?? "new"}
        editing={editingItem}
        onSubmit={handleSubmit}
        onCancel={() => setEditingId(null)}
      />

      <div className="filters">
        <input
          type="search"
          placeholder="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="active">Идёт сбор</option>
          <option value="completed">Завершённые</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="default">Как на сервере</option>
          <option value="target">По сумме цели</option>
        </select>
      </div>

      {content}

      {!firstLoad && !error && (
        <p className="total">
          Всего: {items.length} · завершено:{" "}
          {items.filter((i) => i.status === "completed").length}
        </p>
      )}
    </div>
  );
}
