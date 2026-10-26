const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/cardio
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await prisma.cardioSession.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    });

    // Calculate this week's total minutes
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday as 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    const mondayStr = monday.toISOString().split('T')[0];

    const weeklySessions = sessions.filter(s => s.date >= mondayStr);
    const weeklyMinutes = weeklySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    res.json({
      sessions,
      weeklyMinutes,
      weeklyTarget: req.user.cardioTargetMins || 120
    });
  } catch (error) {
    console.error('Cardio fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cardio sessions' });
  }
});

// POST /api/cardio
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { activity, date, durationMinutes, distanceKm, inclinePercent, speedKmh, intensity, notes } = req.body;

    if (!activity || !durationMinutes) {
      return res.status(400).json({ error: 'Activity and durationMinutes are required' });
    }

    const session = await prisma.cardioSession.create({
      data: {
        userId: req.user.id,
        activity,
        date: date || new Date().toISOString().split('T')[0],
        durationMinutes: parseInt(durationMinutes),
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        inclinePercent: inclinePercent ? parseFloat(inclinePercent) : null,
        speedKmh: speedKmh ? parseFloat(speedKmh) : null,
        intensity: intensity || 'Moderate',
        notes
      }
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Log cardio error:', error);
    res.status(500).json({ error: 'Failed to log cardio session' });
  }
});

// DELETE /api/cardio/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.cardioSession.findUnique({
      where: { id: req.params.id }
    });
    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this session' });
    }

    await prisma.cardioSession.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Cardio session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete cardio session' });
  }
});

module.exports = router;
