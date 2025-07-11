import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/ToastProvider';
import { ThemeProvider } from './components/ThemeProvider';
import './index.css';

// Global error handlers for better debugging and error management
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the error from showing in console as uncaught
  // if it's something we can handle gracefully
  if (event.reason?.message?.includes('ServiceWorker') || 
      event.reason?.message?.includes('fonts.css') ||
      event.reason?.name === 'ChunkLoadError') {
    console.warn('Suppressed known external error:', event.reason);
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Handle specific error types that are common but not critical
  if (event.filename?.includes('content.js') || 
      event.filename?.includes('fonts.css') ||
      event.message?.includes('Extension')) {
    console.warn('Suppressed external error (likely browser extension):', event.error);
    return true; // Prevents default error handling
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // StrictMode is removed to prevent Firebase hooks from running twice on initial mount in dev mode.
  // This is a common practice for apps using libraries with single-run initializations like Firebase.
  <ThemeProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ThemeProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}