const fs = require('fs');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const MAGIC_BYTES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46],
};

function matchesMagic(bytes, buffer) {
  if (buffer.length < bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (buffer[i] !== bytes[i]) return false;
  }
  if (bytes === MAGIC_BYTES.webp) {
    if (buffer.length < 12) return false;
    return buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  return true;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(12).toString('hex');
    cb(null, `${name}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

function validateImageMagicBytes(req, _res, next) {
  if (!req.file) return next();

  const header = Buffer.alloc(12);
  const fd = fs.openSync(req.file.path, 'r');
  fs.readSync(fd, header, 0, 12, 0);
  fs.closeSync(fd);

  const isValid =
    matchesMagic(MAGIC_BYTES.jpeg, header) ||
    matchesMagic(MAGIC_BYTES.png, header) ||
    matchesMagic(MAGIC_BYTES.webp, header);

  if (!isValid) {
    fs.unlink(req.file.path, () => {});
    const err = new Error('Invalid image file — content does not match expected format');
    err.status = 400;
    return next(err);
  }

  next();
}

module.exports = { upload, validateImageMagicBytes };
