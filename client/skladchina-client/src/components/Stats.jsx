import { formatMoney } from "../utils/format";

export default function Stats({ items }) {
  const active = items.filter((i) => i.status === "active").length;
  const target = items.reduce((sum, i) => sum + i.targetAmount, 0);
  const collected = items.reduce((sum, i) => sum + i.currentAmount, 0);
  const percent = target > 0 ? Math.round((collected / target) * 100) : 0;

  return (
    <dl className="stats">
      <div>
        <dt>Всего складчин</dt>
        <dd>{items.length}</dd>
      </div>
      <div>
        <dt>Идёт сбор</dt>
        <dd>{active}</dd>
      </div>
      <div>
        <dt>Завершено</dt>
        <dd>{items.length - active}</dd>
      </div>
      <div>
        <dt>Собрано</dt>
        <dd>
          {formatMoney(collected)} <span className="stats-sub">из {formatMoney(target)} ({percent}%)</span>
        </dd>
      </div>
    </dl>
  );
}
