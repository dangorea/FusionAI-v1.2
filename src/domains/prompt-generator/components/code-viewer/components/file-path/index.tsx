import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { trimMiddle } from '../../helpers';
import styles from './styles.module.scss';

type Props = {
  filePath?: string;
  filePathStyleOverrides?: CSSProperties;
};

const averageCharWidth = 8;

function FilePath({ filePath, filePathStyleOverrides }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState(false);
  const [displayFilePath, setDisplayFilePath] = useState(filePath || '');

  const updateTrimmedPath = useCallback(() => {
    if (containerRef.current && filePath) {
      const containerWidth = containerRef.current.offsetWidth;
      const maxChars = Math.floor(containerWidth / averageCharWidth);
      const trimmed = trimMiddle(filePath, maxChars);
      setDisplayFilePath(trimmed);
    }
  }, [filePath]);

  useEffect(() => {
    updateTrimmedPath();

    const handleResize = () => {
      if (!hovered) {
        updateTrimmedPath();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filePath, hovered, updateTrimmedPath]);

  if (!filePath) return null;

  return (
    <div
      className={styles.headerStyle}
      style={{
        ...filePathStyleOverrides,
        overflowX: hovered ? 'auto' : 'hidden',
      }}
      title={filePath}
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        updateTrimmedPath();
      }}
    >
      <span style={{ display: 'inline-block' }}>
        {hovered ? filePath : displayFilePath}
      </span>
    </div>
  );
}

export { FilePath };
