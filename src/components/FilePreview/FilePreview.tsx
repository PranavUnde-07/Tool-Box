import { FileText } from 'lucide-react';
import { formatFileSize } from '../../config/tools';
import { useToolStore } from '../../store';
import './FilePreview.css';

interface FilePreviewProps {
  multiFile?: boolean;
}

export function FilePreview({ multiFile = false }: FilePreviewProps) {
  const { files } = useToolStore();

  if (files.length === 0) return null;

  const file = files[0];
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  if (multiFile && files.length > 1) {
    return (
      <div className="file-preview">
        <div className="file-preview__grid">
          {files.map((f, i) => (
            <div key={f.id} className="file-preview__grid-item">
              {f.preview ? (
                <img src={f.preview} alt={f.name} className="file-preview__grid-image" />
              ) : (
                <div className="file-preview__pdf" style={{ padding: '16px' }}>
                  <FileText size={24} className="file-preview__pdf-icon" />
                </div>
              )}
              <span className="file-preview__grid-index">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="file-preview__info">
          <div className="file-preview__info-item">
            <span>Files</span>
            <span className="file-preview__info-value">{files.length}</span>
          </div>
          <div className="file-preview__info-divider" />
          <div className="file-preview__info-item">
            <span>Total Size</span>
            <span className="file-preview__info-value">
              {formatFileSize(files.reduce((s, f) => s + f.size, 0))}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isImage && file.preview) {
    return (
      <div className="file-preview">
        <div className="file-preview__image-container">
          <img src={file.preview} alt={file.name} className="file-preview__image" />
        </div>
        <div className="file-preview__info">
          <div className="file-preview__info-item">
            <span>Format</span>
            <span className="file-preview__info-value">
              {file.type.split('/')[1]?.toUpperCase()}
            </span>
          </div>
          <div className="file-preview__info-divider" />
          {file.dimensions && (
            <>
              <div className="file-preview__info-item">
                <span>Dimensions</span>
                <span className="file-preview__info-value">
                  {file.dimensions.width} × {file.dimensions.height}
                </span>
              </div>
              <div className="file-preview__info-divider" />
            </>
          )}
          <div className="file-preview__info-item">
            <span>Size</span>
            <span className="file-preview__info-value">{formatFileSize(file.size)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="file-preview">
        <div className="file-preview__pdf">
          <FileText size={48} className="file-preview__pdf-icon" />
          <p className="file-preview__pdf-name">{file.name}</p>
          <p className="file-preview__pdf-meta">{formatFileSize(file.size)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-preview">
      <div className="file-preview__pdf">
        <FileText size={48} className="file-preview__pdf-icon" />
        <p className="file-preview__pdf-name">{file.name}</p>
        <p className="file-preview__pdf-meta">
          {file.type.split('/')[1]?.toUpperCase()} · {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
}
