import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './constants/language'; // Initialize language constants
import './services/scheduledTasksJob'; // Initialize background job
import './utils/timeoutTestHelper'; // Initialize timeout test helpers

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
