import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  response: { type: String }, // optional field for admin reply
  status: {
    type: String,
    enum: ["pending", "responded"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Inquiry", inquirySchema);