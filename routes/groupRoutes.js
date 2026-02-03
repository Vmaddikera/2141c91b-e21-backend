const express = require('express');
const router = express.Router();
const GroupTrip = require('../models/GroupTrip');

// Post a new group trip
router.post('/', async (req, res) => {
  try {
    const { destination, dates, capacity, description, tags, creatorName } = req.body;
    
    const newGroup = new GroupTrip({
      userId: req.auth.userId,
      creatorName: creatorName || 'Anonymous Traveler',
      destination,
      dates,
      capacity: Number(capacity) || 1,
      description,
      tags: Array.isArray(tags) ? tags : [],
      joinedUsers: [{ 
        userId: req.auth.userId, 
        name: creatorName || 'Creator' 
      }]
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error('Error creating group trip:', err);
    res.status(400).json({ error: 'Failed to create group trip', details: err.message });
  }
});

// Join a group trip
router.post('/:id/join', async (req, res) => {
  try {
    const group = await GroupTrip.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group trip not found' });
    
    if (group.joinedUsers.length >= group.capacity) {
      return res.status(400).json({ error: 'This group is already at full capacity' });
    }

    const alreadyJoined = group.joinedUsers.some(u => u.userId === req.auth.userId);
    if (alreadyJoined) return res.status(400).json({ error: 'You have already joined this trip' });

    group.joinedUsers.push({
       userId: req.auth.userId, 
       name: req.body.userName || 'New Member'
    });
    
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: 'Failed to join group', details: err.message });
  }
});

// Get all available group trips
router.get('/', async (req, res) => {
  try {
    const groups = await GroupTrip.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch group trips', details: err.message });
  }
});

module.exports = router;