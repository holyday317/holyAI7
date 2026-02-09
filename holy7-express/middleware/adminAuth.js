const { authMiddleware } = require('./auth');

/**
 * 管理员权限验证中间件
 * 验证用户是否已登录且具有管理员权限
 */
const adminAuthMiddleware = (req, res, next) => {
  // 首先验证用户是否登录
  authMiddleware(req, res, () => {
    // 检查用户是否为管理员
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    next();
  });
};

/**
 * 可选的管理员权限验证中间件
 * 如果提供了 token，验证是否为管理员；如果没有提供，继续执行
 */
const optionalAdminAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'holy7-secret-key-2024';

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // 检查是否为管理员
    if (decoded.isAdmin) {
      req.isAdmin = true;
    }
  } catch (error) {
    // 忽略验证错误，继续执行
  }

  next();
};

module.exports = {
  adminAuthMiddleware,
  optionalAdminAuthMiddleware
};
