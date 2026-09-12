const { encryptData, decryptData, generateRandomId } = require('./cryptoHelper');
const pool = require('../config/db'); // Mengambil koneksi database yang kita buat sebelumnya

const setAbsen = async (req, res) => {
    const { nama, whatsapp, status_hadir, keterangan, hari } = req.body;

    if (!nama || !whatsapp || !hari) {
        return res.status(400).json({ message: 'Nama, whatsapp, dan hari wajib diisi!' });
    }

    try {
        // Ambil semua data whatsapp anggota untuk diperiksa
        const checkQuery = 'SELECT wa FROM tbl_anggota';
        const checkResult = await pool.query(checkQuery);

        // Loop untuk mendekripsi data di DB dan mencocokkannya dengan wa input baru
        const sudahTerdaftar = checkResult.rows.some(row => {
            const whatsappTerdekripsi = decryptData(row.wa);
            return whatsappTerdekripsi === whatsapp; // Mengembalikan true jika ada yang sama
        });

        // Jika belum terdaftar
        if (!sudahTerdaftar) {
            return res.status(400).json({ message: 'Siswa dengan whatsapp ini tidak terdaftar!' });
        }

        // Cari kelas minggu ini pada hari yang dipilih, ambil yang terdekat
        const kelasQuery = `
            SELECT id, hari, tanggal, waktu, link
            FROM tbl_kelas
            WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', NOW())
              AND selesai = 'belum'
              AND lower(hari) = lower($1)
            ORDER BY tanggal ASC, waktu ASC
        `;
        const kelasResult = await pool.query(kelasQuery, [hari]);

        if (kelasResult.rows.length === 0) {
            return res.status(400).json({ message: 'Tidak ada kelas pada hari ini!' });
        }

        // Pilih kelas terdekat: tanggal >= hari ini, fallback kelas pertama
        const kelas = kelasResult.rows.find(row => row.tanggal >= new Date()) || kelasResult.rows[0];

        // Cegah janji ganda: WA yang sama pada tanggal kelas yang sama
        const dupQuery = 'SELECT wa FROM tbl_absensi WHERE tanggal_absen = $1';
        const dupResult = await pool.query(dupQuery, [kelas.tanggal]);
        const sudahJanji = dupResult.rows.some(row => decryptData(row.wa) === whatsapp);

        if (sudahJanji) {
            return res.status(400).json({ message: 'Kamu sudah membuat janji untuk kelas di tanggal ini!', link: kelas.link || null });
        }

        // Jika sudah terdaftar, lanjutkan proses simpan janji
        const whatsappTerenkripsi = encryptData(whatsapp);
        const idGenerate = generateRandomId(5);

        const queryText = `
            INSERT INTO tbl_absensi (id, nama, wa, status_hadir, alasan, tanggal_absen) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [idGenerate, nama, whatsappTerenkripsi, status_hadir || 'hadir', keterangan, kelas.tanggal];
        
        await pool.query(queryText, values);

        res.status(201).json({
            message: 'Format penamaan: nama-panggilan_4-digit-nomor-belakang-wa. contoh: Tian_9225.',
            link: kelas.link || null
        });
    } catch (error) {
        console.error('❌ Error saat menyimpan data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

const getAbsen = async (req, res) => {
    try {
        const queryText = `
            SELECT * 
            FROM tbl_absensi 
            ORDER BY waktu_absen ASC
        `;
        const result = await pool.query(queryText);

        const dataBersih = result.rows.map(row => {
            return {
                id: row.id,
                nama: row.nama,
                whatsapp: decryptData(row.wa),
                status_hadir: row.status_hadir,
                alasan: row.alasan,
                tanggal_absen: row.tanggal_absen,
                waktu_absen: row.waktu_absen,
                gabung_meet: row.gabung_meet
            };
        });

        res.status(200).json(dataBersih);
    } catch (error) {
        console.error('❌ Error saat mengambil data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

const patchAbsen = async (req, res) => {
    const { id } = req.params; // Mengambil ID dari URL
    let { gabung_meet } = req.body; // Mengambil data baru dari frontend

    if (!gabung_meet) {
        gabung_meet = 'tidak';
    }

    try {
        // Jalankan perintah UPDATE di PostgreSQL
        const queryText = `
            UPDATE tbl_absensi 
            SET gabung_meet = $1
            WHERE id = $2 
            RETURNING *
        `;
        const values = [gabung_meet, id];
        const result = await pool.query(queryText, values);

        // Jika ID data tidak ditemukan
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data absen tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Data absen berhasil diperbarui!' });
    } catch (error) {
        console.error('❌ Error saat memperbarui data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

    const removeAbsen = async (req, res) => {
    // Mengambil parameter ID dari URL
    const { id } = req.params; 

    try {
        const queryText = 'DELETE FROM tbl_absensi WHERE id = $1 RETURNING *';
        const result = await pool.query(queryText, [id]);

        // Jika ID tidak ditemukan di database
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data absen tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Data absen berhasil dihapus!' });
    } catch (error) {
        console.error('❌ Error saat menghapus data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
}

module.exports = {
    setAbsen,
    getAbsen,
    patchAbsen,
    removeAbsen
};