import { Button } from 'antd';
import {
  FolderOpenOutlined,
  FolderOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useDirectorySelector } from '../../../directoty-selector/useDirectorySelector';
import style from '../wizard-pages.module.scss';
import { useAppSelector } from '../../../../lib/redux/hook';
import { selectSelectedProjectId } from '../../../../lib/redux/feature/projects/selectors';

type Props = {
  increasePage: () => void;
};

function SelectSourceFolderPage({ increasePage }: Props) {
  const selectedProjectId = useAppSelector(selectSelectedProjectId);

  const { handleSelectDirectory, handleSaveDirectory, directoryPath } =
    useDirectorySelector(selectedProjectId);

  return (
    <div className={style['page-container']}>
      <div className={style['title-container']}>
        <FolderOpenOutlined className={style['icon-title']} />
        <h2 className={style.title}>Select Source Folder</h2>
      </div>

      <div className={style.description}>
        Connect your project to your local code repository. AngenAI will use
        this to understand your codebase and generate contextually relevant
        code.
      </div>

      <div className={style['label-container']}>
        <p className={style.label}>Source Folder Path</p>
      </div>

      <div className={style['input-container']}>
        <div className={style['custom-input']}>
          <div className={style['custom-input-text']}>
            {directoryPath || 'Select Source Folder Path'}
          </div>
          <button
            type="button"
            onClick={handleSelectDirectory}
            className={style['select-folder-button']}
            aria-label="Select source folder"
          >
            <FolderOutlined className={style['select-folder-icon']} />
          </button>
        </div>
      </div>

      <div className={style['submit-button-container']}>
        <Button
          disabled={!directoryPath}
          type="primary"
          size="large"
          className={style['submit-button']}
          onClick={() => {
            if (selectedProjectId) {
              handleSaveDirectory(selectedProjectId);
              increasePage();
            }
          }}
        >
          Next
          <RightOutlined />
        </Button>
      </div>
    </div>
  );
}

export { SelectSourceFolderPage };
