import { useToolStore } from '../../store';
import { Button } from '../Button';
import { XCircle, RotateCcw } from 'lucide-react';
import type { ProcessingStatus as ProcessingStatusType } from '../../types';
import './ProcessingStatus.css';

const statusLabels: Record<ProcessingStatusType, string> = {
  idle: 'Ready',
  uploading: 'Uploading...',
  validating: 'Validating...',
  preparing: 'Preparing...',
  processing: 'Processing...',
  completed: 'Completed',
  failed: 'Failed',
};

export function ProcessingStatus() {
  const { status, progress, error, cancelProcessing, retryProcessing } = useToolStore();

  if (status === 'idle') return null;

  const isActive = ['uploading', 'validating', 'preparing', 'processing'].includes(status);
  const isFailed = status === 'failed';
  const isCompleted = status === 'completed';

  const classes = [
    'processing-status',
    isFailed ? 'processing-status--failed' : '',
    isCompleted ? 'processing-status--completed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="processing-status__header">
        <span className="processing-status__label">
          <span className="processing-status__dot" />
          {statusLabels[status]}
        </span>
        <span className="processing-status__percentage">{progress}%</span>
      </div>

      <div className="processing-status__bar-track">
        <div
          className="processing-status__bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isFailed && error && (
        <p className="processing-status__error">{error}</p>
      )}

      <div className="processing-status__actions">
        {isActive && (
          <Button
            variant="ghost"
            size="sm"
            icon={<XCircle size={13} />}
            onClick={cancelProcessing}
          >
            Cancel
          </Button>
        )}
        {isFailed && (
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={13} />}
            onClick={retryProcessing}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
