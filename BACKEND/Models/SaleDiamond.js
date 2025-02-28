// import mongoose from "mongoose";

// const saleSchema = new mongoose.Schema({
//   itemCode: { type: String, required: true },
//   shape: { type: String, required: true },
//   size: { type: Number, required: true },
//   color: { type: String, required: true },
//   clarity: { type: String, required: true },
//   cut: { type: String, required: true },
//   polish: { type: String, required: true },
//   symmetry: { type: String, required: true },
//   fluorescence: { type: String },
//   certification: { type: String },
//   measurements: { type: String },
//   tablePercentage: { type: Number },
//   purchasePrice: { type: Number, required: true }, // Purchased price
//   sellingPriceUSD: { type: Number, required: true }, // Price sold to customer
//   sellingPriceBTC: { type: Number },
//   customerName: { type: String, required: true },
//   saleDate: { type: Date, default: Date.now },
//   paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" }
// });

// const Sale = mongoose.model("Sale", saleSchema);
// export default Sale;
