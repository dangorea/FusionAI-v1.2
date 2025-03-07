import React, { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Table } from 'antd';
import type { InputRef } from 'antd/es/input';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import type { ProjectType } from '../../model/type';

interface ProjectTableProps {
  projectBlocks: ProjectType[];
  onSelectChange: (selectedIds: React.Key[]) => void;
}

export function ProjectTable({
  projectBlocks,
  onSelectChange,
}: ProjectTableProps) {
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

  const getColumnSearchProps = (dataIndex: keyof ProjectType) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder="Search"
          value={selectedKeys[0] as string}
          onChange={(e) => {
            const { value } = e.target;
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
    onFilter: (value: string, record: ProjectType) => {
      const fieldValue = record[dataIndex];
      return fieldValue
        ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
  });

  const filteredData = (projectBlocks || []).filter((item) => {
    const title = item.title || '';
    const details = item.details || '';
    const organization = item.orgId || '';
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
      render: (text: string, record: ProjectType) => {
        const isExpanded = expandedRowKeys.includes(record.id);
        const contentPreview =
          text && text.length > 1000 && !isExpanded
            ? `${text.slice(0, 1000)}...`
            : text || '';

        return (
          <button
            type="button"
            onClick={toggleExpandRow.bind(null, record.id)}
            style={{ cursor: 'pointer', background: 'none', border: 'none' }}
          >
            {contentPreview}
            {text && text.length > 1000 && !isExpanded && (
              <strong style={{ marginLeft: 5 }}>Read more</strong>
            )}
          </button>
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
        pageSize,
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
}
