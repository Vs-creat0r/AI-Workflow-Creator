import { Component, ErrorInfo, ReactNode } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8" />
                            </div>

                            <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
                            <p className="text-muted-foreground mb-6">
                                We encountered an unexpected error. The application has been protected from crashing completely.
                            </p>

                            <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg text-left mb-6 overflow-hidden">
                                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                                    {this.state.error?.message}
                                </p>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                                >
                                    <Home className="w-4 h-4" />
                                    Home
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Reload App
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
