# Data contoh lokal

`DatabaseSeeder` membuat dua kelas dasar. Pada lingkungan `local` dan `testing`, `DemoContentSeeder` menambah materi pembuka dan `RichDemoSeeder` mengisi topik, kosakata, aksara, latihan pilihan ganda dan isian/menulis aksara, lebih dari 15 kuis evaluasi dari materi pelajaran, satu kuis menyimak dengan tiga rekaman kalimat, 24 akun pelajar contoh, progres, hasil latihan dan kuis, kartu pengulangan terjadwal, serta riwayat tutor contoh. Kuis memiliki batas waktu, nilai lulus, dan batas percobaan; kuis menyimak meminta pelajar memilih transkrip yang cocok dengan rekaman. Seeder dapat dijalankan kembali: data demo yang belum ada akan ditambahkan tanpa menghapus materi, akun, atau aktivitas tersimpan.

Jalankan dengan `php artisan migrate`, `php artisan db:seed`, dan `php artisan storage:link` pada pemasangan baru. Ketiganya sudah dijalankan pada database lokal proyek ini.

Materi ini adalah **contoh pengembangan**, bukan kurikulum yang sudah ditinjau. Tinjau kosakata, ragam bahasa, konteks, aksara, dan kunci jawaban bersama pengajar atau penutur Bahasa Sunda sebelum digunakan di produksi. Progres dan percakapan tutor pada akun `pelajar.demo.*@example.test` adalah data simulasi; token AI bernilai nol. Seeder demo tidak berjalan di lingkungan produksi.

Rujukan isi:

- [Tata bahasa acuan bahasa Sunda, Kemendikbud](https://repositori.kemendikdasmen.go.id/3691/1/tata%20bahasa%20acuan%20bahasa%20sunda%20%20%20259.pdf): contoh “Wilujeng enjing”, “Kumaha damang?”, “Punten”, dan “Mangga”.
- [Kamus Indonesia–Sunda–Cerbon, Kemendikbud](https://repositori.kemendikdasmen.go.id/34665/1/Buku-Kamus19-Lengkap_compressed.pdf): “hatur nuhun”, “asup”, dan “lebet”.
- [Tata Bahasa Sunda, Kemendikbud](https://repositori.kemendikdasmen.go.id/2644/1/Tata%20Bahasa%20Sunda%20%281984%29.pdf): kata ganti dan sapaan keluarga.
- [Kajian pemerolehan bahasa Sunda, Kemendikbud](https://repositori.kemendikdasmen.go.id/435/): kata tanya dasar.
- [Daftar karakter Sundanese, Unicode](https://www.unicode.org/Public/18.0.0/charts/nameslist/1b80/): aksara swara, ngalagena, rarangkén, dan angka; [Sundanese Supplement](https://www.unicode.org/Public/18.0.0/charts/nameslist/1cc0/) memuat tanda baca tambahan.

Audio `assets/asup.wav` berasal dari [rekaman “asup” oleh Raflinoer32 di Lingua Libre/Wikimedia Commons](https://commons.wikimedia.org/wiki/File:LL-Q34002_(sun)-Raflinoer32-asup.wav), berlisensi [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Tidak ada perubahan pada rekaman. Seeder menyalinnya ke disk `public`; jalankan `php artisan storage:link` bila tautan `public/storage` belum ada.

Audio tambahan untuk [“abdi”](https://commons.wikimedia.org/wiki/File:LL-Q34002_(sun)-Panonpoe_tos_moncorong-abdi.wav) dan [“anjeun”](https://commons.wikimedia.org/wiki/File:LL-Q34002_(sun)-Panonpoe_tos_moncorong-anjeun.wav) direkam Panonpoe tos moncorong; [“akang”](https://commons.wikimedia.org/wiki/File:LL-Q34002_(sun)-Griselda_Orion-akang.wav) direkam Griselda Orion. Ketiganya berasal dari Lingua Libre/Wikimedia Commons dengan lisensi [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), tanpa perubahan pada rekaman. Seeder menyalinnya ke disk `public`.
