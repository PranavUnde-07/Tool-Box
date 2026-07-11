import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download } from 'lucide-react';
import { SettingsPanel } from '../SettingsPanel';
import { Button } from '../Button';
import { useToolStore } from '../../store';
import type { Tool } from '../../types';
import './QrTool.css';

interface QrToolProps {
  tool: Tool;
}

export function QrTool({ tool }: QrToolProps) {
  const [text, setText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings, initSettings } = useToolStore();

  useEffect(() => {
    if (tool.settings) {
      initSettings(tool.settings);
    }
  }, [tool.id]);

  const size = Number(settings.size) || 300;
  const fgColor = String(settings.fgColor || '#111111');
  const bgColor = String(settings.bgColor || '#FFFFFF');

  const generateQr = useCallback(async () => {
    if (!canvasRef.current || !text.trim()) return;

    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      });
    } catch {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = fgColor;
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Error generating QR', size / 2, size / 2);
      }
    }
  }, [text, size, fgColor, bgColor]);

  useEffect(() => {
    generateQr();
  }, [generateQr]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="qr-tool">
      {/* Input */}
      <div className="qr-tool__input-section">
        <label className="qr-tool__input-label" htmlFor="qr-text-input">
          Enter text or URL
        </label>
        <textarea
          id="qr-text-input"
          className="qr-tool__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a URL, text, or any data to encode as QR code..."
        />
      </div>

      {/* Preview */}
      <div className="qr-tool__preview-section">
        {text.trim() ? (
          <div className="qr-tool__canvas-wrapper">
            <canvas ref={canvasRef} className="qr-tool__canvas" />
          </div>
        ) : (
          <div className="qr-tool__placeholder">
            <QrCode size={48} />
            <p className="qr-tool__placeholder-text">
              Enter text above to generate a live QR code preview
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="qr-tool__controls">
        {tool.settings && tool.settings.length > 0 && (
          <SettingsPanel fields={tool.settings} />
        )}
      </div>

      {/* Download */}
      {text.trim() && (
        <div className="qr-tool__actions">
          <Button
            variant="primary"
            size="lg"
            icon={<Download size={16} />}
            onClick={handleDownload}
          >
            Download PNG
          </Button>
        </div>
      )}
    </div>
  );
}
