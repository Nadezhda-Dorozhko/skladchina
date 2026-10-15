import { useEffect, useState } from "react";
import { CATEGORIES } from "../data/initialPurchases";
import { todayISO } from "../utils/format";

const DRAFT_KEY = "skladchina:draft";
const EMPTY_FORM = {
  title: "",
  organizer: "",
  targetAmount: "",
  deadline: "",
  category: "другое",
  description: "",
};

const toForm = (item) => ({
  title: item.title,
  organizer: item.organizer,
  targetAmount: String(item.targetAmount),
  deadline: item.deadline,
  category: item.category,
  description: item.description ?? "",
});

// Черновик новой складчины восстанавливается после перезагрузки страницы
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_FORM, ...JSON.parse(raw) } : EMPTY_FORM;
  } catch {
    return EMPTY_FORM;
  }
}

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Укажите название";
  if (!form.organizer.trim()) errors.organizer = "Укажите организатора";
  const amount = Number(form.targetAmount);
  if (!form.targetAmount || Number.isNaN(amount) || amount <= 0) {
    errors.targetAmount = "Сумма должна быть больше нуля";
  }
  if (!form.deadline) errors.deadline = "Укажите срок сбора";
  return errors;
}

/**
 * Форма создания и редактирования складчины.
 * Родитель ставит key={editingId ?? "new"}, поэтому при переключении
 * между режимами форма создаётся заново с нужными начальными значениями.
 */
export default function PurchaseForm({ editingItem, onSubmit, onCancel }) {
  const isEdit = Boolean(editingItem);
  const [form, setForm] = useState(() => (isEdit ? toForm(editingItem) : loadDraft()));
  const [errors, setErrors] = useState({});
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  // Автосохранение черновика с debounce: пишем в localStorage через 500 мс
  // после последнего изменения полей. При каждом новом вводе таймер сбрасывается.
  useEffect(() => {
    if (isEdit) return;
    const timer = setTimeout(() => {
      const isEmpty = JSON.stringify(form) === JSON.stringify(EMPTY_FORM);
      if (isEmpty) {
        localStorage.removeItem(DRAFT_KEY);
        setDraftSavedAt(null);
      } else {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        setDraftSavedAt(new Date());
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      title: form.title.trim(),
      organizer: form.organizer.trim(),
      targetAmount: Number(form.targetAmount),
      deadline: form.deadline,
      category: form.category,
      description: form.description.trim(),
    });

    if (!isEdit) {
      localStorage.removeItem(DRAFT_KEY);
      setForm(EMPTY_FORM);
      setDraftSavedAt(null);
    }
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={`f-${name}`}>{label}</label>
      <input
        id={`f-${name}`}
        name={name}
        value={form[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
        {...props}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form className="panel purchase-form" onSubmit={handleSubmit} noValidate>
      <h2>{isEdit ? "Редактирование складчины" : "Новая складчина"}</h2>

      {field("title", "Название", { placeholder: "Например, закупка кофе" })}
      {field("organizer", "Организатор", { placeholder: "Имя и фамилия" })}

      <div className="field-row">
        {field("targetAmount", "Цель, ₽", { type: "number", min: "1", step: "100" })}
        {field("deadline", "Срок сбора", { type: "date", min: isEdit ? undefined : todayISO() })}
      </div>

      <div className="field">
        <label htmlFor="f-category">Категория</label>
        <select id="f-category" name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-description">Описание</label>
        <textarea
          id="f-description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {isEdit ? "Сохранить изменения" : "Добавить складчину"}
        </button>
        {isEdit && (
          <button type="button" className="btn" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>

      {!isEdit && draftSavedAt && (
        <p className="hint">Черновик сохранён в {draftSavedAt.toLocaleTimeString("ru-RU")}</p>
      )}
    </form>
  );
}
