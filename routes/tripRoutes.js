const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

// Create a new trip plan
router.post('/', async (req, res) => {
  try {
    const { from, to, transport, arrivalTime, duration } = req.body;
    const newTrip = new Trip({
      userId: req.auth.userId,
      from,
      to,
      transport,
      arrivalTime,
      duration
    });
    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user's trip plans
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.auth.userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;