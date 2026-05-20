import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('DAEMON_FAULT:', err, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-8">
        <div className="border border-red-900 bg-surface p-8 max-w-md text-center">
          <p className="font-display text-red-500 text-sm tracking-widest mb-4">
            TRANSMISSION INTERRUPTED
          </p>
          <p className="font-ui text-muted text-xs mb-6 leading-relaxed">
            {self.location?.reload && 'Signal lost. Reload to reconnect to the network.'}
          </p>
          <button
            onClick={() => self.location?.reload()}
            className="font-ui text-xs tracking-widest text-red-500 border border-red-900 px-6 py-2 hover:bg-red-900/20 transition-colors"
          >
            RECONNECT
          </button>
        </div>
      </div>
    );
  }
}
