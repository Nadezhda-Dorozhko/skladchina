// "2026-09-30" -> "30.09.2026"
const formatDate = (iso) => iso.split("-").reverse().join(".");

// Одна карточка складчины
export default function PurchaseItem({ item, onToggle, onEdit, onDelete }) {
  const done = item.status === "completed";

  return (
    <li className={`item ${item.status}${item.pending ? " pending" : ""}`}>
      <div className="item-main">
        <strong className="item-title">{item.title}</strong>
        <span className="meta">
          {item.organizer} ·{" "}
          <span className={`status ${item.status}`}>
            {done ? "завершена" : "идёт сбор"}
          </span>
          {" · до "}
          {formatDate(item.deadline)}
          {item.pending && <span className="saving"> · сохраняется…</span>}
        </span>
      </div>

      <div className="amount">
        {item.targetAmount.toLocaleString("ru-RU")} руб
        <small>цель</small>
      </div>

      {/* Пока элемент не сохранён на сервере (временный id), трогать его нельзя */}
      <div className="actions">
        <button className="link" disabled={item.pending} onClick={onToggle}>
          {done ? "Возобновить" : "Завершить"}
        </button>
        <button className="link" disabled={item.pending} onClick={onEdit}>
          Изменить
        </button>
        <button
          className="link danger"
          disabled={item.pending}
          onClick={onDelete}
        >
          Удалить
        </button>
      </div>
    </li>
  );
}
