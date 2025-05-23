import type { CSSProperties, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { List, Typography } from 'antd';

const { Title } = Typography;

export interface ListOption {
  key: string;
  label: ReactNode;
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
  selectionType?: 'single' | 'multiple';
  selectedKeys?: string[];
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
  selectedKeys,
}: ListBuilderProps) {
  const [displayedOptions, setDisplayedOptions] = useState<ListOption[]>(
    lazyLoad ? options.slice(0, loadMoreThreshold) : options,
  );
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(
    [],
  );
  const finalSelectedKeys = selectedKeys ?? internalSelectedKeys;

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
    let newSelectedKeys: string[];
    if (selectionType === 'multiple') {
      if (finalSelectedKeys.includes(item.key)) {
        newSelectedKeys = finalSelectedKeys.filter((key) => key !== item.key);
      } else {
        newSelectedKeys = [...finalSelectedKeys, item.key];
      }
    } else {
      newSelectedKeys = [item.key];
    }
    if (!selectedKeys) {
      setInternalSelectedKeys(newSelectedKeys);
    }
    onOptionClick?.(item);
  };

  return (
    <div style={{ ...containerStyle, overflowY: 'auto' }}>
      {headerTitle && (
        <div
          style={{
            backgroundColor: '#EFF0FB',
            marginBottom: 16,
            padding: '8px',
            textAlign: 'center',
            borderTopLeftRadius: '8px',
          }}
        >
          {headerIcon && headerIconPosition === 'left' && (
            <span style={{ marginRight: 8 }}>{headerIcon}</span>
          )}
          <Title level={4} style={{ margin: 0, display: 'inline-block' }}>
            {headerTitle}
          </Title>
          {headerIcon && headerIconPosition === 'right' && (
            <span style={{ marginLeft: 8 }}>{headerIcon}</span>
          )}
        </div>
      )}
      <List
        grid={{ gutter: 4, column: 1 }}
        dataSource={lazyLoad ? displayedOptions : options}
        style={{ padding: '0 10px' }}
        renderItem={(item: ListOption) => {
          const isSelected = finalSelectedKeys.includes(item.key);
          const itemStyle = {
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: isSelected ? '#e6f7ff' : '#EFF0FB',
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

              {typeof item.label === 'string' ? (
                <span>{item.label}</span>
              ) : (
                item.label
              )}
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
