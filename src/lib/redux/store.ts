import { configureStore } from '@reduxjs/toolkit';
import organizationReducer from './feature/organization/reducer';
import userReducer from './feature/user/reducer';
import projectsReducer from './feature/projects/reducer';
import rulesReducer from './feature/rules/reducer';
import workItemsReducer from './feature/work-items/reducer';
import rootUI from './feature/rootSlice/reducer';
import authReducer from './feature/auth/reducer';
import codeGeneration from './feature/code-generation/reducer';
import { axiosTokenMiddleware } from './middleware/axiosTokenMiddleware';

export const makeStore = () => {
  return configureStore({
    reducer: {
      organization: organizationReducer,
      user: userReducer,
      projects: projectsReducer,
      rules: rulesReducer,
      workItems: workItemsReducer,
      auth: authReducer,
      rootUI,
      codeGeneration,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(axiosTokenMiddleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
