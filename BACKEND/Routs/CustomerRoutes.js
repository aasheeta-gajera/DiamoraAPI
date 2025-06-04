import express from "express";
import { generateBill,removeCart,getAllCartItems, getSoldDiamonds,AddToCart, getUsers, getSalesReport, sellDiamond } from "../Controllers/CustomerController.js";

const customerRouter = express.Router();

customerRouter.get('/getUsers', getUsers);

customerRouter.post('/sellDiamond', sellDiamond);

customerRouter.get("/getSoldDiamonds", getSoldDiamonds);

customerRouter.post('/addtocart', AddToCart);

customerRouter.get("/cartDiamonds", getAllCartItems); 

customerRouter.delete("/cartDiamonds/:diamondId", removeCart); 

customerRouter.get('/getSalesReport', getSalesReport);

customerRouter.get('/generate-bill/:saleId', generateBill);

export default customerRouter;