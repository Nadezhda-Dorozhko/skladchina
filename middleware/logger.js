// middleware/logger.js
const fs = require("node:fs/promises");
const path = require("node:path");
const { limits } = require("../validators/purchaseValidator");

const LOG_DIRECTORY = path.resolve(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIRECTORY, "app.txt");
const FILE_ERROR_MESSAGES = {
  ENOENT: "Не удалось записать журнал: каталог или файл не найден.",
  EACCES: "Не удалось записать журнал: недостаточно прав для записи.",
  EPERM: "Не удалось записать журнал: операция запрещена правами доступа.",
  EISDIR: "Не удалось записать журнал: вместо файла app.txt указан каталог.",
  ENOTDIR: "Не удалось записать журнал: часть пути должна быть каталогом.",
  EINVAL: "Не удалось записать журнал: указан недопустимый путь.",
  ENAMETOOLONG:
    "Не удалось записать журнал: путь или имя файла слишком длинное.",
  EROFS:
    "Не удалось записать журнал: файловая система доступна только для чтения.",
  ENOSPC: "Не удалось записать журнал: на диске недостаточно места.",
  EBUSY: "Не удалось записать журнал: файл занят другим процессом.",
  EEXIST:
    "Не удалось создать каталог журнала: по этому пути уже существует файл.",
};
const UNKNOWN_FILE_ERROR = "Не удалось записать журнал запросов в файл.";

async function appendLogEntry(entry) {
  try {
    await fs.mkdir(LOG_DIRECTORY, { recursive: true });
    await fs.appendFile(LOG_FILE, `${entry}\n`, "utf8");
  } catch (error) {
    console.error(FILE_ERROR_MESSAGES[error.code] || UNKNOWN_FILE_ERROR);
  }
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  const requestedAt = new Date(startedAt);
  const requestUrl = String(req.originalUrl || req.url || "").slice(
    0,
    limits.requestUrl.max,
  );

  res.once("finish", () => {
    const durationMs = Date.now() - startedAt;
    const entry = `[${requestedAt.toISOString()}] ${req.method} ${requestUrl} ${res.statusCode} ${durationMs} ms`;
    console.log(entry);
    void appendLogEntry(entry);
  });

  next();
}

module.exports = requestLogger;
