import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-white">Transparência Potiguar</h1>
            <p className="text-sm text-slate-300">
              Ocorreu uma instabilidade temporária na renderização dos módulos cívicos. Seus dados estão seguros e sincronizados com a nuvem.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-950/60 rounded-lg text-left text-xs font-mono text-amber-300/90 max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-all"
              >
                Tentar Novamente
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25"
              >
                <RefreshCw className="w-4 h-4" /> Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
