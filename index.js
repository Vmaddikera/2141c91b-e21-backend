const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['https://2141c91b-e21-frontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// Database Connection Pattern for Vercel Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is missing');
    throw new Error('Database configuration missing');
  }

  try {
    // Always use 'testdb' as the database name
    await mongoose.connect(dbUrl, {
      dbName: 'testdb',
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB (testdb)');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
};

// Middleware to ensure DB connectivity
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({
      error: 'Database connection failed',
      details: err.message
    });
  }
});

// Import Routes
const tripRoutes = require('./routes/tripRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Public Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Protected Routes with Clerk Auth
const authMiddleware = ClerkExpressRequireAuth();

app.use('/api/trips', authMiddleware, tripRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);

// Global Error Handling
app.use((err, req, res, next) => {
  if (err.message === 'Unauthenticated') {
    return res.status(401).json({ error: 'Unauthenticated', message: 'Sign in to access this feature' });
  }
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
});

module.exports = app;