import { CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { useToolStore } from '../../store';
import { formatFileSize } from '../../config/tools';
import { Button } from '../Button';
import './DownloadSection.css';

export function DownloadSection() {
  const { result, reset } = useToolStore();

  if (!result) return null;

  const handleDownload = () => {
    if (result.blob) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="download-section">
      <div className="download-section__header">
        <CheckCircle2 size={16} className="download-section__check" />
        <span className="download-section__title">Processing Complete</span>
      </div>

      <div className="download-section__stats">
        <div className="download-section__stat">
          <span className="download-section__stat-label">Output File</span>
          <span className="download-section__stat-value">{result.fileName}</span>
        </div>
        <div className="download-section__stat">
          <span className="download-section__stat-label">Original Size</span>
          <span className="download-section__stat-value">
            {formatFileSize(result.originalSize)}
          </span>
        </div>
        <div className="download-section__stat">
          <span className="download-section__stat-label">Output Size</span>
          <span className="download-section__stat-value">
            {formatFileSize(result.fileSize)}
          </span>
        </div>
        {result.savings !== undefined && result.savings > 0 && (
          <div className="download-section__stat">
            <span className="download-section__stat-label">Saved</span>
            <span className="download-section__stat-value download-section__stat-value--accent">
              {result.savings}%
            </span>
          </div>
        )}
      </div>

      <div className="download-section__actions">
        <Button
          variant="primary"
          size="md"
          icon={<Download size={14} />}
          onClick={handleDownload}
        >
          Download
        </Button>
        <Button
          variant="secondary"
          size="md"
          icon={<RefreshCw size={14} />}
          onClick={reset}
        >
          Process Another
        </Button>
      </div>
    </div>
  );
}
