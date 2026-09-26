# Sawala

Sawala adalah LMS berbasis web untuk belajar Bahasa Sunda dan Aksara Sunda. Struktur kurikulumnya terdiri dari **kelas → modul → materi**. Pelajar belajar dalam ruang khusus per modul, berlatih dan mengikuti kuis, lalu melihat progres yang tersimpan. Tutor AI tersedia jika penyedia AI sudah dikonfigurasi.

Istilah di kode dan database: `learning_path` berarti kelas, `unit` berarti modul, `lesson` berarti materi/pelajaran, dan `lesson_block` berarti bagian isi materi.

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
- Kelas **Bahasa Sunda** dan **Aksara Sunda** yang terpisah. Setiap kelas berisi kartu modul dengan jumlah materi dan progres.
- Ruang belajar khusus per modul: sidebar hanya menampilkan materi terbit dalam modul yang sedang dibuka. Materi terakhir yang belum selesai dipilih otomatis; materi juga dapat dipilih dari sidebar atau tombol sebelumnya/berikutnya.
- Materi teks, kosakata, dialog, konteks penggunaan, ragam tutur, transliterasi, arti, dan audio jika tersedia. Pelajaran juga dapat menampilkan video YouTube yang ditautkan admin.
- Galeri 72 karakter Unicode Aksara Sunda: swara, ngalagena, rarangkén, angka, tanda baca, dan karakter historis. Galeri mendukung pencarian, filter kelompok, serta salin karakter.
- Latihan dengan soal pilihan ganda, isian, mencocokkan, menyusun urutan, menulis Aksara Sunda, dan menyimak audio.
- Kuis evaluasi terpisah dari latihan. Kuis mendukung soal pilihan ganda dan menyimak audio, dengan durasi, nilai kelulusan, dan batas percobaan yang dapat diatur admin.
- Hasil latihan dan kuis berisi skor, jawaban benar, dan penjelasan; riwayat percobaan disimpan.
- Ulasan jawaban keliru dari percobaan terbaru pada setiap soal.
- Kartu pengulangan terjadwal untuk kosakata dan aksara yang sudah dipelajari. Jadwal menyesuaikan penilaian pelajar tentang tingkat kesulitannya.
- Target aktivitas harian, streak belajar, progres pelajaran, dan riwayat latihan.
- Simpan modul utuh atau blok kosakata, dialog, dan aksara untuk dipelajari kembali. Halaman **Materi tersimpan** memisahkan daftar modul dan bagian materi serta mendukung pencarian dan pagination.
- Pencarian pada judul, ringkasan, isi materi, kosakata, dan aksara di materi yang diterbitkan.
- Tutor AI untuk tanya jawab, latihan percakapan teks, terjemahan Indonesia ke Sunda, dan umpan balik tulisan. Mode tetap berada dalam satu ruang percakapan; tombol Tutor AI juga tersedia di ruang belajar modul. Riwayat percakapan dapat dihapus.
- Pilihan bahasa tampilan **Indonesia** atau **Sunda** di pengaturan profil.

### Untuk admin

- Panel admin khusus dengan akses pengelolaan konten.
- Mengelola kelas, modul, materi, blok materi, latihan, kuis, soal, dan kunci jawaban.
- Mengatur nilai kelulusan, waktu, dan batas percobaan pada setiap kuis.
- Mengisi kosakata, tulisan Latin dan Aksara Sunda, arti, konteks, ragam tutur, urutan materi, dan status konten.
- Menambahkan audio pelafalan dengan mengunggah berkas atau merekam langsung melalui browser. Format yang diterima MP3, WAV, OGG, M4A, atau WEBM hingga 10 MB.
- Menambahkan tautan YouTube pada materi agar video tampil di halaman belajar.
- Mengatur status materi: draf, ditinjau, diterbitkan, atau diarsipkan.
- Mengelola akun pelajar dan admin: tambah akun, ubah nama/email/peran, aktifkan atau nonaktifkan akun, hapus akun, serta kirim tautan verifikasi dan reset kata sandi.
- Meninjau status verifikasi email, status akses, tanggal bergabung, progres pelajaran, dan jumlah percobaan latihan. Admin tidak dapat menonaktifkan atau menghapus akunnya sendiri; sistem juga menjaga agar selalu ada admin aktif.

