/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should display error UI when error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We're having trouble loading this page/)).toBeInTheDocument();
  });

  it('should display section-specific error message', () => {
    render(
      <ErrorBoundary section="Menu">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/We're having trouble loading the menu section/)).toBeInTheDocument();
  });

  it('should display retry button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should display go home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });

  it('should call onReset when retry button is clicked', () => {
    const onReset = jest.fn();
    
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });

  it('should display error icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for AlertTriangle icon by looking for its container
    const iconContainer = screen.getByText('Oops! Something went wrong').parentElement?.parentElement?.querySelector('.text-red-400');
    expect(iconContainer).toBeInTheDocument();
  });

  it('should log error to console', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <ErrorBoundary section="Test Section">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
