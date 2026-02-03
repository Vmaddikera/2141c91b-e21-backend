const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Load environment variables if needed (Vercel provides these automatically)
const app = express();

// 1. Permissive CORS for the specific frontend
// This is crucial to fix the 403/Permission issues when the frontend calls the backend
app.use(cors({
  origin: ['https://2141c91b-e21-frontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// 2. Database Connection (testdb)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('CRITICAL: DATABASE_URL is missing');
    throw new Error('Database URL not configured');
  }

  try {
    await mongoose.connect(dbUrl, {
      dbName: 'testdb',
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB: testdb');
  } catch (err) {
    console.error('MongoDB Error:', err.message);
    throw err;
  }
};

// 3. Middleware to ensure DB and log path
app.use(async (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database connection failed', details: err.message });
  }
});

// 4. Routes
const tripRoutes = require('./routes/tripRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Public Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    clerkKeySet: !!process.env.CLERK_SECRET_KEY,
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 5. Auth Protection Middleware
// Ensure CLERK_SECRET_KEY is added to Vercel env vars
// If Clerk is missing the key, it often returns a 403 or 401
const authMiddleware = ClerkExpressRequireAuth({
  // Optional: Explicitly pass secret key if not automatically detected
  secretKey: process.env.CLERK_SECRET_KEY
});

app.use('/api/trips', authMiddleware, tripRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);

// 6. Global Error Handler
app.use((err, req, res, next) => {
  if (err.message === 'Unauthenticated') {
    console.warn('Unauthorized access attempt to:', req.path);
    return res.status(401).json({ error: 'Unauthenticated', message: 'You must be logged in to access this.' });
  }
  
  console.error('Internal Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
    path: req.path
  });
});

module.exports = app;