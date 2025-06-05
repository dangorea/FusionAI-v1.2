import { Button, Input } from 'antd';
import { RightOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import style from '../wizard-pages.module.scss';
import { useAppDispatch } from '../../../../lib/redux/hook';
import { createOrganizationThunk } from '../../../../lib/redux/feature/organization/thunk';
import { setSelectedOrganization } from '../../../../lib/redux/feature/organization/reducer';
import { LocalStorageKeys } from '../../../../utils/localStorageKeys';
import { updateCurrentUser } from '../../../../api/users';
import type { OrganizationType } from '../../../../domains/organization/model/types';

type Props = {
  increasePage: () => void;
};

function CreateOrganizationPage({ increasePage }: Props) {
  const dispatch = useAppDispatch();

  const [orgName, setOrgName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAddOrganizationBlock = useCallback(async () => {
    setLoading(true);

    const newOrgData: Omit<OrganizationType, 'id'> = {
      name: orgName,
      randomizeSlug: true,
    };

    try {
      const organization = await dispatch(
        createOrganizationThunk({ orgData: newOrgData }),
      ).unwrap();

      await updateCurrentUser({ isOnboarded: true });

      dispatch(setSelectedOrganization(organization)); // pick it in UI
      localStorage.setItem(
        LocalStorageKeys.SELECTED_ORGANIZATION,
        JSON.stringify(organization),
      );

      setLoading(false);
      increasePage();
    } catch (error) {
      setLoading(false);
      console.log('Error creating organization:', error);
    }
  }, [dispatch, increasePage, orgName]);

  return (
    <div className={style['page-container']}>
      <div className={style['title-container']}>
        <ShareAltOutlined className={style['icon-title']} />
        <h2 className={style.title}>Create Your Organization</h2>
      </div>

      <div className={style.description}>
        Your organization is the top-level entity in AngenAI that will contain
        all your projects and team members.
      </div>

      <div className={style['label-container']}>
        <p className={style.label}>Organization Name</p>
      </div>

      <Input
        placeholder="Enter organization name"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        className={style.input}
      />

      <div className={style['submit-button-container']}>
        <Button
          loading={loading}
          disabled={!orgName}
          type="primary"
          size="large"
          className={style['submit-button']}
          onClick={handleAddOrganizationBlock}
        >
          Next
          <RightOutlined />
        </Button>
      </div>
    </div>
  );
}

export { CreateOrganizationPage };
