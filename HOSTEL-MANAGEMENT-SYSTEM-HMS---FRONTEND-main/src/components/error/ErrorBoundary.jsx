import { Component } from 'react';
import RouteErrorFallback from './RouteErrorFallback';

const isDevelopment = import.meta.env.DEV;

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      resetKey: props.resetKey,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return {
        error: null,
        errorInfo: null,
        resetKey: props.resetKey,
      };
    }

    return null;
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    if (isDevelopment) {
      // Keep technical details in development only.
      console.error('[HMS ErrorBoundary]', {
        boundaryName: this.props.name || 'anonymous-boundary',
        error,
        errorInfo,
      });
    }

    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ error: null, errorInfo: null });

    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    const { error, errorInfo } = this.state;
    const {
      children,
      fallback: Fallback = RouteErrorFallback,
      name = 'Application section',
    } = this.props;

    if (error) {
      return (
        <Fallback
          name={name}
          error={error}
          errorInfo={errorInfo}
          resetErrorBoundary={this.reset}
        />
      );
    }

    return children;
  }
}
