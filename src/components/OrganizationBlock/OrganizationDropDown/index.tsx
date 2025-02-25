import React from 'react';
import { Dropdown, Menu, Space, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
// import { useOrganizationBlock } from '../../../Context/OrganizationItemsContext';
// import { LocalStorageKeys } from '../../../utils/localStorageKeys';

export const OrganizationDropdown: React.FC = () => {
  // const {
  //   organizationBlocks,
  //   selectedOrganization,
  //   setSelectedOrganization,
  //   fetchOrganizationBlocks,
  // } = useOrganizationBlock();

  // useEffect(() => {
  //   console.log('Fetching organization blocks...');
  //   fetchOrganizationBlocks();
  // }, []);
  //
  // useEffect(() => {
  //   if (organizationBlocks.length === 0) {
  //     console.log('Organization blocks are not loaded yet.');
  //     return;
  //   }
  //
  //   // const savedOrganization = localStorage
  //   //   .getItem
  //   //   LocalStorageKeys.SELECTED_ORGANIZATION,
  //   //   ();
  //
  //   if (savedOrganization) {
  //     console.log(
  //       'Found saved organization in localStorage:',
  //       savedOrganization,
  //     );
  //
  //     const parsedOrganization = JSON.parse(savedOrganization);
  //
  //     const organization = organizationBlocks.find(
  //       (block) => block.slug === parsedOrganization.slug,
  //     );
  //
  //     if (organization) {
  //       console.log(
  //         'Setting selected organization from localStorage:',
  //         organization,
  //       );
  //       setSelectedOrganization(organization);
  //     } else {
  //       console.warn(
  //         'Saved organization not found in the loaded organization blocks.',
  //       );
  //     }
  //   } else {
  //     console.log('No saved organization found in localStorage.');
  //   }
  // }, [organizationBlocks]);
  //
  // const handleMenuClick = (e: { key: string }) => {
  //   console.log('Selected organization key from dropdown:', e.key);
  //
  //   const selected = organizationBlocks.find((block) => block.slug === e.key);
  //   if (selected) {
  //     console.log('Setting selected organization:', selected);
  //     setSelectedOrganization(selected);
  //
  //     // localStorage.setItem(
  //     //   LocalStorageKeys.SELECTED_ORGANIZATION,
  //     //   JSON.stringify(selected),
  //     // );
  //     console.log('Saved selected organization to localStorage:', selected);
  //   } else {
  //     console.warn('Selected organization not found in organization blocks.');
  //   }
  // };

  const menu = <Menu onClick={() => {}} items={[]} />;

  return (
    <Dropdown overlay={menu}>
      <Typography.Link>
        <Space>
          Select an Organization
          <DownOutlined />
        </Space>
      </Typography.Link>
    </Dropdown>
  );
};
