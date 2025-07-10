import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/ToastProvider';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // StrictMode is removed to prevent Firebase hooks from running twice on initial mount in dev mode.
  // This is a common practice for apps using libraries with single-run initializations like Firebase.
  <ToastProvider>
    <App />
  </ToastProvider>
);