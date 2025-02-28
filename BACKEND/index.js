import express from 'express'
import cors from 'cors';
import 'dotenv/config'
import connectDB from './Config/mongodb.js'
import userRouter from './Routs/userRoutes.js'

const PORT = process.env.PORT || 4000

const app = express()
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
await connectDB()


app.use('/api/user', userRouter)

app.get('/',(req,res)=>{
    res.send("API Working")
});

app.use(cors());

app.listen(PORT , ()=>
    console.log(`Server running on post ${PORT}`)
)

//Database :  Auth
//username  : aiGenerateImages  
//password : poiuytrewq 