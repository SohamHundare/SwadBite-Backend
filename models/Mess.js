// models/Mess.js
import mongoose from "mongoose";

const MessSchema = new mongoose.Schema({
  name: String,
  location: String,
  rating: String,
  image: String,
  map: String,
});

export default mongoose.model("Mess", MessSchema);
