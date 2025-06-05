import type { Key } from 'react';
import { useCallback, useMemo } from 'react';
import { Table } from 'antd';
import type { OrganizationType } from '../../model/types';
import { CommonSearchBar } from '../../../../components/common-search-bar';
import { CommonTable } from '../../../../components';
import type { OrganizationManagementDataType } from '../../../../lib/redux/feature/organization-management/types';

interface OrganizationBlockTableProps {
  organizationManagements: OrganizationManagementDataType[];
  onSelectChange: (_: Key[], selectedOrganizations: OrganizationType[]) => void;
  selectedRowKeys: Key[];
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, size: number) => void;
  onSearch: (value: string) => void;
  setOpen: (isOpen: boolean) => void;
}

function OrganizationManagementBlockTable({
  organizationManagements,
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
        placeholder="Search organization members..."
        onSearch={onSearch}
      />
      <CommonTable
        selectedRowKeys={selectedRowKeys as Key[]}
        onChange={onSelectChange}
        tableData={organizationManagements}
        paginationData={paginationData}
        handleRowClick={handleRowClick}
      >
        <Table.Column
          title="Email"
          render={(_, record) => record.email}
          onCell={() => ({ style: { minWidth: 150 } })}
          width="20%"
        />
        <Table.Column
          title="Roles"
          render={(_, record) =>
            Array.isArray(record.roles) ? record.roles.join(', ') : ''
          }
          onCell={() => ({ style: { minWidth: 170 } })}
        />
      </CommonTable>
    </>
  );
}

export { OrganizationManagementBlockTable };
