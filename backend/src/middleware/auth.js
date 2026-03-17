const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.log('[Auth Middleware] ❌ No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id || decoded.userId, 
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    console.log('[Auth Middleware] ✅ User authenticated:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    console.error('[Auth Middleware] ❌ Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const checkVendorRole = (req, res, next) => {
  if (!req.user) {
    console.error('[Vendor Check] ❌ Authentication data missing');
    return res.status(500).json({ error: 'Authentication data missing' });
  }

  if (req.user.role !== 'VENDOR') {
    console.log(`[Vendor Check] ❌ User ${req.user.id} (${req.user.role}) attempted vendor access`);
    return res.status(403).json({ error: 'Forbidden. Access requires Vendor role' });
  }

  console.log(`[Vendor Check] ✅ Vendor ${req.user.id} authorized`);
  next();
};

module.exports = {
  authenticateToken,
  checkVendorRole
};