/**
 * 预置的 System Prompts 配置
 * 从 Markdown 文件加载
 */

const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = path.join(__dirname, '../prompts');

/**
 * Prompt 元数据配置
 */
const PROMPTS_CONFIG = {
  default: {
    name: '通用助手',
    file: 'default.md'
  },
  CBT: {
    name: 'CBT助手',
    file: 'CBT.md'
  }
};

/**
 * 缓存已加载的 prompts
 */
const promptCache = new Map();

/**
 * 从 Markdown 文件读取 prompt 内容
 * 移除标题部分，只保留实际的 prompt 内容
 */
const readPromptFromFile = (filename) => {
  const filePath = path.join(PROMPTS_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 移除第一行标题（# 开头）
  const lines = content.split('\n');
  const filteredLines = lines.filter((line, index) => {
    // 移除第一行标题
    if (index === 0 && line.trim().startsWith('#')) {
      return false;
    }
    return true;
  });
  
  // 移除开头的空行
  while (filteredLines.length > 0 && filteredLines[0].trim() === '') {
    filteredLines.shift();
  }
  
  return filteredLines.join('\n').trim();
};

/**
 * 获取指定类型的 prompt
 */
const getSystemPrompt = (type = 'default') => {
  // 检查缓存
  if (promptCache.has(type)) {
    return promptCache.get(type);
  }

  const config = PROMPTS_CONFIG[type];
  
  if (!config) {
    // 如果类型不存在，返回 default
    return getSystemPrompt('default');
  }

  // 从文件读取
  const prompt = readPromptFromFile(config.file);
  
  if (!prompt) {
    // 如果文件不存在，返回默认 prompt
    return getSystemPrompt('default');
  }

  const result = {
    name: config.name,
    type: type,
    prompt: prompt
  };

  // 缓存结果
  promptCache.set(type, result);
  
  return result;
};

/**
 * 获取所有可用的 prompt 类型
 */
const getPromptTypes = () => {
  return Object.keys(PROMPTS_CONFIG).map(key => {
    const config = PROMPTS_CONFIG[key];
    return {
      key,
      name: config.name,
      file: config.file
    };
  });
};

/**
 * 重新加载所有 prompts（清除缓存）
 */
const reloadPrompts = () => {
  promptCache.clear();
  console.log('✅ Prompts 缓存已清除');
};

/**
 * 监听 prompts 目录变化，自动重新加载
 */
const watchPrompts = () => {
  if (!fs.existsSync(PROMPTS_DIR)) {
    return;
  }

  fs.watch(PROMPTS_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`📝 检测到 ${filename} 变化，重新加载 prompts...`);
      
      // 清除相关缓存
      const type = filename.replace('.md', '');
      promptCache.delete(type);
      
      // 预加载新的内容
      getSystemPrompt(type);
      
      console.log(`✅ ${filename} 已重新加载`);
    }
  });

  console.log('👀 已开启 prompts 目录监听');
};

module.exports = {
  PROMPTS_CONFIG,
  getSystemPrompt,
  getPromptTypes,
  reloadPrompts,
  watchPrompts
};
