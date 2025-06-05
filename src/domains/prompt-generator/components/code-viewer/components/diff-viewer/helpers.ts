import type { CSSProperties } from 'react';
import type { DiffViewerStyleOverrides } from './index';

export const displayedOriginal = (originalCode: string): string =>
  originalCode.replace(/\r/g, '\r').replace(/\n/g, '\n').trimEnd();

export const displayedModified = (modifiedCode: string): string =>
  modifiedCode.replace(/\r/g, '\r').replace(/\n/g, '\n').trimEnd();

export const scrollContainerStyle = (scrollContainerClass: string): string => `
  .${scrollContainerClass}::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .${scrollContainerClass}::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
  .${scrollContainerClass}::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }
  .${scrollContainerClass} {
    scrollbar-color: #555 #1e1e1e;
    scrollbar-width: thin;
  }
`;

export const getLeftCellStyle = (
  type: 'unchanged' | 'removed' | 'empty',
  rowHeight: number,
  styleOverrides?: DiffViewerStyleOverrides,
): CSSProperties => {
  const baseStyles: Record<string, CSSProperties> = {
    removed: { backgroundColor: '#3f2d2d', ...styleOverrides?.removedCodeCell },
    unchanged: {
      backgroundColor: 'transparent',
      ...styleOverrides?.unchangedCodeCell,
    },
    empty: { backgroundColor: 'transparent' },
  };

  return {
    height: rowHeight,
    ...baseStyles[type],
    ...styleOverrides?.baseCodeCell,
  };
};

export const getRightCellStyle = (
  type: 'unchanged' | 'added' | 'empty',
  rowHeight: number,
  styleOverrides?: DiffViewerStyleOverrides,
): CSSProperties => {
  const baseStyles: Record<string, CSSProperties> = {
    added: { backgroundColor: '#294436', ...styleOverrides?.addedCodeCell },
    unchanged: {
      backgroundColor: 'transparent',
      ...styleOverrides?.unchangedCodeCell,
    },
    empty: { backgroundColor: 'transparent' },
  };

  return {
    height: rowHeight,
    ...baseStyles[type],
  };
};
