import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  diamondId: { type: mongoose.Schema.Types.ObjectId, ref: "Diamond", required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true }, // Store price at the time of adding
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Cart", CartSchema);
