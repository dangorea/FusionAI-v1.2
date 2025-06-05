import { Input } from 'antd';
import React from 'react';

type Props = {
  placeholder: string;
  onSearch: (value: string) => void;
};

function CommonSearchBar({ placeholder, onSearch }: Props) {
  return (
    <Input.Search
      placeholder={placeholder}
      onSearch={onSearch}
      style={{ marginBottom: 16, minWidth: 500 }}
    />
  );
}

export { CommonSearchBar };
