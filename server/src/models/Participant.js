const mongoose = require('mongoose');
const crypto = require('crypto');

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    homeAddress: { type: String, required: true, trim: true },
    birthDate: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    nickname: { type: String, required: true, trim: true },
    facebookName: { type: String, required: true, trim: true },
    existingSickness: { type: String, default: '', trim: true },
    fatherName: { type: String, required: true, trim: true },
    fatherContact: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    motherContact: { type: String, required: true, trim: true },
    paymentStatus: { type: String, enum: ['yes', 'no'], required: true },
    paymentScreenshotUrl: { type: String, default: '' },
    qrToken: { type: String, unique: true, index: true },
    attendanceStatus: {
      type: String,
      enum: ['Absent', 'Present'],
      default: 'Absent',
    },
  },
  { timestamps: true }
);

participantSchema.pre('save', function () {
  if (!this.qrToken) {
    this.qrToken = crypto.randomBytes(16).toString('hex');
  }
});

module.exports = mongoose.model('Participant', participantSchema);
