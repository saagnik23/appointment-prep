const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  const mongoUri = process.env.MONGODB_URI;
  if (
    !isConnected &&
    mongoUri &&
    !mongoUri.includes('127.0.0.1') &&
    !mongoUri.includes('localhost')
  ) {
    try {
      await connectDB(mongoUri);
      isConnected = true;
    } catch (err) {
      console.error('MongoDB connection error in serverless handler:', err.message);
    }
  }

  return app(req, res);
};
