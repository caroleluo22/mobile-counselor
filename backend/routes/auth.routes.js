const router = require('express').Router();
const passport = require('passport');

// Route to initiate Google authentication
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // The permissions we ask from Google
}));

// Callback route that Google redirects to after user authentication
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login/failed', // Redirect to a failure page on the same server
        session: true
    }),
    (req, res) => {
        // Successful authentication!
        // The session is established. Now, save the session before redirecting.
        req.session.save(() => {
            // Redirect to the root of the server, which serves the frontend.
            res.redirect('/');
        });
    }
);

// A route to check if the user is logged in
router.get('/login/success', (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: 'user has successfully authenticated',
            user: req.user,
        });
    } else {
        res.status(401).json({ success: false, message: 'user failed to authenticate.' });
    }
});

// Route to log out the user
// Updated for passport v0.6.0+, which makes req.logout() asynchronous
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        // Redirect to the root of the server after logout.
        res.redirect('/');
    });
});

module.exports = router;