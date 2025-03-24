// File: src/components/slide-panel/SlidePanel.tsx
import React, { useState } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

export interface SlidePanelProps {
  children: React.ReactNode;
  /** If true, the panel starts open */
  defaultOpen?: boolean;
  /** Determines which side the panel slides from */
  direction?: 'left' | 'right';
  /** Width of the panel when open (can be in px, %, etc.) */
  panelWidth?: number | string;
  /** Minimum width of the panel when open */
  minPanelWidth?: number | string;
}

export const SlidePanel: React.FC<SlidePanelProps> = ({
  children,
  defaultOpen = true,
  direction = 'right',
  panelWidth = 300,
  minPanelWidth = 300,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const togglePanel = () => setOpen(!open);

  // Fixed width for the toggle button in pixels.
  const toggleWidth = 30;

  // Helper to ensure CSS values have units.
  const getCssValue = (value: number | string): string =>
    typeof value === 'number' ? `${value}px` : value;

  const computedPanelWidth = getCssValue(panelWidth);
  const computedMinPanelWidth = getCssValue(minPanelWidth);

  // When open, use the specified panel width; when closed, shrink to toggleWidth.
  const containerWidth = open ? computedPanelWidth : `${toggleWidth}px`;
  const containerMinWidth = open ? computedMinPanelWidth : `${toggleWidth}px`;

  // Choose the appropriate icon based on state and direction.
  let toggleIcon;
  if (direction === 'right') {
    toggleIcon = open ? <RightOutlined /> : <LeftOutlined />;
  } else {
    toggleIcon = open ? <LeftOutlined /> : <RightOutlined />;
  }

  const toggleButtonStyle: React.CSSProperties =
    direction === 'right'
      ? {
          position: 'absolute',
          top: '50%',
          left: -toggleWidth / 2,
          transform: 'translateY(-50%)',
        }
      : {
          position: 'absolute',
          top: '50%',
          right: -toggleWidth / 2,
          transform: 'translateY(-50%)',
        };

  return (
    <div
      style={{
        position: 'relative',
        width: containerWidth,
        minWidth: containerMinWidth,
        overflow: 'hidden',
        transition: 'width 0.3s ease',
      }}
    >
      <div style={{ width: '100%' }}>{children}</div>
      <Button
        type="primary"
        size="small"
        onClick={togglePanel}
        style={toggleButtonStyle}
      >
        {toggleIcon}
      </Button>
    </div>
  );
};
