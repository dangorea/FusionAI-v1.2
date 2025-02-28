import {
  AuditOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  OpenAIOutlined,
  SettingOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

export enum DrawerOption {
  PromptGenerator = 'Prompt Generator',
  ShellExecutor = 'Shell Executor',
  TextBlocks = 'Rules',
  Settings = 'Settings',
  Projects = 'Projects',
  WorkItems = 'WorkItems',
  Organizations = 'Organizations',
  GPTIntegrator = 'GPTIntegrator',
  OrganizationManagement = 'Organization Management',
}

export const MenuOptions = [
  {
    icon: ShareAltOutlined,
    text: DrawerOption.Organizations,
  },
  {
    icon: FundProjectionScreenOutlined,
    text: DrawerOption.Projects,
  },
  {
    icon: FileTextOutlined,
    text: DrawerOption.TextBlocks,
  },
  {
    icon: SettingOutlined,
    text: DrawerOption.Settings,
  },
  { icon: OpenAIOutlined, text: DrawerOption.WorkItems },
  {
    icon: AuditOutlined,
    text: DrawerOption.OrganizationManagement,
  },
];
