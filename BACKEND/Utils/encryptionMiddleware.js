import crypto from 'crypto';

const SECRET_KEY = crypto.createHash('sha256').update("aasheeta#p").digest(); // 32 bytes key
const algorithm = 'aes-256-cbc';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, SECRET_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Middleware to decrypt incoming requests
export const decryptRequestMiddleware = (req, res, next) => {
  if (req.body && req.body.data) {
    try {
      const decrypted = decrypt(req.body.data);
      req.body = JSON.parse(decrypted);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid encrypted data' });
    }
  }
  next();
};

// Middleware to encrypt outgoing responses
export const encryptResponseMiddleware = (req, res, next) => {
  const originalSend = res.send.bind(res);
    res.send = (body) => {
          console.log("Response before encrypt:", body);
    if (typeof body === 'object') {
      const jsonString = JSON.stringify(body);
      const encryptedData = encrypt(jsonString);
      return originalSend({ data: encryptedData });
    }
    return originalSend(body);
  };
  next();
};
