import dotenv from 'dotenv';
import express from 'express';
import helloRoutes from "./routes/helloRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import './database.js'
import passport from './passport.js';

const app = express();
dotenv.config();

// Middleware to parse JSON bodies
app.use(express.json());

app.use(passport.initialize({ authInfo: true }));

//Routes definition
app.use('/', helloRoutes);
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
