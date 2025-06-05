import { Modal, Steps } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import {
  CreateDataProjectPage,
  CreateFirstTaskPage,
  CreateOrganizationPage,
  SelectSourceFolderPage,
} from './components';
import style from './onboarding-wizard.module.scss';
import { useAppSelector } from '../../lib/redux/hook';
import { selectIsOnboarded } from '../../lib/redux/feature/user/selectors';

import Logo from '../../../assets/logo.svg';

function OnboardingWizard() {
  const isOnboarded = useAppSelector(selectIsOnboarded);

  const [page, setPage] = useState<number>(0);

  const increasePage = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, [setPage]);

  const content = useMemo(() => {
    const pages = {
      0: <CreateOrganizationPage increasePage={increasePage} />,
      1: <CreateDataProjectPage increasePage={increasePage} />,
      2: <SelectSourceFolderPage increasePage={increasePage} />,
      3: <CreateFirstTaskPage />,
    };
    return pages[page];
  }, [increasePage, page]);

  const stepsItems = useMemo(() => {
    return Array.from({ length: 4 }).map((_, index) => {
      return {
        icon: (
          <div
            className={style['steps-item']}
            style={{
              border: `2px solid ${page < index ? '#d1d5db' : '#3b82f6'}`,
              backgroundColor: page < index ? '#fff' : '#eff6ff',
              color: page < index ? '#9ca3af' : '#3b82f6',
            }}
          >
            {page <= index ? index + 1 : <CheckOutlined />}
          </div>
        ),
      };
    });
  }, [page]);

  return (
    <Modal
      open={isOnboarded === false}
      centered
      width={672}
      styles={{
        maxWidth: '672px',
        mask: {
          backgroundColor: '#f9fafb',
        },
      }}
      footer={null}
      closeIcon={null}
      maskClosable={false}
    >
      <div className={style['modal-container']}>
        <img src={Logo} alt="" className={style.logo} />
        <h1 className={style['main-title']}>Welcome to AngenAI</h1>
        <p className={style['sub-title']}>
          Let&#39;s get you set up in just a few steps
        </p>
        <div>
          <Steps current={page} items={stepsItems} className={style.steps} />
        </div>
        {content}
      </div>
    </Modal>
  );
}

export { OnboardingWizard };
