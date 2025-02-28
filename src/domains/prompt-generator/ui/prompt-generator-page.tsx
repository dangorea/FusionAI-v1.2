import { Spin } from 'antd';
import { useState } from 'react';
import { DirectoryExplorer } from '../../../components';
import styles from './PromptGenerator.module.scss';

export function PromptGenerator() {
  const [loading, setLoading] = useState(false);

  return (
    <Spin spinning={loading} tip="Loading GPT response">
      <div className={styles.componentRoot}>
        <div className={styles.cardsGrid}>
          <DirectoryExplorer />
          {/* <TextBlocksPicker /> */}
          <div className={styles.promptPreview}>
            {/* <PromptPreview onNavigate={onNavigate} setLoading={setLoading} /> */}
          </div>
        </div>
      </div>
    </Spin>
  );
}
