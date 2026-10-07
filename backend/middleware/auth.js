import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'news_aggregator_jwt_secret_dev_key';

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is missing. Using default fallback key for development.');
}

/**
 * Authentication Middleware
 * Validates JWT token in Authorization header (Bearer token)
 * Attaches user information to req.user
 */
export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Authorization token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
};

export default authenticateUser;
