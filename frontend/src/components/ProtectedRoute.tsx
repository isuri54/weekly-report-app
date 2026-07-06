import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('MEMBER' | 'MANAGER')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const userInfo = localStorage.getItem('userInfo');
  
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userInfo);

  // If specific roles are required, check them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'MANAGER' ? '/dashboard' : '/reports'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;