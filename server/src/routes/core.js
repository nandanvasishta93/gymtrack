const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

function getRotatingCore(dayOfWeek) {
  switch (dayOfWeek) {
    case 1: // Monday
    case 4: // Thursday
      return "Core A";
    case 2: // Tuesday
    case 5: // Friday
      return "Core B";
    case 3: // Wednesday
    case 6: // Saturday
      return "Core C";
    default:
      return "Recovery";
  }
}

// GET /api/core/today
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const routineName = getRotatingCore(dayOfWeek);
    const dateStr = today.toISOString().split('T')[0];

    // Find template
    let template = null;
    if (routineName !== "Recovery") {
      template = await prisma.workoutTemplate.findUnique({
        where: { name: routineName },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
    }

    // Check if user already logged core today
    const session = await prisma.coreSession.findFirst({
      where: {
        userId: req.user.id,
        date: dateStr
      },
      include: { setLogs: true }
    });

    res.json({
      routineName,
      date: dateStr,
      isRecovery: routineName === "Recovery",
      template,
      session
    });
  } catch (error) {
    console.error('Core today error:', error);
    res.status(500).json({ error: 'Failed to fetch core routine' });
  }
});

// GET /api/core/templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.workoutTemplate.findMany({
      where: { type: 'CORE' },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch core templates' });
  }
});

// POST /api/core/log
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { routineName, date, plankSeconds, totalReps, notes, sets } = req.body;
    const dateStr = date || new Date().toISOString().split('T')[0];

    // Create or update CoreSession
    const existing = await prisma.coreSession.findFirst({
      where: {
        userId: req.user.id,
        date: dateStr
      }
    });

    let session;
    if (existing) {
      session = await prisma.coreSession.update({
        where: { id: existing.id },
        data: {
          completed: true,
          completedAt: new Date(),
          plankSeconds: plankSeconds ? parseInt(plankSeconds) : existing.plankSeconds,
          totalReps: totalReps ? parseInt(totalReps) : existing.totalReps,
          notes: notes || existing.notes
        }
      });
    } else {
      session = await prisma.coreSession.create({
        data: {
          userId: req.user.id,
          routineName: routineName || 'Core A',
          date: dateStr,
          completed: true,
          startedAt: new Date(),
          completedAt: new Date(),
          plankSeconds: plankSeconds ? parseInt(plankSeconds) : 0,
          totalReps: totalReps ? parseInt(totalReps) : 0,
          notes
        }
      });
    }

    // If sets array provided, record set logs
    if (Array.isArray(sets)) {
      for (const set of sets) {
        await prisma.coreSetLog.create({
          data: {
            coreSessionId: session.id,
            exerciseName: set.exerciseName,
            setNumber: set.setNumber || 1,
            targetReps: set.targetReps || "12-15",
            actualReps: parseInt(set.actualReps) || 0,
            durationSecs: parseInt(set.durationSecs) || 0,
            completed: Boolean(set.completed)
          }
        });
      }
    }

    res.json({ message: 'Core session recorded successfully', session });
  } catch (error) {
    console.error('Core log error:', error);
    res.status(500).json({ error: 'Failed to log core workout' });
  }
});

// GET /api/core/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await prisma.coreSession.findMany({
      where: {
        userId: req.user.id,
        completed: true
      },
      include: { setLogs: true },
      orderBy: { date: 'desc' }
    });

    // Compute stats
    let totalPlankSeconds = 0;
    let totalReps = 0;
    for (const h of history) {
      totalPlankSeconds += (h.plankSeconds || 0);
      totalReps += (h.totalReps || 0);
    }

    res.json({
      sessionsCompleted: history.length,
      totalPlankMinutes: Math.round(totalPlankSeconds / 60),
      totalReps,
      history
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch core history' });
  }
});

module.exports = router;
