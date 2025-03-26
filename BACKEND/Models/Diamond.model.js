// import mongoose, { Types } from "mongoose";


// const DiamondSchema = new mongoose.Schema({
//     shape: { type: String, required: true, enum: [
//       "Round", "Princess", "Cushion", "Oval", "Pear", "Marquise", "Heart", "Emerald", "Radiant", "Asscher", 
//       "Asscher & Sq. Emerald", "Baguette", "Briolette", "Bullets", "Circular Brilliant", "Cushion Brilliant", 
//       "Cushion Modified", "European Cut", "Flanders", "Calf", "Half Moon", "Hexagonal", "Kite", "Lozenge", "Octagonal"]
//     },
//     sizeRange: { type: String, required: true, enum: ["0.18-0.22", "0.23-0.29", "0.30-0.39", "0.40-0.49"] },
//     color: { type: String, required: true, enum: ["White", "Fancy Color"] },
//     colorRange: { type: String, required: true, enum: ["D", "E", "F/G", "H", "I", "J", "K/L", "M", "N", "O-P", "Q-R", "S-T", "U-V", "W-X", "Y-Z"] },
//     clarity: { type: String, required: true, enum: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"] },
//     shade: { type: String, required: true, enum: ["None", "Brown", "Green", "Mix", "No BGM"] },
//     cut: { type: String, required: true, enum: ["Ideal", "Very Good", "Good", "Fair", "Poor"] },
//     polish: { type: String, required: true, enum: ["Ideal", "Good", "Fair", "Poor"] },
//     symmetry: { type: String, required: true, enum: ["Ideal", "Good", "Fair", "Poor"] },
//     lab: { type: String, required: true, enum: ["GIA", "IGI", "HRD"] },
//     location: { type: String, required: true, enum: ["India", "Hong Kong", "Belgium"] },
//     pairingAvailable: { type: Boolean, default: false },
//     availability: { type: String, required: true, enum: ["Available", "Memo"] }
//   });
  
//   const Diamond = mongoose.model("Diamond", DiamondSchema);
//   export default Diamond;



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
