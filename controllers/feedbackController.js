const Feedback = require("../models/Feedback");

  const submitFeedback = async (req, res) => {
  try {
    const { name, hostel, foodType, recommend, rating } = req.body;

    if (!name || !hostel || !foodType || !recommend || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const feedback = new Feedback(req.body);
    await feedback.save();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Error submitting feedback:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: "Server error" });
  }
};
const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
};

module.exports = { submitFeedback, getFeedback };
