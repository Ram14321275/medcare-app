export default async function handler(req, res) {
  try {
    const { url } = req;
    const queryMatch = url.match(/\?(.*)$/);
    const queryString = queryMatch ? queryMatch[1] : '';

    const googleUrl = `https://translate.googleapis.com/translate_tts?${queryString}`;
    
    // Fetch from Google, explicitly overriding headers that might block us
    const response = await fetch(googleUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'audio/mpeg, audio/x-mpeg, audio/x-mpeg-3, audio/mpeg3'
      }
    });

    if (!response.ok) {
        return res.status(response.status).send('TTS Fetch Failed');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Vercel TTS Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
