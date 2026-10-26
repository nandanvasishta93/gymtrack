const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to get phase name
function getPhaseName(weekNumber) {
  if (weekNumber <= 2) return "Phase 1: Baseline Establishment";
  if (weekNumber <= 4) return "Phase 2: Repetition & Form Refinement";
  if (weekNumber <= 7) return "Phase 3: Progressive Load Accumulation";
  if (weekNumber === 8) return "Phase 4: Scheduled Deload (Volume -40%)";
  if (weekNumber <= 11) return "Phase 5: Resumed Progressive Overload";
  if (weekNumber === 12) return "Phase 6: Strength Consolidation";
  return "Phase 7: Assessment & Next Cycle Prep";
}

// GET /api/user/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { password: _, ...userData } = req.user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      name, age, weight, height, experience, goal, trainingFrequency,
      workoutDuration, diet, gymEquipment, units, theme,
      avoidDuplicateCore, dailyProteinTarget, dailyWaterTarget, cardioTargetMins
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(age !== undefined && { age: parseInt(age) }),
        ...(weight !== undefined && { weight: parseFloat(weight) }),
        ...(height !== undefined && { height: parseFloat(height) }),
        ...(experience !== undefined && { experience }),
        ...(goal !== undefined && { goal }),
        ...(trainingFrequency !== undefined && { trainingFrequency: parseInt(trainingFrequency) }),
        ...(workoutDuration !== undefined && { workoutDuration }),
        ...(diet !== undefined && { diet }),
        ...(gymEquipment !== undefined && { gymEquipment }),
        ...(units !== undefined && { units }),
        ...(theme !== undefined && { theme }),
        ...(avoidDuplicateCore !== undefined && { avoidDuplicateCore: Boolean(avoidDuplicateCore) }),
        ...(dailyProteinTarget !== undefined && { dailyProteinTarget: parseFloat(dailyProteinTarget) }),
        ...(dailyWaterTarget !== undefined && { dailyWaterTarget: parseFloat(dailyWaterTarget) }),
        ...(cardioTargetMins !== undefined && { cardioTargetMins: parseInt(cardioTargetMins) })
      }
    });

    const { password: _, ...userData } = updated;
    res.json({ message: 'Profile updated successfully', user: userData });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/user/recalculate-program
router.post('/recalculate-program', authMiddleware, async (req, res) => {
  try {
    const { startDate } = req.body;
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({ error: 'Valid startDate in YYYY-MM-DD format required' });
    }

    // Update user start date
    await prisma.user.update({
      where: { id: req.user.id },
      data: { startDate }
    });

    const templates = await prisma.workoutTemplate.findMany();
    const templatesByName = {};
    templates.forEach(t => { templatesByName[t.name] = t; });

    const startDateObj = new Date(startDate + "T00:00:00Z");

    for (let day = 1; day <= 90; day++) {
      const currentDayDate = new Date(startDateObj);
      currentDayDate.setUTCDate(startDateObj.getUTCDate() + (day - 1));
      const dateStr = currentDayDate.toISOString().split('T')[0];
      const dayOfWeekIndex = currentDayDate.getUTCDay();
      const weekNumber = Math.ceil(day / 7);
      const phaseName = getPhaseName(weekNumber);

      let templateId = null;
      let status = "NOT_STARTED";

      if (dayOfWeekIndex === 0) status = "REST_DAY";
      else if (dayOfWeekIndex === 1) templateId = templatesByName["Push A"]?.id;
      else if (dayOfWeekIndex === 2) templateId = templatesByName["Pull A"]?.id;
      else if (dayOfWeekIndex === 3) templateId = templatesByName["Legs A"]?.id;
      else if (dayOfWeekIndex === 4) templateId = templatesByName["Push B"]?.id;
      else if (dayOfWeekIndex === 5) templateId = templatesByName["Pull B"]?.id;
      else if (dayOfWeekIndex === 6) templateId = templatesByName["Legs B"]?.id;

      // Check if existing day has a completed session, don't overwrite completed status
      const existing = await prisma.programDay.findUnique({
        where: {
          userId_dayNumber: {
            userId: req.user.id,
            dayNumber: day
          }
        }
      });

      const finalStatus = (existing && existing.status === "COMPLETED") 
        ? "COMPLETED" 
        : (status === "REST_DAY" ? "REST_DAY" : "NOT_STARTED");

      await prisma.programDay.upsert({
        where: {
          userId_dayNumber: {
            userId: req.user.id,
            dayNumber: day
          }
        },
        update: {
          date: dateStr,
          weekNumber,
          phaseName,
          workoutTemplateId: templateId,
          status: finalStatus
        },
        create: {
          userId: req.user.id,
          dayNumber: day,
          date: dateStr,
          weekNumber,
          phaseName,
          status: finalStatus,
          workoutTemplateId: templateId
        }
      });
    }

    res.json({ message: 'Program schedule recalculated successfully for 90 days', startDate });
  } catch (error) {
    console.error('Recalculate error:', error);
    res.status(500).json({ error: 'Failed to recalculate program schedule' });
  }
});

// POST /api/user/reset-program (requires confirmation)
router.post('/reset-program', authMiddleware, async (req, res) => {
  try {
    const { confirm } = req.body;
    if (confirm !== true) {
      return res.status(400).json({ error: 'Confirmation required to reset program' });
    }

    const userId = req.user.id;

    // Remove user sessions & reset program days to NOT_STARTED / REST_DAY
    await prisma.workoutSession.deleteMany({ where: { userId } });
    await prisma.coreSession.deleteMany({ where: { userId } });

    const programDays = await prisma.programDay.findMany({ where: { userId } });
    for (const day of programDays) {
      const dayDate = new Date(day.date + "T00:00:00Z");
      const isSunday = dayDate.getUTCDay() === 0;
      await prisma.programDay.update({
        where: { id: day.id },
        data: {
          status: isSunday ? "REST_DAY" : "NOT_STARTED",
          notes: null
        }
      });
    }

    res.json({ message: 'Program progress has been reset successfully.' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Failed to reset program' });
  }
});

// GET /api/user/export (complete user data export)
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, programDays, sessions, coreSessions, cardio, measurements, nutrition, prs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.programDay.findMany({ where: { userId } }),
      prisma.workoutSession.findMany({
        where: { userId },
        include: { setLogs: true, exerciseCompletions: true }
      }),
      prisma.coreSession.findMany({ where: { userId }, include: { setLogs: true } }),
      prisma.cardioSession.findMany({ where: { userId } }),
      prisma.bodyMeasurement.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      prisma.nutritionEntry.findMany({ where: { userId } }),
      prisma.personalRecord.findMany({ where: { userId }, include: { exercise: true } })
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      userProfile: user,
      programDays,
      workoutSessions: sessions,
      coreSessions,
      cardioSessions: cardio,
      bodyMeasurements: measurements,
      nutritionLogs: nutrition,
      personalRecords: prs
    };

    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
