import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Token not found' });
        }

        try {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            if (!decodeToken) {
                return res.status(401).json({ message: 'Token not verified' });
            }
            // console.log(decodeToken);
            req.userId = decodeToken.userId;
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError' || jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }
            throw jwtError;
        }

    } catch (error) {
        // catch other errors
        console.error("isAuth error:", error);
        return res.status(500).json({ message: "Internal Server Error in Auth" });
    }
}

export default isAuth;