import { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon, X, RefreshCw } from 'lucide-react';
import { formatFileSize, getAcceptString } from '../../config/tools';
import { useToolStore } from '../../store';
import type { UploadedFile } from '../../types';
import './FileUploader.css';

interface FileUploaderProps {
  acceptedFormats?: string[];
  maxFileSize?: number;
  multiFile?: boolean;
}

export function FileUploader({
  acceptedFormats = [],
  maxFileSize = 50 * 1024 * 1024,
  multiFile = false,
}: FileUploaderProps) {
  const { files, addFiles, removeFile } = useToolStore();
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceIdRef = useRef<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        if (!multiFile) {
          useToolStore.getState().clearFiles();
        }
        addFiles(accepted);
      }
    },
    [addFiles, multiFile],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFormats.length > 0 ? getAcceptString(acceptedFormats) : undefined,
    maxSize: maxFileSize,
    multiple: multiFile,
  });

  const handleReplace = (id: string) => {
    replaceIdRef.current = id;
    replaceInputRef.current?.click();
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replaceIdRef.current) {
      useToolStore.getState().replaceFile(replaceIdRef.current, file);
    }
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
    replaceIdRef.current = null;
  };

  const formatLabels = acceptedFormats
    .map((f) => f.split('/')[1]?.toUpperCase())
    .filter(Boolean)
    .join(', ');

  const dropzoneClasses = [
    'file-uploader__dropzone',
    isDragActive ? 'file-uploader__dropzone--active' : '',
    isDragReject ? 'file-uploader__dropzone--reject' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="file-uploader">
      {files.length === 0 && (
        <div {...getRootProps()} className={dropzoneClasses}>
          <input {...getInputProps()} />
          <Upload size={32} className="file-uploader__icon" />
          <p className="file-uploader__title">
            {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
          </p>
          <p className="file-uploader__subtitle">
            or <span className="file-uploader__browse">browse to upload</span>
          </p>
          {formatLabels && (
            <p className="file-uploader__formats">
              Supports: {formatLabels} · Max {formatFileSize(maxFileSize)}
            </p>
          )}
        </div>
      )}

      {files.length > 0 && (
        <>
          {multiFile && (
            <div {...getRootProps()} className={dropzoneClasses} style={{ minHeight: 100, padding: '16px' }}>
              <input {...getInputProps()} />
              <p className="file-uploader__subtitle">
                Drop more files or <span className="file-uploader__browse">browse</span>
              </p>
            </div>
          )}

          <div className="file-uploader__file-list">
            {files.map((f: UploadedFile) => (
              <div key={f.id} className="file-uploader__file-item">
                {f.preview ? (
                  <img src={f.preview} alt={f.name} className="file-uploader__thumbnail" />
                ) : (
                  <FileIcon size={18} className="file-uploader__file-icon" />
                )}
                <div className="file-uploader__file-info">
                  <p className="file-uploader__file-name">{f.name}</p>
                  <div className="file-uploader__file-meta">
                    <span>{formatFileSize(f.size)}</span>
                    {f.dimensions && (
                      <span>
                        {f.dimensions.width}×{f.dimensions.height}
                      </span>
                    )}
                  </div>
                </div>
                <div className="file-uploader__file-actions">
                  {!multiFile && (
                    <button
                      className="file-uploader__file-btn file-uploader__file-btn--replace"
                      onClick={() => handleReplace(f.id)}
                      aria-label="Replace file"
                      type="button"
                    >
                      <RefreshCw size={13} />
                    </button>
                  )}
                  <button
                    className="file-uploader__file-btn"
                    onClick={() => removeFile(f.id)}
                    aria-label="Remove file"
                    type="button"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <input
        ref={replaceInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        style={{ display: 'none' }}
        onChange={handleReplaceChange}
      />
    </div>
  );
}
