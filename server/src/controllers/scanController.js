const Participant = require('../models/Participant');

async function scan(req, res, next) {
  try {
    const { qrToken } = req.params;
    const participant = await Participant.findOne({ qrToken });

    if (!participant) {
      return res.status(404).json({ message: 'Invalid QR code — participant not found' });
    }

    if (participant.attendanceStatus === 'Present') {
      return res.status(409).json({
        message: 'Already checked in',
        name: participant.name,
        paymentStatus: participant.paymentStatus,
      });
    }

    participant.attendanceStatus = 'Present';
    await participant.save();

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('attendance:updated', {
        participantId: participant._id,
        name: participant.name,
        attendanceStatus: participant.attendanceStatus,
      });
    }

    res.json({
      message: 'Check-in successful',
      name: participant.name,
      paymentStatus: participant.paymentStatus,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { scan };
