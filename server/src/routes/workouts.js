const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to determine day number from start date
function getDayNumberFromStartDate(startDateStr) {
  const start = new Date(startDateStr + "T00:00:00Z");
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const diffTime = todayUtc.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(90, diffDays));
}

// Helper to get rotating core routine for day of week
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

// GET /api/workouts/today
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const dayNumber = getDayNumberFromStartDate(user.startDate);

    // Fetch ProgramDay
    let programDay = await prisma.programDay.findUnique({
      where: {
        userId_dayNumber: {
          userId: user.id,
          dayNumber
        }
      },
      include: {
        workoutTemplate: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        session: {
          include: {
            setLogs: true,
            exerciseCompletions: true
          }
        }
      }
    });

    if (!programDay) {
      // Fallback: fetch day 1
      programDay = await prisma.programDay.findFirst({
        where: { userId: user.id },
        include: {
          workoutTemplate: {
            include: {
              exercises: {
                include: { exercise: true },
                orderBy: { orderIndex: 'asc' }
              }
            }
          },
          session: {
            include: {
              setLogs: true,
              exerciseCompletions: true
            }
          }
        }
      });
    }

    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    const coreRoutineName = getRotatingCore(dayOfWeek);

    // Fetch Core Routine template
    let coreTemplate = null;
    if (coreRoutineName !== "Recovery") {
      coreTemplate = await prisma.workoutTemplate.findUnique({
        where: { name: coreRoutineName },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { orderIndex: 'asc' }
          }
        }
      });
    }

    // Check if user has logged core today
    const todayDateStr = todayDate.toISOString().split('T')[0];
    const coreSession = await prisma.coreSession.findFirst({
      where: {
        userId: user.id,
        date: todayDateStr
      },
      include: { setLogs: true }
    });

    res.json({
      dayNumber,
      todayDate: todayDateStr,
      programDay,
      coreRoutineName,
      coreTemplate,
      coreSession,
      isRestDay: programDay?.status === "REST_DAY" || dayOfWeek === 0
    });
  } catch (error) {
    console.error('Get today workout error:', error);
    res.status(500).json({ error: 'Failed to fetch today workout' });
  }
});

// GET /api/workouts/day/:dayNumber
router.get('/day/:dayNumber', authMiddleware, async (req, res) => {
  try {
    const dayNumber = parseInt(req.params.dayNumber);
    const programDay = await prisma.programDay.findUnique({
      where: {
        userId_dayNumber: {
          userId: req.user.id,
          dayNumber
        }
      },
      include: {
        workoutTemplate: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        session: {
          include: {
            setLogs: true,
            exerciseCompletions: true
          }
        }
      }
    });

    if (!programDay) {
      return res.status(404).json({ error: 'Program day not found' });
    }

    res.json(programDay);
  } catch (error) {
    console.error('Get day error:', error);
    res.status(500).json({ error: 'Failed to fetch day details' });
  }
});

