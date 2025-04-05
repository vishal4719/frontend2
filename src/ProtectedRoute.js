import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Redirect to login while saving the attempted url
    return <Navigate to="/signup" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;