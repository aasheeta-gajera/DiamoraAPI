import express from "express";
import { registerUser,uploadCertificate,upload,verifyUser, loginUser, uploads, forgotPassword,resetPassword} from "../Controllers/userController.js";
import path from "path";
import { fileURLToPath } from 'url';

const userRouter = express.Router();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('public')); // Serve static files

app.get('/diamond.glb', (req, res) => {
  res.sendFile(path.join(__dirname, 'DiamondsModels/diamond.glb'));
});

app.listen(41455, () => {
  console.log('Server is running on http://127.0.0.1:41455');
});

userRouter.post('/register', registerUser);
userRouter.post('/verifyUser', verifyUser,(req, res) => {
  res.status(200).json({
    message: "User verified successfully",
    user: req.user
  });
});

userRouter.post('/login', loginUser);

userRouter.use('/uploads', uploads);

userRouter.post('/forgotPassword', forgotPassword);

userRouter.post('/resetPassword', resetPassword);

userRouter.post('/uploadCertificate',upload, uploadCertificate);

export default userRouter;


