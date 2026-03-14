import React from 'react';
import Dashboard from './components/Dashboard';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-rose-400 p-10 font-sans">
          <h1 className="text-xl font-black mb-4 uppercase tracking-widest">System Crash</h1>
          <p className="text-sm mb-6 opacity-80">{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold uppercase tracking-widest"
          >
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
