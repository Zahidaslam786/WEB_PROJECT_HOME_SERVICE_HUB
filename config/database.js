const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'homeservicehub'
    });
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
    mongoose.connection.once('open', () => {
      console.log('MongoDB connected');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
