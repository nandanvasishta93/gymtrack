const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'gym_tracker_super_secure_jwt_secret_key_90days_2026';

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Token invalid or expired, continue to fallback check below
      }
    }

    // For local single-user convenience if no token is provided, fall back to default user
    const defaultUser = await prisma.user.findFirst();
    if (defaultUser) {
      req.user = defaultUser;
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal authentication error' });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET
};
