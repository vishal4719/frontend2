import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all data from localStorage
    localStorage.clear();
    navigate('/');
  }, [navigate]);

  return null;
};

export default Logout;