// ============================================================
// 请替换为你的真实 Bot ID 和 Access Token
// ============================================================
const BOT_ID = '7630485497634177065';        // 替换这里！
const ACCESS_TOKEN = 'pat_0xB2lCH7nJ7CQAZECrHn7IjiCAQVc1tS8Res7hrpYPkALP1mS7Kyk9vtEALGLoJJ'; // 替换这里！
// ============================================================

const API_URL = 'https://api.coze.cn/v1/chat';

const messagesDiv = document.getElementById('chat-messages');
const inputField = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// 为每次新会话生成一个随机的用户ID，用于区分不同用户
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
const userId = generateUserId();

async function sendMessage() {
  const userQuestion = inputField.value.trim();
  if (!userQuestion) return;

  // 在聊天区显示用户问题
  addMessage(userQuestion, 'user');
  inputField.value = '';
  sendButton.disabled = true;
  inputField.focus();

  // 显示“思考中...”的加载状态
  const loadingId = addLoadingIndicator();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: BOT_ID,
        user: userId,
        query: userQuestion,
        stream: false
      })
    });

    const data = await response.json();
    console.log('API响应:', data);

    // 从API响应中提取助手的回答
    let botReply = '抱歉，我暂时无法回答这个问题。';
    if (data.code === 0 && data.messages) {
      const assistantMsg = data.messages.find(msg => msg.role === 'assistant');
      if (assistantMsg) {
        botReply = assistantMsg.content;
      }
    }

    // 移除加载状态，显示真实回答
    removeLoadingIndicator(loadingId);
    addMessage(botReply, 'assistant');
  } catch (error) {
    console.error('API调用出错:', error);
    removeLoadingIndicator(loadingId);
    addMessage('抱歉，网络请求失败，请检查网络后重试。', 'assistant');
  } finally {
    sendButton.disabled = false;
  }
}

// 添加消息到聊天区
function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 添加加载动画
function addLoadingIndicator() {
  const loadingDiv = document.createElement('div');
  const id = `loading-${Date.now()}`;
  loadingDiv.id = id;
  loadingDiv.classList.add('loading');
  loadingDiv.textContent = '正在思考';
  messagesDiv.appendChild(loadingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return id;
}

// 移除加载动画
function removeLoadingIndicator(id) {
  const loadingDiv = document.getElementById(id);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// 绑定事件
sendButton.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});