import User from '../models/userModel.js';
import isEmail from 'validator/lib/isEmail.js';
import bcrypt from 'bcrypt';

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

        // User authenticated, manage session here

        res.status(200).send('Login successful');
    } catch (error) {
        res.status(500).send('Server error');
    }

}