const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/progress/summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Program completion metrics
    const allProgramDays = await prisma.programDay.findMany({
      where: { userId },
      orderBy: { dayNumber: 'asc' }
    });

    const totalDays = 90;
    const completedWorkouts = allProgramDays.filter(d => d.status === "COMPLETED").length;
    const restDays = allProgramDays.filter(d => d.status === "REST_DAY").length;
    const scheduledWorkouts = totalDays - restDays;
    const completionPercentage = scheduledWorkouts > 0 ? Math.round((completedWorkouts / scheduledWorkouts) * 100) : 0;

    // Calculate current workout streak
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const pastOrTodayDays = allProgramDays.filter(d => d.date <= todayStr).sort((a, b) => b.dayNumber - a.dayNumber);

    for (const day of pastOrTodayDays) {
      if (day.status === "COMPLETED" || day.status === "REST_DAY") {
        streak++;
      } else {
        break;
      }
    }

    // 2. Total training time and volume
    const completedSessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        status: "COMPLETED"
      },
      include: {
        setLogs: {
          include: { exercise: true }
        }
      }
    });

    let totalDurationSeconds = 0;
    let totalVolumeKg = 0;
    const volumeByMuscle = {};

    for (const sess of completedSessions) {
      totalDurationSeconds += (sess.durationSeconds || 0);
      totalVolumeKg += (sess.totalVolumeKg || 0);

      for (const set of sess.setLogs) {
        if (set.completed && set.exercise) {
          const muscle = set.exercise.primaryMuscle || "Other";
          const setVolume = (set.actualWeightKg || 0) * (set.actualReps || 0);
          volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + setVolume;
        }
      }
    }

    const volumeChartData = Object.keys(volumeByMuscle).map(muscle => ({
      muscle,
      volume: Math.round(volumeByMuscle[muscle])
    }));

    // 3. Weekly consistency (Last 6 weeks)
    const weeklyConsistency = [];
    for (let w = 1; w <= 13; w++) {
      const weekDays = allProgramDays.filter(d => d.weekNumber === w);
      const weekCompleted = weekDays.filter(d => d.status === "COMPLETED").length;
      const weekScheduled = weekDays.filter(d => d.status !== "REST_DAY").length;
      if (weekDays.some(d => d.date <= todayStr) || w <= 4) {
        weeklyConsistency.push({
          week: `Wk ${w}`,
          completed: weekCompleted,
          scheduled: weekScheduled,
          percent: weekScheduled > 0 ? Math.round((weekCompleted / weekScheduled) * 100) : 0
        });
      }
    }

    // 4. Personal records
    const prs = await prisma.personalRecord.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { achievedAt: 'desc' },
      take: 10
    });

    // 5. Weight Trend
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    const weightTrend = measurements.map(m => ({
      date: m.date.slice(5), // MM-DD
      weight: m.weightKg,
      waist: m.waistCm
    }));

    // 6. Abs/Core sessions count
    const coreSessionsCount = await prisma.coreSession.count({
      where: { userId, completed: true }
    });

    // 7. Cardio minutes total
    const cardioSessions = await prisma.cardioSession.findMany({
      where: { userId }
    });
    const totalCardioMinutes = cardioSessions.reduce((acc, c) => acc + c.durationMinutes, 0);

    res.json({
      completionPercentage,
      completedWorkouts,
      scheduledWorkouts,
      totalDays: 90,
      streak,
      totalTrainingMinutes: Math.round(totalDurationSeconds / 60),
      totalVolumeKg: Math.round(totalVolumeKg),
      coreSessionsCompleted: coreSessionsCount,
      totalCardioMinutes,
      currentWeight: req.user.weight,
      volumeByMuscle: volumeChartData,
      weeklyConsistency,
      recentPrs: prs,
      weightTrend
    });
  } catch (error) {
    console.error('Progress summary error:', error);
    res.status(500).json({ error: 'Failed to fetch progress summary' });
  }
});

module.exports = router;