### Akun dan dukungan aksara

- Pendaftaran, login, verifikasi email, pemulihan kata sandi, dan pengaturan profil.
- Autentikasi dua faktor dan passkey tersedia pada pengaturan keamanan.
- Aksara Sunda disimpan sebagai Unicode. Font Noto Sans Sundanese disertakan agar karakter dapat ditampilkan tanpa bergantung pada font perangkat.
- Akses pelajar dan admin dipisahkan berdasarkan peran. Halaman belajar memerlukan login dan verifikasi email.

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

Seeder menambahkan kelas Bahasa Sunda dan Aksara Sunda, materi contoh dalam beberapa modul, latihan, lebih dari 15 kuis evaluasi termasuk kuis menyimak, audio, kartu pengulangan terjadwal, serta akun demo pada lingkungan `local` atau `testing`. Audio publik membutuhkan tautan `storage` dari langkah di atas. Data demo ditujukan untuk pengembangan dan pratinjau, bukan kurikulum siap pakai.

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

| Peran   | Email                       | Kata sandi awal    |
| ------- | --------------------------- | ------------------ |
| Admin   | `admin.demo@example.test`   | `BelajarSunda123!` |
| Pelajar | `pelajar.demo@example.test` | `BelajarSunda123!` |

Seeder juga membuat 24 akun pelajar contoh tambahan dengan email `pelajar.demo.01@example.test` sampai `pelajar.demo.24@example.test`, lengkap dengan progres dan percobaan simulasi untuk melihat tampilan saat data sudah banyak.

Untuk memakai kata sandi lain, ubah `SEED_ACCOUNT_PASSWORD` di `.env` **sebelum** seeding pertama. Seeder yang dijalankan ulang tidak mengganti kata sandi akun yang sudah ada. Jalankan `php artisan db:seed` untuk menambahkan data contoh yang belum tersedia.

> `php artisan migrate:fresh --seed` menghapus seluruh tabel dan isinya sebelum mengisi ulang database. Gunakan hanya untuk database pengembangan yang memang boleh direset.

## Cara menggunakan

### Sebagai pelajar

1. Daftar dan verifikasi email, atau masuk menggunakan akun demo pelajar.
2. Dari dasbor, pilih kelas **Bahasa Sunda** atau **Aksara Sunda**, lalu pilih modul.
3. Di ruang belajar, pilih materi dari sidebar khusus modul. Materi terakhir yang belum selesai akan dibuka otomatis saat modul dilanjutkan.
4. Baca isi materi, putar audio atau video jika tersedia, lalu tandai pelajaran selesai. Gunakan navigasi sebelumnya/berikutnya untuk berpindah dalam modul yang sama.
5. Kerjakan latihan untuk berlatih, atau buka **Kuis** untuk evaluasi. Hasil menampilkan skor dan penjelasan.
6. Buka **Ulasan jawaban** untuk mengulang jawaban keliru, **Materi tersimpan** untuk membuka blok yang disimpan, atau **Ulangan** untuk pengulangan terjadwal.
7. Atur target harian di dasbor, lalu pantau progres dan riwayat percobaan.
8. Jelajahi **Kumpulan Aksara** untuk mencari, memfilter, dan menyalin karakter Sunda.
9. Gunakan pencarian atau Tutor AI untuk mencari materi, bertanya, berlatih percakapan, meminta terjemahan, dan mendapat umpan balik tulisan.
10. Ubah bahasa antarmuka melalui **Profil → Bahasa tampilan**. Materi pelajaran tetap ditampilkan dalam bahasa aslinya.

### Sebagai admin

1. Masuk dengan akun admin demo, atau promosikan akun yang sudah terdaftar:

    ```powershell
    php artisan admin:promote nama@email.com
    ```

    Akun harus sudah terdaftar dan emailnya terverifikasi agar dapat masuk ke panel admin.

