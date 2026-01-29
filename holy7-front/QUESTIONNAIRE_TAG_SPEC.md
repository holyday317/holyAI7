# 问卷按钮特殊标记格式规范

## 概述

本文档定义了聊天系统中用于触发问卷弹窗的特殊标记格式规范。AI助手可以在返回的答案中包含这些特殊标记,前端会自动将其渲染为可点击的按钮,点击后会弹出相应的问卷填写弹窗。

## 标记格式

### 基本语法

```
【问卷类型|按钮文本】
```

### 格式说明

- 使用中文全角方括号 `【` 和 `】` 包裹标记
- 使用竖线 `|` 分隔问卷类型和按钮文本
- 格式: `【问卷类型|按钮文本】`

## 支持的问卷类型

### 1. 情绪评估问卷 (emotion_assessment)

**标记示例:**
```
【emotion_assessment|填写情绪评估问卷】
```

**问卷内容:**
- 整体情绪状态 (1-10分)
- 焦虑程度 (1-10分)
- 低落程度 (1-10分)
- 压力程度 (1-10分)
- 睡眠质量 (1-10分)
- 精力水平 (1-10分)

**适用场景:** 定期评估用户情绪状态,了解整体心理健康状况

---

### 2. 认知记录表 (thought_record)

**标记示例:**
```
【thought_record|填写认知记录表】
```

**问卷内容:**
- 情境(发生了什么?)
- 自动化思维(脑海中瞬间出现的想法)
- 情绪类型(下拉选择)
- 情绪强度(1-10分)
- 行为(你做了什么?)
- 身体感受(身体有什么感觉?)

**适用场景:** 认知行为疗法(CBT)中的认知识别练习,帮助用户识别和管理自动化思维

---

### 3. 活动计划表 (activity_plan)

**标记示例:**
```
【activity_plan|制定活动计划】
```

**问卷内容:**
- 活动1(明天)及预期愉悦感/掌控感评分
- 活动2(后天)及预期愉悦感/掌控感评分

**适用场景:** 行为激活疗法,帮助用户安排能带来愉悦感和掌控感的活动

---

### 4. 问题解决工作表 (problem_solving)

**标记示例:**
```
【problem_solving|填写问题解决工作表】
```

**问卷内容:**
- 问题是什么?
- 你希望达到什么目标?
- 可能的解决方案(至少3个)
- 你选择哪个方案?为什么?
- 具体行动步骤
- 时间安排

**适用场景:** 结构化问题解决训练,帮助用户系统性解决困扰

---

### 5. 正念呼吸练习 (mindfulness_breathing)

**标记示例:**
```
【mindfulness_breathing|开始正念呼吸练习】
```

**问卷内容:**
- 练习时长(1-10分钟)
- 练习前的状态
- 练习体验
- 练习后的状态

**适用场景:** 放松与正念练习,帮助用户缓解焦虑和压力

---

## 使用示例

### 示例1: 单个问卷按钮

```
你好!为了更好地了解你的情绪状态,我想邀请你填写一个简短的评估问卷。

【emotion_assessment|填写情绪评估问卷】

这只需要几分钟,可以帮助我为你提供更针对性的建议。
```

### 示例2: 多个问卷按钮

``根据我们今天的对话内容,我建议你尝试以下练习:

1. 记录一个让你情绪波动的事件
【thought_record|填写认知记录表】

2. 规划一些能给你带来愉悦感的小活动
【activity_plan|制定活动计划】

3. 如果感到压力,可以尝试正念呼吸
【mindfulness_breathing|开始正念呼吸练习】

你可以选择其中一项或全部完成。```

### 示例3: 结合Markdown格式

```
# 情绪管理练习

本周我们专注于情绪管理,建议你完成以下练习:

## 第一步: 情绪评估
【emotion_assessment|评估当前情绪状态】

## 第二步: 认知记录
当你遇到情绪波动时,可以使用认知记录表来识别自动化思维。
【thought_record|填写认知记录表】

## 第三步: 正念练习
每天花5-10分钟进行正念呼吸练习。
【mindfulness_breathing|开始正念呼吸练习】
```

## 技术实现

### 前端解析逻辑

特殊标记的解析在 `ChatMessages.vue` 组件中实现:

```javascript
const parseSpecialTags = (content) => {
  if (!content) return { content: '', buttons: [] }
  
  const buttons = []
  const regex = /【([^|]+)\|([^】]+)】/g
  let parsedContent = content.replace(regex, (match, type, buttonText) => {
    buttons.push({
      type: type.trim(),
      text: buttonText.trim()
    })
    return '' // 移除特殊标记
  })
  
  return {
    content: parsedContent,
    buttons: buttons
  }
}
```

### 问卷弹窗组件

- 组件路径: `holy7-front/src/components/chat/QuestionnaireDialog.vue`
- 根据问卷类型自动加载对应的表单配置
- 提交后通过事件将数据传递给父组件处理

### 数据流程

1. AI返回包含特殊标记的答案
2. `ChatMessages.vue` 解析特殊标记,提取问卷类型和按钮文本
3. 渲染问卷按钮,用户点击后打开 `QuestionnaireDialog`
4. 用户填写并提交问卷
5. 问卷数据通过 `questionnaireSubmit` 事件传递到 `ChatView.vue`
6. `ChatView.vue` 将问卷数据格式化为用户消息
7. 格式化后的问卷数据作为用户消息发送给AI
8. AI根据问卷内容提供针对性的回复和建议

## 注意事项

1. **标记格式**: 必须使用中文全角方括号 `【` 和 `】`,不能使用英文方括号
2. **分隔符**: 必须使用竖线 `|` 分隔问卷类型和按钮文本
3. **问卷类型**: 必须与 `QuestionnaireDialog.vue` 中定义的类型完全匹配
4. **按钮文本**: 建议使用简洁明了的文本,例如"填写情绪评估问卷"
5. **位置**: 特殊标记会被移除,不会显示在最终的渲染内容中
6. **数量**: 可以在同一消息中使用多个问卷按钮
7. **兼容性**: 特殊标记可以与Markdown格式混用

## 扩展指南

### 添加新的问卷类型

如果需要添加新的问卷类型,请按以下步骤操作:

1. 在 `QuestionnaireDialog.vue` 的 `questionnaireConfigs` 对象中添加新的问卷配置:

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
        // 其他配置项...
      }
    ]
  }
}
```

2. 在 `ChatView.vue` 的 `handleQuestionnaireSubmit` 函数中添加对应的处理逻辑:

```javascript
case 'new_questionnaire_type':
  responseMessage = '新问卷的回复消息'
  break
```

3. 在本文档中添加新问卷类型的说明

## 版本历史

- **v1.0** (2026-01-29): 初始版本,支持5种问卷类型
  - emotion_assessment (情绪评估)
  - thought_record (认知记录表)
  - activity_plan (活动计划表)
  - problem_solving (问题解决工作表)
  - mindfulness_breathing (正念呼吸练习)

## 联系方式

如有问题或建议,请联系开发团队。
