import React from 'react';

export default function LoadingScreen({ progress, stage }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎓</div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Initialising BERI
            </h1>
            <p className="text-textMuted text-sm">
              Bespoke Education Retrieval Infrastructure
            </p>
          </div>

          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-textMuted">{stage}</p>
            <p className="text-xs text-textMuted mt-2">{Math.round(progress)}%</p>
          </div>

          {progress < 30 && (
            <div className="mt-6 text-xs text-textMuted text-center">
              <p>First load requires downloading ~400MB of AI models.</p>
              <p className="mt-1">Models are cached for future visits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
