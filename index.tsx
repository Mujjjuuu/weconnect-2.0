import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Mounting Error:", error);
    container.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;">
        <div>
          <h2 style="color: #7c3aed; font-weight: 900; font-size: 24px;">WE CONNECT</h2>
          <p style="color: #6b7280; margin: 10px 0;">The application encountered a startup error.</p>
          <pre style="background: #f3f4f6; padding: 15px; border-radius: 12px; text-align: left; font-size: 11px; max-width: 90vw; overflow: auto; border: 1px solid #e5e7eb; color: #374151;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
          <button onclick="window.location.reload()" style="margin-top: 24px; padding: 12px 24px; background: #7c3aed; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Reload Application</button>
        </div>
      </div>
    `;
  }
}