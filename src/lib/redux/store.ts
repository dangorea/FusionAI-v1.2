import { configureStore } from '@reduxjs/toolkit';
import organizationReducer from './feature/organization/reducer';
import organizationManagementReducer from './feature/organization-management/reducer';
import userReducer from './feature/user/reducer';
import projectsReducer from './feature/projects/reducer';
import rulesReducer from './feature/rules/reducer';
import workItemsReducer from './feature/work-items/reducer';
import configReducer from './feature/config/reducer';
import authReducer from './feature/auth/reducer';
import codeGenerationReducer from './feature/code-generation/reducer';

export const makeStore = () => {
  return configureStore({
    reducer: {
      organization: organizationReducer,
      organizationManagement: organizationManagementReducer,
      user: userReducer,
      projects: projectsReducer,
      rules: rulesReducer,
      workItems: workItemsReducer,
      auth: authReducer,
      config: configReducer,
      codeGeneration: codeGenerationReducer,
    },
    // middleware: (getDefaultMiddleware) =>
    //   getDefaultMiddleware().concat(axiosTokenMiddleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
