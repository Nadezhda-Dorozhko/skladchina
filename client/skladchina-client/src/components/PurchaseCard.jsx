import { useState } from "react";
import { formatDate, formatMoney, progressPercent, todayISO } from "../utils/format";

export default function PurchaseCard({ item, onEdit, onDelete, onAddParticipant, onRemoveParticipant }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");

  const percent = progressPercent(item);
  const completed = item.status === "completed";
  const overdue = !completed && item.deadline < todayISO();

  const handleAdd = (e) => {
    e.preventDefault();
    const amount = Number(contribution);
    if (!name.trim() || Number.isNaN(amount) || amount <= 0) return;
    onAddParticipant(item.id, { name: name.trim(), contribution: amount });
    setName("");
    setContribution("");
  };

  return (
    <li className={`card ${completed ? "is-completed" : ""}`}>
      <div className="card-head">
        <h3>{item.title}</h3>
        <div className="badges">
          <span className="badge">{item.category}</span>
          {completed && <span className="badge badge-done">Завершена</span>}
          {overdue && <span className="badge badge-overdue">Срок истёк</span>}
        </div>
      </div>

      {item.description && <p className="card-desc">{item.description}</p>}

      <div
        className="meter"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Собрано"
      >
        <div className="meter-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="card-money">
        <strong>{formatMoney(item.currentAmount)}</strong>
        <span>
          из {formatMoney(item.targetAmount)} · {percent}%
        </span>
      </div>

      <p className="card-meta">
        Организатор: {item.organizer} · до {formatDate(item.deadline)}
      </p>

      <div className="card-actions">
        <button className="btn btn-small" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          Участники ({item.participants.length})
        </button>
        <button className="btn btn-small" onClick={() => onEdit(item.id)}>
          Редактировать
        </button>
        <button className="btn btn-small btn-danger" onClick={() => onDelete(item.id)}>
          Удалить
        </button>
      </div>

      {open && (
        <div className="participants">
          {item.participants.length === 0 ? (
            <p className="hint">Пока никто не вложился. Добавьте первого участника.</p>
          ) : (
            <ul>
              {item.participants.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <span className="participants-sum">{formatMoney(p.contribution)}</span>
                  <button
                    className="link-btn"
                    onClick={() => onRemoveParticipant(item.id, p.id)}
                    aria-label={`Убрать участника ${p.name}`}
                  >
                    убрать
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="participant-form" onSubmit={handleAdd}>
            <input
              placeholder="Имя участника"
              aria-label="Имя участника"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="number"
              min="1"
              placeholder="Взнос, ₽"
              aria-label="Взнос"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
            />
            <button type="submit" className="btn btn-small btn-primary">
              Добавить
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
