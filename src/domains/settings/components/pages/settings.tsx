import { LayoutContainer } from '../../../../components';
import { useInvitations } from '../../useInvitations';
import { InvitationsTable } from '../table';

function Settings() {
  const { invitations, loading, handleAccept, handleDecline } =
    useInvitations();

  return (
    <LayoutContainer>
      {/* Invitations */}
      <section
        style={{ maxWidth: '100%', marginBottom: 32, padding: '6px 12px' }}
      >
        <h3>Invitations</h3>
        <InvitationsTable
          invitations={invitations}
          loading={loading}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      </section>

      {/* Other settings sections will go here */}
    </LayoutContainer>
  );
}

export { Settings };
