const Participant = require('../models/Participant');
const { generateQR } = require('../services/qr');

async function register(req, res, next) {
  try {
    const body = { ...req.body };
    if (body.paymentStatus === 'yes') {
      if (!req.file) {
        return res.status(400).json({ message: 'Payment screenshot required when payment status is Yes' });
      }
      body.paymentScreenshotUrl = `/uploads/${req.file.filename}`;
    } else {
      body.paymentScreenshotUrl = '';
    }

    const participant = new Participant(body);
    await participant.save();

    const qrPngBase64 = await generateQR(participant.qrToken);

    res.status(201).json({
      participant: sanitize(participant),
      qrPngBase64,
    });
  } catch (err) {
    next(err);
  }
}

async function getQR(req, res, next) {
  try {
    const { email } = req.query;
    const participant = await Participant.findById(req.params.id).select('qrToken email');
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    if (!email || participant.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: 'Invalid email for this participant' });
    }
    const qrPngBase64 = await generateQR(participant.qrToken);
    const base64Data = qrPngBase64.includes(',') ? qrPngBase64.split(',')[1] : qrPngBase64;
    const img = Buffer.from(base64Data, 'base64');
    res.type('image/png').send(img);
  } catch (err) {
    next(err);
  }
}

function sanitize(p) {
  return {
    id: p._id,
    name: p.name,
    email: p.email,
    paymentStatus: p.paymentStatus,
  };
}

module.exports = { register, getQR };
