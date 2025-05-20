//[Section] Dependency
const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is Required']
  },
  name: {
    type: String,
    required: [true, 'Name is Required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is Required']
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed']
  }
});

module.exports = mongoose.model('Workout', workoutSchema);