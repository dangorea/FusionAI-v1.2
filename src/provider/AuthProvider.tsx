import { ReactNode, useEffect } from 'react';
import { useAppDispatch } from '../lib/redux/hook';
import { setToken } from '../lib/redux/feature/auth/reducer';

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedToken = localStorage.getItem('id_token');
    if (savedToken) {
      dispatch(setToken(savedToken));
    }
  }, [dispatch]);

  return children;
}
