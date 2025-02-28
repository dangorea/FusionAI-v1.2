import React, { useState, useRef } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Table, Input } from 'antd';
import type { InputRef } from 'antd/es/input';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { DataType } from '../../../Context/ProjectsContext';

interface ProjectTableProps {
  projectBlocks: DataType[];
  onSelectChange: (selectedIds: React.Key[]) => void;
}

export const ProjectTable = ({
  projectBlocks,
  onSelectChange,
}: ProjectTableProps) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[]) => {
      onSelectChange(selectedRowKeys);
    },
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRowKeys((prevKeys) =>
      prevKeys.includes(id)
        ? prevKeys.filter((key) => key !== id)
        : [...prevKeys, id],
    );
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
  ) => {
    confirm();
    setSearchText(selectedKeys[0] || '');
  };

  const getColumnSearchProps = (dataIndex: keyof DataType) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search`}
          value={selectedKeys[0] as string}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedKeys(value ? [value] : []);
            setSearchText(value);
          }}
          onPressEnter={() => {
            handleSearch(selectedKeys as string[], confirm);
          }}
          style={{ display: 'block' }}
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined
        style={{ color: filtered ? '#1890ff' : undefined, cursor: 'pointer' }}
        onClick={() => {
          if (searchInput.current) {
            searchInput.current.focus();
          }
        }}
      />
    ),
    onFilter: (value: string, record: DataType) => {
      const fieldValue = record[dataIndex];
      return fieldValue
        ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
  });

  const filteredData = (projectBlocks || []).filter((item) => {
    const title = item.title || '';
    const details = item.details || '';
    const organization = item.organization || '';
    return (
      title.toLowerCase().includes(searchText.toLowerCase()) ||
      details.toLowerCase().includes(searchText.toLowerCase()) ||
      organization.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Organization',
      dataIndex: 'organization',
      key: 'organization',
      width: '20%',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (text: string, record: DataType) => {
        const isExpanded = expandedRowKeys.includes(record.id);
        const contentPreview =
          text && text.length > 1000 && !isExpanded
            ? `${text.slice(0, 1000)}...`
            : text || '';

        return (
          <span
            onClick={() => toggleExpandRow(record.id)}
            style={{ cursor: 'pointer' }}
          >
            {contentPreview}
            {text && text.length > 1000 && !isExpanded && (
              <span style={{ marginLeft: 5, fontWeight: 'bold' }}>
                Read more
              </span>
            )}
          </span>
        );
      },
    },
  ];

  return (
    <Table
      rowSelection={{
        type: 'checkbox',
        ...rowSelection,
      }}
      columns={columns}
      dataSource={filteredData}
      rowKey="id"
      scroll={{ y: 800 }}
      pagination={{
        position: ['bottomRight'],
        style: { position: 'sticky', bottom: 0 },
        current: currentPage,
        pageSize: pageSize,
        total: filteredData.length,
        onChange: (page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        },
        showSizeChanger: true,
        pageSizeOptions: ['10', '15', '20'],
      }}
      style={{ width: '100%' }}
    />
  );
};
