import React from 'react';
import { Table, Input } from 'antd';
import type { NewWorkItem } from '../../../api/types/WorkItem';
import dayjs from 'dayjs';

interface Project {
  id: string;
  title: string;
}

interface WorkItemTableProps {
  workItems: NewWorkItem[];
  projects: Project[];
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedKeys: React.Key[]) => void;
  expandedRowKeys: string[];
  toggleExpandRow: (id: string) => void;
  onRowClick?: (record: NewWorkItem) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onSearch?: (value: string) => void;
}

export const WorkItemTable = ({
  workItems,
  selectedRowKeys,
  onSelectChange,
  onRowClick,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onSearch,
}: WorkItemTableProps) => {
  const workItemsNames = workItems.map((item) => ({
    ...item,
  }));

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
      sorter: (a: any, b: any) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
      defaultSortOrder: 'descend' as const,
    }
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
        dataSource={workItemsNames}
        rowKey="id"
        scroll={{ y: 800 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
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
};
