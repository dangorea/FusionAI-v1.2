import { useCallback, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, MouseEventHandler } from 'react';

export interface UseResizablePanelOptions {
  direction: 'left' | 'right';
}

const maxWidth = 800;
const minWidth = 200;

const useResizablePanel = ({ direction }: UseResizablePanelOptions) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(200);

  const startResizing: MouseEventHandler<HTMLDivElement> = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!panelRef.current) return;

      panelRef.current.style.transition = 'none';
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = panelRef.current.offsetWidth;

      const doDrag = (mouseEvent: MouseEvent) => {
        const dx = mouseEvent.clientX - startX;
        let newWidth = direction === 'left' ? startWidth + dx : startWidth - dx;
        newWidth = Math.min(maxWidth, Math.max(minWidth, newWidth));

        setPanelWidth(newWidth);
        if (panelRef.current) {
          panelRef.current.style.width = `${newWidth}px`;
        }
      };

      const stopDrag = () => {
        if (panelRef.current) {
          panelRef.current.style.transition = 'width 0.3s ease-in-out';
        }
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
      };

      document.addEventListener('mousemove', doDrag);
      document.addEventListener('mouseup', stopDrag);
    },
    [direction],
  );

  return { startResizing, panelRef, panelWidth };
};

export { useResizablePanel };
