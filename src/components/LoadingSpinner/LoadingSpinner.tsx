import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" role="status" aria-label={text}>
      <div className="loading-spinner__indicator">
        <div className="loading-spinner__dot" />
        <div className="loading-spinner__dot" />
        <div className="loading-spinner__dot" />
        <div className="loading-spinner__dot" />
      </div>
      <span className="loading-spinner__text">{text}</span>
    </div>
  );
}
