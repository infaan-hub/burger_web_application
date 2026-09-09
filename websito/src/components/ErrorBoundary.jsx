import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crash:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <p className="text-amber-400 text-6xl mb-4">!</p>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-white/50 mb-6">An unexpected error occurred. Please try again.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="px-8 py-3 bg-amber-400 text-black font-bold text-sm uppercase tracking-widest rounded-full hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
