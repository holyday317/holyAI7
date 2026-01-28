const jwt = require('jsonwebtoken');

// JWT 密钥（在生产环境中应该从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'holy7-secret-key-2024';

/**
 * 验证 JWT Token 的中间件
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 提取 token
    const token = authHeader.substring(7);

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 将用户信息添加到请求对象
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌'
      });
    } else {
      console.error('认证错误:', error);
      return res.status(500).json({
        success: false,
        message: '认证失败'
      });
    }
  }
};

/**
 * 可选的认证中间件（不强制要求登录）
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不阻塞请求
    next();
  }
};

/**
 * 生成 JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    JWT_SECRET,
    {
      expiresIn: '7d' // Token 有效期 7 天
    }
  );
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  generateToken
};
