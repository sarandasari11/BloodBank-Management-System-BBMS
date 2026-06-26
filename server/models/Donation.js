const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  unitsDonated: { type: Number, required: true, min: 1 },
  donationDate: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);
