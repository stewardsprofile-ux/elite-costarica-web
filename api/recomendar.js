const { OpenAI } = require("openai");

module.exports = async (req, res) => {
  // Configuración de Headers para CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejo de Preflight para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // En Vercel, el body ya viene parseado si es JSON
    const { perfil, catalogoNombres } = req.body;

    if (!perfil || !catalogoNombres) {
      throw new Error("Faltan datos en la petición (perfil o catálogo)");
    }

    // Inicializamos OpenAI con la clave de entorno de Vercel
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
      Eres un experto asesor de perfumes para la tienda "Elite Parfums".
      Tu objetivo es analizar el perfil del cliente y el catálogo de nombres de perfumes proporcionado.
      
      Cliente: "${perfil}"
      Catálogo: [${catalogoNombres.join(", ")}]
      
      INSTRUCCIONES:
      1. Analiza cuáles perfumes del catálogo combinan mejor con la descripción del cliente.
      2. Selecciona TODOS los que sean compatibles.
      3. Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
      {"recomendados": ["Nombre Exacto 1", "Nombre Exacto 2", "..."]}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente que ayuda a Elite Parfums y solo responde en formato JSON puro." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const cleanText = response.choices[0].message.content;

    // Enviamos la respuesta directamente como JSON
    return res.status(200).json(JSON.parse(cleanText));

  } catch (error) {
    console.error("Error en la función de OpenAI:", error);
    
    return res.status(500).json({ 
      error: "Error en el motor de recomendación", 
      detalle: error.message 
    });
  }
};