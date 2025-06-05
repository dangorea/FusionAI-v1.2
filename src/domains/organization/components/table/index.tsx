import type { Key } from 'react';
import { useCallback, useMemo } from 'react';
import { Table } from 'antd';
import type { OrganizationType } from '../../model/types';
import { CommonSearchBar } from '../../../../components/common-search-bar';
import { CommonTable } from '../../../../components';

interface OrganizationBlockTableProps {
  organizationBlocks: OrganizationType[];
  onSelectChange: (_: Key[], selectedOrganizations: OrganizationType[]) => void;
  selectedRowKeys: Key[];
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, size: number) => void;
  onSearch: (value: string) => void;
  setOpen: (isOpen: boolean) => void;
}

function OrganizationBlockTable({
  organizationBlocks,
  selectedRowKeys,
  onSelectChange,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onSearch,
  setOpen,
}: OrganizationBlockTableProps) {
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
    (record: OrganizationType) => {
      onSelectChange([], [record]);
      setOpen(true);
    },
    [onSelectChange, setOpen],
  );

  return (
    <>
      <CommonSearchBar
        placeholder="Search organizations..."
        onSearch={onSearch}
      />
      <CommonTable
        selectedRowKeys={selectedRowKeys as Key[]}
        onChange={onSelectChange}
        tableData={organizationBlocks}
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
          title="Slug"
          render={(_, record) => record.slug}
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

export { OrganizationBlockTable };
