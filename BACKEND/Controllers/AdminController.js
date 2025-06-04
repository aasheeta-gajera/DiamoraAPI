import PurchaseDiamond from "../Models/purchaseDiamond.model.js";
import Diamond from "../Models/Diamond.model.js";
import Supplier from "../Models/supplier.model.js";
import Inquiry from "../Models/Inquiry.model.js";

  const basePrices = {
    shape: {
      "Round": 6000, "Princess": 5500, "Cushion": 5000, "Oval": 5200,
      "Pear": 5300, "Marquise": 5400, "Heart": 5100, "Emerald": 5800,
      "Radiant": 5700, "Asscher": 5600, "Mitchell": 4900, "Other": 4500
    },
    clarity: {
      "FL": 2.0, "IF": 1.8, "VVS1": 1.6, "VVS2": 1.5,   
      "VS1": 1.4, "VS2": 1.3, "SI1": 1.2, "SI2": 1.1,
      "I1": 1.0, "I2": 0.9, "I3": 0.8
    },
    color: {
      "D": 2.0, "E": 1.9, "F": 1.8, "G": 1.7, "H": 1.6, "I": 1.5,
      "J": 1.4, "K": 1.3, "L": 1.2, "M": 1.1, "N": 1.0, "O": 0.9, "P": 0.8,
      "Q": 0.7, "R": 0.6, "S": 0.5, "T": 0.4, "U": 0.3, "V": 0.2, "W": 0.1, "X": 0.05
    }
  };
  
  // Function to calculate price
  const calculateDiamondPrice = (shape, color, clarity, weightCarat) => {
    const shapePrice = basePrices.shape[shape] || basePrices.shape["Other"];
    const colorMultiplier = basePrices.color[color] || 1;
    const clarityMultiplier = basePrices.clarity[clarity] || 1;
    
    return shapePrice * colorMultiplier * clarityMultiplier * weightCarat;
  };
  
  // Purchase API
  export const purchaseDiamond = async (req, res) => {  
    try {
      let {
        supplier,
        supplierContact,
        itemCode,
        lotNumber,
        shape,
        size,
        weightCarat,
        color,
        clarity,
        cutGrade,
        cut,  // Ensure this is included
        polish,
        symmetry,
        fluorescence,
        certification,
        measurements,
        tablePercentage,
        totalDiamonds,
        invoiceNumber,
        purchaseDate,
        storageLocation,
        pairingAvailable,
        imageURL,
        remarks
      } = req.body;
        
      pairingAvailable = pairingAvailable === "true" || pairingAvailable === true;

      // Convert size to number
      size = Number(size);
      if (isNaN(size)) {
        return res.status(400).json({ message: "Size must be a number" });
      }
  
      // Check if supplier exists and get its ObjectId
      const existingSupplier = await Supplier.findOne({ name: supplier });
      if (!existingSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
  
      // Calculate Price
      const purchasePrice = calculateDiamondPrice(shape, color, clarity, weightCarat);
      const totalPurchasePrice = purchasePrice * totalDiamonds;
      const costPerCarat = purchasePrice / weightCarat;

      console.log("Calculated purchasePrice:", totalDiamonds); // Debugging line
      const stockStatus = totalDiamonds > 0 ? "In Stock" : "Out of Stock";
  
      // Save the purchase
      const newPurchase = new PurchaseDiamond({
        supplier: existingSupplier._id, // Store ObjectId instead of string
        supplierContact,
        itemCode,
        lotNumber,
        shape,
        size,
        weightCarat,
        color,
        clarity,
        cutGrade,
        cut,  // Ensure it's included
        polish,
        symmetry,
        fluorescence,
        certification,
        measurements,
        tablePercentage,
        purchasePrice,
        costPerCarat,
        totalDiamonds,
        totalPurchasePrice,
        invoiceNumber,
        purchaseDate: purchaseDate || new Date(),
        status: stockStatus,
        storageLocation,
        pairingAvailable,
        imageURL,
        remarks,
      });
  
      await newPurchase.save();
      res.status(201).json({ message: "Diamond added to inventory!", purchase: newPurchase});
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getAllPurchasedDiamonds = async (req, res) => {
    try {
      const diamonds = await PurchaseDiamond.find({ status: { $ne: "Sold" } });
  
      const diamondsWithTotalPrice = diamonds.map(diamond => ({
        ...diamond.toObject(),
        totalPurchasePrice: (diamond.purchasePrice || 0) * (diamond.totalDiamonds || 0),
      }));
  
      res.status(200).json({ diamonds: diamondsWithTotalPrice });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const supplier = async (req, res) => {
    try {
      const { name, contact, email, address, gstNumber, companyName } = req.body;
  
      const existingSupplier = await Supplier.findOne({ email });
      if (existingSupplier) {
        return res.status(400).json({ message: "Supplier with this email already exists." });
      }
  
      // Create Supplier (No diamonds added)
      const newSupplier = new Supplier({
        name,
        contact,
        email,
        address,
        gstNumber,
        companyName
      });
  
      await newSupplier.save();
      res.status(201).json({ message: "Supplier added successfully", supplier: newSupplier });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  export const getAllSuppliers = async (req, res) => {
    try {
      const suppliers = await Supplier.find();
      res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

export const getSalesReport = async (req, res) => {
  try {
      const sales = await Diamond.find();

      let totalRevenueUSD = 0;
      let totalProfitOrLossUSD = 0;
      let totalSalesCount = sales.length;

      const shapeCountMap = {};         // shape -> total count
      const shapeProfitMap = {};        // shape -> total profit
      const shapeRevenueMap = {};       // shape -> total revenue

      sales.forEach(sale => {
          const shape = sale.shape || "Unknown";
          const revenue = sale.totlePrice || 0;
          const profit = sale.profitOrLossUSD || 0;

          totalRevenueUSD += revenue;
          totalProfitOrLossUSD += profit;

          // Count sales per shape
          shapeCountMap[shape] = (shapeCountMap[shape] || 0) + 1;

          // Track total profit per shape
          shapeProfitMap[shape] = (shapeProfitMap[shape] || 0) + profit;

          // Track revenue per shape
          shapeRevenueMap[shape] = (shapeRevenueMap[shape] || 0) + revenue;
      });

      // Prepare graph data
      const graphLabels = Object.keys(shapeCountMap);
      const shapeCountValues = Object.values(shapeCountMap);
      const shapeProfitValues = graphLabels.map(label => shapeProfitMap[label]);

      // Analytics
      const sortedShapesBySales = Object.entries(shapeCountMap)
          .sort((a, b) => b[1] - a[1]);

      const mostProfitableShape = Object.entries(shapeProfitMap)
          .sort((a, b) => b[1] - a[1])[0];

      const lossMakingShapes = Object.entries(shapeProfitMap)
          .filter(([_, profit]) => profit < 0)
          .map(([shape]) => shape);

      res.status(200).json({
          totalSalesCount,
          totalRevenueUSD,
          totalProfitOrLossUSD,
          averageProfitPerSale: totalSalesCount > 0 ? (totalProfitOrLossUSD / totalSalesCount).toFixed(2) : 0,

          // By Shape
          shapeAnalytics: {
              salesCount: shapeCountMap,
              revenueByShape: shapeRevenueMap,
              profitByShape: shapeProfitMap,
          },

          insights: {
              topSellingShapes: sortedShapesBySales,
              mostProfitableShape: {
                  shape: mostProfitableShape?.[0],
                  profit: mostProfitableShape?.[1],
              },
              lossMakingShapes
          },

          graphData: {
              labels: graphLabels,
              salesCount: shapeCountValues,
              profitByShape: shapeProfitValues,
          },

          sales
      });

  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const createInquiry = async (req, res) => {
  try {
    const {
      userId,
      subject,
      message,
      diamondId,
      diamondShape,
      caratWeight,
      color,
      clarity,
      certification
    } = req.body;

    const inquiry = new Inquiry({
      userId: userId, 
      subject,
      message,
      diamondId,
      diamondShape,
      caratWeight,
      color,
      clarity,
      certification
    });

    await inquiry.save();
    res.status(201).json({ message: "Inquiry submitted", inquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find();
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const respondToInquiry = async (req, res) => {
  try {
    const { response, adminName } = req.body; // accept adminName or adminId from frontend

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        response: response,
        respondedBy: adminName, // Save who responded
        status: "responded"
      },
      { new: true }
    );

    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    res.json({ message: "Response sent", inquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const patchPurchasedDiamond = async (req, res) => {
  try {
    const { id } = req.params;
    let updateFields = req.body;

    // Optional: Validate pairingAvailable (convert to boolean if it's string)
    if (updateFields.pairingAvailable !== undefined) {
      updateFields.pairingAvailable =
        updateFields.pairingAvailable === "true" || updateFields.pairingAvailable === true;
    }

    // Validate and convert size if provided
    if (updateFields.size !== undefined) {
      updateFields.size = Number(updateFields.size);
      if (isNaN(updateFields.size)) {
        return res.status(400).json({ message: "Size must be a number" });
      }
    }

    // Convert supplier name to ObjectId if it's being updated
    if (updateFields.supplier) {
      const supplier = await Supplier.findOne({ name: updateFields.supplier });
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      updateFields.supplier = supplier._id;
    }

    // Auto calculate costPerCarat and totalPurchasePrice if required
    if (updateFields.purchasePrice && updateFields.weightCarat) {
      updateFields.costPerCarat = updateFields.purchasePrice / updateFields.weightCarat;
    }

    if (updateFields.purchasePrice && updateFields.totalDiamonds) {
      updateFields.totalPurchasePrice = updateFields.purchasePrice * updateFields.totalDiamonds;
    }

    const updatedDiamond = await PurchaseDiamond.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedDiamond) {
      return res.status(404).json({ message: "Diamond not found" });
    }

    res.status(200).json({ message: "Diamond updated successfully", diamond: updatedDiamond });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deletePurchasedDiamond = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDiamond = await PurchaseDiamond.findByIdAndDelete(id);

    if (!deletedDiamond) {
      return res.status(404).json({ message: "Diamond not found" });
    }

    res.status(200).json({ message: "Diamond deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
