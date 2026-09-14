# HeyFlatimo - Personal Temporary Mail Service

Aplikasi Web Temporary Mail (TMail) Modern berkonsep **Ultra-Saturated Neo-Brutalism**, menggunakan **Next.js 14 App Router**, **MongoDB (Mongoose with TTL Auto-Cleanup)**, siap **Deploy di Vercel**, dan menerima email melalui **Cloudflare Email Routing Worker**.

---

## ✨ Fitur Utama

- 🎨 **Neo-Brutalist Aesthetic Design**:
  - Palet warna segar (*Electric Indigo, Mint Emerald, Warm Amber, Deep Onyx*).
  - Mode **Light / Dark Theme** dengan transisi mulus.
  - Kartu & tombol interaktif dengan shadow 3D offset retro brutalist.
- ⚡ **2 Mode Tampilan Inbox**:
  - **Home Mode**: Tampilan kartu ringkas dengan accordion preview yang bisa dilipat/dibuka.
  - **Split-Screen Mode**: Tampilan desktop split-view (sidebar pesan di kiri, reader interaktif di kanan) dan mobile-friendly drawer.
- 🔒 **Pribadi & Tanpa Ribet**:
  - Dikhususkan untuk penggunaan personal tanpa tombol "tambah domain" yang mengganggu.
  - Dukungan multi-domain personal yang terdaftar di Cloudflare.
- 🎲 **Generator Email Pintar & Kustom Alias**:
  - Acak otomatis nama email (kombinasi kata sifat, kata benda, nama Indonesia & global).
  - Kustom nama alias sesuka hati via modal atau langsung lewat URL (misal: `/bisnis` atau `/@domain.com`).
- ⏱️ **Auto-Sync & Auto-Delete**:
  - Polling pesan otomatis setiap 15 detik + tombol refresh manual animasi putar.
  - Pesan otomatis terhapus dari MongoDB setelah 24 jam (dapat diatur lewat variabel `EMAIL_TTL_HOURS`).
- 🛡️ **Keamanan Email**:
  - Sandboxed `<iframe>` untuk merender email HTML dengan aman.
  - Auto-convert link teks polos menjadi link yang bisa diklik (`target="_blank"`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Google Fonts (Space Mono & Plus Jakarta Sans)
- **Database**: MongoDB (Mongoose Cached Serverless Connection + TTL Index)
- **Email Ingestion**: Cloudflare Email Routing + Cloudflare Worker Webhook
- **Deployment**: Vercel

---

## 🚀 Panduan Menjalankan di Lokal (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Atur Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lalu lengkapi isinya:
- `MONGODB_URI`: String koneksi MongoDB Anda (contoh dari MongoDB Atlas Free Tier).
- `WEBHOOK_SECRET`: Token rahasia Anda untuk memvalidasi webhook Cloudflare.
- `NEXT_PUBLIC_AVAILABLE_DOMAINS`: Daftar domain Anda yang dipisah koma (contoh: `mail.domainanda.com,temp.domainanda.com`).

### 3. Jalankan Server Dev
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🌐 Panduan Deploy ke Vercel

1. Push folder project ini ke repository GitHub / GitLab / Bitbucket Anda.
2. Buka [Vercel Dashboard](https://vercel.com/) > klik **Add New...** > **Project**.
3. Import repository Anda.
4. Di bagian **Environment Variables**, tambahkan:
   - `MONGODB_URI`
   - `WEBHOOK_SECRET`
   - `NEXT_PUBLIC_AVAILABLE_DOMAINS`
   - `NEXT_PUBLIC_APP_NAME` (opsional)
   - `EMAIL_TTL_HOURS` (opsional, default: 24)
5. Klik **Deploy**!

---

## 📧 Setup Cloudflare Email Routing (Menerima Email Masuk)

Buka panduan lengkap di folder [cloudflare/README.md](file:///d:/xcdev%20X%20flatimo/tmail-baru/cloudflare/README.md) untuk menghubungkan domain Cloudflare Anda ke webhook Vercel dalam 3 langkah mudah.