// GET /api/workouts/calendar (All 90 days)
router.get('/calendar', authMiddleware, async (req, res) => {
  try {
    const programDays = await prisma.programDay.findMany({
      where: { userId: req.user.id },
      include: {
        workoutTemplate: {
          select: { id: true, name: true, type: true, description: true }
        },
        session: {
          select: { id: true, status: true, durationSeconds: true, totalVolumeKg: true, totalReps: true }
        }
      },
      orderBy: { dayNumber: 'asc' }
    });

    const currentDayNumber = getDayNumberFromStartDate(req.user.startDate);
    const todayStr = new Date().toISOString().split('T')[0];

    // Mark past days without completion as MISSED (if scheduled strength day)
    const formattedDays = programDays.map(d => {
      let displayStatus = d.status;
      if (d.status === "NOT_STARTED" && d.date < todayStr && d.status !== "REST_DAY") {
        displayStatus = "MISSED";
      }
      return {
        ...d,
        displayStatus,
        isToday: d.dayNumber === currentDayNumber
      };
    });

    res.json({
      currentDayNumber,
      totalDays: 90,
      days: formattedDays
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// POST /api/workouts/session/start
router.post('/session/start', authMiddleware, async (req, res) => {
  try {
    const { programDayId } = req.body;
    if (!programDayId) {
      return res.status(400).json({ error: 'programDayId is required' });
    }

    const programDay = await prisma.programDay.findUnique({
      where: { id: programDayId },
      include: { workoutTemplate: true }
    });

    if (!programDay || programDay.userId !== req.user.id) {
      return res.status(404).json({ error: 'Program day not found' });
    }

    // Check if session exists or create one
    let session = await prisma.workoutSession.findUnique({
      where: { programDayId },
      include: {
        setLogs: true,
        exerciseCompletions: true
      }
    });

    if (!session) {
      try {
        session = await prisma.workoutSession.create({
          data: {
            userId: req.user.id,
            programDayId,
            templateId: programDay.workoutTemplateId,
            status: 'IN_PROGRESS'
          },
          include: {
            setLogs: true,
            exerciseCompletions: true
          }
        });

        // Update programDay status
        await prisma.programDay.update({
          where: { id: programDayId },
          data: { status: 'IN_PROGRESS' }
        });
      } catch (e) {
        // In case of race condition, fetch existing session
        session = await prisma.workoutSession.findUnique({
          where: { programDayId },
          include: {
            setLogs: true,
            exerciseCompletions: true
          }
        });
      }
    }

    res.json(session);
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start workout session' });
  }
});

// POST /api/workouts/session/set
router.post('/session/set', authMiddleware, async (req, res) => {
  try {
    const { sessionId, exerciseId, setNumber, targetWeightKg, actualWeightKg, targetReps, actualReps, rir, completed, notes } = req.body;

    if (!sessionId || !exerciseId || setNumber === undefined) {
      return res.status(400).json({ error: 'sessionId, exerciseId and setNumber are required' });
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this session' });
    }

    // Check PR candidate
    let isPr = false;
    const weight = parseFloat(actualWeightKg) || 0;
    const reps = parseInt(actualReps) || 0;

    if (completed && weight > 0 && reps > 0) {
      const estimated1Rm = weight * (1 + reps / 30);
      const existingPr = await prisma.personalRecord.findFirst({
        where: {
          userId: req.user.id,
          exerciseId
        },
        orderBy: { estimated1Rm: 'desc' }
      });

      if (!existingPr || estimated1Rm > existingPr.estimated1Rm) {
        isPr = true;
        await prisma.personalRecord.create({
          data: {
            userId: req.user.id,
            exerciseId,
            weightKg: weight,
            reps,
            estimated1Rm
          }
        });
      }
    }

    // Find existing set or create
    const existingSet = await prisma.setLog.findFirst({
      where: {
        sessionId,
        exerciseId,
        setNumber: parseInt(setNumber)
      }
    });

    let setLog;
    if (existingSet) {
      setLog = await prisma.setLog.update({
        where: { id: existingSet.id },
        data: {
          ...(targetWeightKg !== undefined && { targetWeightKg: parseFloat(targetWeightKg) }),
          ...(actualWeightKg !== undefined && { actualWeightKg: parseFloat(actualWeightKg) }),
          ...(targetReps !== undefined && { targetReps: parseInt(targetReps) }),
          ...(actualReps !== undefined && { actualReps: parseInt(actualReps) }),
          ...(rir !== undefined && { rir: parseInt(rir) }),
          ...(completed !== undefined && { completed: Boolean(completed) }),
          ...(notes !== undefined && { notes }),
          isPr
        }
      });
    } else {
      setLog = await prisma.setLog.create({
        data: {
          sessionId,
          exerciseId,
          setNumber: parseInt(setNumber),
          targetWeightKg: parseFloat(targetWeightKg) || 0,
          actualWeightKg: parseFloat(actualWeightKg) || 0,
          targetReps: parseInt(targetReps) || 10,
          actualReps: parseInt(actualReps) || 0,
          rir: rir !== undefined ? parseInt(rir) : 2,
          completed: Boolean(completed),
          notes,
          isPr
        }
      });
    }

    res.json(setLog);
  } catch (error) {
    console.error('Log set error:', error);
    res.status(500).json({ error: 'Failed to record set' });
  }
});

// POST /api/workouts/session/exercise-complete
router.post('/session/exercise-complete', authMiddleware, async (req, res) => {
  try {
    const { sessionId, exerciseId, completed } = req.body;
    if (!sessionId || !exerciseId) {
      return res.status(400).json({ error: 'sessionId and exerciseId required' });
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify session' });
    }

    const existing = await prisma.exerciseCompletion.findFirst({
      where: { sessionId, exerciseId }
    });

    let completion;
    const isCompleted = completed !== undefined ? Boolean(completed) : true;

    if (existing) {
      completion = await prisma.exerciseCompletion.update({
        where: { id: existing.id },
        data: {
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null
        }
      });
    } else {
      completion = await prisma.exerciseCompletion.create({
        data: {
          sessionId,
          exerciseId,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null
        }
      });
    }

    res.json(completion);
  } catch (error) {
    console.error('Exercise complete error:', error);
    res.status(500).json({ error: 'Failed to toggle exercise completion' });
  }
});

// POST /api/workouts/session/finish
router.post('/session/finish', authMiddleware, async (req, res) => {
  try {
    const { sessionId, durationSeconds, notes } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        setLogs: true,
        exerciseCompletions: true,
        programDay: true
      }
    });

    if (!session || session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to finish session' });
    }

    // Calculate total volume and total reps from completed sets
    let totalVolume = 0;
    let totalReps = 0;
    for (const set of session.setLogs) {
      if (set.completed) {
        totalVolume += (set.actualWeightKg * set.actualReps);
        totalReps += set.actualReps;
      }
    }

    const completedExercises = session.exerciseCompletions.filter(e => e.completed).length;

    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : session.durationSeconds,
        totalVolumeKg: totalVolume,
        totalReps: totalReps,
        notes: notes || session.notes
      },
      include: {
        setLogs: { include: { exercise: true } },
        exerciseCompletions: true
      }
    });

    // Update ProgramDay status
    await prisma.programDay.update({
      where: { id: session.programDayId },
      data: { status: 'COMPLETED' }
    });

    res.json({
      message: 'Workout completed successfully!',
      summary: {
        session: updatedSession,
        totalVolumeKg: totalVolume,
        totalReps,
        completedExercises,
        durationMinutes: Math.round(updatedSession.durationSeconds / 60)
      }
    });
  } catch (error) {
    console.error('Finish workout error:', error);
    res.status(500).json({ error: 'Failed to finish workout' });
  }
});

