const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, // Store as base64 or URL
  quote: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);