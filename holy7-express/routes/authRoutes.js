const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authMiddleware } = require('../middleware/auth');

/**
 * 用户注册
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 基本验证
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: '用户名至少需要 3 个字符'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少需要 6 个字符'
      });
    }

    // 创建用户
    const user = await User.create(username, password);

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    
    if (error.message === '用户名已存在') {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

/**
 * 用户登录
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 基本验证
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 查找用户
    const user = User.findByUsername(username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await User.verifyPassword(user, password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    User.updateLastLogin(user.id);

    // 生成 token
    const token = generateToken(user);

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

/**
 * 获取当前用户信息
 */
router.get('/user', authMiddleware, (req, res) => {
  try {
    const user = User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

/**
 * 用户登出
 */
router.post('/logout', authMiddleware, (req, res) => {
  // JWT 是无状态的，客户端删除 token 即可
  // 这里可以添加一些清理逻辑，比如记录登出时间等
  res.json({
    success: true,
    message: '登出成功'
  });
});

module.exports = router;
