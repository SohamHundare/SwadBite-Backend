const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hostel: { type: String, required: true },
  foodType: { type: String, required: true },
  comments: { type: String ,require:true},
  recommend: { type: String, required: true },
  satisfaction: {
    Taste: { type: String, required: true },        // Radio button -> must select
    Cleanliness: { type: String, required: true },  // Radio button -> must select
    Service: { type: String, required: true },      // Radio button -> must select
    Timeliness: { type: String, required: true },   // Radio button -> must select
  },
  rating: { type: Number, required: true },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
