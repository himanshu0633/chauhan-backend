// models/video.js
const mongoose = require('mongoose');
const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Video', videoSchema);
