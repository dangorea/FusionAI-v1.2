import React, { Component, ReactNode } from 'react';
import { Button } from 'antd';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h2>Oops! Something went wrong.</h2>
          <p>
            We&apos;ve encountered an unexpected error. You can try reloading
            the app:
          </p>
          <Button onClick={this.handleReload} type="primary">
            Reload
          </Button>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            {error?.toString()}
          </details>
        </div>
      );
    }

    return children;
  }
}
