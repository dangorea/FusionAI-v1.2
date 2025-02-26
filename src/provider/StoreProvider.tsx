import { lazy, ReactNode, useRef } from 'react';
import { AppStore, makeStore } from '../lib/redux/store';

const Provider = lazy(() =>
  import('react-redux').then((redux) => ({ default: redux.Provider })),
);

export default function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
