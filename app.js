const express = require('express');
const os = require('os');
const fs = require('fs');

const app = express();

// Get port from environment variable or default to 8080
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON
app.use(express.json());

// Function to get pod information
function getPodInfo() {
  const podInfo = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: PORT
    },
    timestamp: new Date().toISOString()
  };

  // Try to get Kubernetes pod information from environment variables
  if (process.env.POD_NAME) {
    podInfo.kubernetes = {
      podName: process.env.POD_NAME,
      podNamespace: process.env.POD_NAMESPACE,
      podIP: process.env.POD_IP,
      nodeName: process.env.NODE_NAME,
      serviceAccount: process.env.SERVICE_ACCOUNT
    };
  }

  return podInfo;
}

// Main endpoint - displays pod information
app.get('/', (req, res) => {
  const podInfo = getPodInfo();
  
  res.json({
    message: 'Welcome to Sample Node.js App for Kubernetes!',
    status: 'running',
    pod: podInfo,
    endpoints: {
      health: '/health',
      ready: '/ready',
      live: '/live',
      info: '/'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    hostname: os.hostname()
  });
});

// Readiness probe endpoint
app.get('/ready', (req, res) => {
  // Add your readiness checks here
  // For example: database connection, external service availability, etc.
  
  const isReady = true; // Replace with actual readiness logic
  
  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      hostname: os.hostname(),
      checks: {
        database: 'ok', // Example check
        externalService: 'ok' // Example check
      }
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      hostname: os.hostname(),
      checks: {
        database: 'failed',
        externalService: 'failed'
      }
    });
  }
});

// Liveness probe endpoint
app.get('/live', (req, res) => {
  // Add your liveness checks here
  // For example: memory usage, critical processes, etc.
  
  const memoryUsage = process.memoryUsage();
  const maxMemory = 1024 * 1024 * 1024; // 1GB threshold
  const isAlive = memoryUsage.heapUsed < maxMemory;
  
  if (isAlive) {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      hostname: os.hostname(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
      }
    });
  } else {
    res.status(503).json({
      status: 'not alive',
      timestamp: new Date().toISOString(),
      hostname: os.hostname(),
      reason: 'Memory usage too high'
    });
  }
});

// Additional endpoint to get detailed system information
app.get('/info', (req, res) => {
  const info = {
    ...getPodInfo(),
    system: {
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
      freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
      loadAverage: os.loadavg(),
      networkInterfaces: Object.keys(os.networkInterfaces())
    }
  };
  
  res.json(info);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    timestamp: new Date().toISOString(),
    hostname: os.hostname()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'not found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    hostname: os.hostname()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Readiness probe: http://localhost:${PORT}/ready`);
  console.log(`💓 Liveness probe: http://localhost:${PORT}/live`);
  console.log(`ℹ️  Pod info: http://localhost:${PORT}/`);
});

module.exports = app;
