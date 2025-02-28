import React, { useState, useRef } from 'react';
import { Table, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd/es/input';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { OrganizationManagementDataType } from '../../../Context/OrganizationManagmentContext';

interface OrganizationManagementTableProps {
  organizationManagements: OrganizationManagementDataType[];
  onSelectChange: (selectedIds: React.Key[]) => void;
}

export const OrganizationManagementTable = ({
  organizationManagements,
  onSelectChange,
}: OrganizationManagementTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[]) => {
      onSelectChange(selectedRowKeys);
    },
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
  ) => {
    confirm();
    setSearchText(selectedKeys[0] || '');
  };

  const getColumnSearchProps = (
    dataIndex: keyof OrganizationManagementDataType,
  ) => ({
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
    onFilter: (value: string, record: OrganizationManagementDataType) => {
      const fieldValue = record[dataIndex];
      return fieldValue
        ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
  });

  const filteredData = organizationManagements.filter((item) => {
    const userId = item.userId || '';
    const roles = item.roles || [];
    return (
      userId.toLowerCase().includes(searchText.toLowerCase()) ||
      roles.find((role) => role.toLowerCase().includes(searchText.toLowerCase()))
    );
  });

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      ...getColumnSearchProps('userId'),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[] | undefined) => {
        return Array.isArray(roles) ? roles.join(', ') : '';
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
      rowKey="userId"
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
