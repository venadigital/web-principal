// Vena Digital — Node.js server (Express + Resend)
// CommonJS para compatibilidad con Phusion Passenger / Hostinger Node.js

require('dotenv').config();
const express = require('express');
const path    = require('path');
const { Resend } = require('resend');

const PORT       = process.env.PORT || 3000;
const RESEND_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL   = process.env.LEAD_TO_EMAIL   || 'laura@venadigital.com.co';
const FROM_EMAIL = process.env.LEAD_FROM_EMAIL || 'Vena Digital <contacto@venadigital.com.co>';

console.log('▶ Booting Vena Digital server…');
console.log('  Node:        ' + process.version);
console.log('  PORT:        ' + PORT);
console.log('  RESEND_KEY:  ' + (RESEND_KEY ? 'set ✓' : 'MISSING ✗'));
console.log('  TO_EMAIL:    ' + TO_EMAIL);
console.log('  FROM_EMAIL:  ' + FROM_EMAIL);

if (!RESEND_KEY) {
  console.warn('⚠️  RESEND_API_KEY no está definida. Los emails fallarán hasta que se configure.');
}

// Lazy-init de Resend (no crashea el server si falta la API key)
let _resend = null;
function getResend() {
  if (!RESEND_KEY) return null;
  if (!_resend) _resend = new Resend(RESEND_KEY);
  return _resend;
}

const app = express();
app.use(express.json({ limit: '32kb' }));

// ─── Static site ────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (isDev && /\.(css|js)$/.test(filepath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (/\.(css|js|png|jpg|jpeg|svg|webp|woff2?|ttf)$/.test(filepath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// ─── Helpers ────────────────────────────────────────────────────────────
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// ─── POST /api/lead ─────────────────────────────────────────────────────
app.post('/api/lead', async (req, res) => {
  try {
    const { name = '', phone = '', email = '', message = '' } = req.body || {};

    const errors = [];
    if (!name.trim())    errors.push('name');
    if (!phone.trim())   errors.push('phone');
    if (!email.trim() || !isEmail(email)) errors.push('email');
    if (!message.trim()) errors.push('message');

    if (errors.length) {
      return res.status(400).json({ ok: false, error: 'validation', fields: errors });
    }

    const resend = getResend();
    if (!resend) {
      return res.status(500).json({ ok: false, error: 'server_misconfigured' });
    }

    const subject = `Nuevo lead desde la web · ${name.trim()}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0A2142; max-width: 560px; margin: 0 auto;">
        <div style="border-left: 4px solid #FF6B5E; padding: 4px 0 4px 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #6B6F76;">Nuevo lead</p>
          <h1 style="margin: 0; font-size: 22px; color: #0A2142;">${esc(name)}</h1>
        </div>
        <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #E3DFD6; color: #6B6F76; width: 130px;">Nombre</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E3DFD6;">${esc(name)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #E3DFD6; color: #6B6F76;">WhatsApp</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E3DFD6;">${esc(phone)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #E3DFD6; color: #6B6F76;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #E3DFD6;"><a href="mailto:${esc(email)}" style="color: #FF6B5E;">${esc(email)}</a></td></tr>
        </table>
        <div style="margin-top: 24px;">
          <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #6B6F76;">Mensaje</p>
          <div style="background: #F7F5EF; border-radius: 12px; padding: 18px 20px; line-height: 1.55; white-space: pre-wrap;">${esc(message)}</div>
        </div>
        <p style="margin-top: 32px; font-size: 12px; color: #6B6F76;">
          Enviado desde el formulario de venadigital.com.co
        </p>
      </div>
    `;

    const text =
      `Nuevo lead desde la web\n\n` +
      `Nombre:   ${name}\n` +
      `WhatsApp: ${phone}\n` +
      `Email:    ${email}\n\n` +
      `Mensaje:\n${message}\n`;

    const { data, error } = await resend.emails.send({
      from:     FROM_EMAIL,
      to:       [TO_EMAIL],
      reply_to: email,
      subject,
      html,
      text
    });

    if (error) {
      console.error('[resend]', error);
      return res.status(502).json({ ok: false, error: 'send_failed' });
    }

    return res.json({ ok: true, id: data && data.id });
  } catch (err) {
    console.error('[api/lead]', err);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// ─── Healthcheck ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: { resend: !!RESEND_KEY, to: TO_EMAIL, node: process.version } });
});

// ─── SPA fallback (no devuelve index.html para assets con extensión) ────
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (/\.[a-z0-9]{2,5}$/i.test(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Vena Digital running on port ${PORT}`);
});
