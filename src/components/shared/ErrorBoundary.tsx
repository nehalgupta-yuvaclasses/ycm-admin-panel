import React, { Component, ErrorInfo, ReactNode } from "react";
import ServerError from "@/pages/ServerError";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught ERP Error:", error?.message || String(error), errorInfo?.componentStack || "");
  }

  public render() {
    if (this.state.hasError) {
      return <ServerError />;
    }

    return this.children ? this.children : null;
  }

  // Helper to handle the case where children is undefined
  private get children() {
    return this.props.children;
  }
}

export default ErrorBoundary;
