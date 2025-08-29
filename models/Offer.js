const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: Number, required: true },
  image: { type: String },
  validTill: { type: Date, required: true }
});

module.exports = mongoose.model("Offer", OfferSchema);
