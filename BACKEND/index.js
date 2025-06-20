  import express from 'express'
  import cors from 'cors';
  import 'dotenv/config'
  import connectDB from './Config/mongodb.js'
  import swaggerUi from "swagger-ui-express";
  import swaggerJsdoc from "swagger-jsdoc";
  import path from 'path';
  import userRouter from './Routs/userRoutes.js'
  import adminRouter from './Routs/AdminRoutes.js'
  import customerRouter from './Routs/CustomerRoutes.js'
  import ReportRouter from './Routs/ReportsRouts.js';
  import { decryptRequestMiddleware, encryptResponseMiddleware } from './Utils/encryptionMiddleware.js';

  const PORT = process.env.PORT || 3000

  // ngrok http 5000

  const app = express()

  app.use(cors());

  app.use(express.json({ limit: "50mb" })); 
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  await connectDB()

  app.use(decryptRequestMiddleware);

app.use('/invoices', express.static(path.resolve('invoices')));

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
    
  app.use(encryptResponseMiddleware);

  //https://api.diamora.com/api

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));  

  app.use('/diamora/api/Auth', userRouter)
  app.use('/diamora/api/Admin', adminRouter)
  app.use('/diamora/api/Customer', customerRouter)
  app.use('/diamora/api/Report', ReportRouter)


  app.listen(PORT , ()=>
      console.log(`Server running on post ${PORT}`)
  )

  //Database :  Auth
  //username  : aiGenerateImages  
  //password : poiuytrewq