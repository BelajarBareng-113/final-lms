const express = require('express');
const router = express.Router();
const { setAnggota, getAnggota, patchAnggota, removeAnggota } = require('../controllers/anggota');
const { setAbsen, getAbsen, patchAbsen, removeAbsen } = require('../controllers/absen');
const { setKelas, getKelas, getKelasWeek, patchKelas, removeKelas } = require('../controllers/kelas');
const { login } = require('../controllers/auth');
const { setAdmin, getAdmin, patchAdmin, removeAdmin } = require('../controllers/admin');
const { authenticateAdmin } = require('../middlewares/auth');

// Rute publik: login admin
router.post('/auth/login', login);

// Rute publik: siswa absen & lihat jadwal kelas satu minggu per hari
router.post('/user/absen', setAbsen);
router.get('/absensi/:hari', getKelasWeek);

// Rute admin: kelola admin lain
router.post('/admin/admin-baru', authenticateAdmin, setAdmin);
router.get('/admin/daftar-admin', authenticateAdmin, getAdmin);
router.put('/admin/ubah-admin/:id', authenticateAdmin, patchAdmin);
router.delete('/admin/hapus-admin/:id', authenticateAdmin, removeAdmin);

// Rute admin/terproteksi: wajib menyertakan token JWT
router.post('/admin/anggota-baru', authenticateAdmin, setAnggota);
router.post('/admin/kelas-baru', authenticateAdmin, setKelas);
router.get('/daftar/anggota', authenticateAdmin, getAnggota);
router.get('/sekarang', authenticateAdmin, getAbsen);
router.get('/daftar/kelas', authenticateAdmin, getKelas);
router.put('/ubah/anggota/:id', authenticateAdmin, patchAnggota);
router.put('/ubah/absen/:id', authenticateAdmin, patchAbsen);
router.put('/ubah/kelas/:id', authenticateAdmin, patchKelas);
router.delete('/hapus/anggota/:id', authenticateAdmin, removeAnggota);
router.delete('/hapus/absen/:id', authenticateAdmin, removeAbsen);
router.delete('/hapus/kelas/:id', authenticateAdmin, removeKelas);

module.exports = router;
