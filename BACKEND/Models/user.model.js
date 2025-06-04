import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() },
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
  terms_agreed: { type: Boolean },
  });
  
const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", userSchema);

export { User, Admin };
