import type { Key } from 'react';
import { useCallback, useMemo } from 'react';
import { Table } from 'antd';
import type { ProjectType } from '../../model/type';
import { CommonSearchBar } from '../../../../components/common-search-bar';
import { CommonTable } from '../../../../components';

interface ProjectTableProps {
  projectBlocks: ProjectType[];
  onSelectChange: (_: Key[], selectedProjects: ProjectType[]) => void;
  selectedRowKeys: string[];
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, size: number) => void;
  onSearch: (value: string) => void;
  setOpen: (isOpen: boolean) => void;
}

function ProjectTable({
  projectBlocks,
  onSelectChange,
  selectedRowKeys,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onSearch,
  setOpen,
}: ProjectTableProps) {
  const paginationData = useMemo(
    () => ({
      current: currentPage,
      pageSize,
      total,
      onChange: onPageChange,
    }),
    [currentPage, onPageChange, pageSize, total],
  );

  const handleRowClick = useCallback(
    (record: ProjectType) => {
      onSelectChange([], [record]);
      setOpen(true);
    },
    [onSelectChange, setOpen],
  );

  return (
    <>
      <CommonSearchBar placeholder="Search projects..." onSearch={onSearch} />
      <CommonTable
        selectedRowKeys={selectedRowKeys as Key[]}
        onChange={onSelectChange}
        tableData={projectBlocks}
        paginationData={paginationData}
        handleRowClick={handleRowClick}
      >
        <Table.Column
          title="Name"
          render={(_, record) => record.name}
          onCell={() => ({
            style: { minWidth: 150 },
          })}
          width="20%"
        />
        <Table.Column
          title="Description"
          render={(_, record) => record.description}
          onCell={() => ({
            style: { minWidth: 170 },
          })}
        />
      </CommonTable>
    </>
  );
}

export { ProjectTable };
