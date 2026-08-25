# 🧰 ToolBox

> **Privacy-first Local File Toolkit** — Process your files on your own machine with a fast, modern and secure desktop-like web experience.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Status](https://img.shields.io/badge/Status-Full%20Stack%20MVP-green)

---

## 📖 About

ToolBox is a **local-first file processing toolkit** designed to eliminate the privacy concerns of online converters.

Instead of uploading files to unknown cloud servers, ToolBox processes everything **locally** through a backend running on your own machine.

No accounts. No advertisements. No cloud storage. No tracking.

Your files stay under your control — uploaded files are processed in temp directories and deleted automatically after every response.

---

## ✨ Features

### 🖼️ Image Tools *(fully working)*
- Image Converter (PNG ⇄ JPG ⇄ WebP ⇄ AVIF)
- Image Compressor
- Image Resizer
- Crop · Rotate · Flip

### 📄 PDF Tools *(fully working)*
- Merge PDF
- Split PDF (page ranges → ZIP)
- Compress PDF *(Ghostscript for deep compression, automatic pdf-lib fallback)*
- Rotate PDF
- Images → PDF
- PDF → Images (true rasterization via pdf.js)

### 🔳 QR Generator *(fully working)*
- Live client-side generation
- Custom colors & size, PNG download

---

## 🚀 Quick Start

```bash
# Install everything (frontend + server workspaces)
npm install

# Run frontend + API together
npm run dev
# → Web: http://localhost:5173
# → API: http://localhost:5000/api
```

The Vite dev server proxies `/api` to the backend automatically.

### Optional dependency

**Ghostscript** improves `Compress PDF` quality. Without it, ToolBox falls back to lossless pdf-lib compression. Install Ghostscript or point `GS_PATH` at it in `server/.env`.

---

## 🏗️ Architecture

```
Tool Box/
├── src/                        # React 19 SPA
│   ├── components/             # One folder per component (.tsx + .css + barrel)
│   ├── config/
│   │   ├── tools.ts            # Single source of truth: tool registry + settings schemas
│   │   └── toolIcons.ts        # Explicit lucide icon map (tree-shakeable)
│   ├── layouts/                # DashboardLayout, ToolLayout, Sidebar, TopNavbar, Footer
│   ├── pages/                  # HomePage, ToolPage, NotFoundPage
│   ├── routes/AppRouter.tsx    # BrowserRouter
│   ├── services/
│   │   ├── apiClient.ts        # Axios instance + error extraction
│   │   └── toolApi.ts          # Tool ID → endpoint registry, FormData upload
│   ├── store/useToolStore.ts   # Zustand: files, settings, real upload progress, abort
│   ├── styles/                 # Design tokens (industrial palette, IBM Plex Mono)
│   └── types/
├── server/                     # Express API workspace
│   └── src/
│       ├── controllers/        # image / pdf / qr
│       ├── services/           # sharp, pdf-lib, qrcode, pdf-to-img
│       ├── validators/         # Zod request schemas
│       ├── middlewares/        # multer, magic-byte content check, rate limits, errors
│       ├── utils/              # temp cleanup sweeper, ghostscript probe, filename safety
│       └── config/env.ts
└── vite.config.ts              # /api proxy
```

### Data flow

```
User drops files → Frontend validation (react-dropzone)
      ↓
Zustand store → FormData → POST /api/<category>/<op>
      ↓
Rate limit → Multer (disk, UUID names) → Magic-byte content check → Zod params
      ↓
Processing (sharp / pdf-lib / pdf-to-img / Ghostscript)
      ↓
Streamed response (Content-Disposition filename) → Auto-download
      ↓
Temp files scheduled for deletion + periodic orphan sweeper
```

---

## 🔒 Privacy First

- Files never leave your computer.
- Uploads land in OS temp directories with UUID names and are deleted seconds after each response.
- A background sweeper removes anything orphaned by crashes.
- No database. No analytics. No accounts.

---

## 🎨 Design Language

Minimal industrial utility aesthetic.

| Purpose | Color |
|----------|---------|
| Background | `#F7F5F2` |
| Surface | `#FFFFFF` |
| Primary Text | `#111111` |
| Secondary Text | `#6B6B6B` |
| Border | `#111111` |
| Accent | `#FF6B35` |

**IBM Plex Mono** – interface · **Press Start 2P** – logo & hero

---

## 🛠️ Tech Stack

**Frontend** — React 19 · TypeScript · Vite 8 · React Router · Zustand · Axios · React Dropzone · Framer Motion · Lucide · qrcode

**Backend** — Node.js · Express · TypeScript · Sharp · pdf-lib · pdf-to-img (pdf.js rasterization) · QRCode · Multer · Zod · Helmet · express-rate-limit · Archiver

---

## 📌 Project Philosophy

Intentionally built without authentication, user accounts, cloud storage, databases, analytics or ads. The focus is **speed**, **simplicity**, and **privacy**.

---

## 🚧 Coming Soon

Video · Audio · OCR · AI Utilities · Barcode Generator · JSON Formatter · Base64 · Hash Generator — the tool registry is designed so new categories need no restructuring.

---

## 🤝 Contributing

Under active development. Suggestions, feedback and feature requests are welcome.

## 📄 License

MIT

---

> **Your files belong to you. ToolBox keeps them that way.**
