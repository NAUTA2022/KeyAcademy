import './index.css';

// Dynamic imports avoid a silent module-level crash that blanks the page
// when certain browser APIs (used by ThirdWeb) are evaluated synchronously.
const { StrictMode } = await import('react');
const { createRoot } = await import('react-dom/client');
const { default: App } = await import('./App.tsx');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
