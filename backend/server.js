require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session'); // Changed from cookie-session
const passport = require('passport');
const authRoutes = require('./routes/auth.routes');
const path = require('path'); // Add the path module
require('./config/passport-setup'); // This will run the passport configuration

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy in front of the app. This is crucial for secure cookies in production.
// It allows Express to correctly determine the protocol (http vs https) from headers like X-Forwarded-Proto.
app.set('trust proxy', 1);

// Replaced cookie-session with express-session
app.use(session({
    secret: process.env.COOKIE_KEY, // Use the same secret
    resave: false,
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'lax' for localhost, 'none' for production
    }
  }));
  

app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use('/auth', authRoutes);

// --- Serve Frontend Static Files ---
// This serves your frontend's built files (HTML, CSS, JS, images, etc.)
// Adjust the path if your frontend 'build' folder is located elsewhere.
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// --- Catch-all route for Frontend ---
// This makes sure that if a user refreshes a page on a client-side route (e.g., /dashboard),
// the server sends the main index.html file, letting React Router handle the routing.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- Server Initialization ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
