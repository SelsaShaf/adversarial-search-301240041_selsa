# Checkers AI - Adversarial Search

Aplikasi web simulasi permainan Checkers (Dam) dengan implementasi algoritma Minimax dan Alpha-Beta Pruning. Dibuat sebagai project mata kuliah Kecerdasan Buatan, S1 Teknik Informatika, Universitas Bale Bandung.

## Deskripsi

Aplikasi ini mensimulasikan permainan Checkers 8x8 antara manusia dan AI (atau manusia vs manusia). AI menggunakan algoritma Minimax dengan opsi Alpha-Beta Pruning sebagai optimasi. Seluruh logika algoritma diimplementasikan dari nol tanpa library eksternal.

## Fitur

- Mode Human vs AI menggunakan algoritma Minimax
- Implementasi Alpha-Beta Pruning sebagai optimasi Minimax
- Visualisasi Game Tree minimal 3 level kedalaman
- Counter jumlah node yang dievaluasi (Minimax vs Alpha-Beta)
- Toggle mode antara Minimax murni dan Minimax + Alpha-Beta Pruning
- Pengaturan kedalaman pencarian (depth) oleh pengguna
- Indikator giliran pemain dan status permainan
- Tampilan responsif untuk desktop dan mobile
- Mode Human vs Human
- Animasi langkah AI dan highlight node yang dipangkas
- Dark mode dan Light mode

## Aturan Permainan

- Piece hanya bergerak diagonal pada kotak gelap
- Piece biasa hanya bisa maju, King bisa maju dan mundur
- Capture (makan) bersifat wajib jika tersedia
- Multi-jump (lompatan berantai) diterapkan jika piece masih bisa capture lagi
- Piece yang mencapai baris ujung lawan menjadi King
- Menang jika lawan kehabisan piece atau tidak bisa bergerak

## Stack Teknologi

- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Backend: Python Flask (server statis)
- Deployment: GitHub Pages / Render dengan custom domain .my.id

## Cara Menjalankan

### Menjalankan secara lokal

1. Clone repository ini
git clone https://github.com/SelsaShaf/adversarial-search-301240041.git

cd adversarial-search-301240041

2. Install dependencies
pip install -r requirements.txt

3. Jalankan aplikasi
python app.py

4. Buka browser dan akses
http://127.0.0.1:5000

## Struktur Folder
adversarial-search-301240041/

├── static/

│   ├── css/style.css

│   ├── js/

│   │   ├── board.js

│   │   ├── moves.js

│   │   ├── evaluation.js

│   │   ├── minimax.js

│   │   ├── gametree.js

│   │   ├── gamemode.js

│   │   └── ui.js

│   └── assets/favicon.ico

├── templates/

│   ├── index.html

│   ├── about.html

│   └── 404.html

├── venv/

├── app.py

├── requirements.txt

└── README.md

## Algoritma

### Minimax

Algoritma pencarian pada game tree yang menentukan langkah optimal dengan mengasumsikan kedua pemain bermain optimal. Pemain MAX memaksimalkan skor, pemain MIN meminimalkan skor.

### Alpha-Beta Pruning

Optimasi dari Minimax yang memangkas cabang pencarian yang tidak akan memengaruhi hasil akhir, sehingga mengurangi jumlah node yang dievaluasi tanpa mengubah hasil keputusan.

## Demo

- Live Demo: https://game-checkers-selsa.my.id/
- Video Demonstrasi: https://youtu.be/Ee25-hlx5NI?si=D41EBAXJ1Tq2osIv

## Penulis

- Nama: Selsa Shafana Alfiyani
- NIM: 301240041
- Kelas: 4B
- Mata Kuliah: Kecerdasan Buatan
- Dosen: Mohammad Bayu Anggara, S.Kom., M.Kom.

## Lisensi

Project ini dibuat untuk keperluan akademik.
