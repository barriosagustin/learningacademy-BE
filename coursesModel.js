const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  completed: Boolean,
});

const moduleSchema = new mongoose.Schema({
  title: String,
  videos: [videoSchema],
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: String,
  category: String,
  duration: Number,
  price: Number,
  language: String,
  image: Buffer,
  modules: [moduleSchema],
});


const Courses = mongoose.model("internalcourses", courseSchema);

module.exports = Courses;
