import React from 'react';
import { createMemoryRouter } from 'react-router';
import MainLayout from '../layout/main';
import Login from '../../domains/auth/ui/login';
import { Organization } from '../../domains/organization';
import { OrganizationManagement } from '../../domains/organization-management';
import { Projects } from '../../domains/project';
import { Knowledge, Personality } from '../../domains/text-blocks/ui';
import { WorkItems } from '../../domains/work-item/ui';
import { Root } from '../../domains/root/ui';
import { NotFound } from '../error/not-found';
import { RouterError } from '../error/router-error';
import { PromptGenerator } from '../../domains/prompt-generator/ui';
import { Settings } from '../../domains/settings';

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
      { path: 'rules', element: <Knowledge /> },
      { path: 'personality', element: <Personality /> },
      { path: 'work-items', element: <WorkItems /> },
      { path: 'settings', element: <Settings /> },
      { path: 'prompt-generator/:id', element: <PromptGenerator /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
