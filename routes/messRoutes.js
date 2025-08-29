// routes/messRoutes.js
import express from "express";
import Mess from "../models/Mess.js";

const router = express.Router();

// Get all messes
router.get("/", async (req, res) => {
  try {
    const messes = await Mess.find();
    res.json(messes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messes" });
  }
});

// Add new mess
router.post("/", async (req, res) => {
  try {
    const newMess = new Mess(req.body);
    await newMess.save();
    res.status(201).json(newMess);
  } catch (err) {
    res.status(500).json({ error: "Failed to add mess" });
  }
});

export default router;
