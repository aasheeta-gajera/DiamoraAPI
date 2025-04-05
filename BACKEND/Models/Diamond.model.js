import mongoose from "mongoose";

const diamondSchema = new mongoose.Schema({
  itemCode: { type: String,unique: true },
  shape: { type: String, required: true },
  size: { type: Number, required: true },
  color: { type: String, required: true },
  clarity: { type: String, required: true },
  cut: { type: String, required: true },
  polish: { type: String, required: true },
  symmetry: { type: String, required: true },
  fluorescence: { type: String, required: true },
  certification: { type: String, required: true },
  measurements: { type: String, required: true },
  tablePercentage: { type: Number, required: true },
  purchasePrice: { type: Number, required: true }, // Price when purchased
  sellingPriceUSD: { type: Number },
  sellingPriceBTC: { type: Number },
  customerName: { type: String },
  saleDate: { type: Date },
  paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  status: { type: String, enum: ["In Stock", "Sold"], default: "In Stock" },
  totalSellingPriceUSD: { type: Number, default: 0 }, 
    totalSellingPriceBTC: { type: Number, default: 0 },
    profitOrLossUSD: { type: Number, default: 0 }

}, { timestamps: true });

const Diamond = mongoose.model("Diamond", diamondSchema);

export default Diamond;
