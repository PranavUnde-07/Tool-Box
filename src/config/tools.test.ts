import { describe, it, expect } from 'vitest';
import { formatFileSize, getToolById, getToolsByCategory, getAcceptString, tools } from './tools';
import { ENDPOINTS } from '../services/toolApi';
import { toolIcons } from './toolIcons';

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
  });
  it('formats KB/MB with one decimal', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('tool registry', () => {
  it('finds tools by id', () => {
    expect(getToolById('image-converter')?.name).toBe('Image Converter');
    expect(getToolById('does-not-exist')).toBeUndefined();
  });

  it('filters by category', () => {
    const images = getToolsByCategory('image');
    expect(images.length).toBeGreaterThan(0);
    expect(images.every((t) => t.category === 'image')).toBe(true);
  });

  it('every active file tool has a processing endpoint', () => {
    const activeFileTools = tools.filter((t) => t.status === 'active' && t.inputType === 'file');
    for (const tool of activeFileTools) {
      expect(ENDPOINTS[tool.id], `missing endpoint for ${tool.id}`).toBeDefined();
    }
  });

  it('every tool icon resolves in the icon registry', () => {
    for (const tool of tools) {
      expect(toolIcons[tool.icon], `icon "${tool.icon}" missing from registry`).toBeDefined();
    }
  });
});

describe('getAcceptString', () => {
  it('builds an accept record', () => {
    expect(getAcceptString(['image/png'])).toEqual({ 'image/png': [] });
  });
});
