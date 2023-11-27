import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import dotenv from 'dotenv';


dotenv.config();
const jwtSecret = process.env.JWT_SECRET; // Replace with your actual secret key
const BACKEND_URL = process.env.BACKEND_URL;

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
// Google OAuth Strategy
const googleClientID = process.env.GOOGLE_CLIENT_ID; 
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET; 

async function findOrCreateUser(profile) {
  try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email: email });

      if (user) {
          // User exists, update fields if necessary
          user.googleId = profile.id; // Update Google ID in case it's not set
          await user.save();
      } else {
          // If user does not exist, create a new one
          user = new User({
              googleId: profile.id,
              username: profile.displayName,
              email: email,
              signupMethod: 'google'
          });
          await user.save();
      }
      return user;
  } catch (error) {
      throw error;
  }
}

passport.use(new GoogleStrategy({
  clientID: googleClientID,
  clientSecret: googleClientSecret,
  callbackURL: BACKEND_URL + "/auth/google/callback" // Adjust this as per your setup
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser(profile);
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}
));

export default passport;
