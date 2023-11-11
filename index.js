import dotenv from 'dotenv';
import express from 'express';
import helloRoutes from "./routes/helloRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import './database.js'

const app = express();
dotenv.config();

// Middleware to parse JSON bodies
app.use(express.json());

//Routes definition
app.use('/', helloRoutes);
app.use('/user', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
