const mongoose = require('mongoose');

const GroupTripSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Creator
  creatorName: { type: String },
  destination: { type: String, required: true },
  dates: { type: String, required: true },
  capacity: { type: Number, required: true },
  description: { type: String },
  tags: [String],
  joinedUsers: [{ 
    userId: String, 
    name: String,
    avatar: String 
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupTrip', GroupTripSchema);