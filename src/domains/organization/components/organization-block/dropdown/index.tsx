import React, { useEffect } from 'react';
import { Dropdown, Menu, Space, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { LocalStorageKeys } from '../../../../../utils/localStorageKeys';
import { useAppDispatch, useAppSelector } from '../../../../../lib/redux/hook';
import {
  selectAllOrganizations,
  selectCurrentOrganizationId,
} from '../../../../../lib/redux/feature/organization/selectors';
import { setSelectedOrganization } from '../../../../../lib/redux/feature/organization/reducer';

export function OrganizationDropdown() {
  const dispatch = useAppDispatch();
  const organizationBlocks = useAppSelector(selectAllOrganizations);
  const currentId = useAppSelector(selectCurrentOrganizationId);
  const selectedOrganization = organizationBlocks.find(
    (org) => org._id === currentId,
  );

  useEffect(() => {
    if (organizationBlocks.length === 0) {
      return;
    }

    const savedOrganization = localStorage.getItem(
      LocalStorageKeys.SELECTED_ORGANIZATION,
    );

    if (savedOrganization) {
      const parsedOrganization = JSON.parse(savedOrganization);
      const organization = organizationBlocks.find(
        (block) => block.slug === parsedOrganization.slug,
      );
      if (organization) {
        dispatch(setSelectedOrganization(organization));
      }
    }
  }, [organizationBlocks, dispatch]);

  const handleMenuClick = (e: { key: string }) => {
    const selected = organizationBlocks.find((block) => block.slug === e.key);
    if (selected) {
      dispatch(setSelectedOrganization(selected));
      localStorage.setItem(
        LocalStorageKeys.SELECTED_ORGANIZATION,
        JSON.stringify(selected),
      );
    }
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={organizationBlocks.map((block) => ({
        key: block.slug,
        label: block.name,
      }))}
    />
  );

  return (
    <Dropdown overlay={menu}>
      <Typography.Link>
        <Space>
          {selectedOrganization
            ? selectedOrganization.name
            : 'Select an Organization'}
          <DownOutlined />
        </Space>
      </Typography.Link>
    </Dropdown>
  );
}
