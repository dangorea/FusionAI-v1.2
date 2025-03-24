export interface User {
  auth0Id: string;
  email: string;
  emailVerified: boolean;
  givenName: string;
  familyName: string;
  fullName: string;
  nickname: string;
  profilePicture: string;
  lastUpdated?: Date;
  isOnboarded: boolean;
  onboardingDetails: Record<string, any>;
  invitationStatus?: string;
  invitedBy?: string;
}

export interface UserState {
  user: User | null;
}
