import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Proxy Ollama Chat API manually without extra packages (fixes Ollama CORS/Origin errors over Network)
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    // Pipe the Ollama response stream back to the client
    response.body.pipeTo(new WritableStream({
      write(chunk) {
        res.write(chunk);
      },
      close() {
        res.end();
      }
    }));
  } catch (error) {
    console.error("Ollama proxy error:", error);
    res.status(500).json({ error: 'Failed to connect to local Ollama instance.' });
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to React app for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running in production mode`);
  console.log(`Local  -> http://localhost:${PORT}`);
  console.log(`Mobile -> http://<your-ip-address>:${PORT}`);
  console.log('Ensure you have run `npm run build` before starting the server.\n');
});
