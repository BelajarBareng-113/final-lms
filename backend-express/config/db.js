const { Pool } = require('pg');
require('dotenv').config(); // Membaca data rahasia dari file .env

// Membuat pool koneksi ke PostgreSQL memakai variabel dari .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Uji coba koneksi saat server pertama kali dinyalakan
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Gagal terhubung ke database PostgreSQL:', err.stack);
  }
  console.log('✅ Berhasil terhubung ke database PostgreSQL ("DB_LMS")');
  release();
});

// Ekspor pool agar bisa digunakan di file controller nanti
module.exports = pool;
