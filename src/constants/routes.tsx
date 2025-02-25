import { createMemoryRouter } from 'react-router';
import Login from '../routes/Login';
import Root from '../routes/Root';

const router = createMemoryRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Root />,
  },
]);

export default router;
