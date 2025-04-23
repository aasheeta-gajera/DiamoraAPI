import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
    name: { type: String, required: true, }, // Supplier name
    contact: { type: String, required: true,unique: true }, // Contact number
    email: { type: String, required: true, unique: true }, // Supplier email
    address: { type: String, required: true }, // Address
    gstNumber: { type: String, required: true,unique: true }, // GST Number (for taxation)
    companyName: { type: String, required: true ,unique: true}, // Company name
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Supplier", SupplierSchema);
