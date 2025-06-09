import {User,Admin} from "../Models/user.model.js";
import PurchaseDiamond from "../Models/purchaseDiamond.model.js";
import Cart from "../Models/Cart.model.js";
import Diamond from "../Models/Diamond.model.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

  export const getUsers = async (req, res) => {
    try {
      const users = await User.find().select("-password"); // Excluding passwords from response
      res.status(200).send({ users });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
  
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
        return res.status(400).send({ message: "Invalid input" });
      }
  
      // Find the purchased diamond
      const purchasedDiamond = await PurchaseDiamond.findOne({ itemCode });
  
      if (!purchasedDiamond || purchasedDiamond.totalDiamonds < quantity) {
        return res.status(404).send({ message: "Not enough stock" });
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
          purchasePrice: purchasedDiamond.purchasePrice,
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
  
      res.status(201).send({
        message: "Diamond sold successfully!",
        totlePrice,
        profitOrLossUSD
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error: " + error.message });
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
      res.status(200).send({ soldDiamonds: formattedSoldDiamonds });
    } catch (error) {
      res.status(500).send({ message: "Server error: " + error.message });
    }
};

export const AddToCart = async (req, res) => {
  try {
    const { userId, itemCode, quantity } = req.body;

    if (!userId || !itemCode || quantity <= 0) {
      return res.status(400).send({ message: "Invalid data provided" });
    }

    const diamond = await PurchaseDiamond.findOne({ itemCode });

    if (!diamond) {
      return res.status(404).send({ message: "Diamond not found" });
    }

    if (diamond.totalDiamonds < quantity) {
      return res.status(400).send({ message: "Insufficient stock available" });
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

    res.status(200).send({ message: "Diamond added to cart", cart: cartItem, diamond });
  } catch (error) {
    res.status(500).send({ message: "Server error: " + error.message });
  }
};

export const getAllCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.find().lean(); // lean() makes plain JS object

    if (cartItems.length === 0) {
      return res.status(404).send({ message: "No items found in the cart" });
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

    res.status(200).send({ cartItems: enrichedCart });
  } catch (error) {
    res.status(500).send({ message: "Server error: " + error.message });
  }
};

export const removeCart = async (req, res) => {
  const { diamondId } = req.params;
  console.log("Received diamondId:", diamondId); 

  try {
    const cartItem = await Cart.findById(diamondId);
    if (!cartItem) {
      return res.status(404).send({ message: "Cart item not found" });
    }

    const { itemCode, quantity } = cartItem;

    const diamond = await PurchaseDiamond.findOne({ itemCode });
    if (diamond) {
      diamond.totalDiamonds += quantity;
      diamond.status = "In Stock";
      await diamond.save();
    }

    const deletedItem = await Cart.findByIdAndDelete(diamondId);  // Corrected line

    res.status(200).send({ message: "Diamond removed from cart and restored to inventory", deletedItem });
  } catch (error) {
    res.status(500).send({ message: "Error removing diamond from cart", error: error.message });
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

      res.status(200).send({
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
      res.status(500).send({ message: error.message });
  }
};

export const generateBill = async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await Diamond.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    if (!fs.existsSync('./invoices')) {
      fs.mkdirSync('./invoices');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const fileName = `invoice_${sale.itemCode}.pdf`;
    const filePath = `./invoices/${fileName}`;

    doc.pipe(fs.createWriteStream(filePath));

    // Logo at the top
    const logoPath = path.resolve('assets', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoWidth = 80;
      const centerX = (doc.page.width - logoWidth) / 2;
      doc.image(logoPath, centerX, 30, { width: logoWidth });
    }

    doc.moveDown(6);

    doc
      .fontSize(22)
      .fillColor('#333333')
      .text("DAIMORA - Diamond Invoice", { align: "center" });

    doc.moveDown(1.5);

    const saleDate = sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A';
    doc
      .fontSize(12)
      .fillColor('black')
      .text(`Sale Date: ${saleDate}`, { align: "center" });

    doc.moveDown(2);

    // === Customer Details Section ===
    doc
      .fontSize(14)
      .text("Customer Information", { underline: true, align: "center" });

    doc.moveDown(0.8);

    doc
      .fontSize(12)
      .text(`Name: ${sale.customerName ?? 'N/A'}`, { align: "center" })
      .moveDown(0.3)
      .text(`Mobile: ${sale.mobile ?? 'N/A'}`, { align: "center" })
      .moveDown(0.3)
      .text(`Email: ${sale.email ?? 'N/A'}`, { align: "center" });

    doc.moveDown(3);

// === Diamond Info Table ===
doc
  .fontSize(14)
  .text("Diamond Info", { underline: true, align: "center" });

doc.moveDown(0.8);

const tableTop = doc.y;
const margin = 50;
const pageWidth = doc.page.width;
const usableWidth = pageWidth - margin * 2;
const colWidth = usableWidth / 6;

// Headers
doc
  .fontSize(11)
  .text("Item Code", margin + colWidth * 0, tableTop, { width: colWidth, align: "center" })
  .text("Shape / Cut", margin + colWidth * 1, tableTop, { width: colWidth, align: "center" })
  .text("Carat", margin + colWidth * 2, tableTop, { width: colWidth, align: "center" })
  .text("Clarity", margin + colWidth * 3, tableTop, { width: colWidth, align: "center" })
  .text("Color", margin + colWidth * 4, tableTop, { width: colWidth, align: "center" })
  .text("Price (₹)", margin + colWidth * 5, tableTop, { width: colWidth, align: "center" });

doc
  .moveTo(margin, tableTop + 15)
  .lineTo(pageWidth - margin, tableTop + 15)
  .stroke();

// Data row
const rowY = tableTop + 25;

doc
  .fontSize(11)
  .text(sale.itemCode ?? 'N/A', margin + colWidth * 0, rowY, { width: colWidth, align: "center" })
  .text(sale.shapeCut ?? 'N/A', margin + colWidth * 1, rowY, { width: colWidth, align: "center" })
  .text(sale.carat ?? 'N/A', margin + colWidth * 2, rowY, { width: colWidth, align: "center" })
  .text(sale.clarity ?? 'N/A', margin + colWidth * 3, rowY, { width: colWidth, align: "center" })
  .text(sale.color ?? 'N/A', margin + colWidth * 4, rowY, { width: colWidth, align: "center" })
  .text(`₹${Number(sale.purchasePrice ?? 0).toFixed(2)}`, margin + colWidth * 5, rowY, { width: colWidth, align: "center" });

doc.moveDown(5);


    const basePrice = Number(sale.purchasePrice ?? 0);
    const gst = basePrice * 0.18;
    const totalWithGst = basePrice + gst;

    doc
      .fontSize(12)
      .text(`GST (18%): ₹${gst.toFixed(2)}`, { align: "right" })
      .moveDown(0.5)
      .fontSize(14)
      .text(`Total Amount: ₹${totalWithGst.toFixed(2)}`, { align: "right" });

      doc
      .fontSize(10)
      .fillColor('gray')
      .text("Thank you for shopping with", { align: "center" })
      .text("Daimora!", { align: "center" })
      .text("www.daimora.com |", { align: "center" })
      .text("support@daimora.com", { align: "center" });

    doc.end();

    res.status(200).json({ message: "Invoice generated", path: filePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};
