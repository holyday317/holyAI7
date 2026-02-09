# 安全审计报告 - 越权漏洞分析

## 审计日期
2026-02-09

## 严重程度
🔴 **高危 - 存在严重越权漏洞**

---

## 🔴 严重漏洞：管理接口完全无权限控制

### 问题描述
[`adminRoutes.js`](holy7-express/routes/adminRoutes.js) 中的所有管理接口都没有使用 [`authMiddleware`](holy7-express/middleware/auth.js:9) 进行认证，也没有管理员权限检查。

### 受影响的接口
- `GET /api/admin/tables` - 获取所有表名
- `GET /api/admin/stats` - 获取数据库统计信息
- `GET /api/admin/tables/:table/schema` - 获取表结构
- `GET /api/admin/tables/:table/data` - 获取表数据（可遍历所有表）
- `GET /api/admin/tables/:table/search` - 搜索记录
- `GET /api/admin/tables/:table/records/:id` - 获取任意记录
- `POST /api/admin/tables/:table/records` - 创建记录
- `PUT /api/admin/tables/:table/records/:id` - 更新任意记录
- `DELETE /api/admin/tables/:table/records/:id` - 删除任意记录
- `GET /api/admin/users` - 获取所有用户列表
- `GET /api/admin/users/:id` - 获取任意用户详情
- `DELETE /api/admin/users/:id` - 删除任意用户
- `GET /api/admin/users/:userId/conversations` - 获取任意用户的会话
- `GET /api/admin/conversations` - 获取所有会话
- `GET /api/admin/conversations/:id` - 获取任意会话详情
- `GET /api/admin/conversations/:id/chats` - 获取任意会话的聊天记录
- `DELETE /api/admin/conversations/:id` - 删除任意会话
- `GET /api/admin/bookmarks` - 获取所有书签
- `DELETE /api/admin/bookmarks/:id` - 删除任意书签

### 风险等级
🔴 **极高风险**

### 攻击场景
1. **未授权访问**：任何未登录的用户都可以访问所有管理接口
2. **数据泄露**：攻击者可以查看所有用户的敏感数据（聊天记录、问卷等）
3. **数据篡改**：攻击者可以修改、删除任何数据
4. **权限提升**：普通用户可以通过管理接口提升自己的权限

### 代码位置
[`holy7-express/routes/adminRoutes.js:1-73`](holy7-express/routes/adminRoutes.js:1-73)

### 修复方案
1. 在所有管理接口上添加 `authMiddleware`
2. 创建管理员权限中间件，检查用户是否为管理员
3. 在数据库中添加用户角色字段（admin/user）
4. 只允许管理员用户访问管理接口

---

## 🔴 严重漏洞：聊天接口缺少权限控制

### 问题描述
[`chatRoutes.js`](holy7-express/routes/chatRoutes.js) 中的 `/api/ai/chat` 接口没有使用 [`authMiddleware`](holy7-express/middleware/auth.js:9)，未登录用户也可以调用 AI 聊天功能。

### 受影响的接口
- `POST /api/ai/chat` - AI 聊天接口

### 风险等级
🔴 **高风险**

### 攻击场景
1. 匿名用户可以无限制调用 AI 接口，造成资源滥用
2. 无法追踪聊天记录到具体用户
3. 可能导致 API 成本增加

### 代码位置
[`holy7-express/routes/chatRoutes.js:6`](holy7-express/routes/chatRoutes.js:6)

### 修复方案
为聊天接口添加 `authMiddleware` 中间件，确保只有登录用户可以调用。

---

## ⚠️ 中等风险：会话权限检查不完整

### 问题描述
在 [`conversationRoutes.js`](holy7-express/routes/conversationRoutes.js) 中，部分接口只检查了会话是否存在，但没有严格验证会话是否属于当前用户。

### 受影响的接口
- `GET /api/conversations/:id/chats` - 获取会话聊天记录

