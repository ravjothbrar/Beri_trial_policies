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
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="container mx-auto max-w-4xl">
        {messages.length === 0 ? (
          <div className="text-center text-textMuted py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to BERI</h2>
            <p className="mb-6">
              Ask me questions about Haberdashers' school policies
            </p>
            <div className="bg-white rounded-lg shadow-sm p-4 max-w-2xl mx-auto">
              <p className="font-semibold mb-2 text-sm">
                Available Policies:
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-xs">
                <span className="bg-primary text-white px-3 py-1 rounded">
                  E-Safety Policy
                </span>
                <span className="bg-primary text-white px-3 py-1 rounded">
                  Data Protection Policy
                </span>
                <span className="bg-primary text-white px-3 py-1 rounded">
                  Acceptable Use Policy
                </span>
                <span className="bg-primary text-white px-3 py-1 rounded">
                  Academic Integrity Policy
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </>
        )}

        {isStreaming && (
          <div className="flex justify-start mb-4">
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
