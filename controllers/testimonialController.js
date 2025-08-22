const Testimonial = require('../models/Testimonial');

exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const { name, image, quote } = req.body;
    const testimonial = new Testimonial({ name, image, quote });
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create testimonial' });
  }
};