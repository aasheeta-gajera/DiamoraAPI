import {User,Admin} from "../Models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import path from "path";
import express from "express";
import { writeFileSync } from "fs";
import multer from 'multer';
import Tesseract from 'tesseract.js';

const SECRET_KEY = "aasheeta#p"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const registerUser = async (req, res) => {
    try {
      const { password, email, mobile, city,address,userType, contact_name, references, id_proof,  license_copy, tax_certificate, partner_copy,terms_agreed,business_type,
        paymentStatus, // Optional, will default to 'Pending'
            paymentMethod,
            transactionId,
       } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).send({ message: "User already exists" });

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).send({
          status: "error",
          message: "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.",
        });
      }
  
      if (!id_proof) {
        return res.status(400).send({
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
  
      
      const ModelToUse = userType === "admin" ? Admin : User;

      const newUser = new ModelToUse({
        // user_id: new mongoose.Types.ObjectId(),
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
        references: parsedReferences,
        paymentStatus, // Optional, will default to 'Pending'
            paymentMethod,
            transactionId,
      });
  
      const savedUser = await newUser.save();
  
      // Generate Token
      const token = jwt.sign(
        { user_id: savedUser.user_id, email: savedUser.email },
        SECRET_KEY,
      );
  
      res.status(201).send({ 
        message: "User registered successfully!", 
        token, 
        user:savedUser
      });
  
    } catch (error) {
      res.status(500).send({ message: error.message +'Error' });
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
      res.status(200).send({
        message: "Login successful!",
        token,
        user
      });
  
    } catch (error) {
      res.status(500).send({ message: error.message + " Error" });
    }
  };
  

  export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).send({ message: "User not found" });
  
      // Generate password reset token (valid for 10 mins)
      const resetToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: "10m" });
  
      // In a real app, send this token via email (Nodemailer)
      // Example: sendEmail(user.email, `Your reset token: ${resetToken}`);
  
      res.status(200).send({ 
        message: "Password reset token sent to email.",
        resetToken // In real use case, don't return this in response
      });
  
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
  

export const resetPassword = async (req, res) => {
      try {
        const { token, newPassword } = req.body;
    
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded) return res.status(400).send({ message: "Invalid or expired token" });
    
        // Find user by email in decoded token
        const user = await User.findOne({ email: decoded.email });
        if (!user) return res.status(400).send({ message: "User not found" });
    
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
    
        // Update user's password
        user.password = hashedPassword;
        await user.save();
    
        res.status(200).send({ message: "Password reset successful. You can now log in." });
    
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Folder to store files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Generate unique file names
  }
});

export const upload = multer({ storage: storage }).single('certificate');

export const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No certificate file uploaded.' });
    }

    const imagePath = req.file.path;

    // Run OCR to extract text from the image
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => console.log(m),  // Optional: Show progress logs
    });

    const extractedText = result.data.text;

    // Check if it contains the required keywords
    const isPartnership = extractedText.includes('Partnership Certificate') &&
                          extractedText.includes('Daimora');

    // Send response based on whether it is a partnership certificate
    res.send({ isPartnershipCertificate: isPartnership });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error processing certificate' });
  }
};
