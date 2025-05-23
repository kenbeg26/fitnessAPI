// Dependencies and Modules
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const Workout = require('../models/Workout');
const auth = require("../auth");
const { errorHandler } = auth;

// Create Workout
module.exports.addWorkout = async (req, res) => {
  try {
    const { name, duration } = req.body;
    const userId = req.user?.id;

    if (!name || !duration) {
      return res.status(400).json({ error: "Name and duration are required." });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found." });
    }

    const newWorkout = new Workout({
      name,
      duration,
      userId
    });

    const savedWorkout = await newWorkout.save();

    // ✅ Return raw MongoDB document (like in your screenshot)
    return res.status(201).json(savedWorkout);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: {
        message: error.message || "Internal server error",
        errorCode: "SERVER_ERROR",
        details: null
      }
    });
  }
};

// Get Workout
module.exports.getMyWorkout = (req, res) => {
  Workout.find({ userId: req.user.id })
    .then(workouts => {
      console.log("User's Workouts found:", workouts);
      res.status(200).json(workouts);
    })
    .catch(error => errorHandler(error, req, res));
};

// Update Workout
module.exports.updateMyWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;
    const userId = req.user.id;

    // Find the workout first
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    // Check if the workout belongs to the logged-in user
    if (workout.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: You cannot update this workout" });
    }

    // Update only if ownership is confirmed
    const updatedWorkout = await Workout.findByIdAndUpdate(workoutId, req.body, { new: true });

    return res.status(200).json({
      message: "Workout updated successfully",
      updatedWorkout,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};


// Delete Workout
module.exports.deleteWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;
    const userId = req.user.id;

    console.log("Delete request for workout:", workoutId);
    console.log("Authenticated user:", userId);

    if (!mongoose.Types.ObjectId.isValid(workoutId)) {
      return res.status(400).json({ error: "Invalid workout ID" });
    }

    const workout = await Workout.findById(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (workout.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: You cannot delete this workout" });
    }

    await Workout.findByIdAndDelete(workoutId);
    return res.status(200).json({ message: "Workout deleted successfully" });

  } catch (error) {
    console.error("Delete workout error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};



// Complete Workout
module.exports.completeWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the workout by ID
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    // Check if the workout belongs to the current user
    if (workout.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: You can't update this workout" });
    }

    // Update status to "completed"
    workout.status = "completed";
    await workout.save();

    res.status(200).json({
      message: "Workout status updated successfully",
      updatedWorkout: workout
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        message: error.message || "Internal server error",
        errorCode: "SERVER_ERROR"
      }
    });
  }
};

