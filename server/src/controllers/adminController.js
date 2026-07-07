const Participant = require('../models/Participant');

async function list(req, res, next) {
  try {
    const { search, paymentStatus, attendanceStatus, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (attendanceStatus) filter.attendanceStatus = attendanceStatus;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [participants, total, presentCount, absentCount] = await Promise.all([
      Participant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Participant.countDocuments(filter),
      Participant.countDocuments({ attendanceStatus: 'Present' }),
      Participant.countDocuments({ attendanceStatus: 'Absent' }),
    ]);

    res.json({
      participants,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      presentCount,
      absentCount,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file && updates.paymentStatus === 'yes') {
      updates.paymentScreenshotUrl = `/uploads/${req.file.filename}`;
    }

    if (updates.paymentStatus === 'yes' && !updates.paymentScreenshotUrl && !req.file) {
      const existing = await Participant.findById(id);
      if (!existing || !existing.paymentScreenshotUrl) {
        return res.status(400).json({ message: 'Payment screenshot required when payment status is Yes' });
      }
    }

    const participant = await Participant.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    res.json(participant);
  } catch (err) {
    next(err);
  }
}

async function addByAdmin(req, res, next) {
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
    res.status(201).json(participant);
  } catch (err) {
    next(err);
  }
}

async function bulkRemove(req, res, next) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids must be a non-empty array' });
    }

    const result = await Participant.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No participants found to delete' });
    }

    res.json({ message: `Deleted ${result.deletedCount} participant${result.deletedCount === 1 ? '' : 's'}` });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function setAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { attendanceStatus } = req.body;

    if (!['Absent', 'Present'].includes(attendanceStatus)) {
      return res.status(400).json({ message: 'Attendance must be Absent or Present' });
    }

    const participant = await Participant.findByIdAndUpdate(
      id,
      { attendanceStatus },
      { new: true }
    );
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const presentCount = await Participant.countDocuments({ attendanceStatus: 'Present' });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('attendance:updated', {
        participantId: participant._id,
        name: participant.name,
        attendanceStatus: participant.attendanceStatus,
        paymentStatus: participant.paymentStatus,
        presentCount,
        scannedBy: req.user.email,
        source: 'manual',
        timestamp: new Date().toISOString(),
      });
    }

    res.json(participant);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, update, addByAdmin, remove, bulkRemove, setAttendance };
