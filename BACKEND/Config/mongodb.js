import mongoose from "mongoose";
import 'dotenv/config';

const connectDB = async ()=>{
    mongoose.connection.on('Connected' ,()=>{
        console.log("Database Connected");
    })
    await mongoose.connect(`${process.env.MONGODB_URI_WEB}`)
    // await mongoose.connect("mongodb+srv://aiGenerateImages:poiuytrewq@cluster0.zapn6.mongodb.net/AiImages")
}

export default connectDB;