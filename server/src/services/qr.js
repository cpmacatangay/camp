const QRCode = require('qrcode');

async function generateQR(token) {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
  });
}

module.exports = { generateQR };
