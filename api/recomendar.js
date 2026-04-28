const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

const allowedOrigins = new Set([
  "https://elite-costarica.com",
  "https://www.elite-costarica.com",
  "https://elite-costarica-web.vercel.app",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
]);

const requestLog = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 20;
const MAX_PROFILE_LENGTH = 1200;
const MAX_CATALOG_ITEMS = 2500;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return /^https:\/\/elite-costarica-web-[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

function rateLimit(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : String(forwarded || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (requestLog.get(ip) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  hits.push(now);
  requestLog.set(ip, hits);

  return hits.length <= RATE_LIMIT_MAX;
}

function loadCatalogNames() {
  try {
    const filePath = path.join(process.cwd(), "perfumes.json");
    const perfumes = JSON.parse(fs.readFileSync(filePath, "utf8"));

    return perfumes
      .map((item) => String(item?.Title || "").trim())
      .filter(Boolean)
      .slice(0, MAX_CATALOG_ITEMS);
  } catch (error) {
    console.error("No se pudo cargar perfumes.json:", error);
    return [];
  }
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: "Origen no permitido" });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  if (!rateLimit(req)) {
    return res.status(429).json({ error: "Demasiadas solicitudes. Intenta de nuevo en un momento." });
  }

  try {
    const { perfil } = req.body || {};

    if (typeof perfil !== "string" || !perfil.trim()) {
      return res.status(400).json({ error: "Faltan datos en la peticion" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY no esta configurada.");
      return res.status(500).json({ error: "Servicio no configurado" });
    }

    const catalogoNombres = loadCatalogNames();

    if (!catalogoNombres.length) {
      return res.status(503).json({ error: "Catalogo no disponible" });
    }

    const safePerfil = perfil.trim().slice(0, MAX_PROFILE_LENGTH);
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
      Eres un experto asesor de perfumes para la tienda "Elite Parfums".
      Tu objetivo es analizar el perfil del cliente y el catalogo de nombres de perfumes proporcionado.

      Cliente: "${safePerfil}"
      Catalogo: [${catalogoNombres.join(", ")}]

      INSTRUCCIONES:
      1. Analiza cuales perfumes del catalogo combinan mejor con la descripcion del cliente.
      2. Selecciona hasta 12 perfumes compatibles.
      3. Responde unicamente en formato JSON con esta estructura:
      {"recomendados": ["Nombre Exacto 1", "Nombre Exacto 2"]}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente que ayuda a Elite Parfums y solo responde JSON puro." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const cleanText = response.choices[0].message.content;
    const parsed = JSON.parse(cleanText);
    const recomendados = Array.isArray(parsed.recomendados) ? parsed.recomendados.slice(0, 12) : [];

    return res.status(200).json({ recomendados });
  } catch (error) {
    console.error("Error en la funcion de OpenAI:", error);
    return res.status(500).json({ error: "Error en el motor de recomendacion" });
  }
};
