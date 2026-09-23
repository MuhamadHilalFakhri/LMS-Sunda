# PRD: LMS Belajar Bahasa Sunda

**Status:** Draft v0.1  
**Tanggal:** 23 September 2026  
**Nama produk:** Belum ditentukan

## 1. Ringkasan produk

Produk ini adalah Learning Management System berbasis web untuk membantu pelajar umum dan siswa sekolah belajar Bahasa Sunda serta Aksara Sunda secara mandiri. Materi disusun dalam kelas belajar berisi unit dan pelajaran, dilengkapi latihan, audio pelafalan, pencatatan progres, dan tutor AI berbasis teks.

Sistem memiliki dua peran: **Pelajar** dan **Admin**. Sekolah dapat menggunakan akun pelajar untuk belajar mandiri. Pengelolaan kelas dan dashboard guru belum termasuk lingkup MVP.

## 2. Tujuan

- Menyediakan kelas belajar Bahasa Sunda yang terstruktur dari tingkat pemula.
- Menyediakan kelas belajar Aksara Sunda dengan materi dan latihan tersendiri.
- Membantu pelajar berlatih membaca, menulis, menyimak, dan memahami konteks pemakaian ragam bahasa.
- Memungkinkan admin menyusun, meninjau, dan menerbitkan materi tanpa perubahan kode.
- Menyediakan bantuan AI yang merujuk pada materi yang telah ditinjau.

## 3. Keputusan produk yang telah dikonfirmasi

| Area | Keputusan |
|---|---|
| Target pengguna | Pelajar umum dan siswa sekolah |
| Kelas belajar | Bahasa Sunda dan Aksara Sunda sebagai kelas terpisah |
| Ragam materi | Mendukung ragam wilayah dan undak-usuk basa; acuan wilayah awal masih perlu ditentukan |
| Peran | Pelajar dan Admin |
| AI | Tanya jawab, latihan percakapan berbasis teks, dan koreksi tulisan |
| Backend | Laravel terbaru, disarankan Laravel 13.x |
| Frontend | React + Vite melalui Inertia |
| Database | MySQL dengan charset `utf8mb4` |
| Aksara Sunda | Disimpan dan ditampilkan sebagai teks Unicode dengan font yang mendukung aksara Sunda |

## 4. Asumsi dan keputusan terbuka

- Pengalaman sekolah pada MVP bersifat belajar mandiri. Belum ada kelas, penugasan guru, atau laporan per kelas.
- UI utama menggunakan Bahasa Indonesia.
- Produk berfokus pada web responsif dan penggunaan melalui ponsel maupun desktop.
- Kelas pemula menjadi titik awal konten. Tingkat atau jenjang sekolah yang ditargetkan masih perlu dipastikan.
- Materi bahasa, variasi wilayah, contoh pemakaian, dan kunci jawaban harus ditinjau oleh penutur atau pengajar Bahasa Sunda.
- Nama produk, identitas visual, model pendaftaran, penyedia AI, batas biaya AI, serta sumber kurikulum belum ditetapkan.

## 5. Pengguna dan kebutuhan

### 5.1 Pelajar umum

- Ingin belajar Bahasa Sunda dari dasar dengan urutan yang jelas.
- Perlu contoh percakapan, arti kata, konteks pemakaian, dan audio pelafalan.
- Ingin melihat materi yang sudah dipelajari dan melanjutkan dari progres terakhir.

### 5.2 Siswa sekolah

- Perlu materi dan latihan yang sesuai jenjangnya.
- Perlu mempelajari Bahasa Sunda dan Aksara Sunda melalui contoh dan latihan bertahap.
- Pada MVP, belajar menggunakan akun pelajar biasa tanpa kelas yang dikelola guru.

### 5.3 Admin

- Perlu membuat, mengubah, meninjau, menerbitkan, dan mengarsipkan materi.
- Perlu mengelola kosakata, ragam wilayah, konteks undak-usuk, audio, latihan, dan kunci jawaban.
- Perlu melihat penggunaan materi, progres, dan hasil latihan pelajar.

## 6. Ruang lingkup MVP

### 6.1 Akun dan akses

- Pendaftaran, login, logout, pemulihan kata sandi, dan pengelolaan profil pelajar.
- Peran pengguna: Pelajar dan Admin.
- Admin dapat mengelola konten dan melihat data progres yang diperlukan untuk operasional.
- Kebijakan akun untuk siswa di bawah umur perlu ditetapkan sebelum peluncuran ke sekolah.

