# Panduan Desain Sawala

**Status:** Panduan implementasi frontend  
**Revisi:** 23 September 2026  
**Acuan visual:** Enam halaman HTML Stitch yang diberikan pengguna, diadaptasi untuk data dan alur LMS ini.

## Arah visual

Sawala memakai tampilan terang pada seluruh halaman. Tidak ada pilihan tema. Kanvas berwarna lavender sangat pucat, kartu putih bersudut membulat, aksen indigo untuk tindakan utama, emerald untuk bantuan dan status positif, serta amber untuk penanda sekunder. Ilustrasi dari acuan Stitch boleh digunakan sebagai pendamping materi; data progres dan konten tetap berasal dari aplikasi.

Landing page memakai kanvas biru-putih yang tenang, navigasi ringkas, dan aksen indigo `#4255ff`. Kartu fitur pastel menampilkan cuplikan antarmuka belajar, bukan gambar stok. Section Bahasa Sunda, Aksara Sunda, Tutor AI, dan alur belajar menjelaskan kemampuan produk sebelum pengguna membuat akun.

## Token utama

| Token | Nilai | Penggunaan |
|---|---|---|
| Latar | `#fcf8ff` | Kanvas halaman |
| Permukaan | `#ffffff` | Sidebar, kartu, formulir |
| Tinta | `#1b1b24` | Teks utama |
| Indigo | `#493ee5` | Tombol, navigasi aktif, progres, tautan |
| Indigo lembut | `#efedff` | Bidang penekanan |
| Emerald | `#006c4a` | Bantuan dan status positif |
| Amber | `#a34b05` | Penanda sekunder |
| Garis | `#e8e5f2` | Batas dan pemisah |

Gunakan Plus Jakarta Sans untuk antarmuka Latin dan Noto Sans Sundanese untuk Aksara Sunda. Tampilkan aksara sebagai teks Unicode yang dapat dipilih, dengan `lang="su"` pada konten yang sesuai.

## Struktur layar

- **Pelajar:** sidebar kiri pada desktop, drawer pada layar kecil, dan bar atas untuk pencarian serta ringkasan progres yang berasal dari data. Navigasi mengarah ke dasbor, dua kelas belajar, ruang latihan aksara, Tutor AI, dan progres.
- **Admin:** sidebar kiri penuh pada desktop tanpa navbar atas. Pada layar kecil gunakan drawer. Bahasa Sunda dan Aksara Sunda dikelola melalui satu menu **Kelas & Pelajaran**, lalu dipilih di dalam halaman editor. Ringkasan, editor kelas, kosakata, latihan, media, dan progres pelajar memakai hierarki kartu yang sama. Admin hanya mengelola konten dan memantau pelajar; halaman belajar, pengerjaan soal, dan Tutor AI hanya tersedia untuk peran Pelajar.
- **Editor kelas admin:** pemilih kelas berada di baris mendatar agar tidak meninggalkan kolom kosong. Banner menggunakan bentuk, ikon, dan teks vektor sehingga tetap tajam pada layar lebar. Tindakan tambah, ubah, dan hapus memakai label yang jelas.
- **Materi:** kelas menunjukkan unit dan pelajaran, halaman pelajaran menampilkan konten yang nyaman dibaca, latihan menampilkan satu soal pada satu waktu, dan hasil memberi koreksi beserta penjelasan.
- **Akun:** halaman masuk dan daftar memakai panel ilustrasi pada desktop. Pengaturan profil memuat pilihan bahasa tampilan Indonesia atau Sunda; halaman keamanan tetap terpisah.

## Aturan konten dan interaksi

1. Semua angka progres, jumlah soal, skor, dan aktivitas berasal dari data aplikasi. Jangan menyalin metrik contoh pada mockup.
2. Bahasa Sunda dan Aksara Sunda adalah kelas terpisah. Latihan aksara memiliki halaman daftar tersendiri dan palet karakter pada soal menulis.
3. Materi ragam wilayah dan undak-usuk menjelaskan konteks pemakaian. Audio hanya ditampilkan saat berkas terkait tersedia.
4. Jawaban Tutor AI dipisahkan secara visual dari pertanyaan pelajar dan menampilkan rujukan pelajaran bila tersedia.
5. Semua tindakan harus dapat digunakan melalui keyboard, memiliki fokus terlihat, label jelas, dan area sentuh utama setidaknya 44×44px.
6. Pada lebar kecil, kartu tersusun vertikal tanpa gulir horizontal. Hormati `prefers-reduced-motion`.
7. Teks menu dan petunjuk mengikuti bahasa tampilan akun. Judul dan isi materi tetap mengikuti naskah kurikulum agar terjemahan antarmuka tidak mengubah isi pembelajaran.
