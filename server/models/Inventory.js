const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  bloodGroup: { 
    type: String, 
    required: true, 
    unique: true, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  unitsAvailable: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
