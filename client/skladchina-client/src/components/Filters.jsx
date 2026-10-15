import { CATEGORIES } from "../data/initialPurchases";

const SORT_OPTIONS = [
  { value: "newest", label: "Сначала новые" },
  { value: "deadline", label: "По сроку сбора" },
  { value: "progress", label: "По проценту сбора" },
  { value: "target", label: "По сумме цели" },
];

export default function Filters({ filters, onChange }) {
  const set = (name) => (e) => onChange({ ...filters, [name]: e.target.value });

  return (
    <div className="filters">
      <input
        type="search"
        className="filters-search"
        placeholder="Поиск по названию или организатору"
        aria-label="Поиск"
        value={filters.search}
        onChange={set("search")}
      />
      <select aria-label="Статус" value={filters.status} onChange={set("status")}>
        <option value="all">Все статусы</option>
        <option value="active">Идёт сбор</option>
        <option value="completed">Завершённые</option>
      </select>
      <select aria-label="Категория" value={filters.category} onChange={set("category")}>
        <option value="all">Все категории</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select aria-label="Сортировка" value={filters.sort} onChange={set("sort")}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
