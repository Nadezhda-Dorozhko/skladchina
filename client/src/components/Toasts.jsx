// Всплывающие уведомления в углу экрана
export default function Toasts({ toasts, onClose }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.text}</span>
          <button
            className="toast-close"
            onClick={() => onClose(t.id)}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
