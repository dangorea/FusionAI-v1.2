import type { CSSProperties, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, List, Typography } from 'antd';

import styles from './list-builder.module.scss';

const { Title } = Typography;

export interface ListOption {
  key: string;
  label: ReactNode;
  value: string;
  icon?: ReactNode;
  content?: string;
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
  onLabelClick?: (option: ListOption) => void;
  selectionType?: 'single' | 'multiple';
  selectedKeys?: string[];
  useCheckboxes?: boolean;
}

export function ListBuilder({
  headerTitle,
  headerIcon,
  headerIconPosition = 'left',
  options,
  globalOptionIcon,
  lazyLoad = false,
  loadMoreThreshold = 20,
  containerStyle = {},
  onOptionClick,
  onLabelClick,
  selectionType = 'single',
  selectedKeys,
  useCheckboxes = false,
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

  const handleCheckboxChange = (item: ListOption) => {
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

  const handleLabelContainerClick = (item: ListOption) => {
    onLabelClick?.(item);
  };

  const containerClassNames = [styles.listBuilderContainer];
  const finalContainerStyle = { ...containerStyle };

  return (
    <div className={containerClassNames.join(' ')} style={finalContainerStyle}>
      {headerTitle && (
        <div className={styles.headerContainer}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {headerIcon && headerIconPosition === 'left' && (
              <span style={{ marginRight: 8 }}>{headerIcon}</span>
            )}
            <Title level={4} className={styles.headerTitle}>
              {headerTitle}
            </Title>
          </div>
          {headerIcon && headerIconPosition === 'right' && (
            <span style={{ marginLeft: 8 }}>{headerIcon}</span>
          )}
        </div>
      )}

      <List
        grid={{ gutter: 4, column: 1 }}
        dataSource={lazyLoad ? displayedOptions : options}
        className={styles.listItemContainer}
        renderItem={(item: ListOption) => {
          const isSelected = finalSelectedKeys.includes(item.key);
          if (useCheckboxes) {
            return (
              <List.Item
                role="button"
                tabIndex={0}
                className={[
                  styles.listItem,
                  isSelected ? styles.selectedItem : '',
                  styles.checkboxModeListItem,
                ].join(' ')}
                onClick={handleLabelContainerClick.bind(null, item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLabelContainerClick(item);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleCheckboxChange.bind(null, item)}
                  />
                  <div className={styles.labelContainer}>
                    {item.icon ? (
                      <span className={styles.iconMarginRight}>
                        {item.icon}
                      </span>
                    ) : (
                      globalOptionIcon && (
                        <span className={styles.iconMarginRight}>
                          {globalOptionIcon}
                        </span>
                      )
                    )}
                    <span className={styles['list-item-text']}>
                      {item.label}
                    </span>
                  </div>
                </div>
              </List.Item>
            );
          }
          return (
            <List.Item
              role="button"
              tabIndex={0}
              className={[
                styles.listItem,
                isSelected ? styles.selectedItem : '',
              ].join(' ')}
              onClick={() => {
                let newSelectedKeys: string[];
                if (selectionType === 'multiple') {
                  if (finalSelectedKeys.includes(item.key)) {
                    newSelectedKeys = finalSelectedKeys.filter(
                      (key) => key !== item.key,
                    );
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
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  let newSelectedKeys: string[];
                  if (selectionType === 'multiple') {
                    if (finalSelectedKeys.includes(item.key)) {
                      newSelectedKeys = finalSelectedKeys.filter(
                        (key) => key !== item.key,
                      );
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
                }
              }}
            >
              {item.icon ? (
                <span className={styles.iconMarginRight}>{item.icon}</span>
              ) : (
                globalOptionIcon && (
                  <span className={styles.iconMarginRight}>
                    {globalOptionIcon}
                  </span>
                )
              )}
              <span className={styles['list-item-text']}>{item.label}</span>
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
