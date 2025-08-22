// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const { submitFeedback, getFeedback } = require("../controllers/feedbackController.js");

router.post("/submit", submitFeedback);
router.get("/get", getFeedback);

module.exports = router;