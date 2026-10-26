const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/measurements
router.get('/', authMiddleware, async (req, res) => {
  try {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'asc' }
    });

    const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null;

    res.json({
      measurements,
      latest,
      units: req.user.units || 'kg/cm'
    });
  } catch (error) {
    console.error('Fetch measurements error:', error);
    res.status(500).json({ error: 'Failed to fetch measurements' });
  }
});

// POST /api/measurements
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { weightKg, waistCm, chestCm, armCm, thighCm, hipCm, bodyFatPercent, notes, photoUrl, date } = req.body;

    if (!weightKg) {
      return res.status(400).json({ error: 'weightKg is required' });
    }

    const dateStr = date || new Date().toISOString().split('T')[0];

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        userId: req.user.id,
        date: dateStr,
        weightKg: parseFloat(weightKg),
        waistCm: waistCm ? parseFloat(waistCm) : null,
        chestCm: chestCm ? parseFloat(chestCm) : null,
        armCm: armCm ? parseFloat(armCm) : null,
        thighCm: thighCm ? parseFloat(thighCm) : null,
        hipCm: hipCm ? parseFloat(hipCm) : null,
        bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
        notes,
        photoUrl
      }
    });

    // Also update current weight on user profile
    await prisma.user.update({
      where: { id: req.user.id },
      data: { weight: parseFloat(weightKg) }
    });

    res.status(201).json(measurement);
  } catch (error) {
    console.error('Record measurement error:', error);
    res.status(500).json({ error: 'Failed to record measurement' });
  }
});

module.exports = router;
