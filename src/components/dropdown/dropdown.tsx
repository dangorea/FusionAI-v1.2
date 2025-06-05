import type { CSSProperties } from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Select } from 'antd';

const { Option } = Select;

export interface DropdownOption {
  value: string;
  label: string;

  onClick?: () => void;
}

export interface DropdownProps {
  options: DropdownOption[];
  multiSelect?: boolean;
  defaultValue?: string | string[];
  onChange?: (selected: string | string[]) => void;
  style?: CSSProperties;
  selectStyle?: CSSProperties;
  dropDownStyle?: CSSProperties;
  className?: string;

  fallbackOption?: DropdownOption;
  buttonOptions?: DropdownOption[];
}

export interface DropdownRef {
  getSelected: () => string | string[];
  setSelected: (value: string | string[]) => void;
  clearSelected: () => void;
}

export const Dropdown = forwardRef<DropdownRef, DropdownProps>(
  (
    {
      options,
      multiSelect = false,
      defaultValue,
      onChange,
      style,
      selectStyle,
      dropDownStyle,
      className,
      fallbackOption,
      buttonOptions,
    },
    ref,
  ) => {
    const initialSelectedArr = (() => {
      if (defaultValue !== undefined) {
        if (Array.isArray(defaultValue)) {
          return defaultValue;
        }
        if (defaultValue) {
          return [defaultValue];
        }
      }
      return [];
    })();

    const [selectedArr, setSelectedArr] =
      useState<string[]>(initialSelectedArr);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
      null,
    );

    const handleSelect = useCallback((newValue: string) => {
      setSelectedArr((prev) => {
        const filtered = prev.filter((v) => v !== newValue);
        return [newValue, ...filtered];
      });
    }, []);

    const handleDeselect = useCallback((removedValue: string) => {
      setSelectedArr((prev) => prev.filter((v) => v !== removedValue));
    }, []);

    const handleChange = useCallback(
      (values: string[]) => {
        onChange?.(values);
      },
      [onChange],
    );

    useEffect(() => {
      if (defaultValue !== undefined) {
        if (Array.isArray(defaultValue)) {
          setSelectedArr(defaultValue);
        } else if (defaultValue) {
          setSelectedArr([defaultValue]);
        } else {
          setSelectedArr([]);
        }
      }
    }, [defaultValue]);

    useImperativeHandle(ref, () => ({
      getSelected: () => (multiSelect ? selectedArr : selectedArr[0] || ''),
      setSelected: (value: string | string[]) => {
        if (!Array.isArray(value)) {
          setSelectedArr([value]);
          onChange?.(value);
        } else {
          setSelectedArr(value);
          onChange?.(value);
        }
      },
      clearSelected: () => {
        setSelectedArr([]);
        onChange?.(multiSelect ? [] : '');
      },
    }));

    const customTagRender = useCallback(
      (props: any) => {
        const { label, value, closable, onClose } = props;

        const commonTagStyle: CSSProperties = {
          display: 'inline-block',
          padding: '2px 4px',
          marginRight: '4px',
        };

        if (fallbackOption && value === fallbackOption.value) {
          return (
            <div
              style={{
                ...commonTagStyle,
                background: 'transparent',
                border: 'none',
                fontStyle: 'italic',
              }}
            >
              {fallbackOption.label}
            </div>
          );
        }

        return (
          <div
            style={{
              ...commonTagStyle,
              background: '#fafafa',
              border: '1px solid #d9d9d9',
              borderRadius: '2px',
            }}
          >
            {label}
            {closable && (
              <span
                role="presentation"
                onClick={onClose}
                style={{ marginLeft: 4, cursor: 'pointer' }}
              >
                ×
              </span>
            )}
          </div>
        );
      },
      [fallbackOption],
    );

    const defaultSelectStyle: CSSProperties = {
      border: 'none',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'unset',
      width: 'max-content',
    };

    const optionStyle: CSSProperties = {
      width: 'auto',
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'unset',
      marginBottom: '4px',
    };

    const dropdownStyles: CSSProperties = {
      width: 'fit-content',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflow: 'auto',
      textOverflow: 'unset',
      ...dropDownStyle,
    };

    const customDropdownRender = useCallback(
      (menu: React.ReactNode) => (
        <>
          {buttonOptions && buttonOptions.length > 0 && (
            <>
              {buttonOptions.map((option, idx) => (
                <div
                  role="presentation"
                  key={option.value}
                  onMouseEnter={() => setHoveredButtonIndex(idx)}
                  onMouseLeave={() => setHoveredButtonIndex(null)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    option?.onClick?.();
                    setDropdownOpen(false);
                  }}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s',
                    backgroundColor:
                      hoveredButtonIndex === idx ? '#e6f7ff' : 'transparent',
                  }}
                >
                  {option.label}
                </div>
              ))}
              <div
                style={{
                  marginTop: '4px',
                  marginBottom: '4px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              />
            </>
          )}
          {menu}
        </>
      ),
      [buttonOptions, hoveredButtonIndex],
    );

    return (
      <div style={style} className={className}>
        <Select
          mode={multiSelect ? 'multiple' : undefined}
          value={
            multiSelect
              ? selectedArr?.length > 0
                ? selectedArr
                : fallbackOption
                  ? [fallbackOption.value]
                  : []
              : selectedArr.length > 0
                ? selectedArr[0]
                : undefined
          }
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          onChange={handleChange}
          open={dropdownOpen}
          onDropdownVisibleChange={(open) => setDropdownOpen(open)}
          style={{ ...defaultSelectStyle, ...selectStyle }}
          variant="borderless"
          placeholder={multiSelect ? undefined : fallbackOption?.label}
          optionLabelProp="label"
          dropdownStyle={dropdownStyles}
          dropdownRender={buttonOptions ? customDropdownRender : undefined}
          maxTagCount={2}
          maxTagPlaceholder={(omittedValues) => (
            <span style={{ marginLeft: 6, fontWeight: 600 }}>
              +{omittedValues.length}
            </span>
          )}
          tagRender={multiSelect ? customTagRender : undefined}
        >
          {options.map((option) => (
            <Option
              key={option.value}
              value={option.value}
              label={option.label}
              style={optionStyle}
            >
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';
