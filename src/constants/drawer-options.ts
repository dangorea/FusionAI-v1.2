import {
  AuditOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  OpenAIOutlined,
  SettingOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

export enum DrawerOption {
  TextBlocks = 'Rules',
  Settings = 'Settings',
  Projects = 'Projects',
  WorkItems = 'Work Items',
  Organizations = 'Organizations',
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
