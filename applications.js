export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  const slug = String(req.query.slug || "");
  if (!process.env.PANEL_SLUG || slug !== process.env.PANEL_SLUG) {
    return res.status(404).json({ error: "Секретная ссылка неверна." });
  }
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return res.status(500).json({ error: "Сервер не настроен: добавьте переменные Supabase в Vercel." });

  async function supabase(path, options = {}) {
    return fetch(`${base}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
  }

  try {
    if (req.method === "GET") {
      const r = await supabase("applications?select=*&order=created_at.desc&limit=500");
      const body = await r.text();
      res.status(r.status);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.send(body);
    }
    if (req.method === "POST") {
      const data = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const row = {};
      for (const field of ["application_id","nickname","age","telegram","level","role","experience","reason","online","conflicts"]) {
        row[field] = String(data[field] ?? "").slice(0, 5000);
      }
      if (!row.nickname.trim()) return res.status(400).json({ error: "Нужно указать ник." });
      const r = await supabase("applications", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(row)
      });
      const body = await r.text();
      res.status(r.status);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.send(body);
    }
    if (req.method === "PATCH") {
      const data = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const allowed = ["Новая", "Принята", "Отклонена"];
      if (!Number.isInteger(Number(data.id)) || !allowed.includes(data.status)) {
        return res.status(400).json({ error: "Некорректный ID или статус." });
      }
      const r = await supabase(`applications?id=eq.${encodeURIComponent(Number(data.id))}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ status: data.status })
      });
      const body = await r.text();
      res.status(r.status);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.send(body);
    }
    return res.status(405).json({ error: "Метод не поддерживается." });
  } catch (e) {
    return res.status(500).json({ error: "Ошибка сервера. Проверьте настройки базы данных." });
  }
}
