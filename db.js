const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://abarrios:${process.env.MONGODB_API_KEY}@schedulesystem.stitucm.mongodb.net/`);
    console.log('Connection to MongoDB was succesfully');
  } catch (error) {
    console.error('Error to connect MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;