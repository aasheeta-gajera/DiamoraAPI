// import express from "express";
// import { registerUser, AddToCart,loginUser,getUsers,uploads ,forgotPassword,getSalesReport,getAllSuppliers,supplier ,resetPassword,getAllPurchasedDiamonds,purchaseDiamond,sellDiamond} from "../Controllers/userController.js";
// import userAuth from "../Middlewares/auth.js";

// const userRouter = express.Router()

// //ngrok http 5000
//http://localhost:5000/api-docs

// userRouter.post('/register' ,registerUser);
// userRouter.post('/login' ,loginUser);
// userRouter.use('/uploads',uploads);
// userRouter.post('/forgotPassword' ,forgotPassword);
// userRouter.post('/resetPassword' ,resetPassword);
// userRouter.post('/supplier' ,supplier);

// userRouter.get('/getUsers',getUsers);
// userRouter.get('/getAllSuppliers',getAllSuppliers);

// userRouter.post('/purchaseDiamond' ,purchaseDiamond);
// userRouter.get('/getAllPurchasedDiamonds' ,getAllPurchasedDiamonds);

// userRouter.get('/addtocart' ,AddToCart);
// userRouter.post('/sellDiamond' ,sellDiamond);
// userRouter.get('/getSalesReport' ,getSalesReport);

// export default userRouter;

// //http://localhost:4000/api/user/login
// //http://localhost:4000/api/user/register
// //http://localhost:4000/api/user/credits




import express from "express";
import { registerUser,removeCard,getAllCartItems, AddToCart, loginUser, getUsers, uploads, forgotPassword, getSalesReport, getAllSuppliers, supplier, resetPassword, getAllPurchasedDiamonds, purchaseDiamond, sellDiamond } from "../Controllers/userController.js";
import userAuth from "../Middlewares/auth.js";

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User operations
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: mysecretpassword
 *     responses:
 *       200:
 *         description: User registered
 */
userRouter.post('/register', registerUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: yourpassword
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
userRouter.post('/login', loginUser);


userRouter.use('/uploads', uploads);

/**
 * @swagger
 * /api/user/forgotPassword:
 *   post:
 *     summary: Forgot password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 */

userRouter.post('/forgotPassword', forgotPassword);

/**
 * @swagger
 * /api/user/resetPassword:
 *   post:
 *     summary: Reset password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: reset-token-123
 *               newPassword:
 *                 type: string
 *                 example: newsecurepassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 */

userRouter.post('/resetPassword', resetPassword);

/**
 * @swagger
 * /api/user/supplier:
 *   post:
 *     summary: Add a new supplier
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contact
 *             properties:
 *               name:
 *                 type: string
 *                 example: ABC Diamonds
 *               contact:
 *                 type: string
 *                 example: +91-9876543210
 *     responses:
 *       200:
 *         description: Supplier added
 */

userRouter.post('/supplier', supplier);

/**
 * @swagger
 * /api/user/getUsers:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 */
userRouter.get('/getUsers', getUsers);

/**
 * @swagger
 * /api/user/getAllSuppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [User]
 */
userRouter.get('/getAllSuppliers', getAllSuppliers);

/**
 * @swagger
 * /api/user/purchaseDiamond:
 *   post:
 *     summary: Purchase a diamond
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - diamondDetails
 *             properties:
 *               supplierId:
 *                 type: string
 *                 example: 641e0c1234abcdef
 *               diamondDetails:
 *                 type: object
 *                 properties:
 *                   shape:
 *                     type: string
 *                     example: Round
 *                   size:
 *                     type: number
 *                     example: 1.2
 *                   color:
 *                     type: string
 *                     example: D
 *                   price:
 *                     type: number
 *                     example: 10000
 *     responses:
 *       200:
 *         description: Diamond purchased
 */

userRouter.post('/purchaseDiamond', purchaseDiamond);

/**
 * @swagger
 * /api/user/getAllPurchasedDiamonds:
 *   get:
 *     summary: Get all purchased diamonds
 *     tags: [User]
 */
userRouter.get('/getAllPurchasedDiamonds', getAllPurchasedDiamonds);

/**
 * @swagger
 * /api/user/addtocart:
 *   post:
 *     summary: Add diamond to user's cart
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - diamondId
 *               - quantity
 *             properties:
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user
 *                 example: 661011a2f6a77a2d34d3c541
 *               diamondId:
 *                 type: string
 *                 description: MongoDB ObjectId of the diamond
 *                 example: 660fc8f3c5e1234567890abc
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the diamond to add
 *                 example: 2
 *     responses:
 *       200:
 *         description: Diamond added to cart successfully
 *       400:
 *         description: Invalid data provided
 *       500:
 *         description: Server error
 */
userRouter.post('/addtocart', AddToCart);
/**
 * @swagger
 * /api/user/sellDiamond:
 *   post:
 *     summary: Sell a diamond
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - diamondId
 *               - customerId
 *             properties:
 *               diamondId:
 *                 type: string
 *                 example: 641e0c1234abcdef
 *               customerId:
 *                 type: string
 *                 example: 648fa2b1234abcdef
 *               sellingPrice:
 *                 type: number
 *                 example: 12000
 *     responses:
 *       200:
 *         description: Diamond sold
 */

userRouter.post('/sellDiamond', sellDiamond);

/**
 * @swagger
 * /api/user/getSalesReport:
 *   get:
 *     summary: Get sales report
 *     tags: [User]
 */
userRouter.get('/getSalesReport', getSalesReport);

userRouter.get("/cartDiamonds", getAllCartItems); 

userRouter.delete("/cartDiamonds/:id", removeCard); 

export default userRouter;
