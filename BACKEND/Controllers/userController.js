import User from "../Models/user.model.js";
import PurchaseDiamond from "../Models/purchaseDiamond.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import path from "path";
import express from "express";
import { writeFileSync } from "fs";
import Cart from "../Models/Cart.model.js";
import Diamond from "../Models/Diamond.model.js";
import Supplier from "../Models/supplier.model.js";

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
      const diamonds = await PurchaseDiamond.find();
       const diamondsWithTotalPrice = diamonds.map(diamond => ({
            ...diamond.toObject(), 
            totalPurchasePrice: diamond.purchasePrice * diamond.totalDiamonds
        })); 
      res.status(200).json({ diamonds:diamondsWithTotalPrice });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  
  export const sellDiamond = async (req, res) => {
    try {
        const { itemCode, customerName, quantity, sellingPriceUSD, sellingPriceBTC, paymentStatus } = req.body;

        // Find purchased diamond in stock
        const purchasedDiamond = await PurchaseDiamond.findOne({ itemCode, status: "In Stock" });

        if (!purchasedDiamond) {
            return res.status(404).json({ message: "Diamond not available in inventory" });
        }

        if (purchasedDiamond.totalDiamonds < quantity) {
            return res.status(400).json({ message: "Not enough diamonds in stock" });
        }

        // Deduct stock
        purchasedDiamond.totalDiamonds -= quantity;
        if (purchasedDiamond.totalDiamonds === 0) {
            purchasedDiamond.status = "Sold";
        }
        await purchasedDiamond.save();

        // Calculate total selling price
        const totalSellingPriceUSD = sellingPriceUSD * quantity;
        const totalSellingPriceBTC = sellingPriceBTC * quantity;

        // Calculate profit/loss
        const purchaseCost = purchasedDiamond.purchasePrice * quantity;
        const profitOrLossUSD = totalSellingPriceUSD - purchaseCost;

        // Check if sale already exists for the item
        const existingSale = await Diamond.findOne({ itemCode });

        if (existingSale) {
            // Update existing sale
            existingSale.quantity += quantity;
            existingSale.totalSellingPriceUSD += totalSellingPriceUSD;
            existingSale.totalSellingPriceBTC += totalSellingPriceBTC;
            existingSale.profitOrLossUSD += profitOrLossUSD;
            existingSale.paymentStatus = paymentStatus;

            await existingSale.save();
            return res.status(200).json({ message: "Sale updated successfully!", sale: existingSale });
        }

        // Create a new sale record
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
            certification: purchasedDiamond.certification,
            measurements: purchasedDiamond.measurements,
            tablePercentage: purchasedDiamond.tablePercentage,
            purchasePrice: purchasedDiamond.purchasePrice,
            sellingPriceUSD,
            sellingPriceBTC,
            totalSellingPriceUSD,
            totalSellingPriceBTC,
            customerName,
            quantity,
            saleDate: new Date(),
            paymentStatus,
            profitOrLossUSD
        });

        await newSale.save();
        res.status(201).json({ message: "Diamond sold successfully!", sale: newSale });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getSalesReport = async (req, res) => {
    try {
        const sales = await Diamond.find();

        let totalRevenueUSD = 0;
        let totalRevenueBTC = 0;
        let totalProfitOrLossUSD = 0;

        sales.forEach(sale => {
            totalRevenueUSD += sale.totalSellingPriceUSD;
            totalRevenueBTC += sale.totalSellingPriceBTC;
            totalProfitOrLossUSD += sale.profitOrLossUSD;
        });

        res.status(200).json({
            totalRevenueUSD,
            totalRevenueBTC,
            totalProfitOrLossUSD,
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

    // Check if enough stock is available
    if (diamond.totalDiamonds < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    // Update or create cart item
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

    // Decrease totalDiamonds in inventory
    diamond.totalDiamonds -= quantity;

    console.log(diamond.totalDiamonds);
    // If totalDiamonds is now 0, update status
    if (diamond.totalDiamonds === 0) {
      diamond.status = "Out of Stock";
    }

    await Promise.all([cartItem.save(), diamond.save()]);

    res.status(200).json({ message: "Diamond added to cart", cart: cartItem });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};


  export const getAllCartItems = async (req, res) => {
    try {
      const cartItems = await Cart.find().populate("userId", "name email");

      if (cartItems.length === 0) {
        return res.status(404).json({ message: "No items found in the cart" });
      }

      res.status(200).json({ cartItems });
    } catch (error) {
      res.status(500).json({ message: "Server error: " + error.message });
    }
  };