// POST /api/workouts/substitute
router.post('/substitute', authMiddleware, async (req, res) => {
  try {
    const { templateExerciseId, newExerciseId } = req.body;
    if (!templateExerciseId || !newExerciseId) {
      return res.status(400).json({ error: 'templateExerciseId and newExerciseId are required' });
    }

    const updated = await prisma.workoutTemplateExercise.update({
      where: { id: templateExerciseId },
      data: { exerciseId: newExerciseId },
      include: { exercise: true }
    });

    res.json({ message: 'Exercise substituted successfully', updated });
  } catch (error) {
    console.error('Substitute error:', error);
    res.status(500).json({ error: 'Failed to substitute exercise' });
  }
});

// GET /api/workouts/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await prisma.workoutSession.findMany({
      where: {
        userId: req.user.id,
        status: 'COMPLETED'
      },
      include: {
        programDay: true,
        template: true,
        setLogs: { include: { exercise: true } }
      },
      orderBy: { completedAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch workout history' });
  }
});

// GET /api/workouts/templates
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    const templates = await prisma.workoutTemplate.findMany({
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    console.error('Fetch templates error:', error);
    res.status(500).json({ error: 'Failed to fetch workout templates' });
  }
});

// POST /api/workouts/add-exercise (Add exercise to a template or day)
router.post('/add-exercise', authMiddleware, async (req, res) => {
  try {
    let { templateId, dayNumber, exerciseId, targetSets, targetReps, restSeconds, targetRir, notes } = req.body;

    if (!exerciseId) {
      return res.status(400).json({ error: 'exerciseId is required' });
    }

    // If dayNumber is provided, find that program day's template
    if (!templateId && dayNumber) {
      const day = await prisma.programDay.findUnique({
        where: {
          userId_dayNumber: {
            userId: req.user.id,
            dayNumber: parseInt(dayNumber)
          }
        }
      });
      if (day && day.workoutTemplateId) {
        templateId = day.workoutTemplateId;
      }
    }

    if (!templateId) {
      return res.status(400).json({ error: 'Valid templateId or dayNumber with a scheduled workout is required' });
    }

    // Verify template exists
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: templateId }
    });
    if (!template) {
      return res.status(404).json({ error: 'Workout template not found' });
    }

    // Check if exercise already in template
    const existing = await prisma.workoutTemplateExercise.findFirst({
      where: { templateId, exerciseId }
    });
    if (existing) {
      return res.status(400).json({ error: `This exercise is already part of ${template.name}` });
    }

    // Find next order index
    const maxOrder = await prisma.workoutTemplateExercise.aggregate({
      where: { templateId },
      _max: { orderIndex: true }
    });
    const nextOrder = (maxOrder._max.orderIndex || 0) + 1;

    const newItem = await prisma.workoutTemplateExercise.create({
      data: {
        templateId,
        exerciseId,
        orderIndex: nextOrder,
        targetSets: targetSets ? parseInt(targetSets) : 3,
        targetReps: targetReps ? targetReps.toString() : "8-12",
        restSeconds: restSeconds ? parseInt(restSeconds) : 90,
        targetRir: targetRir !== undefined ? parseInt(targetRir) : 2,
        notes: notes || null
      },
      include: {
        exercise: true,
        template: true
      }
    });

    res.status(201).json({
      message: `Successfully added ${newItem.exercise.name} to ${template.name}`,
      item: newItem
    });
  } catch (error) {
    console.error('Add exercise to plan error:', error);
    res.status(500).json({ error: 'Failed to add exercise to workout plan' });
  }
});

module.exports = router;
