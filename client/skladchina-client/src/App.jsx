import PurchaseList from "./components/PurchaseList";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Складчины</h1>
        <p>Совместные покупки: собираем сумму, пока не хватает до цели.</p>
      </header>
      <main>
        <PurchaseList />
      </main>
    </div>
  );
}
