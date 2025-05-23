const express = require('express');
const workoutController = require('../controllers/workout');

const { verify } = require("../auth");

// Routing Component
const router = express.Router();

router.post("/addWorkout", verify, workoutController.addWorkout);

router.get("/getMyWorkouts", verify, workoutController.getMyWorkout);

router.patch("/updateWorkout/:id", verify, workoutController.updateMyWorkout);

router.delete("/deleteWorkout/:id", verify, workoutController.deleteWorkout);

router.patch("/completeWorkoutStatus/:id", verify, workoutController.completeWorkout);

module.exports = router;