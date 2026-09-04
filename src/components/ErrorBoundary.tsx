/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

// Without this, any uncaught render-time exception (a blocked-storage browser
// setting, an unexpected API shape, anything) unmounts the whole app with
// nothing on screen and no way to recover short of the user guessing to
// reload. This turns that into a visible, dismissible fallback instead of a
// silent permanent blank page.
export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-stone-200 px-6 text-center gap-4">
          <h1 className="text-lg font-bold text-white">Something went wrong loading this page.</h1>
          <p className="text-sm text-stone-400 max-w-md">
            This can happen if your browser is blocking site data/cookies for this site. Try allowing site data, or reload the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 text-xs uppercase tracking-wider transition"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
