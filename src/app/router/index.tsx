import React from 'react';
import { createMemoryRouter } from 'react-router';
import MainLayout from '../layout/main';
import { LoginPage } from '../../domains/auth/ui';
import {
  Organization,
  OrganizationManagement,
} from '../../domains/organization/ui';
import { Projects } from '../../domains/project/ui';
import { TextBlocks } from '../../domains/text-block/ui';
import { WorkItems } from '../../domains/work-item/ui';
import { Settings } from '../../domains/settings/ui';
import { Root } from '../../domains/root/ui';
import { NotFound } from '../error/not-found';
import { RouterError } from '../error/router-error';
import { PromptGeneratorPage } from '../../domains/prompt-generator/ui/PromptGeneratorPage';

const router = createMemoryRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouterError />,
  },
  {
    path: '/main_window',
    element: (
      <Root>
        <MainLayout />
      </Root>
    ),
  },
  {
    path: '/',
    element: (
      <Root>
        <MainLayout />
      </Root>
    ),
    errorElement: <RouterError />,
    children: [
      { index: true, path: 'organizations', element: <Organization /> },
      {
        path: 'organization-management',
        element: <OrganizationManagement />,
      },
      { path: 'projects', element: <Projects /> },
      { path: 'text-blocks', element: <TextBlocks /> },
      { path: 'work-items', element: <WorkItems /> },
      { path: 'settings', element: <Settings /> },
      { path: 'prompt-generator/:id', element: <PromptGeneratorPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