### 代码位置
[`holy7-express/routes/conversationRoutes.js:131-151`](holy7-express/routes/conversationRoutes.js:131-151)

### 风险等级
🟡 **中等风险**

### 攻击场景
用户可以通过遍历会话 ID 来查看其他用户的聊天记录。

### 修复方案
在获取会话聊天记录时，验证会话的 `user_id` 是否等于当前用户的 `id`。

---

## ✅ 正确实现的安全控制

以下接口实现了正确的权限控制：

1. **会话路由** ([`conversationRoutes.js`](holy7-express/routes/conversationRoutes.js))
   - ✅ 更新会话标题时检查权限（第 67 行）
   - ✅ 删除会话时检查权限（第 102 行）

2. **书签路由** ([`bookmarkRoutes.js`](holy7-express/routes/bookmarkRoutes.js))
   - ✅ 获取书签时使用 `authMiddleware`（第 10 行）
   - ✅ 创建书签时验证 userId（第 38 行）
   - ✅ 更新书签时检查所有权（第 90 行）
   - ✅ 删除书签时检查所有权（第 125 行）

3. **问卷路由** ([`questionnaireRoutes.js`](holy7-express/routes/questionnaireRoutes.js))
   - ✅ 获取问卷详情时检查所有权（第 62-66 行）
   - ✅ 删除问卷时检查所有权（第 150-154 行）

---

## 📋 修复建议优先级

### 立即修复（P0）
1. 为所有 `/api/admin/*` 接口添加认证和权限控制
2. 为 `/api/ai/chat` 接口添加认证

### 尽快修复（P1）
3. 完善 `/api/conversations/:id/chats` 的权限检查

### 建议改进（P2）
4. 实现基于角色的访问控制（RBAC）
5. 添加操作日志，记录管理操作
6. 实现速率限制，防止 API 滥用

---

## 🔧 具体修复代码示例

### 1. 创建管理员权限中间件

在 `holy7-express/middleware/` 目录下创建 `adminAuth.js`：

```javascript
const { authMiddleware } = require('./auth');

/**
 * 管理员权限验证中间件
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

module.exports = {
  adminAuthMiddleware
};
```

### 2. 修复 adminRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { adminAuthMiddleware } = require('../middleware/adminAuth');

// 所有管理接口都需要管理员权限
router.get('/tables', adminAuthMiddleware, AdminController.getTables);
router.get('/stats', adminAuthMiddleware, AdminController.getStats);
// ... 其他所有接口都需要添加 adminAuthMiddleware
```

### 3. 修复 chatRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');

// AI 聊天接口需要认证
router.post('/chat', authMiddleware, chatController.chatWithAI);

// 其他接口保持不变
router.get('/models', chatController.getModels);
router.get('/prompts', chatController.getPromptTypes);
router.get('/health', chatController.healthCheck);
```

### 4. 完善 conversationRoutes.js 的权限检查

```javascript
router.get('/:id/chats', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 先检查会话是否属于当前用户
    const conversation = Conversation.findById(id, userId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: '会话不存在或无权访问'
      });
    }

    const chats = Conversation.getChats(id, userId);
    // ...
  } catch (error) {
    // ...
  }
});
```

---

## 📊 漏洞统计

| 严重程度 | 数量 | 接口 |
|---------|------|------|
| 🔴 极高风险 | 20+ | 所有 `/api/admin/*` 接口 |
| 🔴 高风险 | 1 | `/api/ai/chat` |
| 🟡 中等风险 | 1 | `/api/conversations/:id/chats` |
| ✅ 安全 | 15+ | 其他接口 |

---

## 总结

当前系统存在严重的越权漏洞，**任何用户都可以访问管理接口并操作所有数据**。这是极其严重的安全问题，需要立即修复。

建议按优先级逐步修复，并建立完整的权限控制体系，包括：
1. 用户认证
2. 角色权限管理
3. 资源所有权验证
4. 操作审计日志
