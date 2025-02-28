import express from "express";
import { registerUser, loginUser,getUsers,uploads ,forgotPassword,getSalesReport ,resetPassword,getAllPurchasedDiamonds,purchaseDiamond,sellDiamond} from "../Controllers/userConroller.js";
import userAuth from "../Middlewares/auth.js";

const userRouter = express.Router()

userRouter.post('/register' ,registerUser);
userRouter.post('/login' ,loginUser);
userRouter.use('/uploads',uploads);
userRouter.post('/forgotPassword' ,forgotPassword);
userRouter.post('/resetPassword' ,resetPassword);


userRouter.get('/getUsers' ,getUsers);


userRouter.post('/purchaseDiamond' ,purchaseDiamond);
userRouter.get('/getAllPurchasedDiamonds' ,getAllPurchasedDiamonds);


userRouter.post('/sellDiamond' ,sellDiamond);
userRouter.get('/getSalesReport' ,getSalesReport);

export default userRouter;

//http://localhost:4000/api/user/login
//http://localhost:4000/api/user/register
//http://localhost:4000/api/user/credits