2. Di panel admin, pilih kelas untuk mengelola modul dan materi. Materi dapat berisi teks, kosakata, dialog, aksara, audio pelafalan, dan tautan YouTube.
3. Dari pengelolaan audio, pilih materi yang sudah ada atau buat materi baru; lalu unggah berkas atau rekam melalui mikrofon browser. Browser perlu mendapat izin mikrofon untuk merekam.
4. Kelola latihan dan kuis secara terpisah. Latihan mendukung beberapa bentuk jawaban; kuis evaluasi mendukung pilihan ganda dan soal menyimak. Atur waktu, nilai kelulusan, dan batas percobaan pada kuis.
5. Terbitkan materi, modul, lalu kelas. Materi harus memiliki isi sebelum diterbitkan; aktivitas perlu memiliki soal agar dapat dikerjakan pelajar.
6. Buka **Pengguna & Akun** untuk membuat akun pelajar/admin, mengubah nama, email, atau peran, mengaktifkan akses, mengirim ulang verifikasi email, mengirim tautan reset kata sandi, dan menghapus akun beserta data aktivitas terkait. Email yang baru diubah perlu diverifikasi kembali.
7. Gunakan bagian **Tutor AI** untuk mengatur dan menguji koneksi penyedia AI.

## Konfigurasi Tutor AI

Tutor AI opsional dan memerlukan endpoint API yang kompatibel dengan format **Chat Completions**. Admin dapat mengaturnya melalui bagian **Tutor AI** di panel admin. Kunci yang disimpan melalui panel dienkripsi di database. Alternatifnya, isi konfigurasi server berikut di `.env`:

```dotenv
TUTOR_API_KEY=isi_kunci_api
TUTOR_API_URL=https://api.openai.com/v1
TUTOR_MODEL=gpt-4o-mini
```

Gunakan model dan endpoint yang tersedia pada penyedia AI Anda. Setelah mengubah konfigurasi `.env`, jalankan `php artisan config:clear` bila konfigurasi pernah di-cache. Kunci API yang dimasukkan lewat panel admin dienkripsi saat disimpan. Jangan masukkan kunci ke kode frontend atau commit berkas `.env` ke repositori.

Tutor membatasi permintaan menjadi 10 kali per jam untuk setiap pengguna dan dibatasi untuk topik pembelajaran Bahasa Sunda serta Aksara Sunda. Tanya jawab dan umpan balik tulisan merujuk pada materi terbit yang relevan; jika tidak ditemukan, tutor tidak membuat jawaban berbasis materi. Untuk mode terjemahan Indonesia–Sunda, tutor dapat mencoba menerjemahkan tanpa rujukan yang cocok dan diminta menyatakan ketidakpastian ragam atau konteks. Tanpa kunci API yang valid atau jika tutor dinonaktifkan admin, halaman tetap dapat menampilkan percakapan dan rujukan, tetapi jawaban AI tidak akan dibuat.

## Perintah pengembangan

| Perintah                     | Kegunaan                                            |
| ---------------------------- | --------------------------------------------------- |
| `composer run dev`           | Menjalankan server pengembangan Laravel dan Vite    |
| `php artisan migrate --seed` | Menjalankan migrasi dan seeder pada pemasangan baru |
| `php artisan db:seed`        | Menambahkan data seeder yang belum tersedia         |
| `php artisan storage:link`   | Membuat tautan penyimpanan audio publik             |
| `npm run build`              | Membuat aset frontend untuk deployment              |
| `npm run check`              | Menjalankan pemeriksaan kode frontend               |
| `npm run types:check`        | Memeriksa tipe TypeScript                           |
| `composer run types:check`   | Memeriksa tipe PHP dengan PHPStan                   |
| `php artisan test`           | Menjalankan tes Laravel                             |

## Batasan dan catatan konten

- Data seeder adalah contoh pengembangan, bukan kurikulum final. Tinjau kosakata, ragam bahasa, konteks, aksara, audio, dan kunci jawaban bersama pengajar atau penutur Bahasa Sunda sebelum dipakai untuk pembelajaran nyata.
- Tutor AI bergantung pada materi terbit dan konfigurasi penyedia AI. Jawabannya dapat keliru; pelajar perlu memeriksa rujukan yang disediakan.
- Fitur kelas guru, penugasan per kelas, transliterasi otomatis Latin ke Aksara Sunda, penilaian pelafalan, dan tutor suara belum tersedia.
- Sebelum dipakai di sekolah, tentukan kebijakan akun untuk siswa di bawah umur, privasi dan retensi percakapan AI, serta batas biaya layanan AI.
