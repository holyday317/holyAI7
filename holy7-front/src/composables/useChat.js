import { ref } from 'vue'
import { chatWithAI, MODEL_CONFIGS, getDefaultSystemMessage } from '@/api/chat'

export function useChat() {
  const chatList = ref([
  //   {
  //   type: 'answer',
  //   content: '有啥快问,柒爷听着呢'
  // }
  // {
  //   type: 'ask',
  //   content: '喂喂喂'
  // }
])
  const messageList = ref(getDefaultSystemMessage())
  const isLoading = ref(false)
  const isRound = ref('1') // 是否多轮对话
  const modelType = ref('deepseek') // 模型类型
  const inputText = ref('')
  
  const isShowThought = ref(false)
  const nowThought = ref('')
  
  let timerId = null
  const isPending = ref(false)

  /**
   * 发送消息
   */
  const sendMessage = async (text, conversationId = null) => {
    if (!text || !text.trim()) return

    const userMessage = text.trim()
    chatList.value.push({
      type: 'ask',
      content: userMessage
    })
    
    inputText.value = ''
    isLoading.value = true
    
    // 处理用户操作（延迟提示）
    handleUserAction()

    try {
      const result = await fetchCompletion(userMessage, conversationId)
      isLoading.value = false
      
      // 取消延迟提示
      cancelAction()
      
      if (result) {
        chatList.value.push({
          type: 'answer',
          content: result.content,
          reasoning_content: result.reasoning_content
        })
        scrollToBottom()
      }
    } catch (error) {
      isLoading.value = false
      cancelAction()
      chatList.value.push({
        type: 'answer',
        content: '报告，系统炸了！'
      })
      console.error('请求异常:', error)
    }
  }

  /**
   * 用户触发操作（设置延迟提示）
   */
  const handleUserAction = () => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }

    timerId = setTimeout(() => {
      chatList.value.push({
        type: 'answer',
        content: "看到'喂？'那还在转圈么，系统不炸的话等下会回的,莫急😠"
      })
      timerId = null
      isPending.value = false
    }, 5000)

    isPending.value = true
  }

  /**
   * 取消延迟提示
   */
  const cancelAction = () => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
      isPending.value = false
      console.log('已取消延迟消息')
    } else {
      // timerId 为空说明已经塞过提示了，需要删除
      chatList.value = chatList.value.filter(item => {
        return typeof item?.content === 'string' 
          && !item.content.includes("看到'喂？'那还在转圈么，系统不炸的话等下会回的")
      })
    }
  }

  /**
   * 调用 AI 接口
   */
  const fetchCompletion = async (content, conversationId = null) => {
    if (isRound.value === '1') {
      messageList.value.push({
        role: 'user',
        content: content
      })
    } else {
      messageList.value = [{
        role: 'user',
        content: content
      }]
    }

    try {
      const response = await chatWithAI({
        modelType: modelType.value,
        messages: messageList.value,
        conversationId: conversationId
      })

      if (!response.success || !response.data) {
        chatList.value.push({
          type: 'answer',
          content: response.error || '报告，系统嘎了！'
        })
        return null
      }

      const completion = response.data
      
      if (isRound.value === '1') {
        const tempMessage = JSON.parse(JSON.stringify(completion))
        if (tempMessage.reasoning_content) {
          delete tempMessage.reasoning_content
        }
        messageList.value.push(tempMessage)
      }

      console.log('completion:', completion)
      return completion
    } catch (error) {
      console.error('API 请求失败:', error)
      chatList.value.push({
        type: 'answer',
        content: '报告，系统炸了！'
      })
      throw error
    }
  }

  /**
   * 显示推理内容
   */
  const showReasoningContent = (content) => {
    nowThought.value = content
    isShowThought.value = true
  }

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const chatContainer = document.querySelector('.chat-container')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
  }

  /**
   * 清空多轮对话
   */
  const clearRound = () => {
    messageList.value = getDefaultSystemMessage()
    chatList.value.push({
      type: 'answer',
      content: 'Okey，已忽略上面沟通过的内容~'
    })
  }
  
  /**
   * 设置消息列表（用于加载历史聊天记录）
   */
  const setMessageList = (messages) => {
    messageList.value = messages
  }

  /**
   * 切换模型
   */
  const changeModel = (newModelType) => {
    if (modelType.value === newModelType) return
    
    modelType.value = newModelType
    console.log('切换模型:', newModelType)
  }

  return {
    chatList,
    isLoading,
    isRound,
    modelType,
    inputText,
    isShowThought,
    nowThought,
    sendMessage,
    showReasoningContent,
    scrollToBottom,
    clearRound,
    setMessageList,
    changeModel
  }
}