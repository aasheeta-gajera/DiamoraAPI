import User from "../models/userModel.js";
import PurchaseDiamond from "../Models/purchaseDiamond.js";
import Diamond from '../Models/Diamond.js'
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import path from "path";
import express from "express";
import { writeFileSync } from "fs";


const SECRET_KEY = "aasheeta#p"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerUser = async (req, res) => {
    try {
      const { user_id, password, email, mobile, city,address,userType, contact_name, references, id_proof,  license_copy, tax_certificate, partner_copy } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User already exists" });
  
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


  export const purchaseDiamond = async (req, res) => {
    try {
      const {
        supplier,
        supplierContact,
        itemCode,
        lotNumber,
        shape,
        size,
        weightCarat,
        color,
        clarity,
        cut,
        polish,
        symmetry,
        fluorescence,
        certification,
        measurements,
        tablePercentage,
        purchasePrice,
        totalDiamonds,
        invoiceNumber,
        purchaseDate,
        storageLocation,
        pairingAvailable,
        imageURL,
        remarks
      } = req.body;
  
      // Check if diamond already exists
      const existingDiamond = await PurchaseDiamond.findOne({ itemCode, status: "In Stock" });
      if (existingDiamond) {
        return res.status(400).json({ message: "Diamond already in stock" });
      }
  
      // Calculate total purchase price
      const totalPurchasePrice = purchasePrice * totalDiamonds;
  
      // Calculate cost per carat
      const costPerCarat = purchasePrice / weightCarat;
  
      // Create new diamond purchase record
      const newPurchase = new PurchaseDiamond({
        supplier,
        supplierContact,
        itemCode,
        lotNumber,
        shape,
        size,
        weightCarat,
        color,
        clarity,
        cut,
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
        status: "In Stock",
        storageLocation,
        pairingAvailable,
        imageURL,
        remarks
      });
  
      await newPurchase.save();
      res.status(201).json({ message: "Diamond added to inventory!", purchase: newPurchase });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  export const getAllPurchasedDiamonds = async (req, res) => {
    try {
      const diamonds = await PurchaseDiamond.find(); 
      res.status(200).json({ diamonds });
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
