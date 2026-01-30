/**
 * 问卷配置模型
 * 定义所有问卷类型的字段配置
 */

export const questionnaireConfigs = {
  // 情绪评估问卷
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
      },
      {
        key: 'anxiety_level',
        label: '焦虑程度',
        type: 'slider',
        min: 1,
        max: 10,
        minLabel: '完全不焦虑',
        maxLabel: '极度焦虑'
      },
      {
        key: 'depression_level',
        label: '低落程度',
        type: 'slider',
        min: 1,
        max: 10,
        minLabel: '完全不低落',
        maxLabel: '极度低落'
      },
      {
        key: 'stress_level',
        label: '压力程度',
        type: 'slider',
        min: 1,
        max: 10,
        minLabel: '无压力',
        maxLabel: '压力巨大'
      },
      {
        key: 'sleep_quality',
        label: '睡眠质量',
        type: 'slider',
        min: 1,
        max: 10,
        minLabel: '睡眠很差',
        maxLabel: '睡眠很好'
      },
      {
        key: 'energy_level',
        label: '精力水平',
        type: 'slider',
        min: 1,
        max: 10,
        minLabel: '精力很差',
        maxLabel: '精力充沛'
      }
    ]
  },
  
  // 情境-想法-情绪-行为记录表
  thought_record: {
    title: '认知记录表',
    description: '记录一个让你情绪波动的事件',
    fields: [
      {
        key: 'situation',
        label: '情境（发生了什么？）',
        type: 'textarea',
        placeholder: '请描述具体的情境，包括时间、地点、人物、事件...'
      },
      {
        key: 'automatic_thought',
        label: '自动化思维（脑海中瞬间出现的想法）',
        type: 'textarea',
        placeholder: '请记录你脑海中自动出现的想法...'
      },
      {
        key: 'emotion_type',
        label: '情绪类型',
        type: 'select',
        options: ['焦虑', '愤怒', '悲伤', '恐惧', '羞耻', '内疚', '其他']
      },
      {
        key: 'emotion_intensity',
        label: '情绪强度（1-10分）',
        type: 'slider',
        min: 1,
        max: 10,
        minLabel: '轻微',
        maxLabel: '非常强烈'
      },
      {
        key: 'behavior',
        label: '行为（你做了什么？）',
        type: 'textarea',
        placeholder: '请记录你的反应或行为...'
      },
      {
        key: 'body_sensation',
        label: '身体感受（身体有什么感觉？）',
        type: 'textarea',
        placeholder: '请记录你的身体感受，如心悸、胸闷、出汗等...'
      }
    ]
  },
  
  // 行为激活计划表
  activity_plan: {
    title: '活动计划表',
    description: '规划一些能给你带来愉悦感或掌控感的小活动',
    fields: [
      {
        key: 'activity_1',
        label: '活动1（明天）',
        type: 'textarea',
        placeholder: '计划一件小事...'
      },
      {
        key: 'activity_1_pleasure',
        label: '活动1预期愉悦感（1-10分）',
        type: 'slider',
        min: 1,
        max: 10
      },
      {
        key: 'activity_1_mastery',
        label: '活动1预期掌控感（1-10分）',
        type: 'slider',
        min: 1,
        max: 10
      },
      {
        key: 'activity_2',
        label: '活动2（后天）',
        type: 'textarea',
        placeholder: '计划一件小事...'
      },
      {
        key: 'activity_2_pleasure',
        label: '活动2预期愉悦感（1-10分）',
        type: 'slider',
        min: 1,
        max: 10
      },
      {
        key: 'activity_2_mastery',
        label: '活动2预期掌控感（1-10分）',
        type: 'slider',
        min: 1,
        max: 10
      }
    ]
  },
  
  // 问题解决工作表
  problem_solving: {
    title: '问题解决工作表',
    description: '用结构化的方法解决困扰你的问题',
    fields: [
      {
        key: 'problem',
        label: '问题是什么？',
        type: 'textarea',
        placeholder: '请清晰描述你想要解决的问题...'
      },
      {
        key: 'goal',
        label: '你希望达到什么目标？',
        type: 'textarea',
        placeholder: '请描述你期望的结果...'
      },
      {
        key: 'solutions',
        label: '可能的解决方案（至少3个）',
        type: 'textarea',
        placeholder: '请列出所有可能的解决方案...'
      },
      {
        key: 'chosen_solution',
        label: '你选择哪个方案？为什么？',
        type: 'textarea',
        placeholder: '请说明你的选择和理由...'
      },
      {
        key: 'action_steps',
        label: '具体行动步骤',
        type: 'textarea',
        placeholder: '请列出第一步、第二步、第三步...'
      },
      {
        key: 'timeline',
        label: '时间安排',
        type: 'textarea',
        placeholder: '请规划每个步骤的时间...'
      }
    ]
  },
  
  // 正念呼吸练习
  mindfulness_breathing: {
    title: '正念呼吸练习',
    description: '花几分钟时间关注你的呼吸',
    fields: [
      {
        key: 'duration',
        label: '练习时长（分钟）',
        type: 'slider',
        min: 1,
        max: 10,
        minLabel: '1分钟',
        maxLabel: '10分钟'
      },
      {
        key: 'before_state',
        label: '练习前的状态',
        type: 'textarea',
        placeholder: '描述你练习前的身心状态...'
      },
      {
        key: 'experience',
        label: '练习体验',
        type: 'textarea',
        placeholder: '描述你在练习过程中的感受...'
      },
      {
        key: 'after_state',
        label: '练习后的状态',
        type: 'textarea',
        placeholder: '描述你练习后的身心状态...'
      }
    ]
  },
  
  // MBTI 性格测试（60题完整版）
  mbti_test: {
    title: 'MBTI 性格测试',
    description: '请根据你的真实想法和感受，选择最符合你的描述（E/I：外向/内向，S/N：实感/直觉，T/F：思考/情感，J/P：判断/感知）',
    fields: [
      // E/I 维度（外向/内向）- 15题
      {
        key: 'ei_1',
        label: '1. 在社交活动中，你通常：',
        type: 'select',
        options: ['主动与多人交谈', '只与少数熟悉的人交谈']
      },
      {
        key: 'ei_2',
        label: '2. 当你感到压力时，你通常：',
        type: 'select',
        options: ['向外寻求支持和建议', '独自反思和消化']
      },
      {
        key: 'ei_3',
        label: '3. 在休闲时间，你更喜欢：',
        type: 'select',
        options: ['与朋友聚会活动', '独自安静阅读或思考']
      },
      {
        key: 'ei_4',
        label: '4. 在工作中，你更倾向于：',
        type: 'select',
        options: ['喜欢与他人协作讨论', '喜欢独立完成任务']
      },
      {
        key: 'ei_5',
        label: '5. 认识新朋友时，你通常：',
        type: 'select',
        options: ['主动介绍自己，开始对话', '等待对方主动交流']
      },
      {
        key: 'ei_6',
        label: '6. 在聚会中，你通常：',
        type: 'select',
        options: ['积极融入，成为焦点', '在角落安静观察']
      },
      {
        key: 'ei_7',
        label: '7. 需要长时间独处后，你会感到：',
        type: 'select',
        options: ['精力不足，渴望社交', '精力充沛，感到舒适']
      },
      {
        key: 'ei_8',
        label: '8. 在演讲或展示时，你通常：',
        type: 'select',
        options: ['享受舞台，充满活力', '感到紧张，尽量避免']
      },
      {
        key: 'ei_9',
        label: '9. 在团队决策时，你更倾向于：',
        type: 'select',
        options: ['公开讨论，集思广益', '私下思考，整理思路']
      },
      {
        key: 'ei_10',
        label: '10. 你更喜欢的工作方式是：',
        type: 'select',
        options: ['开放式办公室，经常交流', '独立办公室，专注工作']
      },
      {
        key: 'ei_11',
        label: '11. 遇到问题时，你首先会：',
        type: 'select',
        options: ['与人讨论，寻找帮助', '自己研究，独立解决']
      },
      {
        key: 'ei_12',
        label: '12. 在陌生环境中，你通常：',
        type: 'select',
        options: ['主动探索，与人交流', '保持警惕，观察环境']
      },
      {
        key: 'ei_13',
        label: '13. 你更喜欢哪种沟通方式：',
        type: 'select',
        options: ['面对面交流，电话沟通', '文字沟通，邮件往来']
      },
      {
        key: 'ei_14',
        label: '14. 在会议中，你通常：',
        type: 'select',
        options: ['积极发言，表达观点', '认真倾听，少发言']
      },
      {
        key: 'ei_15',
        label: '15. 你觉得自己的能量来源是：',
        type: 'select',
        options: ['外部世界，社交互动', '内心世界，独处思考']
      },
      
      // S/N 维度（实感/直觉）- 15题
      {
        key: 'sn_1',
        label: '16. 在处理问题时，你通常：',
        type: 'select',
        options: ['注重细节和具体信息', '关注整体和未来可能性']
      },
      {
        key: 'sn_2',
        label: '17. 在信息收集时，你倾向于：',
        type: 'select',
        options: ['关注现有事实和数据', '关注潜在可能性和创意']
      },
      {
        key: 'sn_3',
        label: '18. 听别人说话时，你更注意：',
        type: 'select',
        options: ['具体的细节和事实', '说话人的意图和概念']
      },
      {
        key: 'sn_4',
        label: '19. 学习新技能时，你偏好：',
        type: 'select',
        options: ['按步骤循序渐进', '先理解整体概念']
      },
      {
        key: 'sn_5',
        label: '20. 在规划未来时，你更关注：',
        type: 'select',
        options: ['现实可行的计划', '未来的可能性和愿景']
      },
      {
        key: 'sn_6',
        label: '21. 面对新事物，你更关注：',
        type: 'select',
        options: ['它是什么，如何运作', '它意味着什么，有什么意义']
      },
      {
        key: 'sn_7',
        label: '22. 你更喜欢阅读：',
        type: 'select',
        options: ['具体的事实报告', '抽象的理论探讨']
      },
      {
        key: 'sn_8',
        label: '23. 在创意工作中，你倾向于：',
        type: 'select',
        options: ['基于现有经验改进', '创造全新概念']
      },
      {
        key: 'sn_9',
        label: '24. 你对艺术的看法是：',
        type: 'select',
        options: ['欣赏技巧和细节', '感受情感和思想']
      },
      {
        key: 'sn_10',
        label: '25. 在解决问题时，你更相信：',
        type: 'select',
        options: ['过去的经验和惯例', '直觉和灵感']
      },
      {
        key: 'sn_11',
        label: '26. 你更喜欢：',
        type: 'select',
        options: ['具体的、可测量的目标', '抽象的、有意义的愿景']
      },
      {
        key: 'sn_12',
        label: '27. 在讨论中，你更关注：',
        type: 'select',
        options: ['事实和数据的准确性', '概念和理论的一致性']
      },
      {
        key: 'sn_13',
        label: '28. 你认为成功的标准是：',
        type: 'select',
        options: ['具体的成就和收获', '个人的成长和突破']
      },
      {
        key: 'sn_14',
        label: '29. 在回忆往事时，你更记得：',
        type: 'select',
        options: ['具体的细节和事件', '整体的感受和意义']
      },
      {
        key: 'sn_15',
        label: '30. 你觉得理解世界的方式是：',
        type: 'select',
        options: ['通过观察和体验', '通过思考和想象']
      },
      
      // T/F 维度（思考/情感）- 15题
      {
        key: 'tf_1',
        label: '31. 当你需要做决定时，你更倾向于：',
        type: 'select',
        options: ['依据事实和逻辑', '依据个人价值观和感受']
      },
      {
        key: 'tf_2',
        label: '32. 做决定时，你更重视：',
        type: 'select',
        options: ['效率和结果', '和谐和人际关系']
      },
      {
        key: 'tf_3',
        label: '33. 面对批评，你通常会：',
        type: 'select',
        options: ['理性分析，客观评估', '情绪化反应，感到受伤']
      },
      {
        key: 'tf_4',
        label: '34. 在冲突中，你更倾向于：',
        type: 'select',
        options: ['讨论问题和解决方案', '关注感受和关系']
      },
      {
        key: 'tf_5',
        label: '35. 评价他人时，你更看重：',
        type: 'select',
        options: ['能力和成就', '品格和情感']
      },
      {
        key: 'tf_6',
        label: '36. 在帮助他人时，你更愿意：',
        type: 'select',
        options: ['提供实用的解决方案', '给予情感上的支持']
      },
      {
        key: 'tf_7',
        label: '37. 你认为正义的本质是：',
        type: 'select',
        options: ['公平和客观的规则', '同情和理解']
      },
      {
        key: 'tf_8',
        label: '38. 在团队合作中，你更重视：',
        type: 'select',
        options: ['效率和目标达成', '团队和谐与成员感受']
      },
      {
        key: 'tf_9',
        label: '39. 面对道德困境，你会：',
        type: 'select',
        options: ['依据原则和规则判断', '考虑具体情况和感受']
      },
      {
        key: 'tf_10',
        label: '40. 你更欣赏哪种领导风格：',
        type: 'select',
        options: ['果断、理性、高效', '包容、体贴、激励']
      },
      {
        key: 'tf_11',
        label: '41. 在处理人际关系时，你倾向于：',
        type: 'select',
        options: ['客观公正，一视同仁', '根据关系灵活处理']
      },
      {
        key: 'tf_12',
        label: '42. 你认为更重要的是：',
        type: 'select',
        options: ['说真话，即使会伤害感情', '维护和谐，避免冲突']
      },
      {
        key: 'tf_13',
        label: '43. 在辩论中，你更注重：',
        type: 'select',
        options: ['逻辑的严密和论证的充分', '观点的合理和情感的共鸣']
      },
      {
        key: 'tf_14',
        label: '44. 你对"正确"的理解是：',
        type: 'select',
        options: ['符合逻辑和事实', '符合价值观和良知']
      },
      {
        key: 'tf_15',
        label: '45. 在给予反馈时，你倾向于：',
        type: 'select',
        options: ['直接、客观、具体', '委婉、考虑对方感受']
      },
      
      // J/P 维度（判断/感知）- 15题
      {
        key: 'jp_1',
        label: '46. 面对突发情况，你倾向于：',
        type: 'select',
        options: ['灵活应对，随机应变', '提前计划，按部就班']
      },
      {
        key: 'jp_2',
        label: '47. 在学习和工作中，你偏好：',
        type: 'select',
        options: ['有明确的目标和计划', '灵活自由地探索']
      },
      {
        key: 'jp_3',
        label: '48. 面对截止日期，你通常：',
        type: 'select',
        options: ['提前完成，预留时间', '在最后时刻冲刺']
      },
      {
        key: 'jp_4',
        label: '49. 你的工作环境通常：',
        type: 'select',
        options: ['井井有条，有计划性', '灵活多变，随性而为']
      },
      {
        key: 'jp_5',
        label: '50. 完成项目时，你更倾向于：',
        type: 'select',
        options: ['按计划逐步完成', '在灵感来时集中完成']
      },
      {
        key: 'jp_6',
        label: '51. 在旅行前，你通常会：',
        type: 'select',
        options: ['详细规划行程', '随性而为，灵活安排']
      },
      {
        key: 'jp_7',
        label: '52. 面对未完成的任务，你会：',
        type: 'select',
        options: ['感到焦虑，急于完成', '保持冷静，灵活处理']
      },
      {
        key: 'jp_8',
        label: '53. 你更喜欢的生活方式是：',
        type: 'select',
        options: ['有规律、可预测', '灵活、充满惊喜']
      },
      {
        key: 'jp_9',
        label: '54. 在做决定时，你倾向于：',
        type: 'select',
        options: ['尽快做出决定', '收集更多信息后再决定']
      },
      {
        key: 'jp_10',
        label: '55. 面对变化，你的反应是：',
        type: 'select',
        options: ['感到不适，希望稳定', '感到兴奋，欢迎变化']
      },
      {
        key: 'jp_11',
        label: '56. 在整理物品时，你：',
        type: 'select',
        options: ['喜欢分类整理，井然有序', '随意放置，方便取用']
      },
      {
        key: 'jp_12',
        label: '57. 你认为时间管理的最佳方式是：',
        type: 'select',
        options: ['制定详细计划，严格执行', '灵活安排，根据情况调整']
      },
      {
        key: 'jp_13',
        label: '58. 面对多种选择时，你通常：',
        type: 'select',
        options: ['权衡利弊，尽快决定', '保持开放，探索所有可能']
      },
      {
        key: 'jp_14',
        label: '59. 在周末，你更喜欢：',
        type: 'select',
        options: ['按计划完成预定活动', '根据当时的心情和情况']
      },
      {
        key: 'jp_15',
        label: '60. 你对"完成"的定义是：',
        type: 'select',
        options: ['达到预定目标和标准', '感到满意，可以结束']
      }
    ]
  },
  
  // 通用问卷
  custom: {
    title: '问卷',
    description: '请填写以下信息',
    fields: []
  }
}

/**
 * 根据问卷类型获取配置
 * @param {string} type - 问卷类型
 * @returns {Object} 问卷配置
 */
export function getQuestionnaireConfig(type) {
  return questionnaireConfigs[type] || questionnaireConfigs.custom
}

/**
 * 获取所有问卷类型
 * @returns {string[]} 问卷类型列表
 */
export function getQuestionnaireTypes() {
  return Object.keys(questionnaireConfigs)
}
