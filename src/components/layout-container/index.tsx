import type { ReactNode } from 'react';
import styles from './style.module.scss';

type Props = {
  children: ReactNode;
};

function LayoutContainer({ children }: Props) {
  return <div className={styles['layout-container']}>{children}</div>;
}

export { LayoutContainer };
