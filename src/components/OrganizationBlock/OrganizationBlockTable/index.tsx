import React, { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Table } from 'antd';
import type { InputRef } from 'antd/es/input';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { OrganizationType } from '../../../domains/organization/model/types';

interface OrganizationBlockTableProps {
  organizationBlocks: OrganizationType[];
  onSelectChange: (selectedIds: React.Key[]) => void;
}

export function OrganizationBlockTable({
  organizationBlocks,
  onSelectChange,
}: OrganizationBlockTableProps) {
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

  const getColumnSearchProps = (dataIndex: keyof OrganizationType) => ({
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
    onFilter: (value: string, record: OrganizationType) => {
      const fieldValue = record[dataIndex];
      return fieldValue
        ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
  });

  const filteredData = organizationBlocks.filter((item) => {
    const name = item.name || '';
    const description = item.description || '';
    const slug = item.slug || '';
    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      description.toLowerCase().includes(searchText.toLowerCase()) ||
      slug.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: OrganizationType) => {
        const isExpanded = expandedRowKeys.includes(record._id);
        const contentPreview =
          text && text.length > 1000 && !isExpanded
            ? `${text.slice(0, 1000)}...`
            : text || '';

        return (
          <span
            onClick={() => toggleExpandRow(record._id)}
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
      rowKey="_id"
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
