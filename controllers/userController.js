import User from '../models/userModel.js';
import isEmail from 'validator/lib/isEmail.js';

export const registerUser = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validate the email format
    if (!isEmail(email)) {
      return res.status(400).send({ error: 'Invalid email format' });
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).send({ error: 'Passwords do not match' });
    }

    // Create a new user
    const user = new User(req.body);
    user.signupMethod = 'local';
    await user.save();
    res.status(201).send(User.createUserDTO(user));
  } catch (error) {
    res.status(500).send(error);
  }
};
