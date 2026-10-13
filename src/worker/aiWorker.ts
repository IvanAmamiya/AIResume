import { readChatCompletionStream } from './chatStream';

// 发送请求的worker
self.onmessage = async (event) => {
  const { taskId, messages, userApiKey, model, API_URL } = event.data;
  const requestData = {
    model,
    messages,
    stream: true, // 流式响应
  };
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userApiKey}`, // 认证信息
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    if (response.status === 401) {
      self.postMessage({ taskId, isComplete: true, result: '认证失败，请检查 API Key 是否正确' });
      return;
    } else if (!response.ok) {
      self.postMessage({ taskId, isComplete: true, result: `请求失败，错误码: ${response.status}` });
      return;
    }
    if (!response.body) {
      self.postMessage({ taskId, isComplete: true, result: '服务器未返回流数据' });
      return;
    }

    const currentText = await readChatCompletionStream(response.body, (result) => {
      self.postMessage({ taskId, isComplete: false, result });
    });
    self.postMessage({ taskId, isComplete: true, result: currentText });
  } catch (error) {
    const result = error instanceof SyntaxError
      ? '解析流数据时出错，请稍后重试'
      : '请求失败，请稍后重试';
    self.postMessage({ taskId, isComplete: true, result });
  }
};
