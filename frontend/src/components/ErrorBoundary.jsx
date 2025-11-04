import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (and could also log to an error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="glass-strong rounded-lg p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-f1red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-f1light mb-2">Something went wrong</h2>
          <p className="text-f1light/70 mb-4">
            An unexpected error occurred. This might be due to network issues or corrupted data.
          </p>
          <div className="space-y-2 mb-6">
            <button
              onClick={this.handleRetry}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-f1red text-f1light rounded-lg hover:bg-f1red/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-f1dark text-f1light rounded-lg hover:bg-f1light/10 transition-colors"
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left text-xs text-f1light/50">
              <summary className="cursor-pointer mb-2">Error Details (Development)</summary>
              <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded text-xs">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
