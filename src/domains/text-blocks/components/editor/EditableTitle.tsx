import React, { useLayoutEffect, useRef } from 'react';
import type { InputRef } from 'antd';
import { Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styles from './editable-title.module.scss';

export interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EditableTitle({
  value,
  onChange,
  placeholder = 'Enter name…',
}: EditableTitleProps) {
  const inputRef = useRef<InputRef>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = inputRef.current?.input;
    const mirror = mirrorRef.current;
    if (!el || !mirror) return;

    const measure = () => {
      mirror.textContent = el.value || placeholder;
      mirror.style.font = window.getComputedStyle(el).font;
      const textWidth = mirror.getBoundingClientRect().width + 8;
      const maxWidth = 300;
      el.style.width = `${Math.min(textWidth, maxWidth)}px`;
    };

    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, [value, placeholder]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.container}
      onClick={() => inputRef.current?.focus()}
      onKeyDown={handleKeyDown}
      aria-label="Edit title"
    >
      <span ref={mirrorRef} className={styles.mirror} />

      <Input
        ref={inputRef}
        className={styles.titleInput}
        value={value}
        placeholder={placeholder}
        variant="borderless"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        onPressEnter={() => inputRef.current?.blur()}
        suffix={<EditOutlined className={styles.editIcon} />}
      />
    </div>
  );
}