### 6.2 Kelas Bahasa Sunda

- Daftar kelas, unit, dan pelajaran.
- Materi kosakata, ungkapan, percakapan, tata bahasa, membaca, dan menyimak.
- Informasi konteks pemakaian, ragam wilayah, dan undak-usuk pada materi yang relevan.
- Contoh kalimat dengan terjemahan Bahasa Indonesia.
- Audio pelafalan yang diunggah atau disetujui admin.

### 6.3 Kelas Aksara Sunda

- Bagan karakter dan materi pengenalan aksara.
- Contoh aksara dengan transliterasi Latin dan arti.
- Latihan mengenali karakter, mencocokkan karakter dengan transliterasi, dan menyusun jawaban menggunakan palet karakter di layar.
- Penyimpanan teks aksara Unicode dan penggunaan font yang mendukung Aksara Sunda.
- Konversi otomatis tulisan Latin ke Aksara Sunda tidak termasuk MVP sampai aturan alih aksara dan sumber validasinya ditetapkan.

### 6.4 Latihan dan evaluasi

- Jenis latihan awal: pilihan ganda, mencocokkan pasangan, melengkapi teks, menyusun urutan kata atau dialog, dan memilih karakter Aksara Sunda.
- Pelajar dapat mengulang latihan.
- Sistem menyimpan percobaan, jawaban, skor, dan waktu pengerjaan.
- Setelah latihan, pelajar dapat melihat jawaban benar dan penjelasan yang disiapkan admin.
- Progres pelajaran ditandai belum dimulai, sedang dikerjakan, atau selesai.

### 6.5 Tutor AI

- Menjawab pertanyaan pelajar dengan merujuk pada materi yang telah diterbitkan dan ditinjau.
- Menjalankan latihan percakapan berbasis teks dengan konteks atau skenario yang disiapkan.
- Memberi saran pada tulisan Bahasa Sunda dan menjelaskan alasannya.
- AI perlu menyatakan ketidakpastian atau mengarahkan pelajar ke materi terkait saat sumber tidak memadai.
- Kunci jawaban latihan tetap dikelola admin. AI tidak menjadi satu-satunya penentu skor.
- Koreksi tulisan Aksara Sunda oleh AI perlu divalidasi sebelum diaktifkan; pemeriksaan latihan aksara pada MVP menggunakan kunci jawaban terstruktur.
- Panggilan AI berjalan dari backend. Kunci API tidak dikirim ke browser.
- Percakapan, penggunaan, dan biaya AI dicatat secukupnya untuk pengelolaan layanan. Masa simpan dan persetujuan pengguna masih perlu ditentukan.

### 6.6 Pengelolaan konten admin

- CRUD kelas, unit, pelajaran, blok konten, kosakata, ragam, audio, latihan, dan kunci jawaban.
- Status konten: draf, ditinjau, diterbitkan, atau diarsipkan.
- Urutan materi dan latihan dapat diatur.
- Validasi agar pelajaran yang diterbitkan memiliki konten yang cukup dan jawaban latihan yang lengkap.
- Admin dapat meninjau progres keseluruhan dan hasil per pelajar.

## 7. Di luar lingkup MVP

- Peran guru, kelas, pendaftaran siswa ke kelas, dan tugas yang ditetapkan guru.
- Pembayaran, langganan, sertifikat, forum, konferensi video, dan aplikasi native.
- Mode offline penuh.
- Penilaian pelafalan otomatis dan percakapan suara langsung.
- Penerjemah atau transliterator otomatis Latin ke Aksara Sunda.
- Gamifikasi kompleks dan papan peringkat publik.

Fitur-fitur tersebut dapat dipertimbangkan setelah pola belajar dan kebutuhan pengguna tervalidasi.

## 8. Alur utama pengguna

### 8.1 Pelajar

1. Membuat akun atau login.
2. Memilih kelas Bahasa Sunda atau Aksara Sunda.
3. Membuka unit dan pelajaran yang tersedia.
4. Mempelajari materi teks, contoh, dan audio.
5. Mengerjakan latihan dan melihat hasil serta penjelasan.
6. Melanjutkan pelajaran berikutnya atau meminta bantuan tutor AI.
7. Melihat progres dan riwayat latihan.

### 8.2 Admin

