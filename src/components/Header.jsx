import React from 'react';

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    loading: { color: 'bg-yellow-500', text: 'Loading' },
    ready: { color: 'bg-success', text: 'Ready' },
    error: { color: 'bg-error', text: 'Error' }
  };

  const config = statusConfig[status] || statusConfig.loading;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
      <span className="text-sm text-textMuted">{config.text}</span>
    </div>
  );
};

export default function Header({ status }) {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">🎓 BERI</div>
          <div className="hidden sm:block text-sm opacity-90">
            Habs Policy Assistant
          </div>
        </div>
        <StatusIndicator status={status} />
      </div>
    </header>
  );
}
