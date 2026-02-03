const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  splitWith: [{ 
    userId: String, 
    amount: Number 
  }],
  paidBy: { type: String, required: true }, // Clerk User ID
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);