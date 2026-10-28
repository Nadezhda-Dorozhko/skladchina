import { useState } from "react";

const EMPTY = { title: "", organizer: "", targetAmount: "", deadline: "" };

// Форма добавления и редактирования. Если передан editing - работает как редактирование.
// Родитель ставит key={id редактируемого элемента}, поэтому при нажатии
// «Изменить» форма создаётся заново уже с нужными значениями.
export default function PurchaseForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    editing
      ? {
          title: editing.title,
          organizer: editing.organizer,
          targetAmount: String(editing.targetAmount),
          deadline: editing.deadline,
        }
      : EMPTY,
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const organizer = form.organizer.trim();
    const targetAmount = Number(form.targetAmount);
    const { deadline } = form;
    if (!title || !organizer || !(targetAmount > 0) || !deadline) return;

    onSubmit({ title, organizer, targetAmount, deadline });
    setForm(EMPTY);
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editing ? "Редактирование" : "Новая складчина"}</h2>
      <div className="form-row">
        <input
          name="title"
          placeholder="Название"
          value={form.title}
          onChange={handleChange}
        />
        <input
          name="organizer"
          placeholder="Организатор"
          value={form.organizer}
          onChange={handleChange}
        />
        <input
          name="targetAmount"
          type="number"
          min="1"
          placeholder="Цель, руб"
          value={form.targetAmount}
          onChange={handleChange}
        />
        <input
          name="deadline"
          type="date"
          title="Дата окончания сбора"
          value={form.deadline}
          onChange={handleChange}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="primary">
          {editing ? "Сохранить" : "Добавить"}
        </button>
        {editing && (
          <button type="button" className="link" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
