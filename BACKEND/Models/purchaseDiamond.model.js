import mongoose from "mongoose";

const PurchaseDiamondSchema = new mongoose.Schema({
    supplier: { type: String, required: true }, // Supplier name
    invoiceNumber: { type: String, required: true },
    supplierContact: { type: String }, // Optional
    itemCode: { type: String, required: true, unique: true },
    lotNumber: { type: String, unique: true },
    shape: { type: String, required: true },
    size: { type: Number, required: true },
    weightCarat: { type: Number, required: true },
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
    costPerCarat: { type: Number }, // Computed
    totalDiamonds: { type: Number, required: true },
    totalPurchasePrice: { type: Number }, // Computed
    purchaseDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["In Stock", "Sold", "Reserved", "Memo"], default: "In Stock" },
    storageLocation: { type: String },
    pairingAvailable: { type: Boolean, default: false },
    imageURL: { type: String },
    soldCount: { type: Number, default: 0 },
    remarks: { type: String },

    // Payment fields
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        required: true,
        default: 'Pending' // ✅ Default added here
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'],
        required: false
    },
    transactionId: { type: String, required: false },
    paymentDate: { type: Date, default: Date.now },
});

// Auto-calculate fields before saving
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
