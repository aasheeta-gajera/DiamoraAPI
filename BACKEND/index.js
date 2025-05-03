import express from 'express'
import cors from 'cors';
import 'dotenv/config'
import connectDB from './Config/mongodb.js'
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from 'path';
import userRouter from './Routs/userRoutes.js'

const PORT = process.env.PORT || 4000

const app = express()
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
await connectDB()

app.use('/invoices', express.static(path.join(process.cwd(), 'invoices')));

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Daimora API',
        version: '1.0.0',
        description: 'API docs for the Daimora app',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      servers: [
        {
          url: 'http://localhost:5000',
        },
      ],
    },
    apis: ['./Routs/userRoutes.js'],
  };
  
  const swaggerSpec = swaggerJsdoc(options);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));  

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