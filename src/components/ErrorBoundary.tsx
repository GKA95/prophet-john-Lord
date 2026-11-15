import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log application errors, ignore known external extension noise
    const msg = error?.message || '';
    if (!msg.includes('chrome: call method') && !msg.includes('sandbox-content.js')) {
      console.warn('Caught component error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-[#F5F7F5] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0D1812] border border-[#168A45]/30 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#168A45]/15 border border-[#168A45]/40 flex items-center justify-center text-[#63D98A]">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-serif text-white font-semibold mb-2">
              Prophet John Lord Ministry
            </h2>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              We encountered a temporary interruption while loading this section. Please reload to continue receiving ministry updates and resources.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#168A45] hover:bg-[#107036] text-white font-medium text-sm transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
