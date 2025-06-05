import React, { useCallback, useMemo } from 'react';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import type { WorkItemType } from '../../model/types';
import { setSelectedWorkItem } from '../../../../lib/redux/feature/work-items/reducer';
import { useAppDispatch } from '../../../../lib/redux/hook';
import { CommonTable } from '../../../../components';
import { CommonSearchBar } from '../../../../components/common-search-bar';
import './styles.module.scss';

interface WorkItemTableProps {
  workItems: WorkItemType[];
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedKeys: React.Key[]) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onSearch?: (value: string) => void;
}

function WorkItemTable({
  workItems,
  selectedRowKeys,
  onSelectChange,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onSearch,
}: WorkItemTableProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleRowClick = useCallback(
    (record: WorkItemType) => {
      dispatch(setSelectedWorkItem(record.id));
      navigate(`/prompt-generator/${record.id}`);
    },
    [dispatch, navigate],
  );

  const paginationData = useMemo(
    () => ({
      current: currentPage,
      pageSize,
      total,
      onChange: onPageChange,
    }),
    [currentPage, onPageChange, pageSize, total],
  );

  return (
    <>
      <CommonSearchBar placeholder="Search work items..." onSearch={onSearch} />
      <CommonTable
        selectedRowKeys={selectedRowKeys}
        onChange={onSelectChange}
        tableData={workItems}
        paginationData={paginationData}
        handleRowClick={handleRowClick}
      >
        <Table.Column title="Name" render={(_, record) => record.name} />
        <Table.Column
          title="Created"
          style={{ width: '20%' }}
          onCell={() => ({
            style: { minWidth: 170 },
          })}
          render={(_, record) =>
            dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')
          }
          sorter={(a: any, b: any) =>
            dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix()
          }
          defaultSortOrder="ascend"
        />
      </CommonTable>
    </>
  );
}

export { WorkItemTable };
