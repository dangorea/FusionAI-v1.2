import React from 'react';
import { Input, Table } from 'antd';
import dayjs from 'dayjs';
import type { WorkItemType } from '../../model/types';

interface WorkItemTableProps {
  workItems: WorkItemType[];
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedKeys: React.Key[]) => void;
  onRowClick?: (record: WorkItemType) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onSearch?: (value: string) => void;
}

export function WorkItemTable({
  workItems,
  selectedRowKeys,
  onSelectChange,
  onRowClick,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onSearch,
}: WorkItemTableProps) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a: any, b: any) =>
        dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
      defaultSortOrder: 'descend' as const,
    },
  ];

  return (
    <>
      <Input.Search
        placeholder="Search work items..."
        onSearch={onSearch}
        style={{ marginBottom: 16 }}
      />
      <Table
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        columns={columns}
        dataSource={workItems}
        rowKey="id"
        scroll={{ y: 800 }}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: onPageChange,
        }}
        style={{ width: '100%' }}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          style: { cursor: 'pointer' },
        })}
      />
    </>
  );
}
