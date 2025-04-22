🚀 Daimora API
Daimora is a web and mobile application built to facilitate the buying and selling of diamonds. The API backend is built with Express and Node.js, which communicates with a MongoDB database to manage diamond inventory, orders, and user interactions.

🌟 Features
🛒 Diamond Management – Manage diamond inventory, including details such as size, shape, color, and certification.

📦 User Orders – Allows users to place orders for diamonds, check order status, and make payments.

💎 Advanced Search – Search diamonds based on criteria like shape, size, and color.

📈 Reports – Admins can generate daily sales reports and track inventory.

🛡️ User Authentication – Users and Admins can register, login, and manage profiles.

⚙️ Admin Dashboard – Manage inventory, customer orders, and sales reports.

🖼️ Preview
📱 Mobile App Screenshots
Mobile App Preview is available via Flutter's mobile client (details in the Flutter App README).

🔧 Tech Stack
💻 Backend (API)
Node.js + Express.js (for building the API)

MongoDB (NoSQL database for managing diamond data, orders, etc.)

JWT (JSON Web Tokens) for user authentication

Mongoose (ODM for MongoDB to interact with the database)

Bcrypt.js (for password hashing)

Nodemailer (for email notifications)

Swagger (for API documentation)

📱 Frontend
Flutter for cross-platform mobile app development

Provider / BLoC for state management

Firebase Authentication (optional, for user auth)

just_audio or audioplayers (for media functionality)

🚀 Getting Started
📦 API Installation
1 Clone the repository:
git clone https://github.com/<your-username>/daimora-api.git
cd daimora-api

2 Install dependencies:
npm install

3 Set up environment variables:

Create a .env file in the root of your project and set up the necessary configuration, such as:

DB_URI=""
JWT_SECRET=your-jwt-secret
MAILER_USER=your-email@gmail.com
MAILER_PASS=your-email-password

4 Start the API server:
npm start


📝 API Endpoints
Authentication
POST /api/auth/register – Register a new user.

POST /api/auth/login – Log in with your credentials.

Diamond Inventory
GET /api/diamonds – Retrieve a list of diamonds.

GET /api/diamonds/:id – Retrieve a specific diamond by ID.

POST /api/diamonds – Add a new diamond to the inventory.

PUT /api/diamonds/:id – Update diamond details.

DELETE /api/diamonds/:id – Delete a diamond from the inventory.

Orders
POST /api/orders – Create a new order.

GET /api/orders/:id – Retrieve order details by order ID.

GET /api/orders – Get a list of all orders.

Admin
GET /api/admin/reports – Generate daily sales and inventory reports.

PUT /api/admin/diamonds/:id – Admin updates diamond inventory.

📚 API Documentation
For a detailed view of all the available endpoints and their request parameters, visit the Swagger UI:

Swagger Documentation: API Documentation

🛠️ Troubleshooting
CORS Issues: If you're facing CORS issues while calling the API from a frontend application, make sure to add CORS middleware in Express.

JWT Token Expiration: Ensure your token isn't expired while making API requests. Tokens typically expire after 24 hours (or as configured).