1. Login ke panel admin.
2. Membuat atau mengubah kelas, unit, dan pelajaran.
3. Menambahkan kosakata, ragam wilayah, konteks undak-usuk, media, dan latihan.
4. Meninjau materi sebelum menerbitkannya.
5. Melihat progres pelajar dan penggunaan materi.

## 9. Kebutuhan fungsional dan kriteria penerimaan

| ID | Kebutuhan | Kriteria penerimaan |
|---|---|---|
| FR-01 | Kelas belajar terpisah | Pelajar dapat menemukan dan membuka kelas Bahasa Sunda serta Aksara Sunda secara terpisah. |
| FR-02 | Progres belajar | Progres pelajaran tersimpan dan pelajar dapat melanjutkan dari aktivitas terakhir. |
| FR-03 | Audio | Pelajar dapat memutar audio yang terhubung dengan materi atau kosakata. |
| FR-04 | Latihan berulang | Pelajar dapat mengulang latihan dan melihat hasil untuk setiap percobaan. |
| FR-05 | Konten aksara | Aksara Sunda tersimpan dan tampil sebagai karakter yang terbaca pada perangkat yang didukung aplikasi. |
| FR-06 | Editor konten | Admin dapat membuat dan menerbitkan materi tanpa mengubah kode aplikasi. |
| FR-07 | Ragam dan konteks | Admin dapat menandai kosakata atau contoh dengan ragam wilayah dan konteks pemakaian yang relevan. |
| FR-08 | Bantuan AI | Pelajar dapat bertanya, berlatih percakapan teks, dan meminta umpan balik tulisan. Jawaban menggunakan materi terbit jika tersedia. |
| FR-09 | Administrasi progres | Admin dapat melihat progres dan hasil latihan pelajar untuk mendukung pengelolaan konten. |
| FR-10 | Akses berbasis peran | Fitur kelola hanya dapat diakses Admin; halaman belajar, pengerjaan soal, hasil latihan pribadi, dan Tutor AI hanya dapat diakses Pelajar. |

## 10. Model konten dan data awal

Entitas utama yang disarankan:

- `users`, `roles` atau kolom peran pada pengguna.
- `learning_paths`, `units`, `lessons`, `lesson_blocks`.
- `vocabulary_items`: tulisan Latin, tulisan Aksara Sunda, arti, contoh, ragam wilayah, konteks pemakaian, dan audio.
- `media_assets` untuk gambar dan audio.
- `exercises`, `questions`, `choices`, `answer_keys`.
- `lesson_progress`, `exercise_attempts`, `exercise_answers`.
- `ai_conversations`, `ai_messages`, dan catatan penggunaan AI.

Semua kolom yang dapat menyimpan teks Aksara Sunda harus memakai `utf8mb4`. Pengaturan collation perlu dipilih sesuai kebutuhan pencarian dan pengurutan teks.

## 11. Arsitektur teknis yang disarankan

- Laravel 13.x dan PHP 8.3 atau lebih baru.
- React 19 + TypeScript + Vite menggunakan starter kit Inertia resmi.
- Inertia untuk komunikasi halaman antara route/controller Laravel dan komponen React.
- MySQL dengan `utf8mb4` untuk menyimpan data aplikasi dan karakter Unicode.
- Penyimpanan berkas audio/gambar melalui filesystem Laravel; gunakan object storage saat deployment bila dibutuhkan.
- Laravel AI SDK atau adapter provider di backend agar pemanggil model terpisah dari komponen React.
- Queue untuk tugas AI atau pekerjaan lambat saat beban dan kebutuhan sudah memerlukan.
- Font Aksara Sunda disertakan atau dilayani secara konsisten oleh aplikasi.

## 12. Kebutuhan nonfungsional

- Antarmuka responsif dan nyaman dipakai di ponsel.
- Validasi dan otorisasi dilakukan di backend.
- Konten dan input pelajar ditampilkan dengan perlindungan terhadap skrip berbahaya.
- Audio menyediakan kontrol putar yang jelas dan teks pendamping.
- Halaman menyediakan keadaan memuat, kosong, sukses, dan gagal.
- Penggunaan AI memiliki batas permintaan dan pencatatan biaya.
- Percakapan AI tidak boleh dijadikan sumber kurikulum tanpa proses tinjauan.
- Aplikasi harus dapat mempertahankan tulisan Aksara Sunda saat simpan, muat ulang, pencarian, dan ekspor yang didukung.

## 13. Ukuran keberhasilan

