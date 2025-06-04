import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId , required: [true, "user_id is required"], unique: true },
    email: { type:  String, required: [true, "email is required"], unique: true },
    password: { 
      type: String, 
      required: [true, "Password is required"], 
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function(value) {
          return /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
        },
        message: "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character."
      }
    },
    mobile: { type: String, required: [true, "mobile is required"] },
    city: { type: String},
    address: { type: String },
    userType: { 
      type: String, 
      enum: ["admin", "customer"], // Only allow "admin" or "customer"
      default: "customer"
    },
    contact_name: { type: String, required: [true, "contact_name is required"] },
    id_proof: { type: String, required: [true, "id_proof is required"] },
    license_copy: { type: String},
    tax_certificate: { type: String },
    partner_copy: { type: String},
    references: [
      {
        name: { type: String, required: [true, "name is required"] },
        phone: { type: String, required: [true, "phone is required"] }
      }
    ],
    business_type: { type: [String], default: [] },
  terms_agreed: { type: Boolean }
  });
  

const User = mongoose.model("User", userSchema);
export default User;



// import mongoose from 'mongoose';

// const adminSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   contact_name: { type: String, required: true },
//   mobile: { type: String, required: true },
//   city: String,
//   address: String,
//   id_proof: { type: String, required: true },
//   license_copy: String,
//   tax_certificate: String,
//   partner_copy: String,
//   references: [
//     {
//       name: { type: String, required: true },
//       phone: { type: String, required: true }
//     }
//   ],
//   business_type: [String],
//   terms_agreed: Boolean,
//   userType: { type: String, default: 'admin' }
// });

// const customerSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   contact_name: { type: String, required: true },
//   mobile: { type: String, required: true },
//   city: String,
//   address: String,
//   id_proof: { type: String, required: true },
//   license_copy: String,
//   tax_certificate: String,
//   partner_copy: String,
//   references: [
//     {
//       name: { type: String, required: true },
//       phone: { type: String, required: true }
//     }
//   ],
//   business_type: [String],
//   terms_agreed: Boolean,
//   userType: { type: String, default: 'customer' }
// });

// const Admin = mongoose.model('Admin', adminSchema);
// const Customer = mongoose.model('Customer', customerSchema);

// export { Admin, Customer };



// export const registerUser = async (req, res) => {
//   try {
//     const {
//       email,
//       password,
//       contact_name,
//       mobile,
//       city,
//       address,
//       id_proof,
//       license_copy,
//       tax_certificate,
//       partner_copy,
//       references,
//       business_type,
//       terms_agreed,
//       userType
//     } = req.body;

//     // Check if user already exists in either collection
//     const existingAdmin = await Admin.findOne({ email });
//     const existingCustomer = await Customer.findOne({ email });

//     if (existingAdmin || existingCustomer) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userData = {
//       email,
//       password: hashedPassword,
//       contact_name,
//       mobile,
//       city,
//       address,
//       id_proof,
//       license_copy,
//       tax_certificate,
//       partner_copy,
//       references,
//       business_type,
//       terms_agreed,
//       userType
//     };

//     let newUser;
//     if (userType === 'admin') {
//       newUser = new Admin(userData);
//     } else {
//       newUser = new Customer(userData);
//     }

//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully', user: newUser });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error: ' + error.message });
//   }
// };
