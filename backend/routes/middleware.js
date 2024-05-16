const JWT_SECRET  = require("../config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // Check if the Authorization header exists and starts with 'Bearer '
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ error: "Unauthorized: Missing or invalid token" });
        }

        // Extract the token from the Authorization header
        const token = authHeader.split(' ')[1];

        // Verify the JWT token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach the user ID from the token to the request object
        req.userId = decoded.userId;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // Log the error for debugging
        console.error("JWT Verification Error:", err);
        return res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = {
    authMiddleware
};
