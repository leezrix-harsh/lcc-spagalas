# Family 100 LCC Spagalas

Website permainan untuk Lomba Cerdas Cermat Sumpah Pemuda x Bulan Bahasa, SMP Negeri 13 Jember.

> Bank soal Kelas 7, 8, dan 9 dari dokumen panitia sudah dimasukkan untuk Penyisihan, Semi-Final, dan Final. Semua jenjang menggunakan skor yang sama: Penyisihan benar +2/salah 0, Semi-Final benar +3/salah 0, dan Final benar +5/salah −2. Timer Kelas 9 mengikuti dokumen: Penyisihan 30 detik, Semi-Final 25 detik, Final 20 detik.

## Menjalankan

Pasang Node.js versi LTS, lalu jalankan:

```sh
npm install
npm run dev
```

Jalankan pemeriksaan bank soal dan build produksi:

```sh
npm run validate
npm run build
npm run preview
```

Hasil build berada di folder `dist/`.

## Cara pakai saat acara

1. Buka `#/host` di laptop operator.
2. Tekan **Buka Layar Penonton** atau buka `#/display` pada jendela baru; seret jendela itu ke proyektor.
3. Klik **Klik untuk mengaktifkan suara** di layar penonton. Gunakan F11 atau tombol **Layar Penuh**.
4. Pilih kategori kelas (Kelas 7, 8, atau 9). Daftar tim otomatis: 7A–7D, 8A–8C, atau 9A–9D. Skor tiap kategori tetap tersimpan terpisah saat berpindah kategori.
5. Pilih sesi dan soal. Tekan tombol **[nama tim] kontrol** untuk memilih tim yang sedang menjawab.
6. Untuk jawaban benar, buka nomor jawaban yang sesuai. Untuk jawaban salah/tidak terjawab, tekan **Jawaban salah — [nama tim] (X)** atau tombol `X`. Tombol salah aktif setelah tim kontrol dipilih.
7. Setelah tiga strike, kontrol berpindah ke tim berikutnya untuk kesempatan mencuri. Jawaban salah saat steal mengakhiri ronde dan bank kembali ke tim awal.

Efek suara benar dan salah diputar pada layar penonton setelah tombol aktivasi suara diklik. Jika ingin bunyi juga di laptop operator, aktifkan **Suara panel** di pengaturan.

Pintasan di panel operator: `1–7` buka jawaban, `X` salah, `A`/`B` tim kontrol, `N` soal berikutnya, `T` timer, `Z` undo, `M` mute.
Skor manual dapat ditambah atau dikurangi dengan memilih nominal cepat 10, 25, 50, atau 100 poin, atau memasukkan nominal sendiri.

## Mengubah konten

- **Soal:** edit `src/data/questions.ts` (Kelas 7), `src/data/questions-class8.ts` (Kelas 8), dan `src/data/questions-class9.ts` (Kelas 9). Tiap sesi berisi 60 soal dengan ID unik dan kunci jawaban. Jalankan `npm run validate` setelah perubahan.
- **Suara MP3:** taruh berkas di `public/sounds/`, lalu isi map `customSounds` pada `src/config.ts`. Suara sintesis Web Audio tersedia secara default.
- **Logo:** tambahkan `public/logo-spagalas.png` dan gunakan slot logo di header Display.
- **Skor babak:** aturan poin benar dan penalti jawaban salah untuk semua jenjang ditetapkan pada `src/config.ts`.

## Deploy statis

Jalankan build `npm run build`, lalu unggah folder `dist/`.

- **Vercel:** Build Command `npm run build`, Output Directory `dist`.
- **Netlify:** Build command `npm run build`, Publish directory `dist`.
- **Cloudflare Pages:** Build command `npm run build`, Build output directory `dist`.

Hash routing tidak memerlukan aturan rewrite. Aset aplikasi dan font dibundel; suara sintesis tidak membutuhkan internet setelah halaman dimuat.

### Deploy ke Vercel

1. Masuk ke Vercel dan pilih **Add New → Project**.
2. Impor repository `leezrix-harsh/lcc-spagalas`.
3. Pastikan Framework Preset **Vite**, Build Command `npm run build`, dan Output Directory `dist` (pengaturan ini juga tersedia di `vercel.json`).
4. Pilih **Deploy**. Setelah berhasil, buka URL `.vercel.app` yang diberikan.
5. Untuk pembaruan berikutnya, push ke branch `main`; Vercel akan membangun ulang secara otomatis jika integrasi Git aktif.

## Checklist gladi resik

- [ ] Tes dua jendela dan pastikan indikator layar penonton terhubung.
- [ ] Tes suara melalui speaker/proyektor setelah klik aktivasi audio.
- [ ] Coba jawaban benar, strike ketiga, steal, timer, undo, dan pemenang.
- [ ] Refresh kedua jendela dan pastikan progres permainan tetap pulih.
- [ ] Pastikan dokumen soal Kelas 9 telah dimasukkan sebelum kategori tersebut dimainkan.
