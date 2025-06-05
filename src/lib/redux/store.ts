import { configureStore } from '@reduxjs/toolkit';
import organizationReducer from './feature/organization/reducer';
import organizationManagementReducer from './feature/organization-management/reducer';
import userReducer from './feature/user/reducer';
import projectsReducer from './feature/projects/reducer';
import textBlockReducer from './feature/text-blocks/reducer';
import workItemsReducer from './feature/work-items/reducer';
import configReducer from './feature/config/reducer';
import authReducer from './feature/auth/reducer';
import artifactReducer from './feature/artifacts/reducer';
import contextReducer from './feature/context/reducer';
import invitationsReducer from './feature/invitations/reducer';
import imagesReducer from './feature/images/reducer';

export const makeStore = () => {
  return configureStore({
    reducer: {
      organization: organizationReducer,
      organizationManagement: organizationManagementReducer,
      user: userReducer,
      projects: projectsReducer,
      textBlock: textBlockReducer,
      workItems: workItemsReducer,
      auth: authReducer,
      config: configReducer,
      artifact: artifactReducer,
      context: contextReducer,
      invitations: invitationsReducer,
      images: imagesReducer,
    },
    // middleware: (getDefaultMiddleware) =>
    //   getDefaultMiddleware().concat(axiosTokenMiddleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];