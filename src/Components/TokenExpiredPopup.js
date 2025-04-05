import React from 'react';
import { useNavigate } from 'react-router-dom';

const TokenExpiredPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signup');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Session Expired</h3>
        <p>Your session has expired. Please log in again.</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiredPopup;