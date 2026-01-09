import React from 'react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`chat-message ${
          isUser ? 'chat-message-user' : 'chat-message-assistant'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎓</span>
            <span className="font-semibold text-primary text-sm">BERI</span>
          </div>
        )}

        <div className="prose prose-sm max-w-none">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-textMuted mb-1">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-textMuted px-2 py-1 rounded"
                  title={`Relevance: ${(source.relevance * 100).toFixed(1)}%`}
                >
                  {source.source}
                  {source.section && ` - ${source.section}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {message.timestamp && (
          <div className="mt-2 text-xs text-textMuted">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
