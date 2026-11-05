const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

let isShuttingDown = false;

async function startServer() {
  try {
    await connectDB(env.MONGODB_URI);
    const server = app.listen(env.PORT, () => {
      console.log(`Appointment Prep API listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`Liveness probe:  http://localhost:${env.PORT}/health`);
      console.log(`Readiness probe: http://localhost:${env.PORT}/ready`);
    });

    const createGracefulShutdown = (signal) => {
      return () => {
        if (isShuttingDown) {
          console.log(`Shutdown already in progress. Ignoring duplicate ${signal} signal.`);
          return;
        }
        isShuttingDown = true;
        console.log(`Received ${signal}. Starting idempotent graceful shutdown...`);

        // Bounded shutdown timer: 5 seconds max
        const forceExitTimeout = setTimeout(() => {
          console.error('Graceful shutdown timed out after 5s. Forcing exit.');
          process.exit(1);
        }, 5000);
        forceExitTimeout.unref();

        // 1. Stop accepting new HTTP connections
        server.close(async (err) => {
          if (err) {
            console.error('Error during HTTP server close:', err);
            process.exit(1);
          }
          console.log('HTTP server successfully closed. Drained connections.');

          try {
            // 2. Disconnect Mongoose cleanly
            await disconnectDB();
            console.log('Database disconnected successfully.');
            clearTimeout(forceExitTimeout);
            process.exit(0);
          } catch (dbErr) {
            console.error('Error disconnecting database during shutdown:', dbErr);
            process.exit(1);
          }
        });
      };
    };

    process.on('SIGTERM', createGracefulShutdown('SIGTERM'));
    process.on('SIGINT', createGracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('Fatal error starting server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
