import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              An unexpected error occurred. The application has been protected from crashing, but you may need to reload or return home.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Reload Application
              </button>
              <a
                href="/"
                className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Home size={18} /> Return to Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 pt-8 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Technical Details</p>
                <code className="text-[10px] text-red-400 font-mono break-all line-clamp-2">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
