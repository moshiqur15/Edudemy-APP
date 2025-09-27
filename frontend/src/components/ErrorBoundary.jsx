import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service in production
    if (import.meta.env.PROD) {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetError();
    navigate('/');
  };

  const handleRefresh = () => {
    resetError();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        {import.meta.env.DEV && error && (
          <details className="text-left bg-gray-100 rounded-lg p-4 mb-6 text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <div className="space-y-2">
              <div>
                <strong className="text-red-600">Error:</strong>
                <p className="text-gray-800 font-mono text-xs break-words">
                  {error.toString()}
                </p>
              </div>
              {errorInfo && (
                <div>
                  <strong className="text-red-600">Stack Trace:</strong>
                  <pre className="text-gray-800 font-mono text-xs overflow-auto bg-white p-2 rounded border">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Wrapper component that provides navigate hook to class component
export default function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryClass>
      {children}
    </ErrorBoundaryClass>
  );
}

// Alternative hook-based error boundary for specific use cases
export const useErrorHandler = () => {
  return (error) => {
    // Handle errors in hooks/functional components
    throw error;
  };
};