Metrik berikut dicatat sebagai dasar evaluasi; target angka ditetapkan setelah baseline pilot tersedia.

- Pendaftaran dan aktivasi pelajar.
- Jumlah pelajar yang memulai dan menyelesaikan pelajaran.
- Tingkat penyelesaian per unit dan kelas.
- Jumlah percobaan serta perubahan skor setelah pengulangan.
- Pelajaran yang paling sering ditinggalkan.
- Frekuensi penggunaan tutor AI dan umpan balik pelajar.
- Waktu yang diperlukan admin untuk membuat dan menerbitkan materi.
- Laporan kesalahan konten, audio, atau tampilan aksara.

## 14. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Variasi wilayah atau tingkat tutur membuat contoh berbeda | Simpan metadata ragam dan konteks; tinjau materi oleh penutur atau pengajar. |
| AI memberi terjemahan atau koreksi keliru | Batasi jawaban pada sumber terbit, tampilkan rujukan, gunakan kunci jawaban untuk penilaian, dan beri sarana umpan balik. |
| Aksara tidak tampil pada sebagian perangkat | Bundel font yang sesuai dan sediakan uji tampilan lintas browser/perangkat sebelum rilis. |
| Biaya atau latensi AI meningkat | Tetapkan batas penggunaan, gunakan antrean untuk proses lambat, dan catat penggunaan per fitur. |
| Pengguna mencakup siswa di bawah umur | Tentukan kebijakan akun, privasi, persetujuan, dan retensi data sebelum peluncuran sekolah. |
| Materi awal belum lengkap | Tetapkan editor/peninjau dan siapkan kurikulum minimum sebelum fitur tutor AI diaktifkan. |

## 15. Tahapan rilis

1. **Validasi konten dan kurikulum:** tentukan sasaran jenjang, acuan ragam awal, dan proses tinjauan.
2. **Fondasi aplikasi:** autentikasi, peran Pelajar/Admin, navigasi, penyimpanan berkas, dan konfigurasi MySQL.
3. **CMS admin:** kelas, unit, pelajaran, kosakata, media, latihan, kunci jawaban, dan penerbitan.
4. **Pengalaman belajar:** katalog kelas, pemutar audio, latihan, hasil, serta pencatatan progres.
5. **Kelas Aksara Sunda:** bagan karakter, teks Unicode, font, palet karakter, dan latihan aksara.
6. **Tutor AI teks:** tanya jawab, percakapan teks, dan umpan balik tulisan berbasis materi yang ditinjau.
7. **Pilot dan rilis:** tinjauan penutur/pengajar, pemeriksaan konten, aksesibilitas dasar, privasi, dan deployment.

## 16. Pertanyaan terbuka

- Acuan wilayah/ragam apa yang menjadi konten pertama, dan wilayah mana yang perlu didukung setelahnya?
- Siswa sekolah yang ditargetkan berada di jenjang apa saja?
- Apakah pendaftaran pelajar terbuka untuk umum atau menggunakan undangan/kode sekolah?
- Siapa yang menyediakan dan meninjau kurikulum, contoh kalimat, serta audio?
- Apakah tutor AI perlu menyimpan riwayat percakapan, dan berapa lama?
- Penyedia/model AI dan anggaran penggunaan apa yang diinginkan?
- Apakah materi Aksara Sunda mencakup tulisan tangan, atau fokus pada pengenalan dan penyusunan karakter digital?

## 17. Referensi

- [Laravel 13 release notes](https://laravel.com/framework/docs/releases)
- [Laravel React starter kit](https://laravel.com/framework/docs/13.x/starter-kits)
- [Laravel AI SDK](https://laravel.com/framework/docs/13.x/ai-sdk)
- [Inertia.js](https://inertiajs.com/)
- [BubbleSmart, referensi pembelajaran bahasa/aksara daerah](https://github.com/bubblevy/bubblesmart)
- [LMS Laravel + React + Inertia](https://github.com/darakushinji/Learning-Management-System)
- [Unicode Sundanese block](https://www.unicode.org/charts/PDF/U1B80.pdf)
- [Unicode Sundanese Supplement](https://unicode.org/charts/PDF/U1CC0.pdf)
- [MySQL `utf8mb4`](https://dev.mysql.com/doc/refman/8.0/en/charset-unicode-utf8mb4.html)
- [Noto Sans Sundanese](https://github.com/notofonts/sundanese)
