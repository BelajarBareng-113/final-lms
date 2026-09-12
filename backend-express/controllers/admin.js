const bcrypt = require('bcryptjs');
const { generateRandomId } = require('./cryptoHelper');
const pool = require('../config/db');


const setAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi!' });
    }

    try {
        const idGenerate = generateRandomId(5);
        const hash = await bcrypt.hash(password, 10);

        const queryText = `
            INSERT INTO tbl_admin (id, username, password) 
            VALUES ($1, $2, $3) RETURNING username
        `;
        const result = await pool.query(queryText, [idGenerate, username, hash]);

        res.status(201).json({ message: 'Admin berhasil ditambahkan!', admin: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Username sudah dipakai!' });
        }
        console.error('❌ Error saat menambah admin:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
};

const getAdmin = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username FROM tbl_admin ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error saat mengambil data admin:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
};

const patchAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username && !password) {
        return res.status(400).json({ message: 'Tidak ada data yang diperbarui!' });
    }

    try {
        let queryText = 'UPDATE tbl_admin SET ';
        const values = [];
        const sets = [];

        if (username) {
            values.push(username);
            sets.push(`username = $${values.length}`);
        }
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            values.push(hash);
            sets.push(`password = $${values.length}`);
        }

        queryText += sets.join(', ') + ` WHERE id = $${values.length + 1} RETURNING id, username`;
        values.push(id);

        const result = await pool.query(queryText, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Admin tidak ditemukan!' });
        }

        res.status(200).json({ message: 'Data admin berhasil diperbarui!', admin: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Username sudah dipakai!' });
        }
        console.error('❌ Error saat memperbarui admin:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
};

const removeAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const check = await pool.query('SELECT username FROM tbl_admin WHERE id = $1', [id]);

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Admin tidak ditemukan!' });
        }

        // Cegah admin menghapus akunnya sendiri
        if (check.rows[0].username === req.user.username) {
            return res.status(400).json({ message: 'Tidak bisa menghapus akun admin yang sedang dipakai!' });
        }

        await pool.query('DELETE FROM tbl_admin WHERE id = $1', [id]);
        res.status(200).json({ message: 'Admin berhasil dihapus!' });
    } catch (error) {
        console.error('❌ Error saat menghapus admin:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
};

module.exports = {
    setAdmin,
    getAdmin,
    patchAdmin,
    removeAdmin
};