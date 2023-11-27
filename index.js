import dotenv from 'dotenv';
import express from 'express';
import helloRoutes from "./routes/helloRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
import './config/database.js'
import passport from './config/passport.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
dotenv.config();

const corsOptions = {
  origin: true, // replace with your frontend URL
  credentials: true, // to support cookies
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));

//Middlewares
app.use(express.json());
app.use(cookieParser())
app.use(passport.initialize({ authInfo: true }));

//Routes definition
app.use('/hello', helloRoutes);
app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
