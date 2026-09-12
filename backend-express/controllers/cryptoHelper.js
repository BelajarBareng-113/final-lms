require('dotenv').config();
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8'); 
const IV_LENGTH = 16; 

// Fungsi Helper untuk Enkripsi Data Sensitif (Nama & whatsapp)
function encryptData(text) {
    const iv = crypto.randomBytes(IV_LENGTH); 
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Gabungkan IV dan hasil enkripsi dengan pemisah ":"
    return iv.toString('hex') + ':' + encrypted;
}

// Fungsi Helper untuk Dekripsi di bawah fungsi encryptData
function decryptData(encryptedText) {
    try {
        const textParts = encryptedText.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedData = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return "[Gagal Dekripsi / Data Rusak]";
    }
}

// Fungsi untuk menghasilkan angka acak unik tepat 11 digit (Range: 10.000.000.000 hingga 99.999.999.999)
function generateRandomId(num) {
    if (num < 1 || num > 15) {
        throw new Error("Panjang digit harus berada di antara 1 sampai 15.");
    }
    
    // Contoh jika num = 3: min = 100, max = 999
    const min = Math.pow(10, num - 1);
    const max = Math.pow(10, num) - 1;
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



module.exports = {
    encryptData,
    decryptData,
    generateRandomId
};