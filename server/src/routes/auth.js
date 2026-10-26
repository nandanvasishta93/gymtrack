const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '90d' });

    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, age, weight, height, goal, startDate } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const dateFormatted = startDate || new Date().toISOString().split('T')[0];

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name || 'Athlete',
        age: age ? parseInt(age) : 23,
        weight: weight ? parseFloat(weight) : 62.0,
        height: height ? parseFloat(height) : 168.0,
        goal: goal || 'Build muscle and gradually reduce body fat',
        startDate: dateFormatted
      }
    });

    // Auto-generate 90-day program for new user
    const templates = await prisma.workoutTemplate.findMany();
    const templatesByName = {};
    templates.forEach(t => { templatesByName[t.name] = t; });

    const startDateObj = new Date(dateFormatted + "T00:00:00Z");
    for (let day = 1; day <= 90; day++) {
      const currentDayDate = new Date(startDateObj);
      currentDayDate.setUTCDate(startDateObj.getUTCDate() + (day - 1));
      const dateStr = currentDayDate.toISOString().split('T')[0];
      const dayOfWeekIndex = currentDayDate.getUTCDay();
      const weekNumber = Math.ceil(day / 7);
      
      let phaseName = "Phase 1: Baseline Establishment";
      if (weekNumber <= 4) phaseName = "Phase 2: Repetition & Form Refinement";
      else if (weekNumber <= 7) phaseName = "Phase 3: Progressive Load Accumulation";
      else if (weekNumber === 8) phaseName = "Phase 4: Scheduled Deload (Volume -40%)";
      else if (weekNumber <= 11) phaseName = "Phase 5: Resumed Progressive Overload";
      else if (weekNumber === 12) phaseName = "Phase 6: Strength Consolidation";
      else phaseName = "Phase 7: Assessment & Next Cycle Prep";

      let templateId = null;
      let status = "NOT_STARTED";

      if (dayOfWeekIndex === 0) {
        status = "REST_DAY";
      } else if (dayOfWeekIndex === 1) templateId = templatesByName["Push A"]?.id;
      else if (dayOfWeekIndex === 2) templateId = templatesByName["Pull A"]?.id;
      else if (dayOfWeekIndex === 3) templateId = templatesByName["Legs A"]?.id;
      else if (dayOfWeekIndex === 4) templateId = templatesByName["Push B"]?.id;
      else if (dayOfWeekIndex === 5) templateId = templatesByName["Pull B"]?.id;
      else if (dayOfWeekIndex === 6) templateId = templatesByName["Legs B"]?.id;

      await prisma.programDay.create({
        data: {
          userId: newUser.id,
          dayNumber: day,
          date: dateStr,
          weekNumber,
          phaseName,
          status,
          workoutTemplateId: templateId
        }
      });
    }

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '90d' });
    const { password: _, ...userData } = newUser;
    res.status(201).json({ token, user: userData });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  const { password: _, ...userData } = req.user;
  res.json({ user: userData });
});

module.exports = router;
