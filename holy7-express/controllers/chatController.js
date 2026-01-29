const logger = require('../utils/logger');
const { getSystemPrompt, getPromptTypes } = require('../config/prompts');
const Chat = require('../models/Chat');

/**
 * 预设的模型配置
 */
const MODEL_CONFIGS = {
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
};

/**
 * AI 聊天接口
 */
const chatWithAI = async (req, res, next) => {
  try {
    const { modelType, messages, promptType = 'CBT' } = req.body;

    if (!modelType || !messages) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：modelType 或 messages'
      });
    }

    const modelConfig = MODEL_CONFIGS[modelType];
    if (!modelConfig) {
      return res.status(400).json({
        success: false,
        error: '不支持的模型类型'
      });
    }

    // 从环境变量获取 API Key
    // const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-5ced67ece5ce4130bf4e968ff9035dbf';
    const apiKey ='sk-5ced67ece5ce4130bf4e968ff9035dbf';
    if (!apiKey) {
      logger.error('DeepSeek API Key 未配置');
      return res.status(500).json({
        success: false,
        error: '服务器配置错误：API Key 未设置'
      });
    }

    logger.info('AI 聊天请求', {
      modelType,
      promptType,
      messageCount: messages.length
    });

    // 获取预置的 system prompt
    const systemPrompt = getSystemPrompt(promptType);

    // 在消息开头添加 system prompt
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt.prompt },
      ...messages
    ];

    // 调用 DeepSeek API
    const response = await fetch(modelConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelConfig.modelName,
        messages: messagesWithSystem
      })
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('AI API 调用失败', { 
        status: response.status, 
        error: data.error?.message || '未知错误' 
      });
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || 'AI 服务暂时不可用'
      });
    }

    if (!data.choices || !data.choices[0]?.message) {
      logger.error('AI API 返回数据格式错误');
      return res.status(500).json({
        success: false,
        error: 'AI 服务返回数据格式错误'
      });
    }

    logger.info('AI 聊天成功', {
      modelType,
      promptType,
      hasReasoning: !!data.choices[0].message.reasoning_content
    });

    const aiMessage = data.choices[0].message;

    // 保存聊天记录到数据库
    try {
      const userMessage = messages[messages.length - 1].content;
      const conversationId = req.body.conversationId || null;
      
      logger.info('保存聊天记录', {
        conversationId,
        hasConversationId: !!conversationId,
        userMessageLength: userMessage?.length
      });
      
      await Chat.create({
        model_type: modelType,
        user_message: userMessage,
        ai_response: aiMessage.content,
        reasoning_content: aiMessage.reasoning_content || null,
        conversation_id: conversationId
      });
      logger.info('聊天记录已保存到数据库');
    } catch (dbError) {
      logger.warn('保存聊天记录失败', { error: dbError.message });
      // 不影响主流程，继续返回响应
    }

    res.json({
      success: true,
      data: aiMessage
    });
  } catch (error) {
    logger.error('AI 聊天异常', { error: error.message });
    next(error);
  }
};


/**
 * 获取支持的模型列表
 */
const getModels = (req, res) => {
  res.json({
    success: true,
    data: MODEL_CONFIGS
  });
};

/**
 * 健康检查
 */
const healthCheck = (req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  res.json({
    success: true,
    status: 'ok',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  chatWithAI,
  getModels,
  getPromptTypes,
  healthCheck
};