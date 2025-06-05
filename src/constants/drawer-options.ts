import {
  AuditOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  OpenAIOutlined,
  RobotOutlined,
  SettingOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

export enum DrawerOption {
  Knowledge = 'Knowledge Base',
  Personalities = 'Personalities',
  Settings = 'Settings',
  Projects = 'Projects',
  WorkItems = 'Work Items',
  Organizations = 'Organizations',
  OrganizationManagement = 'Organization Management',
}

export const MenuOptions = [
  {
    icon: OpenAIOutlined,
    text: DrawerOption.WorkItems
  },
  {
    icon: FileTextOutlined,
    text: DrawerOption.Knowledge,
  },
  {
    icon: RobotOutlined,
    text: DrawerOption.Personalities,
  },

  {
    icon: FundProjectionScreenOutlined,
    text: DrawerOption.Projects,
  },
  {
    icon: ShareAltOutlined,
    text: DrawerOption.Organizations,
  },
  {
    icon: AuditOutlined,
    text: DrawerOption.OrganizationManagement,
  },
  {
    icon: SettingOutlined,
    text: DrawerOption.Settings,
  },
];
