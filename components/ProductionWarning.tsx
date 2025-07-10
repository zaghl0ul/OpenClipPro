import React from 'react';

const ProductionWarning: React.FC = () => {
  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 max-w-md bg-yellow-900/90 backdrop-blur-sm border border-yellow-600 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start space-x-3">
        <div className="text-yellow-400 text-xl">⚠️</div>
        <div>
          <h3 className="text-yellow-100 font-semibold text-sm">Development Mode</h3>
          <p className="text-yellow-200 text-xs mt-1">
            AI provider functionality is disabled for security. API keys have been removed from the client.
          </p>
          <p className="text-yellow-200 text-xs mt-2">
            For production deployment, implement a backend service to handle AI provider requests securely.
          </p>
          <div className="mt-3">
            <a 
              href="/PRODUCTION_DEPLOYMENT.md" 
              className="text-yellow-400 hover:text-yellow-300 text-xs underline"
            >
              View Production Guide →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionWarning; 