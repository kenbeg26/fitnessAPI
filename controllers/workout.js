// Dependencies and Modules
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
  Workout.find({})
    .then(workouts => {
      console.log("Workout found:", workouts);
      res.status(200).json(workouts);
    })
    .catch(error => errorHandler(error, req, res));
};

// Update Workout
module.exports.updateMyWorkout = (req, res) => {
  Workout.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedWorkout => {
      if (!updatedWorkout) {
        return res.status(404).json({ error: "Workout not found" });
      }
      res.status(200).json({ message: "Workout updated successfully", updatedWorkout: { updatedWorkout } });
    })
    .catch(error => errorHandler(error, req, res));
};

// Delete Workout
module.exports.deleteWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the workout and check if it belongs to the user
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
    console.error(error);
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

