# 📧 Panduan Setup Cloudflare Email Routing & Worker

Panduan 3 menit untuk mengarahkan email domain Anda di Cloudflare langsung ke aplikasi TMail di Vercel.

---

### Langkah 1: Buat Email Worker di Cloudflare

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) > menu **Compute (Workers & Pages)** > **Workers & Pages**.
2. Klik tombol **Create Application** > pilih tab **Workers** > **Create Worker**.
3. Beri nama worker Anda, contoh: `tmail-router` > klik **Deploy**.
4. Setelah ter-deploy, klik **Edit code**:
   - Buka file [worker-standalone.js](file:///d:/xcdev%20X%20flatimo/tmail-baru/cloudflare/worker-standalone.js) di repositori ini.
   - Hapus semua isi editor Cloudflare, lalu paste seluruh isi `worker-standalone.js`.
   - Klik **Deploy** (di pojok kanan atas).

---

### Langkah 2: Tambahkan Environment Variables di Cloudflare

1. Masuk ke halaman detail Worker `tmail-router` > pilih tab **Settings** > **Variables and Secrets**.
2. Tambahkan 2 variabel berikut:
   - `WEBHOOK_URL` : URL Vercel Anda, misalnya `https://tmail-kamu.vercel.app` (atau domain custom Anda).
   - `WEBHOOK_SECRET` : Secret key yang Anda atur di file `.env` Vercel (misal: `kuncirahasiaku123`).
3. Klik **Save and Deploy**.

---

### Langkah 3: Aktifkan Cloudflare Email Routing & Catch-All Rule

1. Di Cloudflare Dashboard, pilih **Domain** Anda yang ingin dipakai temp mail.
2. Masuk ke menu **Email** > **Email Routing**.
3. Jika baru pertama kali, klik **Enable Email Routing** (Cloudflare akan otomatis menambahkan MX Record dan TXT SPF record ke DNS Anda dengan 1 klik).
4. Pilih tab **Routing Rules**:
   - Di bagian **Catch-all rule** (atau buat Custom Rule baru jika mau):
   - Klik **Edit**.
   - Action: Pilih **Send to a Worker**.
   - Destination: Pilih worker yang tadi Anda buat (`tmail-router`).
   - Status: Ubah menjadi **Active / Enabled**.
   - Klik **Save**.

---

### 🎉 Selesai!

Sekarang setiap ada email yang dikirim ke alamat apapun di domain Anda (contoh: `apa.saja@domainanda.com`), Cloudflare akan otomatis menerima email tersebut dan mem-forward ke Webhook Vercel MongoDB Anda dalam hitungan detik!
