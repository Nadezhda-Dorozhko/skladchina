const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_ADD_REQUESTS = 10;
const requestsByIp = new Map();

function limitAddSubmissions(req, res, next) {
  const now = Date.now();
  const ip = req.ip || "unknown";
  let window = requestsByIp.get(ip);

  if (!window || now >= window.resetAt) {
    window = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (window.count >= MAX_ADD_REQUESTS) {
    res.set("Retry-After", String(Math.ceil((window.resetAt - now) / 1000)));
    return res.status(429).send("Слишком много попыток. Попробуйте позже.");
  }

  window.count += 1;
  requestsByIp.set(ip, window);
  next();
}

function requireFormContentType(req, res, next) {
  if (!req.is("application/x-www-form-urlencoded")) {
    return res
      .status(415)
      .send("Ожидается форма с типом application/x-www-form-urlencoded.");
  }
  next();
}

function trimBody(req, res, next) {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === "string") req.body[key] = value.trim();
    }
  }
  next();
}

module.exports = { limitAddSubmissions, requireFormContentType, trimBody };
