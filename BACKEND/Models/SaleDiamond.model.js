import mongoose from "mongoose";

const SaleDiamondSchema = new mongoose.Schema({
  itemCode: String,
  shape: String,
  size: String,
  color: String,
  clarity: String,
  cut: String,
  polish: String,
  symmetry: String,
  fluorescence: String,
  certification: String,
  measurements: String,
  tablePercentage: Number,
  purchasePrice: Number,
  totlePrice: Number,
  customerName: String,
  quantity: Number,
  saleDate: Date,
  paymentStatus: String,
  paymentMethod: String,
  transactionId: String,
  profitOrLossUSD: Number,
});

const SaleDiamond = mongoose.model("SaleDiamond", SaleDiamondSchema);

export default SaleDiamond;
