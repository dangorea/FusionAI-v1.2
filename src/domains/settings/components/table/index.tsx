import { Table, Button, Space } from 'antd';
import type { InvitationType } from '../../model/types';

interface InvitationsTableProps {
  invitations: InvitationType[];
  loading: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

function InvitationsTable({
  invitations,
  loading,
  onAccept,
  onDecline,
}: InvitationsTableProps) {
  return (
    <Table<InvitationType>
      dataSource={invitations}
      rowKey="id"
      loading={loading}
      pagination={false}
      style={{
        background: '#fff',
        padding: 16,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '100%',
        overflow: 'auto',
      }}
    >
      <Table.Column title="Email" dataIndex="email" key="email" />
      <Table.Column
        title="Organization Name"
        dataIndex="organizationName"
        key="organizationName"
      />
      <Table.Column
        title="Roles"
        dataIndex="roles"
        key="roles"
        render={(roles: string[]) => roles.join(', ')}
      />
      <Table.Column
        title="Invited By"
        dataIndex="invitedByEmail"
        key="invitedByEmail"
      />
      <Table.Column title="Status" dataIndex="status" key="status" />
      <Table.Column
        title="Expires On"
        dataIndex="expirationDate"
        key="expirationDate"
        render={(date: string) => new Date(date).toLocaleDateString()}
      />
      <Table.Column<InvitationType>
        title="Actions"
        key="actions"
        render={(_, record) =>
          record.status === 'pending' ? (
            <Space>
              <Button type="primary" onClick={() => onAccept(record.id)}>
                Accept
              </Button>
              <Button danger onClick={() => onDecline(record.id)}>
                Decline
              </Button>
            </Space>
          ) : null
        }
      />
    </Table>
  );
}

export { InvitationsTable };
