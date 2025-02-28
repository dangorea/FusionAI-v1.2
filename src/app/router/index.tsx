import React from 'react';
import { createMemoryRouter } from 'react-router';
import MainLayout from '../layout/main';
import { LoginPage } from '../../domains/auth/ui';
import {
  OrganizationBlocks,
  OrganizationManagement,
} from '../../domains/organization/ui';
import { Projects } from '../../domains/project/ui';
import { TextBlocks } from '../../domains/text-block/ui';
import { WorkItems } from '../../domains/work-item/ui';
import { PromptGenerator } from '../../domains/prompt-generator/ui';
import { GPTIntegrator } from '../../domains/gpt-integrator/ui';
import { Settings } from '../../domains/settings/ui';
import { Root } from '../../domains/root/ui';

const router = createMemoryRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <Root>
        <MainLayout />
      </Root>
    ),
    children: [
      { index: true, path: 'organizations', element: <OrganizationBlocks /> },
      {
        path: 'organization-management',
        element: <OrganizationManagement />,
      },
      { path: 'projects', element: <Projects /> },
      { path: 'text-blocks', element: <TextBlocks /> },
      { path: 'work-items', element: <WorkItems /> },
      { path: 'prompt-generator', element: <PromptGenerator /> },
      { path: 'gpt-integrator', element: <GPTIntegrator /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default router;
