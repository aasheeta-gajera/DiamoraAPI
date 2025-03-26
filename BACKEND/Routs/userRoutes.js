import express from "express";
import { registerUser, loginUser,getUsers,uploads ,forgotPassword,getSalesReport,getAllSuppliers,supplier ,resetPassword,getAllPurchasedDiamonds,purchaseDiamond,sellDiamond} from "../Controllers/userController.js";
import userAuth from "../Middlewares/auth.js";

const userRouter = express.Router()

//ngrok http 5000

userRouter.post('/register' ,registerUser);
userRouter.post('/login' ,loginUser);
userRouter.use('/uploads',uploads);
userRouter.post('/forgotPassword' ,forgotPassword);
userRouter.post('/resetPassword' ,resetPassword);
userRouter.post('/supplier' ,supplier);

userRouter.get('/getUsers',getUsers);
userRouter.get('/getAllSuppliers',getAllSuppliers);

userRouter.post('/purchaseDiamond' ,purchaseDiamond);
userRouter.get('/getAllPurchasedDiamonds' ,getAllPurchasedDiamonds);

userRouter.post('/sellDiamond' ,sellDiamond);
userRouter.get('/getSalesReport' ,getSalesReport);

export default userRouter;

//http://localhost:4000/api/user/login
//http://localhost:4000/api/user/register
//http://localhost:4000/api/user/credits