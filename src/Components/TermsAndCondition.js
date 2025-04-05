import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const handleLoginAsUser = () => {
    navigate('/signup', { state: { email: 'vg2556519@gmail.com', password: 'vvvvvvvv' } });
  };

  const handleLoginAsAdmin = () => {
    navigate('/signup', { state: { email: 'vcg@gmail.com', password: 'vv' } });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
        <p className="mb-4">
          This project is only for learning purposes and the certificate generated on this website is not valid anywhere.
        </p>
        <p className="mb-4">
          The tech stack used in this project includes React for the frontend, Spring Boot for the backend, and MongoDB for the database.
        </p>
        <p className="mb-4">
          This project is a comprehensive e-learning platform that allows users to enroll in courses, watch videos, and take tests. It also includes features for generating certificates upon course completion.
        </p>
        <h2 className="text-xl font-bold mb-4">Are you an interviewer?</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleLoginAsUser}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Login as User
          </button>
          <button
            onClick={handleLoginAsAdmin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;