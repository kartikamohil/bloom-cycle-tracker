const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { computeStats } = require('../predict');

const router = express.Router();
const CIRCLE_CODE_RE = /^[A-Z0-9]{6}$/;

// POST /api/circle/follow { code }
// Lets the current user follow someone else's shared overview by code.
router.post('/follow', requireAuth, async (req, res, next) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase();

    if (!CIRCLE_CODE_RE.test(code)) {
      return res.status(400).json({ error: 'code must be a valid 6-character circle code.' });
    }

    const ownerId = await db.ownerOfCircleCode(code);

    if (!ownerId) {
      return res.status(404).json({ error: 'No account found for that code.' });
    }

    if (ownerId === req.userId) {
      return res.status(400).json({ error: "You can't follow your own code." });
    }

    const result = await db.followCircle(req.userId, code);

    if (!result.found) {
      return res.status(404).json({ error: 'No account found for that code.' });
    }

    return res.json({
      ok: true,
      added: result.added,
      followingCodes: result.followedCodes
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/circle -> everyone the current user follows, with their
// current phase / predicted next period only (never notes or symptoms).
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const codes = await db.getFollowedCodes(req.userId);

    const results = await Promise.all(
      codes.map(async code => {
        const ownerId = await db.ownerOfCircleCode(code);

        if (!ownerId) {
          return { code, name: 'Unknown', phase: null, dayInCycle: null, predictedNext: null };
        }

        const owner = await db.getUser(ownerId);

        if (!owner) {
          return { code, name: 'Unknown', phase: null, dayInCycle: null, predictedNext: null };
        }

        const raw = await db.getEntries(ownerId);
        const entries = {};

        // Deliberately exclude notes and symptoms from the shared response.
        for (const [date, entry] of Object.entries(raw)) {
          entries[date] = { flow: entry.flow };
        }

        const stats = computeStats(entries, owner);

        return {
          code,
          name: owner.name,
          phase: stats.phase,
          dayInCycle: stats.dayInCycle,
          predictedNext: stats.predictedNext
        };
      })
    );

    return res.json({ following: results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
