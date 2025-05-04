const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

// Environment info endpoint
router.get('/env', (req, res) => {
  res.json({
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    platform: process.platform,
    arch: process.arch,
  });
});

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const status = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    res.json({
      status: states[status],
      database: mongoose.connection.name,
      host: mongoose.connection.host,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection error',
      details: error.message,
    });
  }
});

// Test TON network connection
router.get('/ton-test', async (req, res) => {
  try {
    const { TonClient } = require('@ton/ton');
    const client = new TonClient({
      endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });
    
    const info = await client.getLastBlock();
    res.json({
      status: 'connected',
      blockNumber: info.last.seqno,
      timestamp: new Date(info.last.genUtime * 1000),
    });
  } catch (error) {
    res.status(500).json({
      error: 'TON network connection error',
      details: error.message,
    });
  }
});

// Test rate limiting
router.get('/rate-test', (req, res) => {
  res.json({
    message: 'Rate limit test endpoint',
    timestamp: new Date(),
    requestsRemaining: req.rateLimit?.remaining,
    resetTime: new Date(req.rateLimit?.resetTime),
  });
});

// Error test endpoint
router.get('/error-test', (req, res) => {
  const errorTypes = ['validation', 'auth', 'server'];
  const type = req.query.type || 'server';
  
  switch (type) {
    case 'validation':
      res.status(400).json({
        error: 'Validation Error',
        message: 'Test validation error response',
      });
      break;
    case 'auth':
      res.status(401).json({
        error: 'Authentication Error',
        message: 'Test authentication error response',
      });
      break;
    default:
      res.status(500).json({
        error: 'Server Error',
        message: 'Test server error response',
      });
  }
});

module.exports = router;
