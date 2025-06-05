import { Button, Input } from 'antd';
import { AppstoreOutlined, RightOutlined } from '@ant-design/icons';
import { useState } from 'react';
import style from '../wizard-pages.module.scss';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../../lib/redux/feature/organization/selectors';
import { createProjectThunk } from '../../../../lib/redux/feature/projects/thunk';
import { setSelectedProjectId } from '../../../../lib/redux/feature/projects/reducer';

type Props = {
  increasePage: () => void;
};

function CreateDataProjectPage({ increasePage }: Props) {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);

  const [dataProjectName, setDataProjectName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAddProject = async () => {
    setLoading(true);
    const newProject = {
      name: dataProjectName,
    };

    if (!org?.slug) {
      console.log('No organization selected');
      setLoading(false);
    } else {
      dispatch(
        createProjectThunk({
          orgSlug: org.slug,
          newProject,
        }),
      )
        .unwrap()
        .then((project) => {
          dispatch(setSelectedProjectId(project.id));
          setLoading(false);
          increasePage();
        })
        .catch((error) => {
          console.log('Error creating project:', error);
          setLoading(false);
        });
    }
  };

  return (
    <div className={style['page-container']}>
      <div className={style['title-container']}>
        <AppstoreOutlined className={style['icon-title']} />
        <h2 className={style.title}>Create Your First Project</h2>
      </div>
      <div className={style.description}>
        Projects help you organize your work. Each project can connect to
        different repositories and knowledge bases.
      </div>
      <div className={style['label-container']}>
        <p className={style.label}>Project Name</p>
      </div>
      <Input
        placeHolder="Enter project name"
        value={dataProjectName}
        onChange={(e) => setDataProjectName(e.target.value)}
        className={style.input}
      />
      <div className={style['submit-button-container']}>
        <Button
          loading={loading}
          disabled={!dataProjectName}
          type="primary"
          size="large"
          className={style['submit-button']}
          onClick={() => handleAddProject()}
        >
          Next
          <RightOutlined />
        </Button>
      </div>
    </div>
  );
}

export { CreateDataProjectPage };
