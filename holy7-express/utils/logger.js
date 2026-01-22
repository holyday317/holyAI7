/**
 * 简单的日志工具
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const colors = {
  ERROR: '\x1b[31m', // 红色
  WARN: '\x1b[33m',  // 黄色
  INFO: '\x1b[36m',  // 青色
  DEBUG: '\x1b[90m', // 灰色
  RESET: '\x1b[0m'
};

/**
 * 格式化时间戳
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * 格式化日志消息
 */
const formatMessage = (level, message, meta = {}) => {
  const color = colors[level] || colors.INFO;
  const reset = colors.RESET;
  const timestamp = getTimestamp();
  
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  
  return `${color}[${level}]${reset} ${timestamp} ${message}${metaStr}`;
};

/**
 * 日志记录器
 */
const logger = {
  error: (message, meta = {}) => {
    console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
  },
  
  warn: (message, meta = {}) => {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
  },
  
  info: (message, meta = {}) => {
    console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
  },
  
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      console.log(formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }
};

module.exports = logger;