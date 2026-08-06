export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagem não fornecida' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chave GEMINI_API_KEY não configurada no painel da Vercel.' });
    }

   // Linha nova (corrigida):
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { 
            text: "Extraia os dados da tabela de descarga de combustível e responda EXCLUSIVAMENTE em formato JSON com as chaves: tt, ta, densidade, fc, volume. Exemplo: {\"tt\":\"26,9\",\"ta\":\"24,5\",\"densidade\":\"0,8280\",\"fc\":\"0,9943\",\"volume\":\"58664\"}" 
          },
          { 
            inline_data: { 
              mime_type: "image/jpeg", 
              data: imageBase64 
            } 
          }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json"
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errDetails = await response.text();
      return res.status(response.status).json({ error: `Erro na API do Google: ${errDetails}` });
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;

    return res.status(200).json(JSON.parse(rawText));

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}
