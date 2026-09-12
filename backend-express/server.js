const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Memuat file .env

const apiRoutes = require('./routes/api');

const app = express();

// 1. Definisikan semua URL frontend yang diizinkan mengakses API ini
// (Silakan ganti URL production sesuai dengan URL asli dari Vercel Anda nanti)
const allowedOrigins = [
    'https://frontend-user-tau.vercel.app',            // Frontend User (Production)
    'https://frontend-admin-lilac.vercel.app',      // Frontend Admin (Production) -> *Perbaikan: ubah subdomain agar berbeda
    'http://localhost:1133',            // Frontend User (Development)
    'http://localhost:5173'             // Frontend Admin (Development)
];

// 2. Aktifkan Dynamic CORS Middleware (Cukup Panggil Sekali)
app.use(cors({
    origin: function (origin, callback) {
        // Mengizinkan request tanpa origin (seperti Postman, mobile apps, atau server-to-server)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Origin cocok dan diizinkan
        } else {
            callback(new Error('Akses diblokir oleh kebijakan CORS Express!'));
        }
    },
    credentials: true // WAJIB bernilai true jika Anda mengirimkan Cookies/Session nantinya
}));

// Middleware untuk membaca data berbentuk JSON dari body request
app.use(express.json());

// Sambungkan rute API utama
app.use('/api', apiRoutes);

module.exports = app; 

// Menjalankan Server (Menggunakan port dinamis agar otomatis kompatibel dengan Render/Railway)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server backend berjalan di port ${PORT}`);
});
