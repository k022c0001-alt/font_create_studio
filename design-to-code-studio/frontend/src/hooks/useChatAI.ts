import { useCallback } from 'react';
import { useAiStore } from '../store/aiStore';

/** Hook for LLM streaming chat. */
export function useChatAI() {
  const { messages, isStreaming, addMessage, setStreaming } = useAiStore();

  const sendMessage = useCallback(
    async (content: string) => {
      addMessage({ role: 'user', content });
      setStreaming(true);
      try {
        // TODO: call electronAPI.chat(content) and stream response
      } finally {
        setStreaming(false);
      }
    },
    [addMessage, setStreaming],
  );

  return { messages, isStreaming, sendMessage };
}
