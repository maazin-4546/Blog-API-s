const jwt = require("jsonwebtoken");
const User = require("../models/User");


const authorize = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).send({
                    success: false,
                    message: 'Access denied. No token provided.'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(decoded.userId)

            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: 'No user Found'
                });
            }

            if (user.status == "inactive" || user.status == "banned") {
                return res.status(403).send({
                    success: false,
                    message: 'User is inactive or banned by Admin.'
                });
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return res.status(403).send({
                    success: false,
                    message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
                });
            }

            req.user = user
            next()


        } catch (error) {
            console.log(error.message)
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
                error: error.message
            })
        }
    }
}


module.exports = authorize;