const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();

// Configure CORS - explicitly allow the frontend origin and common headers
app.use(cors({
  origin: ['https://2141c91b-e21-frontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Database Connection Pattern for Vercel Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is missing in environment variables');
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

// Middleware to ensure DB connectivity and log basic request info
app.use(async (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Protected Routes with Clerk Auth
// Note: Ensure CLERK_SECRET_KEY is set in Vercel environment variables
app.use('/api/trips', ClerkExpressRequireAuth(), tripRoutes);
app.use('/api/groups', ClerkExpressRequireAuth(), groupRoutes);
app.use('/api/expenses', ClerkExpressRequireAuth(), expenseRoutes);

// Global Error Handling (Catching 401/403 from Clerk or 500s)
app.use((err, req, res, next) => {
  if (err.message === 'Unauthenticated') {
    console.warn('Authentication attempt failed: Missing or invalid token');
    return res.status(401).json({ error: 'Unauthenticated', message: 'Sign in to access this feature' });
  }
  
  if (err.status === 403 || err.message === 'Forbidden') {
    console.warn('Forbidden access attempt to:', req.path);
    return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to perform this action' });
  }

  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on our end'
  });
});

// Export for Vercel Serverless
module.exports = app;