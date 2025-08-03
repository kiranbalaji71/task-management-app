import { lazy } from 'react';
import { baseUrlRoute } from '../common/Constants';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';

const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Task = lazy(() => import('../pages/Task'));
const User = lazy(() => import('../pages/User'));

export const loginRoutes = [
  {
    path: `${baseUrlRoute}/login`,
    component: Login,
    label: 'Login',
  },
];

export const appRoutes = [
  {
    path: `${baseUrlRoute}/dashboard`,
    component: Dashboard,
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    showMenu: true,
  },
  {
    path: `${baseUrlRoute}/task`,
    component: Task,
    label: 'Task',
    icon: <UnorderedListOutlined />,
    showMenu: true,
  },
];

export const adminRoutes = [
  ...appRoutes,
  {
    path: `${baseUrlRoute}/user-management`,
    component: User,
    label: 'User Management',
    icon: <UserOutlined />,
    showMenu: true,
  },
];
