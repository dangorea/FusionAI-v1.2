export interface InvitationType {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  roles: string[];
  invitedBy: string;
  invitedByEmail: string;
  status: string;
  expirationDate: string; // ISO date string
}
