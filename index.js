const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();

// Configure CORS to allow the frontend
app.use(cors({
  origin: 'https://2141c91b-e21-frontend.vercel.app',
  credentials: true
}));
app.use(express.json());

// Database Connection Pattern
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    // Use 'testdb' as requested
    const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/testdb';
    await mongoose.connect(dbUrl, {
      dbName: 'testdb'
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Middleware to connect DB before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database connection failed', details: err.message });
  }
});

// Import Routes
const tripRoutes = require('./routes/tripRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Public Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Protected Routes - Apply Clerk Auth
app.use('/api/trips', ClerkExpressRequireAuth(), tripRoutes);
app.use('/api/groups', ClerkExpressRequireAuth(), groupRoutes);
app.use('/api/expenses', ClerkExpressRequireAuth(), expenseRoutes);

// Error Handler for Authentication
app.use((err, req, res, next) => {
  if (err.message === 'Unauthenticated') {
    return res.status(401).json({ error: 'Authentication required' });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;