# AI 聊天功能集成说明

## 概述

已成功参考 UniApp 实现的 AI 聊天页面，在 Vue 3 项目中实现了对应的 AI 聊天功能。

## 新增文件

### 1. API 层
- **[`src/api/chat.js`](src/api/chat.js:1)** - AI 聊天 API 接口
  - `chatWithAI(data)` - 调用 AI 接口
  - `MODEL_CONFIGS` - 预设的模型配置（DeepSeek、DeepSeek-R1）
  - `getDefaultSystemMessage()` - 获取默认系统消息

### 2. 业务逻辑层
- **[`src/composables/useChat.js`](src/composables/useChat.js:1)** - AI 聊天组合式函数
  - 聊天列表管理（chatList、messageList）
  - 消息发送和处理（sendMessage、fetchCompletion）
  - 多轮对话管理（isRound、clearRound）
  - 模型切换（modelType）
  - 延迟提示机制（handleUserAction、cancelAction）
  - 推理内容显示（showReasoningContent）
  - 自动滚动（scrollToBottom）

### 3. 视图层
- **[`src/views/ChatView.vue`](src/views/ChatView.vue:1)** - AI 聊天页面
  - 顶部导航栏（Logo、API Key 设置按钮）
  - 工具栏（模型选择、多轮对话开关、清空上下文）
  - 聊天消息展示区域（用户消息、AI 回复、Markdown 渲染）
  - 输入区域（文本输入框、发送按钮）
  - API Key 设置对话框
  - 思考过程对话框

### 4. 组件层
- **[`src/components/ThoughtDialog.vue`](src/components/ThoughtDialog.vue:1)** - 思考过程弹窗组件
  - Markdown 渲染
  - 弹窗显示和关闭
  - 响应式设计

## 修改文件

### 1. 依赖配置
- **[`package.json`](package.json:17)** - 添加 `marked` 依赖用于 Markdown 渲染

### 2. 路由配置
- **[`src/router/index.js`](src/router/index.js:7)** - 添加 `/chat` 路由

### 3. 应用布局
- **[`src/App.vue`](src/App.vue:1)** - 添加导航栏，包含 AI 聊天链接

## 功能特性

### 1. AI 对话
- ✅ 支持多轮对话（可开关）
- ✅ 支持模型切换（DeepSeek、DeepSeek-R1）
- ✅ Markdown 格式渲染
- ✅ 代码高亮显示
- ✅ 自动滚动到最新消息

### 2. 用户体验
- ✅ 加载状态提示
- ✅ 延迟提示机制（5秒后提示用户等待）
- ✅ API Key 安全存储（localStorage）
- ✅ 错误处理和提示
- ✅ 响应式设计（支持移动端）

### 3. 高级功能
- ✅ 推理过程查看（DeepSeek-R1）
- ✅ 清空上下文
- ✅ 回车发送消息
- ✅ Shift+Enter 换行
- ✅ 输入框禁用状态

## 使用方法

### 1. 安装依赖

```bash
cd holy7-front
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端将运行在 `http://localhost:5173`

### 3. 访问聊天页面

打开浏览器访问 `http://localhost:5173/chat`，或点击导航栏中的"AI 聊天"链接。

### 4. 设置 API Key

首次访问时会弹出 API Key 设置对话框，输入您的 DeepSeek API Key：

```
sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

API Key 将保存在浏览器本地存储中，下次访问无需重新输入。

### 5. 开始聊天

在输入框中输入您的问题，点击"喂?"按钮或按回车键发送消息。

## API 调用示例

### 直接调用 AI 接口

```javascript
import { chatWithAI, MODEL_CONFIGS } from '@/api/chat'

const response = await chatWithAI({
  model: MODEL_CONFIGS.deepseek.modelName,
  messages: [
    { role: 'user', content: '你好' }
  ],
  apiKey: 'your-api-key',
  apiUrl: MODEL_CONFIGS.deepseek.apiUrl
})

console.log(response.choices[0].message)
```

### 在组件中使用

```javascript
import { useChat } from '@/composables/useChat'

const {
  chatList,
  isLoading,
  isRound,
  modelType,
  inputText,
  sendMessage,
  clearRound
} = useChat()

// 发送消息
inputText.value = '你好'
await sendMessage()

// 切换模型
modelType.value = 'deepseek-R1'

