import User from "../Models/user.model.js";
import PurchaseDiamond from "../Models/purchaseDiamond.model.js";
import bcrypt from 'bcrypt';
import SaleDiamond from "../Models/SaleDiamond.model.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import path from "path";
import express from "express";
import { writeFileSync } from "fs";
import Cart from "../Models/Cart.model.js";
import Diamond from "../Models/Diamond.model.js";
import Supplier from "../Models/supplier.model.js";
import Inquiry from "../Models/Inquiry.model.js";

const SECRET_KEY = "aasheeta#p"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerUser = async (req, res) => {
    try {
      const { user_id, password, email, mobile, city,address,userType, contact_name, references, id_proof,  license_copy, tax_certificate, partner_copy,terms_agreed,business_type } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User already exists" });

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          status: "error",
          message: "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.",
        });
      }
  
  
      if (!id_proof) {
        return res.status(400).json({
          status: "error",
          message: "Photo (Base64) is required.",
        });
      }

      const saveBase64Image = (base64Data, filename) => {
        if (!base64Data) return "";
        const buffer = Buffer.from(base64Data, "base64");
        const filePath = `uploads/${Date.now()}-${filename}.png`;
        writeFileSync(filePath, buffer);
        return filePath;
      };

    const idProofPath = saveBase64Image(id_proof, "id_proof");
    const licenseCopyPath = saveBase64Image(license_copy, "license_copy");
    const taxCertPath = saveBase64Image(tax_certificate, "tax_certificate");
    const partnerCopyPath = saveBase64Image(partner_copy, "partner_copy");

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt);

      const parsedReferences = typeof references === "string" ? JSON.parse(references) : references;
  
      const newUser = new User({
        user_id,
        password: hashedPassword,
        email,
        mobile,
        city,
        address,
        userType,
        contact_name,
        id_proof: idProofPath,
        license_copy: licenseCopyPath,
        tax_certificate: taxCertPath,
        partner_copy: partnerCopyPath,
        terms_agreed,
        business_type,
        references: parsedReferences
      });
  
      const savedUser = await newUser.save();
  
      // Generate Token
      const token = jwt.sign(
        { user_id: savedUser.user_id, email: savedUser.email },
        SECRET_KEY,
      );
  
      res.status(201).json({ 
        message: "User registered successfully!", 
        token, 
        user:savedUser
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message +'Error' });
    }
};

  const token = jwt.sign(
    {
      _id: User._id,         // ✅ Mongoose ObjectId
      user_id: User.user_id, // optional if you still want it
      userType: User.userType
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  export const verifyUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
  
      req.user = decoded; // This will include _id from the JWT payload
      next();
    });
  };
  

  export const getUsers = async (req, res) => {
    try {
      const users = await User.find().select("-password"); // Excluding passwords from response
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  export const uploads = express.static(path.join(__dirname, 'uploads'));

  export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });
  
      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });
  
      // Generate JWT Token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        SECRET_KEY,
        { expiresIn: "7d" }
      );
  
      // Send response with full user data
      res.status(200).json({
        message: "Login successful!",
        token,
        user
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message + " Error" });
    }
  };
  

  export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });
  
      // Generate password reset token (valid for 10 mins)
      const resetToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: "10m" });
  
      // In a real app, send this token via email (Nodemailer)
      // Example: sendEmail(user.email, `Your reset token: ${resetToken}`);
  
      res.status(200).json({ 
        message: "Password reset token sent to email.",
        resetToken // In real use case, don't return this in response
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

    export const resetPassword = async (req, res) => {
      try {
        const { token, newPassword } = req.body;
    
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded) return res.status(400).json({ message: "Invalid or expired token" });
    
        // Find user by email in decoded token
        const user = await User.findOne({ email: decoded.email });
        if (!user) return res.status(400).json({ message: "User not found" });
    
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        // Update user's password
        user.password = hashedPassword;
        await user.save();
    
        res.status(200).json({ message: "Password reset successful. You can now log in." });
    
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

  // Admin

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
  
  // export const sellDiamond = async (req, res) => {
  //   try {
  //     const {
  //       userId, // 🟢 New: userId required to remove cart for that user
  //       itemCode,
  //       customerName,
  //       quantity,
  //       totlePrice,
  //       paymentStatus
  //     } = req.body;
  
  //     // ✅ Validation
  //     if (!userId || isNaN(totlePrice) || isNaN(quantity) || quantity <= 0 || totlePrice <= 0) {
  //       return res.status(400).json({ message: "Invalid price, quantity, or userId" });
  //     }
  
  //     // ✅ Fetch diamond from inventory
  //     const purchasedDiamond = await PurchaseDiamond.findOne({ itemCode });
  
  //     if (!purchasedDiamond || purchasedDiamond.totalDiamonds < quantity) {
  //       return res.status(404).json({ message: "Not enough diamonds in inventory" });
  //     }
  
  //     // ✅ Update inventory stock
  //     purchasedDiamond.totalDiamonds -= quantity;
  //     purchasedDiamond.status = purchasedDiamond.totalDiamonds === 0 ? "Sold" : "In Stock";
  //     await purchasedDiamond.save();
  
  //     // ✅ Calculate profit/loss
  //     const purchaseCost = purchasedDiamond.purchasePrice * quantity;
  //     const profitOrLossUSD = totlePrice - purchaseCost;
  
  //     // ✅ Check if diamond already sold earlier
  //     const existingSale = await Diamond.findOne({ itemCode });
  
  //     if (existingSale) {
  //       existingSale.quantity += quantity;
  //       existingSale.totlePrice += totlePrice;
  //       existingSale.profitOrLossUSD += profitOrLossUSD;
  //       existingSale.paymentStatus = paymentStatus;
  //       await existingSale.save();
  //     } else {
  //       const newSale = new Diamond({
  //         itemCode,
  //         shape: purchasedDiamond.shape,
  //         size: purchasedDiamond.size,
  //         color: purchasedDiamond.color,
  //         clarity: purchasedDiamond.clarity,
  //         cut: purchasedDiamond.cut,
  //         polish: purchasedDiamond.polish,
  //         symmetry: purchasedDiamond.symmetry,
  //         fluorescence: purchasedDiamond.fluorescence,
  //         certification: purchasedDiamond.certification,
  //         measurements: purchasedDiamond.measurements,
  //         tablePercentage: purchasedDiamond.tablePercentage,
  //         purchasePrice: purchasedDiamond.purchasePrice,
  //         totlePrice,
  //         customerName,
  //         quantity,
  //         saleDate: new Date(),
  //         paymentStatus,
  //         profitOrLossUSD
  //       });
  
  //       await newSale.save();
  //     }
  
  //    await Cart.deleteOne({ userId, itemCode });
  
  //     res.status(201).json({ message: "Diamond sold successfully!" });
  //   } catch (error) {
  //     res.status(500).json({ message: "Server error: " + error.message });
  //   }
  // };

  export const sellDiamond = async (req, res) => {
    try {
      const {
        userId,
        itemCode,
        customerName,
        quantity,
        paymentStatus,
        paymentMethod,
        transactionId,
      } = req.body;
  
      // Validate inputs
      if (!userId || isNaN(quantity) || quantity <= 0 || !paymentStatus) {
        return res.status(400).json({ message: "Invalid input" });
      }
  
      // Find the purchased diamond
      const purchasedDiamond = await PurchaseDiamond.findOne({ itemCode });
  
      if (!purchasedDiamond || purchasedDiamond.totalDiamonds < quantity) {
        return res.status(404).json({ message: "Not enough stock" });
      }
  
      // Update stock
      purchasedDiamond.totalDiamonds -= quantity;
      purchasedDiamond.status = purchasedDiamond.totalDiamonds === 0 ? "Sold" : "In Stock";
      await purchasedDiamond.save();
  
      // Calculate selling price with 15% profit
      const purchaseCost = purchasedDiamond.purchasePrice * quantity;
      const totlePrice = +(purchaseCost * 1.15).toFixed(2);  // 15% markup
      const profitOrLossUSD = totlePrice - purchaseCost;
  
      // Check for existing sale entry
      const existingSale = await Diamond.findOne({ itemCode });
  
      if (existingSale) {
        existingSale.quantity += quantity;
        existingSale.totlePrice += totlePrice;
        existingSale.profitOrLossUSD += profitOrLossUSD;
        existingSale.paymentStatus = paymentStatus;
        existingSale.paymentMethod = paymentMethod;
        existingSale.transactionId = transactionId;
        existingSale.saleDate = new Date(); // Update to most recent sale
        await existingSale.save();
      } else {
        const newSale = new Diamond({
          itemCode,
          shape: purchasedDiamond.shape,
          size: purchasedDiamond.size,
          color: purchasedDiamond.color,
          clarity: purchasedDiamond.clarity,
          cut: purchasedDiamond.cut,
          polish: purchasedDiamond.polish,
          symmetry: purchasedDiamond.symmetry,
          fluorescence: purchasedDiamond.fluorescence,
          certification: purchasedDiamond .certification,
          measurements: purchasedDiamond.measurements,
          tablePercentage: purchasedDiamond.tablePercentage,
          // purchasePrice: purchasedDiamond.purchasePrice,
          totlePrice,
          customerName,
          quantity,
          saleDate: new Date(),
          paymentStatus,
          paymentMethod,
          transactionId,
          // profitOrLossUSD,
        });
  
        await newSale.save();
      }
  
      // Remove from cart
      await Cart.deleteOne({ userId, itemCode });
  
      res.status(201).json({
        message: "Diamond sold successfully!",
        totlePrice,
        profitOrLossUSD
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error: " + error.message });
    }
  };  

export const getSoldDiamonds = async (req, res) => {
    try {
      // Fetch sold diamonds from the Diamond collection
      const soldDiamonds = await Diamond.find().sort({ saleDate: -1 }); // Sort by most recent first
  
      // Map the diamonds to include relevant details
      const formattedSoldDiamonds = soldDiamonds.map(diamond => ({
        itemCode: diamond.itemCode,
        shape: diamond.shape,
        size: diamond.size,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        polish: diamond.polish,
        symmetry: diamond.symmetry,
        fluorescence: diamond.fluorescence,
        certification: diamond.certification,
        measurements: diamond.measurements,
        tablePercentage: diamond.tablePercentage,
        purchasePrice: diamond.purchasePrice,
        totlePrice: diamond.totlePrice,
        customerName: diamond.customerName,
        quantity: diamond.quantity,
        saleDate: diamond.saleDate,
        paymentStatus: diamond.paymentStatus,
        paymentMethod: diamond.paymentMethod,
        transactionId: diamond.transactionId,
        profitOrLossUSD: diamond.profitOrLossUSD
      }));
  
      // Respond with the list of sold diamonds
      res.status(200).json({ soldDiamonds: formattedSoldDiamonds });
    } catch (error) {
      res.status(500).json({ message: "Server error: " + error.message });
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

export const AddToCart = async (req, res) => {
  try {
    const { userId, itemCode, quantity } = req.body;

    if (!userId || !itemCode || quantity <= 0) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    const diamond = await PurchaseDiamond.findOne({ itemCode });

    if (!diamond) {
      return res.status(404).json({ message: "Diamond not found" });
    }

    if (diamond.totalDiamonds < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    let cartItem = await Cart.findOne({ userId, itemCode });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new Cart({
        userId,
        itemCode,
        quantity,
        price: diamond.purchasePrice || 0,
      });
    }

    diamond.totalDiamonds -= quantity;

    if (diamond.totalDiamonds === 0) {
      diamond.status = "Out of Stock";
    }

    if (!diamond.paymentStatus) {
      diamond.paymentStatus = 'Pending';
    }

    await Promise.all([cartItem.save(), diamond.save()]);

    res.status(200).json({ message: "Diamond added to cart", cart: cartItem, diamond });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};


export const getAllCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.find().lean(); // lean() makes plain JS object

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "No items found in the cart" });
    }

    // Replace itemCode with diamond details
    const enrichedCart = await Promise.all(
      cartItems.map(async (item) => {
        const diamond = await PurchaseDiamond.findOne({ itemCode: item.itemCode }).lean();
        return {
          ...item,
          diamondDetails: diamond || null, // attach full diamond details
        };
      })
    );

    res.status(200).json({ cartItems: enrichedCart });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const removeCart = async (req, res) => {
  const { diamondId } = req.params;
  console.log("Received diamondId:", diamondId); 

  try {
    const cartItem = await Cart.findById(diamondId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const { itemCode, quantity } = cartItem;

    const diamond = await PurchaseDiamond.findOne({ itemCode });
    if (diamond) {
      diamond.totalDiamonds += quantity;
      diamond.status = "In Stock";
      await diamond.save();
    }

    const deletedItem = await Cart.findByIdAndDelete(diamondId);  // Corrected line

    res.status(200).json({ message: "Diamond removed from cart and restored to inventory", deletedItem });
  } catch (error) {
    res.status(500).json({ message: "Error removing diamond from cart", error: error.message });
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

export const generateBill = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await Diamond.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const doc = new PDFDocument();
    const fileName = `invoice_${sale.itemCode}.pdf`;
    const filePath = `./invoices/${fileName}`;

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("Diamond Sale Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Customer Name: ${sale.customerName}`);
    doc.text(`Item Code: ${sale.itemCode}`);
    doc.text(`Quantity: ${sale.quantity}`);
    doc.text(`Total Price: $${sale.totlePrice}`);
    doc.text(`Payment Status: ${sale.paymentStatus}`);
    doc.text(`Profit/Loss: $${sale.profitOrLossUSD}`);
    doc.text(`Sale Date: ${sale.saleDate.toLocaleDateString()}`);

    doc.end();

    res.status(200).json({ message: "Invoice generated", path: `/invoices/${fileName}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
