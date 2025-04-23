import mongoose from "mongoose";

const PurchaseDiamondSchema = new mongoose.Schema({
    supplier: { type: String , ref: "Supplier" },
    invoiceNumber: { type: String, required: true},
    supplierContact: { type: String }, // New field
    itemCode: { type: String, required: true, unique: true },
    lotNumber: { type: String, unique: true }, // New field
    shape: { type: String, required: true },
    size: { type: Number, required: true },
    weightCarat: { type: Number, required: true }, // New field
    color: { type: String, required: true },
    clarity: { type: String, required: true },
    cut: { type: String, required: true },
    polish: { type: String, required: true },
    symmetry: { type: String, required: true },
    fluorescence: { type: String, required: true },
    certification: { type: String },
    measurements: { type: String },
    tablePercentage: { type: Number },
    purchasePrice: { type: Number, required: true },
    costPerCarat: { type: Number }, // New field (computed)
    totalDiamonds: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now }, // New field
    status: { type: String, enum: ["In Stock", "Sold", "Reserved", "Memo"], default: "In Stock" }, // Updated field
    storageLocation: { type: String }, // New field
    pairingAvailable: { type: Boolean, default: false }, // New field
    imageURL: { type: String }, // New field
    remarks: { type: String } ,// New field
    totalPurchasePrice: { type: Number }, // ✅ Add this field
});

// Auto-calculate cost per carat before saving
PurchaseDiamondSchema.pre("save", function (next) {
    if (this.weightCarat && this.purchasePrice) {
        this.costPerCarat = this.purchasePrice / this.weightCarat;
    }
    if (this.purchasePrice && this.totalDiamonds) {
        this.totalPurchasePrice = this.purchasePrice * this.totalDiamonds;
    }
    next();
});

export default mongoose.model("PurchaseDiamond", PurchaseDiamondSchema);
