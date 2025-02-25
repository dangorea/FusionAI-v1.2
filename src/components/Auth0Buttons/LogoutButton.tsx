import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'antd';

const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth0();

  return (
    isAuthenticated && (
      <Button type="default" onClick={() => logout()}>
        SignOut
      </Button>
    )
  );
};

export default LogoutButton;
