module.exports = function(roles) {
    return function(req, res, next) {
        // Ensure user obj exists (should if auth middleware ran first)
        if (!req.user || !req.user.role) {
            return res.status(401).json({ msg: 'Not authorized, no role found' });
        }

        // Check if the user's role is included in the allowed roles array
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Access denied: insufficient permissions' });
        }

        next();
    };
};