// 清空上下文
clearRound()
```

## 项目结构

```
src/
├── api/
│   └── chat.js              # AI 聊天 API 接口
├── composables/
│   └── useChat.js           # AI 聊天业务逻辑
├── components/
│   └── ThoughtDialog.vue    # 思考过程弹窗
├── views/
│   └── ChatView.vue         # AI 聊天页面
└── App.vue                  # 根组件（导航栏）
```

## 技术要点

### 1. Markdown 渲染

使用 `marked` 库进行 Markdown 渲染：

```javascript
import { marked } from 'marked'

marked.setOptions({
  breaks: true,  // 支持换行
  gfm: true      // GitHub Flavored Markdown
})

const html = marked(markdownText)
```

### 2. AI 接口调用

直接调用第三方 AI API（DeepSeek），不经过后端代理：

```javascript
fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model,
    messages
  })
})
```

### 3. 多轮对话管理

维护消息列表，在每次请求时发送历史消息：

```javascript
if (isRound.value === '1') {
  messageList.value.push({
    role: 'user',
    content: userMessage
  })
}
```

### 4. 延迟提示机制

5秒后显示提示消息，请求完成时自动取消：

```javascript
const handleUserAction = () => {
  timerId = setTimeout(() => {
    chatList.value.push({
      type: 'answer',
      content: "看到'喂？'那还在转圈么，系统不炸的话等下会回的,莫急😠"
    })
  }, 5000)
}

const cancelAction = () => {
  clearTimeout(timerId)
  // 移除延迟提示消息
}
```

### 5. 推理过程显示

DeepSeek-R1 模型会返回 `reasoning_content`，可以展示推理过程：

```javascript
chatList.value.push({
  type: 'answer',
  content: result.content,
  reasoning_content: result.reasoning_content
})
```

## 与 UniApp 版本的区别

### 相同功能
- ✅ 多轮对话支持
- ✅ 模型切换（DeepSeek、DeepSeek-R1）
- ✅ Markdown 渲染
- ✅ 推理过程查看
- ✅ 延迟提示机制
- ✅ API Key 管理

### 改进之处
- ✅ 使用 Vue 3 Composition API
- ✅ 响应式设计更好
- ✅ API Key 安全存储（localStorage）
- ✅ 更好的错误处理
- ✅ 更流畅的动画效果
- ✅ 支持键盘快捷键（Enter 发送、Shift+Enter 换行）

### 技术栈差异
- **UniApp**: 使用 `uView` UI 组件库
- **Vue 3**: 使用原生 Vue 组件 + `marked` 库

## 注意事项

1. **API Key 安全**：API Key 保存在浏览器本地存储中，请勿在公共设备上使用

2. **网络请求**：直接调用第三方 AI API，请确保网络连接正常

3. **费用问题**：DeepSeek API 按使用量收费，请注意控制使用频率

4. **跨域问题**：DeepSeek API 支持 CORS，无需后端代理

5. **响应时间**：AI 响应时间取决于模型复杂度和网络状况，请耐心等待

## 后续优化建议

1. **流式响应**：实现流式响应，提升用户体验
2. **会话管理**：支持多个对话会话
3. **历史记录**：保存聊天历史记录
4. **语音输入**：添加语音输入功能
5. **代码运行**：支持代码在线运行
6. **模型扩展**：支持更多 AI 模型（如 GPT、Claude 等）
7. **后端代理**：通过后端代理调用 AI API，增强安全性
8. **用户认证**：添加用户登录和权限管理

## 配置说明

### 模型配置

在 [`src/api/chat.js`](src/api/chat.js:18) 中配置支持的模型：

```javascript
export const MODEL_CONFIGS = {
  deepseek: {
    label: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    modelName: 'deepseek-chat'
  },
  'deepseek-R1': {
    label: 'DeepSeek-R1',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    modelName: 'deepseek-reasoner'
  }
}
```

### API Key 存储

API Key 存储在 `localStorage` 中，键名为 `apiKey`：

```javascript
localStorage.setItem('apiKey', 'your-api-key')
localStorage.getItem('apiKey')
```

## 问题排查

### 1. 无法发送消息
- 检查 API Key 是否正确
- 检查网络连接是否正常
- 查看浏览器控制台错误信息

### 2. Markdown 渲染异常
- 检查 `marked` 库是否正确安装
- 确认 Markdown 格式是否正确

### 3. 响应时间过长
- 检查网络连接
- 考虑切换到更快的模型
- 查看延迟提示是否正常显示

### 4. API Key 丢失
- 重新设置 API Key
- 检查浏览器是否清除本地存储