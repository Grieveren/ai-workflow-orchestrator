import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        ...req.body
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Streaming endpoint for document generation
app.post('/api/chat/stream', async (req, res) => {
  try {
    // Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        stream: true,  // Enable streaming
        ...req.body
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      res.write(`data: ${JSON.stringify({ error: true, message: errorData })}\n\n`);
      res.end();
      return;
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream completed successfully');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            // Forward the SSE event to the client
            try {
              res.write(`data: ${data}\n\n`);
            } catch (writeError) {
              console.error('Error writing to response:', writeError.message);
              break;
            }

            // Check for stream end
            if (data === '[DONE]') {
              res.end();
              return;
            }
          }
        }
      }
    } catch (readError) {
      console.error('Error reading stream:', readError.message);
      // Don't throw - try to end gracefully
    }

    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    try {
      res.write(`data: ${JSON.stringify({ error: true, message: error.message })}\n\n`);
    } catch {
      // Response already closed
    }
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`API proxy server running on http://localhost:${PORT}`);
});
