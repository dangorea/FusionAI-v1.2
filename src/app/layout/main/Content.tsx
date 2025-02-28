import React from 'react';
import { DrawerOption } from '../../../constants/drawer-options';
import {
  OrganizationBlocks,
  OrganizationManagement,
  Projects,
  Settings,
  TextBlocks,
  WorkItems,
} from '../../../pages';
import { TabsLayout } from '../../PromptShellLayout';
import { PageParams } from './index';

type TabContentProps = {
  selectedTab: DrawerOption;
  pageParams: PageParams;
  onNavigate: (page: DrawerOption, params?: PageParams) => void;
};

export default function TabContent({
  selectedTab,
  pageParams,
  onNavigate,
}: TabContentProps) {
  const TabContentMap: Record<DrawerOption, React.FC<any>> = {
    [DrawerOption.OrganizationManagement]: OrganizationManagement,
    [DrawerOption.TextBlocks]: TextBlocks,
    [DrawerOption.Settings]: Settings,
    [DrawerOption.Projects]: Projects,
    [DrawerOption.WorkItems]: WorkItems,
    [DrawerOption.Organizations]: OrganizationBlocks,
    [DrawerOption.PromptGenerator]: () => (
      <TabsLayout
        activeTab={DrawerOption.PromptGenerator}
        onTabChange={onNavigate}
      />
    ),
    [DrawerOption.ShellExecutor]: () => (
      <TabsLayout
        activeTab={DrawerOption.ShellExecutor}
        onTabChange={onNavigate}
      />
    ),
    [DrawerOption.GPTIntegrator]: () => (
      <TabsLayout
        activeTab={DrawerOption.GPTIntegrator}
        onTabChange={onNavigate}
      />
    ),
  };
  const RenderedComponent = TabContentMap[selectedTab];
  return RenderedComponent ? (
    <RenderedComponent {...pageParams} onNavigate={onNavigate} />
  ) : (
    <div>Page not found</div>
  );
}
