const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.serializeUser((user, done) => {
    done(null, user.id); // user.id is the _id from MongoDB
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

const PORT = process.env.PORT || 5000;
const CALLBACK_URL = process.env.NODE_ENV === 'production' ? `https://your-production-domain.com/auth/google/callback` : `http://localhost:${PORT}/auth/google/callback`;

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        // proxy: true // No longer strictly necessary with an absolute URL
    }, async (accessToken, refreshToken, profile, done) => {
        // This function is called after the user logs in with Google
        try {
            // Check if user already exists in our DB
            let existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                // If they exist, call done with that user
                return done(null, existingUser);
            }

            // If not, create a new user in our DB
            const newUser = await new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value,
            }).save();
            
            done(null, newUser);
        } catch (error) {
            done(error, null);
        }
    })
);
