import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import style from '../wizard-pages.module.scss';
import { createWorkItemThunk } from '../../../../lib/redux/feature/work-items/thunk';
import { setSelectedWorkItem } from '../../../../lib/redux/feature/work-items/reducer';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import { selectSelectedOrganizationEntity } from '../../../../lib/redux/feature/organization/selectors';
import { selectSelectedProjectId } from '../../../../lib/redux/feature/projects/selectors';
import { selectCurrentUser } from '../../../../lib/redux/feature/user/selectors';
import { setUser } from '../../../../lib/redux/feature/user/reducer';

function CreateFirstTaskPage() {
  const dispatch = useAppDispatch();
  const org = useAppSelector(selectSelectedOrganizationEntity);
  const selectedProjectId = useAppSelector(selectSelectedProjectId);
  const user = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();

  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAddWorkItem = () => {
    if (!org?.slug) {
      console.log('No organization selected');
    } else if (!selectedProjectId) {
      console.log('No project selected');
    } else {
      setLoading(true);
      dispatch(
        createWorkItemThunk({
          orgSlug: org.slug,
          projectId: selectedProjectId,
          description,
        }),
      )
        .then((action) => {
          if (createWorkItemThunk.fulfilled.match(action)) {
            const createdWorkItem = action.payload;
            if (user) {
              dispatch(setUser({ ...user, isOnboarded: true }));
            }
            setLoading(false);
            dispatch(setSelectedWorkItem(createdWorkItem.id));
            navigate(`/prompt-generator/${createdWorkItem.id}`);
          } else {
            setLoading(false);
            console.log('Error creating Work Item');
          }
        })
        .catch((error) => {
          setLoading(false);
          console.log('Error creating Work Item:', error);
        });
    }
  };

  return (
    <div className={style['page-container']}>
      <div className={style['title-container']}>
        <LeftOutlined className={style['custom-left-icon']} />
        <RightOutlined className={style['custom-right-icon']} />
        <h2 className={style.title}>Create Your First Task</h2>
      </div>
      <div className={style.description}>
        Let&#39;s create your first task for the AI code generator. Describe
        what you want to build, and AngenAI will help you create it.
      </div>
      <div className={style['label-container']}>
        <p className={style.label}>Task Description</p>
      </div>
      <TextArea
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Create a React login form component with email and password fields, validation, and submission handling..."
        className={style.input}
      />
      <div className={style['submit-button-container']}>
        <Button
          loading={loading}
          disabled={!description}
          type="primary"
          size="large"
          className={style['submit-button']}
          onClick={() => handleAddWorkItem()}
        >
          Finish
          <RightOutlined />
        </Button>
      </div>
    </div>
  );
}

export { CreateFirstTaskPage };
