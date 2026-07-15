/**
 * ============================================
 * NotaOTO LITE - Service Worker
 * Fungsi: Bikin web ini bisa di-"Install" jadi app di HP
 * (Add to Home Screen) dan tetap bisa dibuka walau offline.
 * ============================================
 *
 * Catatan: verifikasi Akun+Kode tetap wajib online (lihat app.js),
 * service worker ini cuma nge-cache TAMPILAN app-nya saja supaya
 * cepat kebuka & tetap bisa dipakai edit-edit ringan walau offline.
 */

// Naikkan angka versi ini (cache_v1 -> cache_v2, dst) setiap kali
// habis update file app.js/style.css/index.html, supaya HP pengguna
// otomatis ambil versi baru dan bukan versi cache lama.
const CACHE_NAME = 'notaoto-lite-cache-v2';

const FILE_YANG_DICACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './favicon-192x192.png',
  './favicon-512x512.png'
];

// Saat pertama kali diinstal: simpan semua file inti ke cache.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILE_YANG_DICACHE))
  );
  self.skipWaiting();
});

// Bersihkan cache versi lama supaya tidak numpuk.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((namaCacheList) =>
      Promise.all(
        namaCacheList
          .filter((nama) => nama !== CACHE_NAME)
          .map((nama) => caches.delete(nama))
      )
    )
  );
  self.clients.claim();
});

// Strategi: coba jaringan dulu (biar selalu dapat data terbaru & GAS
// tetap real-time), kalau gagal/offline baru jatuh ke cache.
self.addEventListener('fetch', (event) => {
  // Jangan cache pemanggilan ke Google Apps Script (harus selalu real-time,
  // bukan hasil cache) — biarkan lewat langsung ke jaringan.
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});