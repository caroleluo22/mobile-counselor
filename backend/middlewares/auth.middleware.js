exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // isAuthenticated() is a Passport.js function
        return next();
    }
    res.status(401).json({
        success: false,
        message: "Unauthorized: You must be logged in to access this resource."
    });
};
