exports.loginSuccess = (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "User has successfully authenticated",
            user: req.user,
        });
    } else {
        res.status(401).json({
            success: false,
            message: "User is not authenticated",
        });
    }
};

exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session = null; // Destroy the session
        res.redirect(process.env.CLIENT_URL); // Redirect to frontend home
    });
};

exports.getProfile = (req, res) => {
    // req.user is available here thanks to the authMiddleware
    res.status(200).json({
        success: true,
        user: req.user
    });
};
