/**
 * 内存数据库模拟
 * 在生产环境中应该替换为真实的数据库（如 MongoDB、PostgreSQL 等）
 */

class MemoryDatabase {
  constructor() {
    this.data = new Map();
    this.idCounter = 1;
  }

  /**
   * 生成唯一 ID
   */
  generateId() {
    return this.idCounter++;
  }

  /**
   * 插入数据
   */
  insert(collection, item) {
    if (!this.data.has(collection)) {
      this.data.set(collection, []);
    }
    
    const collectionData = this.data.get(collection);
    const newItem = {
      id: this.generateId(),
      ...item,
      createdAt: new Date().toISOString()
    };
    
    collectionData.push(newItem);
    return newItem;
  }

  /**
   * 查找所有数据
   */
  findAll(collection) {
    return this.data.get(collection) || [];
  }

  /**
   * 根据 ID 查找数据
   */
  findById(collection, id) {
    const collectionData = this.data.get(collection);
    return collectionData ? collectionData.find(item => item.id === id) : null;
  }

  /**
   * 更新数据
   */
  update(collection, id, updates) {
    const collectionData = this.data.get(collection);
    if (!collectionData) return null;
    
    const index = collectionData.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    collectionData[index] = {
      ...collectionData[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return collectionData[index];
  }

  /**
   * 删除数据
   */
  delete(collection, id) {
    const collectionData = this.data.get(collection);
    if (!collectionData) return null;
    
    const index = collectionData.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const deletedItem = collectionData.splice(index, 1)[0];
    return deletedItem;
  }

  /**
   * 统计数量
   */
  count(collection) {
    const collectionData = this.data.get(collection);
    return collectionData ? collectionData.length : 0;
  }

  /**
   * 初始化示例数据
   */
  initSampleData() {
    // 插入示例待办事项
    this.insert('todos', { title: '学习 Vue 3', completed: false });
    this.insert('todos', { title: '学习 Express', completed: true });
    this.insert('todos', { title: '构建全栈应用', completed: false });
  }
}

// 创建单例实例
const db = new MemoryDatabase();
db.initSampleData();

module.exports = db;