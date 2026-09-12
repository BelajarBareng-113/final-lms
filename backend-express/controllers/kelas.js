const { generateRandomId } = require('./cryptoHelper');
const pool = require('../config/db'); // Mengambil koneksi database yang kita buat sebelumnya

const setKelas = async (req, res) => {
    const { hari, tanggal, waktu, materi, link } = req.body;

    if (!hari || !tanggal || !waktu) {
        return res.status(400).json({ message: 'Semua kolom data wajib diisi!' });
    }

    try {
        // Cek apakah pada tanggal yang sama sudah ada kelas dengan jam berselisih kurang dari 1 jam
        const checkQuery = `
            SELECT id FROM tbl_kelas
            WHERE tanggal = $1
              AND abs(EXTRACT(EPOCH FROM (waktu::time - $2::time))) < 3600
        `;
        const checkResult = await pool.query(checkQuery, [tanggal, waktu]);

        // Jika sudah ada kelas dengan jam terlalu dekat
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'Sudah ada kelas pada tanggal ini dengan selisih jam kurang dari 1 jam!' });
        }

        const idGenerate = generateRandomId(3);

        const queryText = `
            INSERT INTO tbl_kelas (id, hari, tanggal, waktu, materi, link) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [idGenerate, hari, tanggal, waktu, materi, link];
        
        await pool.query(queryText, values);

        res.status(201).json({ message: 'Kelas berhasil disimpan dengan aman!' });
    } catch (error) {
        console.error('❌ Error saat menyimpan data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

const getKelas = async (req, res) => {
    try {
        // Ambil semua data absensi, urutkan dari yang paling baru
        const queryText = `
        SELECT * 
        FROM tbl_kelas 
        WHERE selesai = 'belum' 
            ORDER BY tanggal ASC
        `;

        const result = await pool.query(queryText);

        // Lakukan perulangan (loop) untuk mendekripsi Nama dan NISN tiap siswa
        const dataBersih = result.rows.map(row => {
            return {
                id: row.id,
                materi: row.materi,
                hari: row.hari,
                tanggal: row.tanggal,
                waktu: row.waktu,
                selesai: row.selesai,
                link: row.link
            };
        });

        // Kirim data yang sudah bersih/terdekripsi ke frontend
        res.status(200).json(dataBersih);
    } catch (error) {
        console.error('❌ Error saat mengambil data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

const getKelasWeek = async (req, res) => {
    const { hari } = req.params;

    try {
        // Ambil seluruh data dari database untuk didekripsi
        const queryText = `
            SELECT hari, tanggal 
            FROM tbl_kelas 
            WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', NOW()) 
            AND selesai = 'belum' 
            ORDER BY tanggal ASC, waktu ASC
        `;

        const result = await pool.query(queryText);

        // Ambil data jadwal (link tidak ditampilkan di jadwal publik)
        const dataBersih = result.rows.map(row => {
            return {
                hari: row.hari, 
                tanggal: row.tanggal
            };
        });

        // Saring data berdasarkan hari yang dicari (tidak sensitif huruf besar/kecil)
        const hasilPencarian = dataBersih.filter(data =>
            data.hari && hari && data.hari.toLowerCase().includes(hari.toLowerCase())
        );

        res.status(200).json(hasilPencarian);
    } catch (error) {
        console.error('❌ Error saat mencari data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

const patchKelas = async (req, res) => {
    const { id } = req.params; // Mengambil ID dari URL
    const { hari, tanggal, waktu, materi, selesai, link } = req.body; // Mengambil data baru dari frontend

    if (!hari || !tanggal || !waktu || !selesai) {
        return res.status(400).json({ message: 'Data status absen dan selesai wajib diisi!' });
    }

    try {
        // Jalankan perintah UPDATE di PostgreSQL
        const queryText = `
            UPDATE tbl_kelas 
            SET hari = $1, tanggal = $2, waktu = $3, materi = $4, selesai = $5, link = $6
            WHERE id = $7 
            RETURNING *
        `;
        const values = [hari, tanggal, waktu, materi, selesai, link, id];
        const result = await pool.query(queryText, values);

        // Jika ID siswa tidak ditemukan
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data kelas tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Data kelas berhasil diperbarui!' });
    } catch (error) {
        console.error('❌ Error saat memperbarui data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

const removeKelas = async (req, res) => {
    // Mengambil parameter ID dari URL
    const { id } = req.params; 

    try {
        const queryText = 'DELETE FROM tbl_kelas WHERE id = $1 RETURNING *';
        const result = await pool.query(queryText, [id]);

        // Jika ID tidak ditemukan di database
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data kelas tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Data kelas berhasil dihapus!' });
    } catch (error) {
        console.error('❌ Error saat menghapus data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

module.exports = {
    setKelas,
    getKelas,
    getKelasWeek,
    patchKelas,
    removeKelas
};

