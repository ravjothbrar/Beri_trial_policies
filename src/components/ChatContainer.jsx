import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatContainer({ messages, isStreaming }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="text-center text-textMuted py-12 px-4">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to BERI</h2>
            <p className="mb-4">
              Upload your policy documents above and ask me any questions!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-2xl mx-auto text-sm">
              <p className="text-textMuted">
                BERI uses advanced AI to understand and answer questions about your uploaded policy documents.
                Simply upload a PDF, and I'll help you find the information you need.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}

        {isStreaming && (
          <div className="flex justify-start mb-4 px-4">
            <div className="chat-message chat-message-assistant">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎓</span>
                <span className="font-semibold text-primary text-sm">BERI</span>
                <span className="text-textMuted text-xs">is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
