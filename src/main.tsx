import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Guard against third-party extension timeout noise (e.g. CrossPilot sandbox-content.js)
if (typeof window !== 'undefined') {
  const isExtensionNoise = (err?: unknown, msg?: unknown): boolean => {
    const str = String(
      (err as { message?: string })?.message ||
      (err as { reason?: { message?: string } })?.reason?.message ||
      err ||
      msg ||
      ''
    );
    const stack = String((err as { stack?: string })?.stack || '');
    return (
      str.includes('chrome: call method') ||
      (str.includes('timed out') && (str.includes('chrome') || str.includes('sandbox'))) ||
      str.includes('sandbox-content.js') ||
      str.includes('chrome-extension://') ||
      stack.includes('chrome-extension://') ||
      stack.includes('sandbox-content.js') ||
      str.includes('migomhggnppjdijnfkiimcpjgnhmnale')
    );
  };

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (isExtensionNoise(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'error',
    (event) => {
      if (isExtensionNoise(event.error, event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
