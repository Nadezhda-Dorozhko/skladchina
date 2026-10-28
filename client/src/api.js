// Сервис для работы с серверным API (лабораторные №1–3, маршруты без префикса /api).
// Все запросы к серверу идут только через этот файл.
import axios from "axios";

const TOKEN_KEY = "token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// --- Токен ---------------------------------------------------------------

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Перехватчик запросов: подставляем JWT в каждый запрос
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Перехватчик ответов: если сервер сказал 401 (токен протух или неверный),
// чистим токен и сообщаем приложению, чтобы оно показало форму входа
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

// --- Ошибки --------------------------------------------------------------

// Достаём из ошибки axios текст, который не стыдно показать пользователю
export function getErrorMessage(err) {
  const data = err.response?.data;
  // Сервер возвращает { error: "текст" } или { error: ["текст1", "текст2"] }
  if (Array.isArray(data?.error)) return data.error.join(", ");
  if (data?.error) return data.error;
  if (err.code === "ECONNABORTED") return "Сервер слишком долго отвечает";
  if (!err.response) return "Сервер недоступен";
  return `Ошибка сервера (${err.response.status})`;
}

export const isCanceled = (err) => axios.isCancel(err);

// --- Преобразование данных ----------------------------------------------
// PostgreSQL отдаёт DECIMAL строкой ("15000.00"), поэтому сумму приводим к числу.

const fromServer = (p) => ({
  id: p.id,
  title: p.title,
  organizer: p.organizer,
  targetAmount: Number(p.targetAmount),
  deadline: p.deadline, // строка "2026-09-30"
  status: p.status,
});

// Сервер требует title, organizer, targetAmount и deadline и при POST, и при PUT
const toServer = (p) => ({
  title: p.title,
  organizer: p.organizer,
  targetAmount: p.targetAmount,
  deadline: p.deadline,
  status: p.status,
});

// --- Авторизация ---------------------------------------------------------

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data.token;
}

// Регистрация токен не возвращает, поэтому после неё сразу выполняем вход
export async function register(email, password) {
  await api.post("/auth/register", { email, password });
  return login(email, password);
}

// --- Складчины (CRUD) ----------------------------------------------------

export const fetchPurchases = async ({ search = "" } = {}, signal) => {
  const params = search ? { search } : {};
  const { data } = await api.get("/purchases", { params, signal });
  return data.map(fromServer);
};

export const addPurchase = async (purchase) => {
  const { data } = await api.post("/purchases", toServer(purchase));
  return fromServer(data);
};

export const updatePurchase = async (id, purchase) => {
  const { data } = await api.put(`/purchases/${id}`, toServer(purchase));
  return fromServer(data);
};

export const deletePurchase = (id) => api.delete(`/purchases/${id}`);
