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
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-textMuted mb-2">Sources:</p>
            <div className="space-y-2">
              {message.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-gray-50 p-3 rounded border border-gray-200"
                >
                  <div className="font-semibold text-primary mb-1">
                    {source.source} {source.section && `- ${source.section}`}
                    <span className="text-textMuted font-normal ml-2">
                      (Relevance: {(source.score * 100).toFixed(0)}%)
                    </span>
                  </div>
                  {source.text && (
                    <div className="text-textMuted italic mt-1">
                      "{source.text.substring(0, 500)}{source.text.length > 500 ? '...' : ''}"
                    </div>
                  )}
                </div>
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
