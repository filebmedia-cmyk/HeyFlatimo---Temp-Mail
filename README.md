<div align="center">

# ⚡ HEYFLATIMO — TEMPORARY MAIL
### *Ultra-Saturated Neo-Brutalist Disposable Email Engine*

[![Next.js 14](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>Sistem Layanan Email Sementara (Temp Mail) Modern, Super Cepat, & Aman.</b><br>
  Dirancang dengan estetika <b>Ultra-Saturated Neo-Brutalism</b>, dilengkapi <b>REST API v1</b> untuk integrasi bot/developer, <b>Admin Dashboard Dinamis</b>, dan pemrosesan otomatis via <b>Cloudflare Email Routing</b>.
</p>

[✨ Fitur Utama](#-fitur-unggulan) • [🏗️ Arsitektur](#️-arsitektur-sistem) • [🚀 Panduan Deploy](#-panduan-deployment-vercel) • [🔌 REST API v1](#-rest-api-v1-documentation) • [🛠️ Dashboard Admin](#-dashboard-admin) • [📜 Lisensi](#-lisensi)

---

</div>

## 🌟 Fitur Unggulan

<table>
  <tr>
    <td width="50%">
      <h3>🎨 Ultra-Saturated Neo-Brutalism</h3>
      <ul>
        <li>Desain tebal, kontras tinggi, border tegas, dan offset 3D shadow retro modern.</li>
        <li>Dukungan penuh <b>Dark Mode & Light Mode</b> dengan transisi mulus.</li>
        <li>Responsif sempurna di perangkat Desktop, Tablet, dan Mobile.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>⚡ Dual-Mode Inbox View</h3>
      <ul>
        <li><b>Home Accordion View</b>: Preview pesan interaktif langsung di halaman depan.</li>
        <li><b>Split-Screen Pro Mode</b>: Tampilan split desktop (sidebar daftar email + reader canggih di kanan).</li>
        <li>Sandbox <code>&lt;iframe&gt;</code> rendering untuk perlindungan keamanan email HTML.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔐 Access Gate & Session Security</h3>
      <ul>
        <li>Proteksi kode akses website dengan sistem <b>In-Memory Session</b> (selalu minta kunci saat refresh / buka halaman baru).</li>
        <li>Bisa diaktifkan/dinonaktifkan sewaktu-waktu dari Dashboard Admin.</li>
        <li>Bot API tetap dapat mengakses endpoint secara instan menggunakan <b>Header API Key</b> tanpa terhalang gate.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🤖 REST API v1 Developer & Bot Ready</h3>
      <ul>
        <li>Endpoint lengkap untuk integrasi bot Telegram, Discord, Python, NodeJS, atau otomasi web.</li>
        <li><b>Auto-Extract OTP</b> (ekstraksi kode 4-8 digit verifikasi secara instan).</li>
        <li><b>Auto-Extract Verification Links</b> (langsung ambil URL aktivasi).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📢 Dynamic Broadcast Announcement</h3>
      <ul>
        <li>Pop-up pengumuman kustom untuk pengunjung website.</li>
        <li>Frekuensi cerdas: <i>1x per Perangkat</i>, <i>1x per Sesi Browser</i>, atau <i>Setiap Buka Web</i>.</li>
        <li>Live interactive preview langsung di menu Admin.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>⏱️ Auto-TTL Message Cleanup</h3>
      <ul>
        <li>Pesan email otomatis terhapus dari MongoDB setelah 24 jam (dapat dikonfigurasi via <code>EMAIL_TTL_HOURS</code>).</li>
        <li>Zero maintenance & bebas dari overload database.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏗️ Arsitektur Sistem

```
 ┌────────────────────────┐
 │   Pengirim Email Luar  │
 └───────────┬────────────┘
             │ (SMTP)
             ▼
 ┌────────────────────────────────────────────────────────┐
 │ Cloudflare Email Routing (Custom Catch-All Domain)     │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ Cloudflare Email Worker (POST Raw Body / JSON)         │
 └───────────────────────────┬────────────────────────────┘
                             │ (Webhook Secret Header)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ HeyFlatimo Engine (Next.js 14 API on Vercel)           │
 ├───────────────────────────┬────────────────────────────┤
 │ 🛡️ Access Gate (Web)      │ 🔑 x-api-key Guard (API)   │
 └─────────────┬─────────────┴──────────────┬─────────────┘
               │                            │
               ▼                            ▼
 ┌───────────────────────────┐ ┌──────────────────────────┐
 │ MongoDB Atlas (TTL Clean) │ │ Neo-Brutalist UI (React) │
 └───────────────────────────┘ └──────────────────────────┘
```

---

## 🚀 Panduan Deployment (Vercel)

### 1. Import Repository
1. Fork atau gunakan repo ini: `https://github.com/filebmedia-cmyk/HeyFlatimo---Temp-Mail.git`
2. Buka [Vercel Dashboard](https://vercel.com/) lalu pilih **Add New...** > **Project** > **Import**.

### 2. Konfigurasi Environment Variables
Masukkan variabel berikut di menu pengaturan Vercel (**Settings > Environment Variables**):

| Variabel | Wajib | Contoh / Default | Deskripsi |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | **Ya** | `mongodb+srv://user:pass@cluster0.abcde.mongodb.net/tmail?retryWrites=true&w=majority` | Connection string MongoDB Atlas |
| `WEBHOOK_SECRET` | **Ya** | `super_secret_webhook_123` | Token rahasia pengaman webhook Cloudflare |
| `ADMIN_USERNAME` | Opsional | `HeyFlatimo` | Username awal login dashboard admin |
| `ADMIN_PASSWORD` | Opsional | `TmailFlatimo` | Password awal login dashboard admin |
| `ADMIN_API_KEY` | Opsional | `hfl_key_8899aabbccddeeff00112233` | API Key master untuk akses REST API v1 |
| `NEXT_PUBLIC_APP_NAME` | Opsional | `HeyFlatimo` | Nama brand aplikasi |
| `EMAIL_TTL_HOURS` | Opsional | `24` | Waktu kedaluwarsa email otomatis (jam) |

### 3. Deploy
Klik **Deploy**! Project Anda akan aktif dalam hitungan detik.

---

## 📧 Setup Cloudflare Email Routing

Untuk menerima email dari domain Anda secara gratis:
1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) > pilih domain Anda.
2. Buka menu **Email Routing** > **Email Workers**.
3. Buat Worker baru menggunakan skrip di [`cloudflare/worker.js`](./cloudflare/worker.js) atau [`cloudflare/worker-standalone.js`](./cloudflare/worker-standalone.js).
4. Atur Environment Variables di Worker:
   - `FORWARD_URL`: `https://domain-anda.vercel.app/api/webhook/email`
   - `WEBHOOK_SECRET`: Nilai yang sama dengan `WEBHOOK_SECRET` di Vercel.
5. Pada menu **Routing Rules**, aktifkan **Catch-all address** dan arahkan ke Worker yang baru dibuat.

---

## 🔌 REST API v1 Documentation

Semua endpoint v1 membutuhkan Header otentikasi:
```http
x-api-key: YOUR_ADMIN_API_KEY
```

### 1. Generate Email Baru
```http
GET /api/v1/generate?prefix=customname&domain=domainanda.com
```
**Response:**
```json
{
  "success": true,
  "email": "customname@domainanda.com",
  "prefix": "customname",
  "domain": "domainanda.com",
  "generatedAt": "2026-09-14T18:30:00.000Z"
}
```

### 2. Ambil Kotak Masuk (Inbox)
```http
GET /api/v1/inbox?email=customname@domainanda.com&limit=10
```
**Response:**
```json
{
  "success": true,
  "recipient": "customname@domainanda.com",
  "count": 1,
  "messages": [
    {
      "id": "673f8a9e1234567890abcdef",
      "from": "service@example.com",
      "fromName": "Service Verification",
      "subject": "Kode Verifikasi Anda: 882910",
      "preview": "Halo! Gunakan kode 882910 untuk memverifikasi akun Anda...",
      "receivedAt": "2026-09-14T18:30:00.000Z"
    }
  ]
}
```

### 3. Auto-Extract OTP (Kode Verifikasi)
```http
GET /api/v1/otp?email=customname@domainanda.com
```
**Response:**
```json
{
  "success": true,
  "recipient": "customname@domainanda.com",
  "otp": "882910",
  "subject": "Kode Verifikasi Anda: 882910",
  "from": "service@example.com",
  "receivedAt": "2026-09-14T18:30:00.000Z"
}
```

### 4. Auto-Extract Verification Links (URL Aktivasi)
```http
GET /api/v1/links?email=customname@domainanda.com
```
**Response:**
```json
{
  "success": true,
  "recipient": "customname@domainanda.com",
  "primaryLink": "https://service.com/verify?token=abc123xyz",
  "allLinks": [
    "https://service.com/verify?token=abc123xyz"
  ]
}
```

### 5. Daftar Domain Aktif
```http
GET /api/v1/domains
```

### 6. Statistik Email
```http
GET /api/v1/stats
```

---

## 🛠️ Dashboard Admin

Kunjungi URL `/admin` pada domain Anda untuk mengakses panel kendali lengkap:
- 🔑 **Ubah Kredensial**: Ganti Username & Password admin langsung dari antarmuka web (tersimpan di MongoDB).
- 🔐 **Access Gate**: Aktifkan/nonaktifkan gerbang kode akses web & atur pesan selamat datang.
- 🌐 **Manajemen Domain**: Tambah atau hapus domain email kustom secara realtime.
- 📢 **Broadcast Announcement**: Buat dan jadwalkan popup pengumuman untuk seluruh pengunjung.
- ⚡ **API Key Generator**: Generate dan perbarui Developer API Key secara instan.

---

## 💻 Menjalankan di Lokal (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/filebmedia-cmyk/HeyFlatimo---Temp-Mail.git
cd HeyFlatimo---Temp-Mail

# 2. Install dependencies
npm install

# 3. Buat file .env.local dan isi konfigurasi Anda
# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📜 Lisensi

Didistribusikan di bawah Lisensi **MIT**. Bebas digunakan, dimodifikasi, dan didistribusikan untuk keperluan personal maupun komersial.

<div align="center">
  <b>Dibuat dengan ❤️ & Semangat Kreatif oleh <a href="https://github.com/filebmedia-cmyk">HeyFlatimo</a></b>
</div>
