const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/appointment_prep';
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    if (process.env.NODE_ENV !== 'test') {
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = {
  connectDB,
  disconnectDB,
};
