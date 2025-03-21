import type { CSSProperties } from 'react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Select } from 'antd';

const { Option } = Select;

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  multiSelect?: boolean;
  defaultValue?: string | string[];
  onChange?: (selected: string | string[]) => void;
  style?: CSSProperties;
  selectStyle?: CSSProperties;
  className?: string;
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
      className,
    },
    ref,
  ) => {
    let initialValue: string | string[];
    if (defaultValue !== undefined) {
      initialValue = defaultValue;
    } else if (multiSelect) {
      initialValue = [];
    } else {
      initialValue = '';
    }

    const [selected, setSelected] = useState<string | string[]>(initialValue);

    useEffect(() => {
      if (defaultValue !== undefined) {
        setSelected(defaultValue);
      }
    }, [defaultValue]);

    useImperativeHandle(ref, () => ({
      getSelected: () => selected,
      setSelected: (value: string | string[]) => {
        setSelected(value);
        onChange?.(value);
      },
      clearSelected: () => {
        const clearedValue = multiSelect ? [] : '';
        setSelected(clearedValue);
        onChange?.(clearedValue);
      },
    }));

    const handleChange = (value: string | string[]) => {
      setSelected(value);
      onChange?.(value);
    };

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
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'unset',
    };

    return (
      <div style={style} className={className}>
        <Select
          mode={multiSelect ? 'multiple' : undefined}
          value={selected}
          onChange={handleChange}
          style={{ ...defaultSelectStyle, ...selectStyle }}
          variant="borderless"
          optionLabelProp="label"
          dropdownStyle={{
            width: 'max-content',
            whiteSpace: 'normal',
            overflow: 'visible',
            textOverflow: 'unset',
          }}
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
