const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/exercises (with query filters)
router.get('/', async (req, res) => {
  try {
    const { search, category, muscle, equipment, difficulty } = req.query;

    const where = {};
    if (search) {
      where.name = { contains: search };
    }
    if (category && category !== 'All') {
      where.category = category;
    }
    if (muscle && muscle !== 'All') {
      where.primaryMuscle = muscle;
    }
    if (equipment && equipment !== 'All') {
      where.equipment = { contains: equipment };
    }
    if (difficulty && difficulty !== 'All') {
      where.difficulty = difficulty;
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json(exercises);
  } catch (error) {
    console.error('Fetch exercises error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// GET /api/exercises/:id
router.get('/:id', async (req, res) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id }
    });
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercise details' });
  }
});

// GET /api/exercises/:id/history (user's past weights and reps progression for this exercise)
router.get('/:id/history', authMiddleware, async (req, res) => {
  try {
    const history = await prisma.setLog.findMany({
      where: {
        exerciseId: req.params.id,
        completed: true,
        session: { userId: req.user.id }
      },
      include: {
        session: { select: { startedAt: true, completedAt: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercise history' });
  }
});

module.exports = router;
