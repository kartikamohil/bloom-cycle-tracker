const express = require('express');
const rateLimit = require('express-rate-limit');
const { askBloomAI } = require('../services/aiAssistant');

console.log('ASSISTANT ROUTER LOADED');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'Too many AI requests. Please try again in a minute.'
  }
});

router.get('/test', (req, res) => {
  res.json({
    ok: true,
    message: 'Assistant route is connected!'
  });
});

router.post('/message', aiLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required.'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'Message is too long.'
      });
    }

    const reply = await askBloomAI(message);

    res.json({
      reply
    });

  } catch (error) {
    console.error('Bloom AI error:', error);

    res.status(500).json({
      error: 'Bloom AI could not process your request.'
    });
  }
});

module.exports = router;
