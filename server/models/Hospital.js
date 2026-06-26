const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', HospitalSchema);
