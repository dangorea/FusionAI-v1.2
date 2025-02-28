import { GPTReview } from '../../../components/GPTReview';
import { GptFilesExplorer } from '../../../components/GptFilesExplorer';
import styles from '../../prompt-generator/ui/PromptGenerator.module.scss';

export function GPTIntegrator() {
  return (
    <div className={styles.componentRoot}>
      <div className={styles.cardsGrid}>
        <GptFilesExplorer />
        <div className={styles.promptPreview}>
          <GPTReview />
        </div>
      </div>
    </div>
  );
}
