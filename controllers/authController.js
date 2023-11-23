import User from '../models/userModel.js';
import isEmail from 'validator/lib/isEmail.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const dummyPasswordHash = bcrypt.hashSync('dummyPassword', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req, res) => {

    const { email, password } = req.body;

    try {
        // Find user by email or use a dummy user
        const user = await User.findOne({ email }) || { password: dummyPasswordHash };

        // Compare submitted password with stored hash (or dummy hash)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Send a generic error message
            return res.status(401).send('Invalid email or password');
        }

        const expirationTime = Math.floor(Date.now() / 1000) + 60;
        const jwtPayload = {
            iss: 'FileCrypt', // Issuer (your application)
            sub: user.shortId, // Subject (user's short ID)
            iat: Math.floor(Date.now() / 1000), // Issued At (current timestamp in seconds)
            exp: expirationTime // Expiration time (current timestamp + 900 seconds)
        };

        // Generate JWT token with the payload and your secret key
        const token = jwt.sign(jwtPayload, JWT_SECRET);

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).send('Server error');
    }

}