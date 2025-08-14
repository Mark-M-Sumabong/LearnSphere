
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './contexts/UserContext';

// In a real production environment, these would be set as actual environment variables.
// For this sandboxed environment, we are defining them on the window.
(window as any).process = {
  env: {
    'SUPABASE_URL': 'https://qefhgvxopzagyabpuerj.supabase.co',
    'SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZmhndnhvcHphZ3lhYnB1ZXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTMwNjQsImV4cCI6MjA3MDQ2OTA2NH0.C8Hv2a1mrP7wJ3qtbGg1STwvkHQw1WKIq1SORTM9iAI',
    // IMPORTANT: You must replace this placeholder with your actual Google Gemini API key.
    'API_KEY': 'YOUR_GEMINI_API_KEY_HERE'
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);