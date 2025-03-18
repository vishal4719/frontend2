import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading/Loading';
import Navbar from './Home/pages/Navbar'; // Adjust the path based on your project structure
import AdminNavbar from '../Admin/Components/Navbar'; // Import the admin navbar component
import { FaTrash } from 'react-icons/fa';
import Lottie from 'react-lottie';
import circleProfileAnimation from '../Components/Loading/ProfileCircle.json'; // Adjust the path based on your project structure

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_HOST}/api/auth/user/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
        if (error.response && error.response.status === 401) {
          navigate('/signup');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_HOST}/api/auth/user/delete`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        // Navigate to home page
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">No user data available</div>;
  }

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: circleProfileAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {user.roles.includes('ADMIN') ? <AdminNavbar /> : <Navbar />}
      <div className="flex flex-col mt-20 items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Lottie options={defaultOptions} height={64} width={64} />
                <div className="absolute inset-0 flex items-center text-2xl justify-center  font-serif font-bold text-4xl text-gray-900">
                  {user.name.charAt(0)}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <button 
              onClick={handleDeleteAccount}
              className="text-red-500 flex items-center gap-2 hover:text-red-700 transition-colors duration-200"
            >
              <FaTrash />
              Delete Account
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">First Name *</label>
              <input
                type="text"
                value={user.name}
                className="w-full border border-gray-300 p-2 rounded-lg"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700">Last Name *</label>
              <input
                type="text"
                value={user.lname}
                className="w-full border border-gray-300 p-2 rounded-lg"
                readOnly
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={user.email}
              className="w-full border border-gray-300 p-2 rounded-lg"
              readOnly
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              value={`+91 | ${user.phone || 'Not Available'}`}
              className="w-full border border-gray-300 p-2 rounded-lg"
              readOnly
            />
          </div>

          <button className="mt-6 bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded-lg">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;