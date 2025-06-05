import type { TablePaginationConfig } from 'antd';
import { Table } from 'antd';
import type { Key, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

type Props<T extends { id: Key }> = {
  children: ReactNode;
  selectedRowKeys: Key[];
  onChange: (selectedKeys: Key[]) => void;
  tableData: T[];
  paginationData?: Partial<TablePaginationConfig>;
  handleRowClick?: (record: T) => void;
  rowKey?: keyof T | ((record: T) => Key);
};

function CommonTable<T extends { id: Key }>({
  children,
  selectedRowKeys,
  onChange,
  tableData,
  paginationData,
  handleRowClick,
  rowKey,
}: Props<T>) {
  const pagination: TablePaginationConfig = useMemo(
    () => ({
      position: ['bottomRight'],
      showSizeChanger: true,
      pageSizeOptions: ['10', '15', '20', '50', '100'],
      ...paginationData,
    }),
    [paginationData],
  );

  const onRowCallback = useCallback(
    (record: T) => {
      if (handleRowClick) {
        return {
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        };
      }
      return {};
    },
    [handleRowClick],
  );

  const computedRowKey = useMemo(() => {
    if (rowKey) {
      if (typeof rowKey === 'function') {
        return rowKey;
      }
      return (record: T) => record[rowKey];
    }
    return (record: T) => record.id;
  }, [rowKey]);

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      <Table<T>
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange,
        }}
        dataSource={tableData}
        rowKey={(record: T) => {
          const key = computedRowKey(record);
          return key != null ? key.toString() : '';
        }}
        pagination={pagination}
        onRow={onRowCallback}
      >
        {children}
      </Table>
    </div>
  );
}

export { CommonTable };
