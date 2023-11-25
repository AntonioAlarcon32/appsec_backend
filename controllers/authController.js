import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshTokenModel.js';

const dummyPasswordHash = bcrypt.hashSync('dummyPassword', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET= process.env.JWT_REFRESH_SECRET
const JWT_EXPIRATION_TIME = 600; // 60 seconds

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

        const expirationTime = Math.floor(Date.now() / 1000) + JWT_EXPIRATION_TIME;
        const jwtPayload = {
            iss: 'FileCrypt', // Issuer (your application)
            sub: user.shortId, // Subject (user's short ID)
            iat: Math.floor(Date.now() / 1000), // Issued At (current timestamp in seconds)
            exp: expirationTime // Expiration time (current timestamp + 900 seconds)
        };
        const refreshTokenPayload = {
            iss: 'FileCrypt', // Issuer (your application)
            sub: user.shortId,
            iat: Math.floor(Date.now() / 1000),
            type: 'refresh'
        };

        // Generate JWT token with the payload and your secret key
        const token = jwt.sign(jwtPayload, JWT_SECRET);
        const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET);
        const newToken = new RefreshToken({ payloadDgst: refreshToken , shortId: user.shortId});
        await newToken.save();
        res.status(200).json({ token: token, refreshToken: refreshToken });
    } catch (error) {
        res.status(500).send('Server error');
    }

}

export const refreshToken = async (req, res) => {
    const receivedToken = req.body.refreshToken;
    if (!receivedToken) {
        return res.status(401).send('No token provided');
    }
    try {
        //Check if token is valid
        const decodedToken = jwt.verify(receivedToken, JWT_REFRESH_SECRET);

        const { sub, iat, type } = decodedToken;

        //Check if token is of type refresh
        if (type !== 'refresh') {
            return res.status(403).send('Invalid token');
        }
        //Check if token is in database
        const storedToken = await RefreshToken.findOne({ shortId: sub });
        if (!storedToken) {
            return res.status(403).send('Invalid token');
        }
        //Check the hash of the payload is the same as the stored in the db
        const isMatch = await bcrypt.compare(receivedToken, storedToken.payloadDgst);
        if (!isMatch) {
            return res.status(403).send('Invalid token');
        }
        //Generate new token
        const expirationTime = Math.floor(Date.now() / 1000) + JWT_EXPIRATION_TIME;
        const jwtPayload = {
            iss: 'FileCrypt', // Issuer (your application)
            sub: sub, // Subject (user's short ID)
            iat: Math.floor(Date.now() / 1000), // Issued At (current timestamp in seconds)
            exp: expirationTime // Expiration time (current timestamp + 900 seconds)
        };
        const newToken = jwt.sign(jwtPayload, JWT_SECRET);
        res.status(200).json({ token: newToken });


    }
    catch (error) {
        return res.status(403).send('Invalid token');
    }


}