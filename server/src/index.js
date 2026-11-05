const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  try {
    await connectDB(env.MONGODB_URI);
    const server = app.listen(env.PORT, () => {
      console.log(`Appointment Prep API listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`Health check: http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('Received termination signal. Closing HTTP server and database connections...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
