import passport from "../config/passport.js";

export const getHelloMessage = (req, res) => {

  const test = req.authInfo;

  res.json({ message: 'Authenticated user', user: req.user });
};
  