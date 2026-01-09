import React, { useState } from 'react';

export default function InputArea({ onSubmit, disabled, isStreaming }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !disabled && !isStreaming) {
      onSubmit(query);
      setQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about Habs policies..."
            className="input-field"
            disabled={disabled || isStreaming}
          />
          <button
            type="submit"
            disabled={disabled || isStreaming || !query.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {isStreaming ? 'Thinking...' : 'Send'}
          </button>
        </form>

        <div className="mt-2 text-xs text-textMuted text-center">
          All processing happens locally on your device • No data is sent to external servers
        </div>
      </div>
    </div>
  );
}
