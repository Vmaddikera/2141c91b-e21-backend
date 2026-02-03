const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  transport: { type: String, enum: ['Flight', 'Train', 'Bus'], default: 'Flight' },
  arrivalTime: { type: String },
  duration: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);