const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Log a new expense
router.post('/', async (req, res) => {
  try {
    const { description, amount, splitWith, category } = req.body;
    const newExpense = new Expense({
      userId: req.auth.userId,
      paidBy: req.auth.userId,
      description,
      amount,
      splitWith,
      category
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get expenses for the user (where they paid or are included in split)
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [
        { userId: req.auth.userId },
        { 'splitWith.userId': req.auth.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;