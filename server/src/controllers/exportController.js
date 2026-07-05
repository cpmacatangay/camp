const Participant = require('../models/Participant');
const { generateExcel } = require('../services/excel');

async function exportExcel(req, res, next) {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 });
    const buffer = await generateExcel(participants);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=participants-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = { exportExcel };
