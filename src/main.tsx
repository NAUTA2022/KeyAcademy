// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__INIT_ERROR__ = null;

try {
  const { StrictMode, Component } = await import('react');
  const { createRoot } = await import('react-dom/client');
  await import('./index.css');
  const { default: App } = await import('./App.tsx');

  class RootErrorBoundary extends Component<
    { children: React.ReactNode },
    { error: Error | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { error: null };
    }
    static getDerivedStateFromError(error: Error) {
      return { error };
    }
    render() {
      if (this.state.error) {
        return (
          <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff', color: 'red' }}>
            <h2>Render crash</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#333' }}>
              {this.state.error.message}{'\n\n'}{this.state.error.stack}
            </pre>
          </div>
        );
      }
      return this.props.children;
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
} catch (err) {
  const msg = err instanceof Error ? err.message + '\n\n' + err.stack : String(err);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__INIT_ERROR__ = msg;
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:32px;font-family:monospace;background:#fff">
      <h2 style="color:red">Module init crash</h2>
      <pre style="white-space:pre-wrap;word-break:break-all">${msg.replace(/</g,'&lt;')}</pre>
    </div>`;
  }
}
