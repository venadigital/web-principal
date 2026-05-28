# Vena Digital · Sitio web

IA real para negocios reales. Sitio editorial con formulario de leads que reenvía a Laura vía Resend.

## Stack

- Frontend estático: HTML / CSS / JS vanilla
- Backend: Node.js (Express) sirviendo el sitio + endpoint `/api/lead`
- Email: [Resend](https://resend.com)

## Estructura

```
.
├── index.html              # Página principal
├── css/
│   ├── colors.css          # Tokens (paleta, tipografía, espaciado)
│   └── styles.css          # Estilos del sitio
├── js/
│   └── main.js             # Interacciones (nav, scroll-reveal, slider, FAQ, form)
├── assets/                 # Imágenes, ilustraciones, logos, favicons
├── fonts/                  # Manrope, DM Sans, IBM Plex Mono
├── server.js               # Express + endpoint Resend
├── package.json
└── .env                    # (no commit) credenciales
```

## Variables de entorno

Copia `.env.example` a `.env` y completa:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
LEAD_TO_EMAIL=laura@venadigital.com.co
LEAD_FROM_EMAIL=Vena Digital <contacto@venadigital.com.co>
PORT=3000
```

> `LEAD_FROM_EMAIL` debe ser un dominio **verificado** en Resend (Settings → Domains).

## Correr localmente

```bash
npm install
cp .env.example .env       # y completa con tu API key
npm run dev                # arranca con --watch
```

Abre http://localhost:3000

## Desplegar en Hostinger (Node.js)

1. Sube el proyecto al hosting (sin `node_modules` ni `.env`).
2. En el panel de Hostinger → Node.js, crea una app que apunte a `server.js`.
3. Define las variables de entorno (`RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`).
4. Comando de arranque: `npm start`
5. Hostinger asigna automáticamente `PORT` vía `process.env.PORT`.

## Endpoint del formulario

`POST /api/lead`

```json
{
  "name":    "Laura García",
  "phone":   "+57 304 378 7768",
  "email":   "laura@ejemplo.com",
  "message": "Quiero implementar IA en mi negocio"
}
```

Respuestas:
- `200 { ok: true, id }` — email enviado
- `400 { ok: false, error: "validation", fields: [...] }` — campos inválidos
- `5xx { ok: false, error: "send_failed" | "server_error" }` — error
