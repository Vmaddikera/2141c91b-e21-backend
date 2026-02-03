const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// The server will run on the port provided by the environment or default to 3000.
const PORT = process.env.PORT || 3000;

// Basic HTML page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Node Server</title>
      <style>
        html, body { margin: 0; padding: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#0b0b0c; color:#e5e7eb; }
        .wrap { min-height: 100vh; display:grid; place-items:center; }
        .card { padding: 24px 28px; border:1px solid #2a2a2a; background:#121214; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); max-width:640px }
        .title { font-size: 24px; margin: 0 0 8px; }
        .muted { color:#a3a3a3; margin: 6px 0 16px }
        code { padding: 2px 6px; border-radius: 8px; background: #1b1b1d; }
        .hello { font-weight: 600; letter-spacing:.3px }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <h1 class="title">Hello from <span class="hello">backend</span> 👋</h1>
          <p class="muted">Server is running on port ${PORT}.</p>
          <p>This HTML is being served by <code>index.js</code> at <code>/</code>.</p>
        </div>
      </div>
    </body>
  </html>`);
});

// Start server
app.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});