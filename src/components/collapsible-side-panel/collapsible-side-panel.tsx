import type { CSSProperties, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './collapsible-side-panel.module.scss';
import { useResizablePanel } from '../../hooks/useResizablePanel';

export interface CollapsibleSidePanelProps {
  children: ReactNode;
  collapseDirection: 'left' | 'right';
  responsiveThreshold: number;
  collapsedWidth: string;
  header?: React.ReactNode;
  extraHeaderIcon?: React.ReactNode;
  style?: CSSProperties;
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function CollapsibleSidePanel({
  collapseDirection,
  responsiveThreshold,
  collapsedWidth,
  header,
  extraHeaderIcon,
  children,
  style = {},
  className = '',
  containerClassName = '',
  headerClassName = '',
  contentClassName = '',
}: CollapsibleSidePanelProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isCollapsed, setIsCollapsed] = useState(
    window.innerWidth <= responsiveThreshold,
  );
  const [hasUserToggled, setHasUserToggled] = useState(false);

  const { panelRef, panelWidth, startResizing } = useResizablePanel({
    direction: collapseDirection,
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!hasUserToggled) {
      setIsCollapsed(windowWidth <= responsiveThreshold);
    }
  }, [windowWidth, hasUserToggled, responsiveThreshold]);

  const handleToggleCollapse = useCallback(() => {
    setHasUserToggled(true);
    setIsCollapsed((prev) => !prev);
  }, []);

  const panelClassName = useMemo(
    () =>
      `${styles.collapsibleSidePanelContainer} ${className} ${containerClassName} ${collapseDirection === 'left' ? styles.leftResizable : styles.rightResizable}`,
    [className, collapseDirection, containerClassName],
  );

  const panelStyle = useMemo(
    () => ({ width: isCollapsed ? collapsedWidth : panelWidth, ...style }),
    [collapsedWidth, isCollapsed, panelWidth, style],
  );

  const renderArrow = () => {
    if (collapseDirection === 'left') {
      return isCollapsed ? <RightOutlined /> : <LeftOutlined />;
    }
    return isCollapsed ? <LeftOutlined /> : <RightOutlined />;
  };

  return (
    <div ref={panelRef} className={panelClassName} style={panelStyle}>
      <div
        className={`${styles.panelHeader} ${headerClassName}`}
        onClick={handleToggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleCollapse();
          }
        }}
      >
        {collapseDirection === 'left' ? (
          <div className={styles.headerContentWrapper}>
            <div className={styles.iconContainer}>{extraHeaderIcon}</div>
            <div
              className={`${styles.headerTextContainer} ${isCollapsed ? styles.collapsedText : ''}`}
            >
              <span className={styles.headerText}>{header}</span>
            </div>
            <div className={styles.arrowContainer}>{renderArrow()}</div>
          </div>
        ) : (
          <div className={styles.headerContentWrapper}>
            <div className={styles.arrowContainer}>{renderArrow()}</div>
            <div className={styles.iconContainer}>{extraHeaderIcon}</div>
            <div
              className={`${styles.headerTextContainer} ${isCollapsed ? styles.collapsedText : ''}`}
            >
              <span className={styles.headerText}>{header}</span>
            </div>
          </div>
        )}
      </div>
      <div className={`${styles.panelContent} ${contentClassName}`}>
        {children}
      </div>
      {isCollapsed ? null : (
        <div
          className={styles.resizer}
          onMouseDown={(e) => startResizing(e as MouseEvent)}
        />
      )}
    </div>
  );
}
