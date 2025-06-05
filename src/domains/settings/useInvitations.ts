import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/redux/hook';
import {
  fetchInvitations,
  acceptInvitationThunk,
  declineInvitationThunk,
} from '../../lib/redux/feature/invitations/thunk';
import {
  selectAllInvitations,
  selectInvitationsLoading,
} from '../../lib/redux/feature/invitations/selectors';

export const useInvitations = () => {
  const dispatch = useAppDispatch();
  const invitations = useAppSelector(selectAllInvitations);
  const loading = useAppSelector(selectInvitationsLoading);

  useEffect(() => {
    dispatch(fetchInvitations());
  }, [dispatch]);

  const handleAccept = (id: string) => {
    dispatch(acceptInvitationThunk(id));
  };

  const handleDecline = (id: string) => {
    dispatch(declineInvitationThunk(id));
  };

  return { invitations, loading, handleAccept, handleDecline };
};
