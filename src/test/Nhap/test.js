const crypto = require('crypto');

const userId = '64fac9b2545bc6a41973744c';

const hash = crypto.createHash('md5');
hash.update(userId);
const digest = hash.digest('hex');

// Giá trị băm MD5 là 128 bit, tương đương với 16 byte
const decimalHash = parseInt(digest, 16);

// Cắt giảm 10 chữ số ở cuối số thập phân
const truncatedHash = decimalHash.toString(16).slice(0, 6);

console.log('decimalHash::', truncatedHash);
