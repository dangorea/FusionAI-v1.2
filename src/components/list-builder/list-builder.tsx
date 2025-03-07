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
  // New prop to choose between single or multiple selection
  selectionType?: 'single' | 'multiple';
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
  selectionType = 'single',
}: ListBuilderProps) {
  const [displayedOptions, setDisplayedOptions] = useState<ListOption[]>(
    lazyLoad ? options.slice(0, loadMoreThreshold) : options,
  );

  // State to track the selected option keys
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

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

  const handleItemClick = (item: ListOption) => {
    if (selectionType === 'multiple') {
      setSelectedKeys((prev) =>
        prev.includes(item.key)
          ? prev.filter((key) => key !== item.key)
          : [...prev, item.key],
      );
    } else {
      setSelectedKeys([item.key]);
    }
    onOptionClick?.(item);
  };

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
        renderItem={(item: ListOption) => {
          const isSelected = selectedKeys.includes(item.key);
          const itemStyle = {
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: isSelected ? '8px' : undefined,
            backgroundColor: isSelected ? '#e6f7ff' : undefined,
          };
          return (
            <List.Item onClick={() => handleItemClick(item)} style={itemStyle}>
              {item.icon ? (
                <span style={{ marginRight: 8 }}>{item.icon}</span>
              ) : (
                globalOptionIcon && (
                  <span style={{ marginRight: 8 }}>{globalOptionIcon}</span>
                )
              )}
              <span>{item.label}</span>
            </List.Item>
          );
        }}
      />
      {lazyLoad && (
        <div ref={observerRef} style={{ height: 20, margin: '10px 0' }} />
      )}
    </div>
  );
}
