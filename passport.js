import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET; // Replace with your actual secret key

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const currentTime = Date.now() / 1000;
        if (jwt_payload.exp <= currentTime) {
          // Instead of returning false, call done with an error
          return done({ message: 'Token has expired' }, false);
        }
  
        const user = await User.findOne({ shortId: jwt_payload.sub });
        if (user) {
          return done(null, user);
        } else {
          // Instead of returning false, call done with an error
          return done({ message: 'User not found' }, false);
        }
      } catch (error) {
        // Call done with an error
        return done(error, false);
      }
    })
  );
export default passport;
