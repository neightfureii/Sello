import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth, RequireRole } from './auth/guards';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import UsersPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';
import AddProductPage from './pages/AddProductPage';
import AddCategoryPage from './pages/AddCategoryPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import AccountsPage from './pages/AccountsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <InventoryPage /> },
          { path: 'products/add-product', element: <AddProductPage /> },
          { path: 'products/add-category', element: <AddCategoryPage /> },
          {
            element: <RequireRole roles={['admin']} />,
            children: [{ path: 'users', element: <UsersPage /> }],
          },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'accounts', element: <AccountsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);