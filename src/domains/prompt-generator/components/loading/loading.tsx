import type { ReactNode } from 'react';
import React from 'react';
import { Spin } from 'antd';
import styles from './loading.module.scss';

type Props = { loading: boolean; children: ReactNode };

export function Loading({ loading, children }: Props) {
  return loading ? (
    <div className={styles['loading-container']}>
      <Spin
        spinning
        tip="Just a sec, we're summoning some code ninjas..."
        size="large"
      />
      <div className={styles['loading-notification']}>
        Hang tight—our magic is brewing!
      </div>
    </div>
  ) : (
    children
  );
}
