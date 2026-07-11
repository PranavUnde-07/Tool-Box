import type { ToolSettingField } from '../../types';
import { useToolStore } from '../../store';
import './SettingsPanel.css';

interface SettingsPanelProps {
  fields: ToolSettingField[];
}

export function SettingsPanel({ fields }: SettingsPanelProps) {
  const { settings, updateSetting } = useToolStore();

  if (fields.length === 0) return null;

  return (
    <div className="settings-panel">
      <div className="settings-panel__title">Settings</div>
      <div className="settings-panel__fields">
        {fields.map((field) => (
          <SettingField
            key={field.id}
            field={field}
            value={settings[field.id] ?? field.defaultValue}
            onChange={(val) => updateSetting(field.id, val)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────── Individual Field Renderer ─────────────── */

interface SettingFieldProps {
  field: ToolSettingField;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

function SettingField({ field, value, onChange }: SettingFieldProps) {
  switch (field.type) {
    case 'slider':
      return (
        <div className="setting-field">
          <label className="setting-field__label">
            {field.label}
            <span className="setting-field__value">
              {value}
              {field.suffix ?? ''}
            </span>
          </label>
          <input
            type="range"
            className="setting-field__slider"
            min={field.min}
            max={field.max}
            step={field.step}
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );

    case 'select':
      return (
        <div className="setting-field">
          <label className="setting-field__label">{field.label}</label>
          <select
            className="setting-field__select"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'toggle':
      return (
        <div className="setting-field">
          <div className="setting-field__toggle-wrapper">
            <span className="setting-field__label">{field.label}</span>
            <button
              type="button"
              className={`setting-field__toggle ${value ? 'setting-field__toggle--active' : ''}`}
              onClick={() => onChange(!value)}
              role="switch"
              aria-checked={Boolean(value)}
              aria-label={field.label}
            >
              <span className="setting-field__toggle-knob" />
            </button>
          </div>
        </div>
      );

    case 'number':
      return (
        <div className="setting-field">
          <label className="setting-field__label">
            {field.label}
            {field.suffix && (
              <span className="setting-field__value">{field.suffix}</span>
            )}
          </label>
          <input
            type="number"
            className="setting-field__number"
            min={field.min}
            max={field.max}
            step={field.step}
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );

    case 'text':
      return (
        <div className="setting-field">
          <label className="setting-field__label">{field.label}</label>
          <input
            type="text"
            className="setting-field__text"
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'color':
      return (
        <div className="setting-field">
          <label className="setting-field__label">{field.label}</label>
          <div className="setting-field__color-wrapper">
            <input
              type="color"
              className="setting-field__color"
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="setting-field__color-value">{String(value)}</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
