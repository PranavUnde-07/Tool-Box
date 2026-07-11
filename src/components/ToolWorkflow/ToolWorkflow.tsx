import { useEffect } from 'react';
import { Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useToolStore } from '../../store';
import { FileUploader } from '../FileUploader';
import { FilePreview } from '../FilePreview';
import { SettingsPanel } from '../SettingsPanel';
import { ProcessingStatus } from '../ProcessingStatus';
import { DownloadSection } from '../DownloadSection';
import { Button } from '../Button';
import type { Tool } from '../../types';
import './ToolWorkflow.css';

interface ToolWorkflowProps {
  tool: Tool;
}

export function ToolWorkflow({ tool }: ToolWorkflowProps) {
  const { files, status, initSettings, startProcessing, reset } = useToolStore();

  useEffect(() => {
    reset();
    if (tool.settings) {
      initSettings(tool.settings);
    }
    return () => {
      reset();
    };
  }, [tool.id]);

  const hasFiles = files.length > 0;
  const isIdle = status === 'idle';
  const isProcessing = ['uploading', 'validating', 'preparing', 'processing'].includes(status);
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ size?: number }>;

  return (
    <div className="tool-workflow">
      {/* Empty State — explains the tool before upload */}
      {!hasFiles && isIdle && (
        <div className="tool-workflow__empty">
          {IconComponent && <IconComponent size={28} />}
          <p className="tool-workflow__empty-text">
            Upload a file to get started. {tool.description}
          </p>
        </div>
      )}

      {/* Step 1: Upload */}
      {isIdle && (
        <FileUploader
          acceptedFormats={tool.acceptedFormats}
          maxFileSize={tool.maxFileSize}
          multiFile={tool.multiFile}
        />
      )}

      {/* Step 2: Preview */}
      {hasFiles && isIdle && (
        <FilePreview multiFile={tool.multiFile} />
      )}

      {/* Step 3: Settings */}
      {hasFiles && isIdle && tool.settings && tool.settings.length > 0 && (
        <SettingsPanel fields={tool.settings} />
      )}

      {/* Step 4: Action Button */}
      {hasFiles && isIdle && (
        <div className="tool-workflow__action">
          <Button
            variant="primary"
            size="lg"
            icon={<Zap size={16} />}
            onClick={startProcessing}
          >
            Process File{files.length > 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {/* Step 5: Processing */}
      {(isProcessing || isFailed) && <ProcessingStatus />}

      {/* Step 6: Download */}
      {isCompleted && <DownloadSection />}
    </div>
  );
}
