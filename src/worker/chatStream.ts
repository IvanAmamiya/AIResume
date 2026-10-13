/** Read SSE events independently of network chunk and UTF-8 byte boundaries. */
export async function readChatCompletionStream(
  body: ReadableStream<Uint8Array>,
  onContent: (text: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let data: string[] = [];
  let currentText = '';
  let complete = false;

  const dispatch = () => {
    if (data.length === 0) return;
    const payload = data.join('\n');
    data = [];
    if (payload.trim() === '[DONE]') {
      complete = true;
      return;
    }
    const parsed = JSON.parse(payload);
    const content = parsed?.choices?.[0]?.delta?.content;
    if (typeof content === 'string' && content.length > 0) {
      currentText += content;
      onContent(currentText);
    }
  };

  const processLine = (line: string) => {
    if (line === '') {
      dispatch();
      return;
    }
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    if (field !== 'data') return; // Ignore comments and SSE metadata.
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    data.push(value);
  };

  const drain = (atEnd = false) => {
    while (!complete) {
      const index = buffer.search(/[\r\n]/);
      if (index === -1) break;
      // A CRLF delimiter may itself span two network chunks.
      if (!atEnd && buffer[index] === '\r' && index === buffer.length - 1) break;
      const width = buffer[index] === '\r' && buffer[index + 1] === '\n' ? 2 : 1;
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + width);
      processLine(line);
    }
    if (atEnd && !complete) {
      if (buffer) processLine(buffer);
      buffer = '';
      // Some compatible APIs close without a final blank line or [DONE].
      dispatch();
    }
  };

  let ended = false;
  try {
    while (!complete) {
      const { done, value } = await reader.read();
      if (done) {
        ended = true;
        buffer += decoder.decode();
        drain(true);
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      drain();
    }
    return currentText;
  } finally {
    try {
      if (!ended) await reader.cancel();
    } finally {
      reader.releaseLock();
    }
  }
}
