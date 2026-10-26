require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const workoutRoutes = require('./routes/workouts');
const exerciseRoutes = require('./routes/exercises');
const coreRoutes = require('./routes/core');
const cardioRoutes = require('./routes/cardio');
const nutritionRoutes = require('./routes/nutrition');
const measurementRoutes = require('./routes/measurements');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/core', coreRoutes);
app.use('/api/cardio', cardioRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '90-Day Gym Workout Tracker API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Gym Tracker API server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
