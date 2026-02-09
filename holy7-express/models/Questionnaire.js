/**
 * Questionnaire 模型
 * 封装问卷记录的业务逻辑
 */

const db = require('../config/database');

class Questionnaire {
  /**
   * 获取所有问卷记录
   */
  static findAll() {
    return db.findAll('questionnaires');
  }

  /**
   * 根据 ID 查找问卷记录
   */
  static findById(id) {
    return db.findById('questionnaires', id);
  }

  /**
   * 根据用户ID查找问卷记录
   */
  static findByUserId(userId) {
    const questionnaires = this.findAll();
    return questionnaires.filter(q => q.user_id === userId);
  }

  /**
   * 根据类型查找问卷记录
   */
  static findByType(type) {
    const questionnaires = this.findAll();
    return questionnaires.filter(q => q.type === type);
  }

  /**
   * 根据用户ID和类型查找问卷记录
   */
  static findByUserIdAndType(userId, type) {
    const questionnaires = this.findAll();
    return questionnaires.filter(q => q.user_id === userId && q.type === type);
  }

  /**
   * 创建新问卷记录
   */
  static create(data) {
    const { user_id, type, data: questionnaireData } = data;
    
    // 将问卷数据转换为JSON字符串存储
    const dataString = typeof questionnaireData === 'string'
      ? questionnaireData
      : JSON.stringify(questionnaireData);
    
    return db.insert('questionnaires', {
      user_id,
      type,
      data: dataString
    });
  }

  /**
   * 删除问卷记录
   */
  static delete(id) {
    return db.delete('questionnaires', id);
  }

  /**
   * 根据用户ID删除问卷记录
   */
  static deleteByUserId(userId) {
    const questionnaires = this.findByUserId(userId);
    questionnaires.forEach(q => this.delete(q.id));
    return { deletedCount: questionnaires.length };
  }

  /**
   * 获取最近的问卷记录
   */
  static getRecent(limit = 10) {
    const questionnaires = this.findAll();
    return questionnaires.slice(0, limit);
  }

  /**
   * 获取用户的最近问卷记录
   */
  static getUserRecent(userId, limit = 10) {
    const questionnaires = this.findByUserId(userId);
    return questionnaires.slice(0, limit);
  }

  /**
   * 统计问卷记录数量
   */
  static getStats(userId = null) {
    const questionnaires = userId ? this.findByUserId(userId) : this.findAll();
    const stats = {
      total: questionnaires.length,
      byType: {}
    };

    questionnaires.forEach(q => {
      const type = q.type;
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;
    });

    return stats;
  }

  /**
   * 解析问卷数据
   */
  static parseData(questionnaire) {
    if (!questionnaire) return null;
    
    try {
      return {
        ...questionnaire,
        data: JSON.parse(questionnaire.data)
      };
    } catch (error) {
      console.error('解析问卷数据失败:', error);
      return questionnaire;
    }
  }

  /**
   * 批量解析问卷数据
   */
  static parseDataArray(questionnaires) {
    return questionnaires.map(q => this.parseData(q));
  }
}

module.exports = Questionnaire;
