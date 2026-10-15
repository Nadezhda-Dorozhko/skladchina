const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export const formatMoney = (value) => moneyFormatter.format(Number(value) || 0);

export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ru-RU");
}

// Сегодняшняя дата в формате YYYY-MM-DD (по локальному времени, не UTC)
export function todayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const progressPercent = (item) =>
  item.targetAmount > 0
    ? Math.min(100, Math.round((item.currentAmount / item.targetAmount) * 100))
    : 0;

// Статус зависит только от собранной суммы: цель достигнута — складчина завершена
export const withStatus = (item) => ({
  ...item,
  status: item.currentAmount >= item.targetAmount ? "completed" : "active",
});
