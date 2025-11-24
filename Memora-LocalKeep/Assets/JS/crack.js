// crack.js
(function showError502() {
  // Replace the entire page with a custom 502 Bad Gateway message
  document.documentElement.innerHTML = `
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>502 Bad Gateway</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          background: #0f172a;
          color: #e2e8f0;
          font-family: "Segoe UI", Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          height: 100vh;
          margin: 0;
        }
        h1 {
          font-size: 5rem;
          margin: 0;
          color: #ef4444;
        }
        p {
          font-size: 1.25rem;
          color: #94a3b8;
        }
        .hint {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <h1>502</h1>
      <p><strong>Bad Gateway</strong></p>
      <p class="hint">The server encountered an invalid response.<br>Please try again later.</p>
    </body>
  `;
})();
