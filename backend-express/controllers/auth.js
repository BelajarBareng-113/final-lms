const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi!' });
    }

    try {
        const result = await pool.query(
            'SELECT id, username, password FROM tbl_admin WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah!' });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ message: 'Username atau password salah!' });
        }

        const token = jwt.sign(
            { username: user.username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error('❌ Error saat login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
    }
};

module.exports = { login };