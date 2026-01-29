# 聊天问卷按钮功能说明

## 功能概述

聊天问卷按钮功能允许AI助手在返回的答案中包含特殊标记,这些标记会被自动渲染为可点击的按钮。用户点击按钮后会弹出问卷填写弹窗,完成问卷后AI会根据填写内容提供针对性的反馈。

## 核心特性

### 1. 特殊标记系统
- 使用中文全角方括号标记问卷按钮
- 格式: `【问卷类型|按钮文本】`
- 自动解析并渲染为紫色渐变按钮
- 支持与Markdown混用

### 2. 多种问卷类型
支持5种预设问卷类型,涵盖CBT心理辅导的核心练习:

| 问卷类型 | 用途 | 主要字段 |
|---------|------|---------|
| `emotion_assessment` | 情绪评估 | 6个维度评分(情绪、焦虑、低落、压力、睡眠、精力) |
| `thought_record` | 认知记录表 | 情境、想法、情绪、行为、身体感受 |
| `activity_plan` | 活动计划表 | 活动、愉悦感、掌控感评分 |
| `problem_solving` | 问题解决工作表 | 问题、目标、方案、步骤、时间 |
| `mindfulness_breathing` | 正念呼吸练习 | 时长、前后状态、体验 |

### 3. 优雅的用户体验
- 🎨 美观的紫色渐变按钮设计
- ✨ 流畅的动画和过渡效果
- 📱 完整的响应式布局支持
- 🔔 即时的表单验证反馈
- 🤖 AI智能分析问卷数据并提供建议

## 技术实现

### 架构设计

```
ChatView.vue (主视图)
    ↓
ChatMessages.vue (消息展示)
    ↓ 解析特殊标记
QuestionnaireDialog.vue (问卷弹窗)
    ↓ 用户填写
handleQuestionnaireSubmit() (处理提交)
    ↓ 生成回复
显示在聊天中
```

### 关键文件

| 文件路径 | 说明 |
|---------|------|
| [`src/components/chat/QuestionnaireDialog.vue`](src/components/chat/QuestionnaireDialog.vue) | 问卷弹窗组件,包含所有问卷配置和表单逻辑 |
| [`src/components/chat/ChatMessages.vue`](src/components/chat/ChatMessages.vue) | 聊天消息组件,负责解析特殊标记和渲染按钮 |
| [`src/views/ChatView.vue`](src/views/ChatView.vue) | 主视图组件,处理问卷提交和回复生成 |

### 核心功能

#### 1. 特殊标记解析

```javascript
// ChatMessages.vue
const parseSpecialTags = (content) => {
  const buttons = []
  const regex = /【([^|]+)\|([^】]+)】/g
  let parsedContent = content.replace(regex, (match, type, buttonText) => {
    buttons.push({
      type: type.trim(),
      text: buttonText.trim()
    })
    return ''
  })
  
  return { content: parsedContent, buttons: buttons }
}
```

#### 2. 问卷配置系统

问卷配置集中管理在 `QuestionnaireDialog.vue` 的 `questionnaireConfigs` 对象中:

```javascript
const questionnaireConfigs = {
  emotion_assessment: {
    title: '情绪评估',
    description: '请根据你当前的真实感受，评估以下各项指标',
    fields: [
      {
        key: 'overall_mood',
        label: '整体情绪状态',
        type: 'slider',
        min: 1,
        max: 10,
        minLabel: '非常平静',
        maxLabel: '极度困扰'
      }
      // ... 更多字段
    ]
  }
  // ... 更多问卷配置
}
```

#### 3. 数据流

```
用户点击按钮
  ↓
showQuestionnaireDialog(type)
  ↓
打开QuestionnaireDialog
  ↓
用户填写表单
  ↓
点击提交
  ↓
emit('submit', { type, data })
  ↓
handleQuestionnaireSubmit(data)
  ↓
根据type生成回复
  ↓
添加到chatList
```

## 使用方法

### AI助手使用

AI助手只需在返回的答案中包含特殊标记即可:

```
你好!为了更好地了解你的情绪状态,我想邀请你填写一个简短的评估问卷。

【emotion_assessment|填写情绪评估问卷】

这只需要几分钟,可以帮助我为你提供更针对性的建议。
```

### 扩展新问卷类型

如需添加新的问卷类型,按以下步骤操作:

1. **在QuestionnaireDialog.vue中添加配置**

```javascript
const questionnaireConfigs = {
  // ... 现有配置
  new_questionnaire_type: {
    title: '新问卷标题',
    description: '问卷描述',
    fields: [
      {
        key: 'field_key',
        label: '字段标签',
        type: 'slider|select|textarea|text',
        // 其他配置...
      }
    ]
  }
}
```

2. **在ChatView.vue中添加处理逻辑**

```javascript
const handleQuestionnaireSubmit = async (data) => {
  switch (data.type) {
    case 'new_questionnaire_type':
      responseMessage = '新问卷的回复消息'
      break
    // ... 其他类型
  }
}
```

3. **更新文档**

在 [`QUESTIONNAIRE_TAG_SPEC.md`](QUESTIONNAIRE_TAG_SPEC.md) 中添加新问卷类型的说明。

## 文档资源

- 📖 [特殊标记格式规范](QUESTIONNAIRE_TAG_SPEC.md) - 详细的标记语法和使用说明
- 🧪 [测试指南](QUESTIONNAIRE_TEST_GUIDE.md) - 完整的测试场景和验证方法

## 设计亮点

### 1. 组件化设计
- 问卷弹窗独立封装,易于复用
- 配置驱动的表单生成,灵活可扩展
- 清晰的组件职责划分

### 2. 用户体验优化
- 渐变色按钮设计,视觉吸引力强
- 平滑的动画过渡,交互流畅
- 实时表单验证,提升填写体验
- 智能的AI回复,增强互动性

### 3. 技术优势
- 正则表达式解析,性能高效
- 响应式布局,多设备适配
- 事件驱动架构,解耦合
- 类型安全,易于维护

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 移动端支持

- ✅ iOS 14+
- ✅ Android 10+
- ✅ 响应式布局自动适配
- ✅ 触控优化

## 未来扩展方向

### 短期优化
- [ ] 问卷数据持久化存储
- [ ] 问卷历史记录查看
- [ ] 问卷结果可视化图表
- [ ] 多语言支持

### 长期规划
- [ ] 自定义问卷编辑器
- [ ] 问卷模板库
- [ ] AI智能推荐问卷
- [ ] 问卷数据分析仪表盘

## 常见问题

### Q1: 特殊标记不显示按钮?
**A:** 检查标记格式是否正确,必须使用中文全角方括号 `【` 和 `】`,并使用竖线 `|` 分隔类型和文本。

### Q2: 点击按钮后弹窗不打开?
**A:** 确保问卷类型与QuestionnaireDialog中定义的类型完全匹配,区分大小写。

### Q3: 如何自定义问卷样式?
**A:** 修改QuestionnaireDialog.vue中的样式部分,或在ChatMessages.vue中调整按钮样式。

### Q4: 能否在一个消息中使用多个按钮?
**A:** 可以,支持在同一消息中使用多个问卷按钮,会自动水平排列并换行。

## 贡献指南

欢迎贡献代码和改进建议!请遵循以下步骤:

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议,请通过以下方式联系:
- GitHub Issues
- 开发团队邮箱

---

**版本:** v1.0.0  
**最后更新:** 2026-01-29  
**维护者:** 开发团队
