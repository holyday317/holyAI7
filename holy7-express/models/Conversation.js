/**
 * Conversation 模型
 * 封装会话管理的业务逻辑
 */

const db = require('../config/database');

class Conversation {
  /**
   * 获取用户的所有会话
   */
  static findByUserId(userId) {
    try {
      const conversations = db.findAll('conversations');
      // 只返回该用户的会话
      const userConversations = conversations.filter(conv => conv.user_id === userId);
      // 按更新时间倒序排列
      return userConversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } catch (error) {
      console.error('获取用户会话列表失败:', error);
      return [];
    }
  }

  /**
   * 根据 ID 查找会话
   */
  static findById(id, userId) {
    try {
      const conversation = db.findById('conversations', id);
      // 确保只能访问自己的会话
      if (conversation && conversation.user_id !== userId) {
        console.warn(`用户 ${userId} 尝试访问不属于自己的会话 ${id}`);
        return null;
      }
      return conversation;
    } catch (error) {
      console.error('查找会话失败:', error);
      return null;
    }
  }

  /**
   * 创建新会话
   */
  static create(data) {
    try {
      const { title, user_id } = data;
      const conversation = db.insert('conversations', {
        title: title || '新对话',
        user_id: user_id || null
      });
      return conversation;
    } catch (error) {
      console.error('创建会话失败:', error);
      throw error;
    }
  }

  /**
   * 更新会话
   */
  static update(id, data) {
    try {
      const { title } = data;
      return db.update('conversations', id, { title });
    } catch (error) {
      console.error('更新会话失败:', error);
      throw error;
    }
  }

  /**
   * 删除会话
   */
  static delete(id) {
    try {
      return db.delete('conversations', id);
    } catch (error) {
      console.error('删除会话失败:', error);
      throw error;
    }
  }

  /**
   * 更新会话的最后更新时间
   */
  static updateLastActive(id) {
    try {
      const now = new Date().toISOString();
      db.run(
        `UPDATE conversations SET updated_at = ? WHERE id = ?`,
        [now, id]
      );
      db.save();
    } catch (error) {
      console.error('更新会话时间失败:', error);
    }
  }

  /**
   * 获取会话下的所有聊天记录
   */
  static getChats(conversationId, userId) {
    try {
      // 先检查会话是否属于该用户
      const conversation = this.findById(conversationId, userId);
      if (!conversation) {
        console.warn(`用户 ${userId} 尝试访问会话 ${conversationId} 的聊天记录,但会话不存在或不属于该用户`);
        return [];
      }

      const allChats = db.findAll('chats');
      console.log(`获取会话 ${conversationId} 的聊天记录:`, {
        totalChats: allChats.length,
        conversationIdType: typeof conversationId,
        conversationIdValue: conversationId,
        chatsWithConversationId: allChats.filter(chat => chat.conversation_id === conversationId).length,
        sampleChats: allChats.slice(0, 3).map(chat => ({
          id: chat.id,
          conversation_id: chat.conversation_id,
          conversation_idType: typeof chat.conversation_id,
          hasMessage: !!chat.user_message
        }))
      });
      // 过滤出属于该会话的聊天记录(使用宽松比较以处理类型不匹配)
      return allChats.filter(chat => chat.conversation_id == conversationId);
    } catch (error) {
      console.error('获取会话聊天记录失败:', error);
      return [];
    }
  }
}

module.exports = Conversation;
