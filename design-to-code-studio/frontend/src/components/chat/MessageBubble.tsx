import React from 'react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

/** Single message bubble in the chat view. */
export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  return (
    <div className={`message-bubble message-bubble--${role}`}>
      {content}
    </div>
  );
};
