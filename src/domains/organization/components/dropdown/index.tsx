import React, { useEffect } from 'react';
import { Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { LocalStorageKeys } from '../../../../utils/localStorageKeys';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import {
  selectAllOrganizations,
  selectSelectedOrganizationEntity,
} from '../../../../lib/redux/feature/organization/selectors';
import { setSelectedOrganization } from '../../../../lib/redux/feature/organization/reducer';
import style from './style.module.scss';

function OrganizationDropdown() {
  const dispatch = useAppDispatch();
  const organizationBlocks = useAppSelector(selectAllOrganizations);
  const selectedOrganization = useAppSelector(selectSelectedOrganizationEntity);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedOrganization) {
      localStorage.setItem(
        LocalStorageKeys.SELECTED_ORGANIZATION,
        selectedOrganization.id,
      );
    }
  }, [selectedOrganization]);

  useEffect(() => {
    if (organizationBlocks.length) {
      const savedOrg = localStorage.getItem(
        LocalStorageKeys.SELECTED_ORGANIZATION,
      );

      const org =
        organizationBlocks.find(
          (organization) => organization.id === savedOrg,
        ) || organizationBlocks[0];

      dispatch(setSelectedOrganization(org));
    } else {
      dispatch(setSelectedOrganization(null));
    }
  }, [dispatch, organizationBlocks]);

  const handleMenuClick = (e: { key: string }) => {
    const selected = organizationBlocks.find((block) => block.slug === e.key);
    if (selected) {
      dispatch(setSelectedOrganization(selected));
      localStorage.setItem(
        LocalStorageKeys.SELECTED_ORGANIZATION,
        JSON.stringify(selected),
      );
      navigate('/work-items');
    }
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={organizationBlocks.map((block) => ({
        key: block.slug!,
        label: block.name,
      }))}
    />
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <div className={style['dropdown-container']}>
        <div className={style['dropdown-selected']}>
          {selectedOrganization
            ? selectedOrganization.name
            : 'Select an Organization'}
        </div>
        <DownOutlined style={{ fontSize: 10, marginTop: 4, marginLeft: 2 }} />
      </div>
    </Dropdown>
  );
}

export { OrganizationDropdown };
