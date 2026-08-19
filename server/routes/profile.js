const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();

router.patch('/', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['name', 'avgCycleLength', 'avgPeriodLength', 'lastPeriodStart'];
    const patch = {};

    for (const key of allowed) {
      if (req.body?.[key] !== undefined) patch[key] = req.body[key];
    }

    if (patch.name !== undefined && !String(patch.name).trim()) {
      return res.status(400).json({ error: 'name cannot be empty.' });
    }

    if (patch.avgCycleLength !== undefined) {
      const value = Number(patch.avgCycleLength);
      if (!Number.isInteger(value) || value < 18 || value > 60) {
        return res.status(400).json({ error: 'avgCycleLength must be an integer between 18 and 60.' });
      }
      patch.avgCycleLength = value;
    }

    if (patch.avgPeriodLength !== undefined) {
      const value = Number(patch.avgPeriodLength);
      if (!Number.isInteger(value) || value < 1 || value > 14) {
        return res.status(400).json({ error: 'avgPeriodLength must be an integer between 1 and 14.' });
      }
      patch.avgPeriodLength = value;
    }

    if (patch.lastPeriodStart !== undefined && patch.lastPeriodStart !== null) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(patch.lastPeriodStart))) {
        return res.status(400).json({ error: 'lastPeriodStart must be YYYY-MM-DD or null.' });
      }
    }

    const updated = await db.updateUser(req.userId, patch);
    if (!updated) return res.status(404).json({ error: 'User not found.' });

    const { passwordHash, ...safe } = updated;
    res.json({ user: safe });
  } catch (error) {
    next(error);
  }
});

// Companions are people the user wants to keep a personal note of (e.g. a
// partner or child) who don't necessarily have their own bloom account.
// For account-to-account sharing, see routes/circle.js.
router.get('/companions', requireAuth, async (req, res, next) => {
  try {
    const user = await db.getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ companions: Array.isArray(user.companions) ? user.companions : [] });
  } catch (error) {
    next(error);
  }
});

router.post('/companions', requireAuth, async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const relation = String(req.body?.relation || 'Companion').trim() || 'Companion';

    if (!name) return res.status(400).json({ error: 'name is required.' });
    if (name.length > 100) return res.status(400).json({ error: 'name is too long.' });
    if (relation.length > 100) return res.status(400).json({ error: 'relation is too long.' });

    const user = await db.getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const companions = [
      ...(Array.isArray(user.companions) ? user.companions : []),
      { name, relation }
    ];

    await db.updateUser(req.userId, { companions });
    res.status(201).json({ companions });
  } catch (error) {
    next(error);
  }
});

router.delete('/companions/:index', requireAuth, async (req, res, next) => {
  try {
    const idx = Number(req.params.index);
    if (!Number.isInteger(idx) || idx < 0) {
      return res.status(400).json({ error: 'index must be a non-negative integer.' });
    }

    const user = await db.getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const companions = [...(Array.isArray(user.companions) ? user.companions : [])];
    if (idx >= companions.length) return res.status(404).json({ error: 'Companion not found.' });

    companions.splice(idx, 1);
    await db.updateUser(req.userId, { companions });
    res.json({ companions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
