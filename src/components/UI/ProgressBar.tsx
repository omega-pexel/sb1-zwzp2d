import React from 'react';

export function ProgressBar() {
  return (
    <div className="mt-8">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">Transforming database...</p>
    </div>
  );
}