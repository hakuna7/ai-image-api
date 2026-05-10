export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "请使用 POST" });

  const { prompt, model = "dall-e-3", n = 1, size = "1024x1024" } = req.body;
  if (!prompt) return res.status(400).json({ error: "缺少 prompt" });
  if (!process.env.API_KEY) return res.status(500).json({ error: "API_KEY 未配置" });
  if (!process.env.API_BASE) return res.status(500).json({ error: "API_BASE 未配置" });

  try {
    const apiUrl = process.env.API_BASE.replace(/\/+$/, "") + "/images/generations";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.API_KEY}` },
      body: JSON.stringify({ model, prompt, n: Math.min(Math.max(1, n), 4), size }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: "中转站错误", detail: data });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "服务器错误", detail: err.message });
  }
}
