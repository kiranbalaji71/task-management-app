import { useLocation, Navigate, matchPath } from 'react-router-dom';

const WrongPathNav = ({ redirectPath, routesArray }) => {
  const location = useLocation();

  const isPathValid = routesArray.some((route) => {
    if (matchPath({ path: route.path, end: false }, location.pathname)) {
      return true;
    }
    if (route.children) {
      return route.children.some((child) =>
        matchPath(
          { path: `${route.path}/${child.path}`, end: false },
          location.pathname
        )
      );
    }
    return false;
  });

  return isPathValid ? null : <Navigate to={redirectPath} replace />;
};

export default WrongPathNav;
