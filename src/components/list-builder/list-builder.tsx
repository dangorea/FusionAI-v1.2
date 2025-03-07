import type { CSSProperties, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { List, Typography } from 'antd';

const { Title } = Typography;

export interface ListOption {
  key: string;
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface ListBuilderProps {
  headerTitle?: string;
  headerIcon?: ReactNode;
  headerIconPosition?: 'left' | 'right';
  options: ListOption[];
  globalOptionIcon?: ReactNode;
  lazyLoad?: boolean;
  loadMoreThreshold?: number;
  containerStyle?: CSSProperties;
  onOptionClick?: (option: ListOption) => void;
}

export function ListBuilder({
  headerTitle,
  headerIcon,
  headerIconPosition = 'left',
  options,
  globalOptionIcon,
  lazyLoad = false,
  loadMoreThreshold = 20,
  containerStyle,
  onOptionClick,
}: ListBuilderProps) {
  const [displayedOptions, setDisplayedOptions] = useState<ListOption[]>(
    lazyLoad ? options.slice(0, loadMoreThreshold) : options,
  );

  const observerRef = useRef<HTMLDivElement>(null);

  const loadMoreOptions = () => {
    if (displayedOptions.length < options.length) {
      const nextItems = options.slice(
        displayedOptions.length,
        displayedOptions.length + loadMoreThreshold,
      );
      setDisplayedOptions([...displayedOptions, ...nextItems]);
    }
  };

  useEffect(() => {
    if (!lazyLoad) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMoreOptions();
        }
      });
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [displayedOptions, lazyLoad, options]);

  useEffect(() => {
    setDisplayedOptions(
      lazyLoad ? options.slice(0, loadMoreThreshold) : options,
    );
  }, [options, lazyLoad, loadMoreThreshold]);

  return (
    <div style={{ ...containerStyle, overflowY: 'auto' }}>
      {headerTitle && (
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
        >
          {headerIcon && headerIconPosition === 'left' && (
            <span style={{ marginRight: 8 }}>{headerIcon}</span>
          )}
          <Title level={4} style={{ margin: 0 }}>
            {headerTitle}
          </Title>
          {headerIcon && headerIconPosition === 'right' && (
            <span style={{ marginLeft: 8 }}>{headerIcon}</span>
          )}
        </div>
      )}
      <List
        dataSource={lazyLoad ? displayedOptions : options}
        renderItem={(item: ListOption) => (
          <List.Item
            onClick={() => onOptionClick && onOptionClick(item)}
            style={{ cursor: 'pointer', padding: '8px 16px' }}
          >
            {item.icon ? (
              <span style={{ marginRight: 8 }}>{item.icon}</span>
            ) : (
              globalOptionIcon && (
                <span style={{ marginRight: 8 }}>{globalOptionIcon}</span>
              )
            )}
            <span>{item.label}</span>
          </List.Item>
        )}
      />
      {lazyLoad && (
        <div ref={observerRef} style={{ height: 20, margin: '10px 0' }} />
      )}
    </div>
  );
}
