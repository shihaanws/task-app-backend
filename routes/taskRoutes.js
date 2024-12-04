const express = require("express");
const Task = require("../models/Task");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all tasks (Admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const tasks = await Task.find().populate("createdBy", "username");
  console.log("tasks", tasks);
  res.json(tasks);
});

// Get tasks for logged-in user
router.get("/my-tasks", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ createdBy: req.user._id });
  res.json(tasks);
});

// Create  task
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, status, priority } = req.body;

  try {
    const task = new Task({
      title,
      description,
      status,
      priority,
      createdBy: req.user._id,
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating task", error: error.message });
  }
});

// Update  task
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByIdAndUpdate(id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating task", error: error.message });
  }
});

// Delete task
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting task", error: error.message });
  }
});

module.exports = router;
