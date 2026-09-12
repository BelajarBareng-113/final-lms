const { encryptData, decryptData, generateRandomId } = require('./cryptoHelper');
const pool = require('../config/db'); // Mengambil koneksi database yang kita buat sebelumnya

// Logika Utama untuk Menyimpan Absensi
const setAnggota = async (req, res) => {
    const { nama, whatsapp, email } = req.body;

    // Validasi input dasar
    if (!nama || !whatsapp) {
        return res.status(400).json({ message: 'Semua kolom data wajib diisi!' });
    }

    try {
        const whatsappTerenkripsi = encryptData(whatsapp);

        const idGenerate = generateRandomId(10);

        const queryText = `
            INSERT INTO tbl_anggota (id, nama, wa, mail) 
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        // 📍 PENTING: Variabel 'nama' langsung dimasukkan tanpa enkripsi
        const values = [idGenerate, nama, whatsappTerenkripsi, email];
        
        await pool.query(queryText, values);

        // Kirim respons sukses ke frontend
        res.status(201).json({ message: 'Anggota berhasil disimpan dengan aman!' });
    } catch (error) {
        console.error('❌ Error saat menyimpan data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
};


// 📋 Tambahkan Fungsi untuk Mengambil Data & Mendekripsi Whatsapp
const getAnggota = async (req, res) => {
    try {
        const queryText = 'SELECT id, nama, wa, mail FROM tbl_anggota';
        const result = await pool.query(queryText);

        // Dekripsi whatsapp saja; nama disimpan tanpa enkripsi
        const dataBersih = result.rows.map(row => {
            return {
                id: row.id,
                nama: row.nama,
                whatsapp: decryptData(row.wa),
                email: row.mail
            };
        });

        // Kirim data yang sudah bersih/terdekripsi ke frontend
        res.status(200).json(dataBersih);
    } catch (error) {
        console.error('❌ Error saat mengambil data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
};

const patchAnggota = async (req, res) => {
    const { id } = req.params; // Mengambil ID dari URL
    const { nama, whatsapp, email } = req.body; // Mengambil data baru dari frontend

    if (!nama || !whatsapp) {
        return res.status(400).json({ message: 'Nama dan whatsapp wajib diisi!' });
    }

    try {
        // Jalankan perintah UPDATE di PostgreSQL
        const queryText = `
            UPDATE tbl_anggota 
            SET nama = $1, wa = $2, mail = $3
            WHERE id = $4 
            RETURNING *
        `;
        const values = [nama, encryptData(whatsapp), email, id];
        const result = await pool.query(queryText, values);

        // Jika ID siswa tidak ditemukan
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data anggota tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Data anggota berhasil diperbarui!' });
    } catch (error) {
        console.error('❌ Error saat memperbarui data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

const removeAnggota = async (req, res) => {
    // Mengambil parameter ID dari URL
    const { id } = req.params; 

    try {
        const queryText = 'DELETE FROM tbl_anggota WHERE id = $1 RETURNING *';
        const result = await pool.query(queryText, [id]);

        // Jika ID tidak ditemukan di database
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data anggota tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Data anggota berhasil dihapus!' });
    } catch (error) {
        console.error('❌ Error saat menghapus data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

module.exports = {
    setAnggota,
    getAnggota,
    patchAnggota,
    removeAnggota
};
