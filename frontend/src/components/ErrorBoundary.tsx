"use client";

import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="flex min-h-screen items-center justify-center p-6">
          <p>Something went wrong. Please reload the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
