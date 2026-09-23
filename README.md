# Sawala

Sawala adalah LMS berbasis web untuk belajar Bahasa Sunda dan Aksara Sunda. Materi disusun dalam kelas, unit, dan pelajaran; pelajar dapat berlatih, mendengarkan audio yang tersedia, melihat progres, dan meminta bantuan Tutor AI.

## Daftar isi

- [Fitur](#fitur)
- [Teknologi dan prasyarat](#teknologi-dan-prasyarat)
- [Instalasi lokal](#instalasi-lokal)
- [Akun demo dan data contoh](#akun-demo-dan-data-contoh)
- [Cara menggunakan](#cara-menggunakan)
- [Konfigurasi Tutor AI](#konfigurasi-tutor-ai)
- [Perintah pengembangan](#perintah-pengembangan)
- [Batasan dan catatan konten](#batasan-dan-catatan-konten)

## Fitur

### Untuk pelajar

- Dasbor dengan ringkasan kelas, progres, dan pelajaran terakhir.
- Kelas **Bahasa Sunda** dan **Aksara Sunda** yang terpisah, dengan unit dan pelajaran berurutan.
- Materi teks, kosakata, dialog, konteks penggunaan, ragam tutur, transliterasi, arti, dan audio jika tersedia.
- Latihan pilihan ganda, isian, mencocokkan, menyusun urutan, serta latihan Aksara Sunda.
- Hasil latihan berisi skor, jawaban benar, dan penjelasan; percobaan disimpan untuk melihat riwayat.
- Progres pelajaran dan latihan yang dapat dilihat kembali.
- Pencarian pada judul, ringkasan, isi materi, kosakata, dan aksara di materi yang diterbitkan.
- Tutor AI untuk tanya jawab, latihan percakapan teks, dan umpan balik tulisan. Jawaban menggunakan materi terbit yang relevan sebagai rujukan.
- Pilihan bahasa tampilan **Indonesia** atau **Sunda** di pengaturan profil.

### Untuk admin

- Panel admin khusus dengan akses pengelolaan konten.
- Mengelola kelas, unit, pelajaran, blok materi, latihan, soal, serta kunci jawaban.
- Mengisi kosakata, tulisan Latin dan Aksara Sunda, arti, konteks, ragam tutur, urutan materi, dan status konten.
- Mengunggah audio pelafalan berformat MP3, WAV, OGG, atau M4A hingga 10 MB.
- Mengatur status materi: draf, ditinjau, diterbitkan, atau diarsipkan.
- Melihat daftar pelajar, jumlah pelajaran yang selesai, dan jumlah percobaan latihan.

### Akun dan dukungan aksara

- Pendaftaran, login, verifikasi email, pemulihan kata sandi, dan pengaturan profil.
- Autentikasi dua faktor dan passkey tersedia pada pengaturan keamanan.
- Aksara Sunda disimpan sebagai Unicode. Font Noto Sans Sundanese disertakan agar karakter dapat ditampilkan tanpa bergantung pada font perangkat.
- Akses pelajar dan admin dipisahkan berdasarkan peran. Admin mengelola konten; pelajar membuka pelajaran dan mengerjakan latihan.

## Teknologi dan prasyarat

- PHP **8.3 atau lebih baru** dan ekstensi PHP yang dibutuhkan Laravel, termasuk PDO MySQL.
- Composer 2.
- Node.js **20.19+** atau **22.12+**, serta npm.
- MySQL 8+ dengan database ber-charset `utf8mb4`.
- Git untuk mengambil kode sumber.

Stack aplikasi: Laravel 13, Inertia, React 19, TypeScript, Vite, dan MySQL.

## Instalasi lokal

Langkah berikut menggunakan PowerShell di Windows. Di macOS/Linux, gunakan `cp .env.example .env` sebagai pengganti `Copy-Item`.

### 1. Siapkan kode dan dependensi

Masuk ke folder proyek, lalu jalankan:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
composer install
npm ci
```

### 2. Buat database MySQL

Buat database dengan charset `utf8mb4`:

```sql
CREATE DATABASE lms_sunda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Periksa nilai koneksi di `.env`. Sesuaikan nama pengguna dan kata sandi dengan instalasi MySQL Anda:

```dotenv
APP_NAME="Sawala"
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lms_sunda
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Siapkan aplikasi dan isi data awal

```powershell
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

Seeder menambahkan kelas Bahasa Sunda dan Aksara Sunda, materi contoh, latihan, audio, dan akun demo pada lingkungan `local` atau `testing`. Audio publik membutuhkan tautan `storage` dari langkah di atas.

### 4. Jalankan aplikasi

```powershell
composer run dev
```

Buka [http://localhost:8000](http://localhost:8000). Perintah tersebut menjalankan server pengembangan Laravel dan Vite. Jika ingin menjalankannya terpisah, gunakan dua terminal:

```powershell
# Terminal 1
php artisan serve
```

```powershell
# Terminal 2
npm run dev
```

Pendaftaran akun baru mengharuskan verifikasi email sebelum halaman belajar atau admin dapat dibuka. Pada konfigurasi lokal, email menggunakan mailer `log`; tautan verifikasi dapat dilihat di `storage/logs/laravel.log`.

## Akun demo dan data contoh

Seeder demo berjalan hanya pada lingkungan `local` dan `testing`. Akun demo dibuat dalam keadaan email terverifikasi.

| Peran | Email | Kata sandi awal |
|---|---|---|
| Admin | `admin.demo@example.test` | `BelajarSunda123!` |
| Pelajar | `pelajar.demo@example.test` | `BelajarSunda123!` |

Seeder juga membuat 24 akun pelajar contoh tambahan dengan email `pelajar.demo.01@example.test` sampai `pelajar.demo.24@example.test`, lengkap dengan progres dan percobaan simulasi untuk melihat tampilan saat data sudah banyak.

Untuk memakai kata sandi lain, ubah `SEED_ACCOUNT_PASSWORD` di `.env` **sebelum** seeding pertama. Seeder yang dijalankan ulang tidak mengganti kata sandi akun yang sudah ada. Jalankan `php artisan db:seed` untuk menambahkan data contoh yang belum tersedia.

> `php artisan migrate:fresh --seed` menghapus seluruh tabel dan isinya sebelum mengisi ulang database. Gunakan hanya untuk database pengembangan yang memang boleh direset.

## Cara menggunakan

### Sebagai pelajar

1. Daftar dan verifikasi email, atau masuk menggunakan akun demo pelajar.
2. Dari dasbor, pilih kelas Bahasa Sunda atau Aksara Sunda.
3. Buka unit dan pelajaran. Dengarkan audio jika materi menyediakannya, lalu tandai pelajaran selesai.
4. Kerjakan latihan. Setelah mengirim jawaban, buka hasil untuk melihat skor dan penjelasan.
5. Lihat progres, gunakan pencarian materi, atau buka Tutor AI untuk bertanya dan berlatih.
6. Ubah bahasa antarmuka melalui **Pengaturan akun → Profil → Bahasa tampilan**.

### Sebagai admin

1. Masuk dengan akun admin demo, atau promosikan akun yang sudah terdaftar:

   ```powershell
   php artisan admin:promote nama@email.com
   ```

   Akun harus sudah terdaftar dan emailnya terverifikasi agar dapat masuk ke panel admin.

2. Gunakan menu **Kelas & Pelajaran** untuk mengelola kelas Bahasa Sunda dan Aksara Sunda, lalu pilih unit atau pelajaran yang akan diubah.
3. Tambahkan blok materi, latihan, soal, kunci jawaban, dan audio dari halaman pengelolaan terkait.
4. Terbitkan secara berurutan: isi dan terbitkan pelajaran terlebih dahulu, kemudian unit, lalu kelas. Pelajaran perlu memiliki blok materi; latihan perlu memiliki soal sebelum konten dapat diterbitkan.
5. Buka bagian **Pelajar & Progres** untuk melihat aktivitas belajar dan hasil latihan.

## Konfigurasi Tutor AI

Tutor AI opsional dan memerlukan endpoint API yang kompatibel dengan format **Chat Completions**. Isi nilai berikut di `.env`:

```dotenv
TUTOR_API_KEY=isi_kunci_api
TUTOR_API_URL=https://api.openai.com/v1
TUTOR_MODEL=gpt-4o-mini
```

Gunakan model dan endpoint yang tersedia pada penyedia AI Anda. Setelah mengubah konfigurasi, jalankan `php artisan config:clear` bila konfigurasi pernah di-cache. Simpan kunci API hanya di `.env`; jangan masukkan kunci ke kode frontend atau commit ke repositori.

Tutor membatasi permintaan menjadi 10 kali per jam untuk setiap pengguna dan hanya menggunakan blok materi yang sudah diterbitkan sebagai konteks. Jika tidak ada materi yang relevan, tutor akan meminta pelajar merujuk ke kelas yang tersedia. Tanpa `TUTOR_API_KEY`, halaman tetap dapat menampilkan materi rujukan, tetapi jawaban AI tidak akan dibuat.

## Perintah pengembangan

| Perintah | Kegunaan |
|---|---|
| `composer run dev` | Menjalankan server pengembangan Laravel dan Vite |
| `php artisan migrate --seed` | Menjalankan migrasi dan seeder pada pemasangan baru |
| `php artisan db:seed` | Menambahkan data seeder yang belum tersedia |
| `php artisan storage:link` | Membuat tautan penyimpanan audio publik |
| `npm run build` | Membuat aset frontend untuk deployment |
| `npm run types:check` | Memeriksa tipe TypeScript |
| `composer run types:check` | Memeriksa tipe PHP dengan PHPStan |
| `php artisan test` | Menjalankan tes Laravel |

## Batasan dan catatan konten

- Data seeder adalah contoh pengembangan, bukan kurikulum final. Tinjau kosakata, ragam bahasa, konteks, aksara, audio, dan kunci jawaban bersama pengajar atau penutur Bahasa Sunda sebelum dipakai untuk pembelajaran nyata.
- Tutor AI bergantung pada materi terbit dan konfigurasi penyedia AI. Jawabannya dapat keliru; pelajar perlu memeriksa rujukan yang disediakan.
- Fitur kelas guru, penugasan per kelas, transliterasi otomatis Latin ke Aksara Sunda, penilaian pelafalan, dan tutor suara belum tersedia.
- Sebelum dipakai di sekolah, tentukan kebijakan akun untuk siswa di bawah umur, privasi dan retensi percakapan AI, serta batas biaya layanan AI.

Panduan desain antarmuka tersedia di [`DESIGN.md`](DESIGN.md); ruang lingkup produk dan keputusan yang masih terbuka ada di [`PRD.md`](PRD.md).
