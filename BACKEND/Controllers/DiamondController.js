import User from "../Models/user.model.js";
import PurchaseDiamond from "../Models/purchaseDiamond.model.js";
import Diamond from '../Models/Diamond.model.js'
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import path from "path";
import express from "express";
import { writeFileSync } from "fs";
import Supplier from "../Models/supplier.model.js";

const SECRET_KEY = "aasheeta#p"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

        // Validate required fields
        if (!shape || !color || !clarity || !weightCarat) {
            return res.status(400).json({ message: "Missing required fields: shape, color, clarity, weightCarat" });
        }

        // Convert values to correct types
        pairingAvailable = pairingAvailable === "true" || pairingAvailable === true; // Ensure Boolean
        size = Number(size);
        weightCarat = Number(weightCarat);
        totalDiamonds = Number(totalDiamonds);

        if (isNaN(size) || isNaN(weightCarat) || isNaN(totalDiamonds)) {
            return res.status(400).json({ message: "Size, weightCarat, and totalDiamonds must be numbers" });
        }

        // Check if supplier exists
        const existingSupplier = await Supplier.findOne({ name: supplier });
        if (!existingSupplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        // Calculate Price
        const perDiamondPrice = calculateDiamondPrice(shape, color, clarity, weightCarat); 
        const purchasePrice = perDiamondPrice * weightCarat;  // Price for 1 diamond
        const totalPurchasePrice = purchasePrice * totalDiamonds; // Price for all diamonds

        const costPerCarat = purchasePrice / weightCarat;

        // Debugging Logs
        console.log("Purchase Price Per Diamond:", purchasePrice);
        console.log("Total Purchase Price:", totalPurchasePrice);
        console.log("Cost Per Carat:", costPerCarat);

        // Save the purchase
        const newPurchase = new PurchaseDiamond({
            supplier: existingSupplier._id,
            supplierContact,
            itemCode,
            lotNumber,
            shape,
            size,
            weightCarat,
            color,
            clarity,
            cutGrade,
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
        res.status(201).json({ message: "Diamond added to inventory!", purchase: newPurchase,totalPurchasePrice });

    } catch (error) {
        console.error("Error purchasing diamond:", error);
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