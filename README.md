# 🗺️ GeoWithin - Nearby Place Finder

<p align="center">
  <img src="image/logoGeo.png" alt="GeoWithin Logo" width="150" height="150">
</p>

**GeoWithin** adalah aplikasi web pencari tempat terdekat berbasis lokasi yang menggunakan teknologi Sistem Informasi Geografis (SIG). Aplikasi ini membantu pengguna menemukan berbagai fasilitas di sekitar lokasi mereka dengan mudah dan cepat.

## 🌟 Fitur Utama

- 📍 **Auto Location Detection** - Otomatis mendeteksi lokasi pengguna
- 🔍 **Smart Search** - Pencarian cerdas dengan deteksi keyword
- 🎯 **Radius Search** - Pencarian dalam radius 3 km dari lokasi pengguna
- 🗺️ **Interactive Map** - Peta interaktif dengan Leaflet.js
- 🏷️ **Real-time Labels** - Nama tempat langsung terlihat di marker
- 📋 **Detailed Info** - Informasi lengkap saat marker diklik
- 📱 **Responsive Design** - Dapat diakses di semua perangkat

## 🎯 Kategori Tempat

### 🏨 Penginapan
- Hotel, Penginapan, Losmen, Homestay

### 🏥 Kesehatan  
- Rumah Sakit, Klinik, Puskesmas

### 🍽️ Kuliner
- Restoran, Cafe, Rumah Makan

### 🛒 Belanja
- Minimarket, Supermarket, Mall
- Indomaret, Alfamart

### ⛽ Fasilitas Umum
- SPBU, ATM, Toilet

### 🕌 Tempat Ibadah
- Masjid, Gereja

## 🛠️ Teknologi yang Digunakan

- **Frontend**: HTML, CSS, JavaScript
- **Mapping**: Leaflet.js
- **Geospatial Analysis**: Turf.js  
- **Data Source**: OpenStreetMap via Overpass API
- **Geolocation**: HTML Geolocation API

## 📁 Struktur Project

```
GeoWithin/
│
├── index.html          # Halaman utama aplikasi
├── script.js           # Logika utama dan fungsi pencarian
├── data.js             # Data keyword mapping dan styling
├── style.css           # Styling dan responsive design
├── image/              # Folder gambar
│   └── logoGeo.png     # Logo aplikasi
└── README.md           # Dokumentasi project
```

## 🔧 Cara Penggunaan

1. **Izinkan Akses Lokasi** - Klik "Allow" saat browser meminta izin akses lokasi
2. **Tunggu Peta Load** - Peta akan menampilkan lokasi Anda dengan lingkaran radius pencarian
3. **Ketik Pencarian** - Masukkan kata kunci di search bar (contoh: "hotel", "rumah sakit", "cafe")
4. **Tekan Enter** - Hasil pencarian akan muncul sebagai marker berwarna di peta
5. **Klik Marker** - Untuk melihat informasi detail tempat tersebut

## 💡 Tips Pencarian

- Gunakan kata kunci bahasa Indonesia: "rumah sakit", "kafe", "masjid"
- Bisa juga menggunakan singkatan: "rs", "spbu", "atm"
- Pencarian tidak case-sensitive dan mengabaikan tanda baca

## 🎨 Kustomisasi Warna

Setiap kategori tempat memiliki warna marker yang berbeda:
- 🔵 **Hotel**: Biru
- 🔴 **Rumah Sakit**: Merah  
- 🟠 **Klinik**: Oranye
- 🟢 **Restoran**: Hijau
- 🟤 **Cafe**: Coklat
- 🟡 **Supermarket**: Kuning
- ⚫ **SPBU**: Abu-abu
- 🟣 **ATM**: Ungu
- 🔵 **Tempat Ibadah**: Biru Gelap
