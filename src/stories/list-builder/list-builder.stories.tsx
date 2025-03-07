import React from 'react';
import type { Meta } from '@storybook/react';
import { UserOutlined } from '@ant-design/icons';
import type { ListBuilderProps, ListOption } from '../../components';
import { ListBuilder } from '../../components';

export default {
  title: 'Components/ListBuilder',
  component: ListBuilder,
  argTypes: {
    headerIconPosition: {
      control: 'radio',
      options: ['left', 'right'],
    },
    lazyLoad: { control: 'boolean' },
    loadMoreThreshold: { control: 'number' },
    onOptionClick: { action: 'clicked' },
  },
} as Meta;

const defaultOptions: ListOption[] = [
  { key: '1', label: 'Option 1', value: '1', icon: <UserOutlined /> },
  { key: '2', label: 'Option 2', value: '2' },
  { key: '3', label: 'Option 3', value: '3', icon: <UserOutlined /> },
];

export function Default(args: ListBuilderProps) {
  return <ListBuilder {...args} />;
}

Default.args = {
  headerTitle: 'Default List',
  headerIcon: <UserOutlined />,
  headerIconPosition: 'left',
  options: defaultOptions,
  globalOptionIcon: <UserOutlined />,
  lazyLoad: false,
};

export function LazyLoaded(args: ListBuilderProps) {
  return <ListBuilder {...args} />;
}

LazyLoaded.args = {
  headerTitle: 'Lazy Loaded List',
  headerIcon: <UserOutlined />,
  headerIconPosition: 'left',
  options: Array.from({ length: 50 }, (_, index) => ({
    key: `${index + 1}`,
    label: `Item ${index + 1}`,
    value: `${index + 1}`,
    icon: index % 2 === 0 ? <UserOutlined /> : undefined,
  })),
  globalOptionIcon: <UserOutlined />,
  lazyLoad: true,
  loadMoreThreshold: 10,
};

export function IconOnRight(args: ListBuilderProps) {
  return <ListBuilder {...args} />;
}

IconOnRight.args = {
  headerTitle: 'Icon on Right',
  headerIcon: <UserOutlined />,
  headerIconPosition: 'right',
  options: defaultOptions,
  globalOptionIcon: <UserOutlined />,
  lazyLoad: false,
};

export function CustomContainer(args: ListBuilderProps) {
  return <ListBuilder {...args} />;
}

CustomContainer.args = {
  headerTitle: 'Custom Styled List',
  headerIcon: <UserOutlined />,
  headerIconPosition: 'left',
  options: defaultOptions,
  globalOptionIcon: <UserOutlined />,
  containerStyle: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    background: '#fafafa',
  },
  lazyLoad: false,
};
