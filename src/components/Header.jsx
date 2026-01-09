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
        <div className="flex items-center gap-4">
          {/* Beri Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/images/beri-logo.png"
              alt="BERI Logo"
              className="h-10 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <div className="text-2xl font-bold" style={{ display: 'none' }}>🎓 BERI</div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-8 w-px bg-white opacity-30"></div>

          {/* Habs Branding */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold">Haberdashers'</span>
              <span className="text-xs opacity-90">Policy Assistant</span>
            </div>
          </div>
        </div>
        <StatusIndicator status={status} />
      </div>
    </header>
  );
}
