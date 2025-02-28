import { Tabs } from 'antd';
import { InteractionOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { DrawerOption } from '../../constants/drawer-options';
import { PromptGenerator } from '../../domains/prompt-generator/ui';
import { GPTIntegrator } from '../../domains/gpt-integrator/ui';

export function TabsLayout({
  activeTab,
  onTabChange,
}: {
  activeTab: DrawerOption;
  onTabChange: (tab: DrawerOption) => void;
}) {
  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => onTabChange(key as DrawerOption)}
      items={[
        {
          key: DrawerOption.PromptGenerator,
          label: 'Prompt Generator',
          children: <PromptGenerator />,
          icon: <ThunderboltOutlined />,
        },
        {
          key: DrawerOption.GPTIntegrator,
          label: 'GPT Integrator',
          children: <GPTIntegrator />,
          icon: <InteractionOutlined />,
        },
      ]}
    />
  );
}
