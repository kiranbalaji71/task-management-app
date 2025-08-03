import React, { Suspense, use, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { adminRoutes, appRoutes, loginRoutes } from '../routes/Routes';
import { baseUrlRoute } from '../common/Constants';
import WrongPathNav from './WrongPathNav';
import Loader from '../components/Loader';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout as AntLayout,
  Menu,
  Grid,
  Tooltip,
  Avatar,
  Dropdown,
  Space,
} from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import './Layout.scss';
import { MessageProvider } from '../context/MessageContext';

const { Header, Sider, Content, Footer } = AntLayout;
const { useBreakpoint } = Grid;

const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userdetails, role, userName } = useSelector(
    (state) => state.loginReducer
  );
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const dispatch = useDispatch();
  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        dispatch({ type: 'RESET_STORE' });
        localStorage.clear();
        navigate('/login');
      },
    },
  ];

  const isLoggedIn =
    userdetails && Object.keys(userdetails?.data || {}).length > 0;

  const routing = useMemo(() => {
    let merged = [...loginRoutes];
    if (isLoggedIn) {
      const appRoutesWithRole =
        userdetails?.data?.role === 'admin' ? adminRoutes : appRoutes;
      merged.push(...appRoutesWithRole);
    }
    return merged;
  }, [isLoggedIn]);

  const fullContent = useMemo(() => {
    return [`${baseUrlRoute}/login`].includes(pathname);
  }, [pathname]);

  const prepareMenuItems = () =>
    routing
      .filter(({ showMenu }) => showMenu)
      .map(({ path, label, icon }, index) => ({
        key: path || index,
        icon,
        label,
        onClick: () => navigate(path),
      }));

  const renderRoutes = (routesArray) => {
    const redirectPath = isLoggedIn ? '/dashboard' : '/login';

    return [
      ...routesArray.map((route, index) => (
        <Route
          key={route.path || index}
          path={route.path}
          element={<route.component userdetails={userdetails?.data} />}
        />
      )),
      <Route
        key="page-not-found"
        path="*"
        element={
          <WrongPathNav
            redirectPath={`${baseUrlRoute}${redirectPath}`}
            routesArray={routesArray}
          />
        }
      />,
    ];
  };

  return (
    <AntLayout className="layout-container">
      <MessageProvider>
        {!fullContent ? (
          <>
            <Header className="layout-header">
              <div className="layout-title">Task Management</div>

              <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                <Space
                  className="layout-user-menu"
                  style={{ cursor: 'pointer' }}
                >
                  {screens.sm && (
                    <div className="layout-user-details">
                      <div className="layout-user-name">
                        {userName || 'User'}
                      </div>
                      <div className="layout-user-role">{role || 'Role'}</div>
                    </div>
                  )}
                  <Avatar className="layout-avatar" size="large">
                    {userName?.charAt(0)?.toUpperCase() || <UserOutlined />}
                  </Avatar>
                </Space>
              </Dropdown>
            </Header>

            <AntLayout>
              {!screens.xs && (
                <Sider
                  className="layout-sider"
                  collapsed={collapsed}
                  onCollapse={setCollapsed}
                  breakpoint="md"
                  onBreakpoint={(broken) => setCollapsed(broken)}
                >
                  <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={prepareMenuItems()}
                  />
                </Sider>
              )}

              <Content className="layout-content">
                <Suspense fallback={<Loader />}>
                  <Routes>{renderRoutes(routing)}</Routes>
                </Suspense>
              </Content>
            </AntLayout>
            {screens.xs && (
              <Footer className="layout-footer">
                <Menu
                  className="footer-menu-icons"
                  mode="horizontal"
                  selectedKeys={[pathname]}
                  items={prepareMenuItems().map((item) => ({
                    key: item?.key,
                    onClick: item?.onClick,
                    label: (
                      <Tooltip title={item.label} placement="top">
                        {item.icon}
                      </Tooltip>
                    ),
                  }))}
                />
              </Footer>
            )}
          </>
        ) : (
          <AntLayout>
            <Content className="layout-content">
              <Suspense fallback={<Loader />}>
                <Routes>{renderRoutes(routing)}</Routes>
              </Suspense>
            </Content>
          </AntLayout>
        )}
      </MessageProvider>
    </AntLayout>
  );
};

export default Layout;
