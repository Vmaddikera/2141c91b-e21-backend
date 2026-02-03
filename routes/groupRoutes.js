const express = require('express');
const router = express.Router();
const GroupTrip = require('../models/GroupTrip');

// Post a new group trip
router.post('/', async (req, res) => {
  try {
    const { destination, dates, capacity, description, tags, creatorName } = req.body;
    const newGroup = new GroupTrip({
      userId: req.auth.userId,
      creatorName,
      destination,
      dates,
      capacity,
      description,
      tags,
      joinedUsers: [{ userId: req.auth.userId, name: creatorName }] // Creator joins by default
    });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Join a group trip
router.post('/:id/join', async (req, res) => {
  try {
    const group = await GroupTrip.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Trip not found' });
    
    if (group.joinedUsers.length >= group.capacity) {
      return res.status(400).json({ error: 'Trip is full' });
    }

    const alreadyJoined = group.joinedUsers.find(u => u.userId === req.auth.userId);
    if (alreadyJoined) return res.status(400).json({ error: 'Already joined' });

    group.joinedUsers.push({
       userId: req.auth.userId, 
       name: req.body.userName || 'Explorer' 
    });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all group trips
router.get('/', async (req, res) => {
  try {
    const groups = await GroupTrip.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;