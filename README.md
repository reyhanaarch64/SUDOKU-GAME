## Sudoku Game - Web Version

game sudoku interaktif berbasis web dengan sistem autentikasi, leaderboard realtime, dan berbagai mode kesulitan. dibangun pakai firebase untuk backend dan vanilla javascript murni.

## fitur utama

- **5 tingkat kesulitan**: chill, mudah, hard, extreme, dewa
- **sistem nyawa & strike combo**: setiap jawaban salah mengurangi nyawa, jawaban benar berturut-turut memicu efek strike
- **fitur notes**: catat angka kemungkinan di setiap sel (bisa di-toggle)
- **timer & pause**: pantau waktu bermain, pause kapan aja
- **hint terbatas**: maksimal 2 hint per game, tapi ada konsekuensi nyawa berkurang
- **sistem akun**: login google atau sebagai tamu (data tamu rawan hilang)
- **leaderboard**: peringkat per mode kesulitan, update realtime
- **tema & mode gelap**: 5 tema visual (ios, pinky, matrix, cyberpunk, classic) + dark mode
- **penyimpanan progres**: best time tersimpan di firebase per user

## struktur file

```

/
├── index.html          # halaman utama game
├── leaderboard.html    # papan peringkat
├── setting.html        # halaman pengaturan
├── sudoku.js           # library inti (generator puzzle + ui modal)
├── about.html          # (opsional) halaman info game
└── README.md           # ini

```

## persiapan firebase

1. buat project di [firebase console](https://console.firebase.google.com)
2. aktifkan autentikasi dengan provider **google** dan **anonymous**
3. buat realtime database di region terdekat
4. atur rules database (lihat bagian rules di bawah)
5. ambil konfigurasi firebase (apiKey, authDomain, databaseURL, dll)

### cara masukin config

di file **index.html**, **leaderboard.html**, dan **setting.html**, cari blok `firebaseConfig` (ada di dalam tag `<script type="module">`). ganti semua value dengan config dari project firebase kamu:

```javascript
const firebaseConfig = {
  apiKey: "isi_dari_firebase",
  authDomain: "isi_dari_firebase",
  databaseURL: "isi_dari_firebase",
  projectId: "isi_dari_firebase",
  storageBucket: "isi_dari_firebase",
  messagingSenderId: "isi_dari_firebase",
  appId: "isi_dari_firebase"
};
```

database rules

buat realtime database dengan rules berikut agar aman:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "scores": {
      ".read": true,
      "easy": {
        "$uid": {
          ".write": "$uid === auth.uid"
        }
      },
      "hard": {
        "$uid": {
          ".write": "$uid === auth.uid"
        }
      },
      "extreme": {
        "$uid": {
          ".write": "$uid === auth.uid"
        }
      },
      "god": {
        "$uid": {
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

penjelasan:

· users/$uid: hanya pemilik akun yang bisa baca/tulis data profilnya
· scores: semua orang bisa baca (buat leaderboard)
· scores/*/$uid: hanya pemilik akun yang bisa update skor mereka

library sudoku.js

file ini bertanggung jawab untuk:

1. generator puzzle
   · sudoku.generate(difficulty) → return { puzzle, solved }
   · difficulty: 'chill' | 'easy' | 'hard' | 'extreme' | 'god'
   · otomatis generate papan lengkap pakai backtracking, lalu sembunyikan sel sesuai tingkat kesulitan
2. ui modal sederhana
   · sudoku.a(msg, opts) → alert (tombol ok aja)
   · sudoku.c(msg, callback, opts) → confirm (callback terima boolean)
   · sudoku.p(msg, callback, opts) → prompt (callback terima string input)
   · semua modal pakai css yang di-inject otomatis, konsisten di semua halaman

cara menjalankan

karena ini pure html + js (tanpa bundler), kamu bisa:

1. clone repo ini
2. buka file index.html langsung di browser
3. atau pake live server (vscode extension) biar lebih enak

pastikan file block.ttf (font efek strike) ada di root folder, atau hapus referensi di css kalo ga butuh.

about.html

halaman about tidak disertakan dalam repo ini. kamu bisa buat sendiri dengan konten bebas, misalnya:

· deskripsi game
· credit pembuat
· versi game
· link repo github

cukup buat file about.html di root, styling menyesuaikan dengan tema yang dipakai (pakai variabel css yang sama).

catatan penting

· font awesome 6.4.0 di-load dari cdn, pastikan koneksi internet aktif
· semua file wajib di-root folder yang sama, karena routing pake path absolut (/leaderboard.html)
· game hanya berjalan di browser modern (support es module)
· tidak ada dependensi npm, murni vanilla js + firebase sdk via cdn

lisensi

bebas dipakai, dimodifikasi, disebarkan. credit ga wajib tapi dihargai.

---

dibuat untuk iseng-iseng, semoga bermanfaat.