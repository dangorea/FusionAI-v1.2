import React from 'react';
import { createMemoryRouter } from 'react-router';
import MainLayout from '../layout/main';
import { Login } from '../../domains/auth/ui';
import {
  Organization,
  OrganizationManagement,
} from '../../domains/organization/ui';
import { Projects } from '../../domains/project/ui';
import { Rules } from '../../domains/rules/ui';
import { WorkItems } from '../../domains/work-item/ui';
import { Settings } from '../../domains/settings/ui';
import { Root } from '../../domains/root/ui';
import { NotFound } from '../error/not-found';
import { RouterError } from '../error/router-error';
import { PromptGenerator } from '../../domains/prompt-generator/ui';

const router = createMemoryRouter([
  {
    path: '/login',
    element: <Login />,
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
      { path: 'rules', element: <Rules /> },
      { path: 'work-items', element: <WorkItems /> },
      { path: 'settings', element: <Settings /> },
      { path: 'prompt-generator/:id', element: <PromptGenerator /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
