import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ChevronDown, User, ArrowLeft } from 'lucide-react';
import logo from '../../../Assests/logo.jpg';
import CourseModal from './CourseModel'; // Import the CourseModal component

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false); // State for showing the course modal

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-4 py-4 bg-white shadow-sm w-full">
      {/* Back Button (Hidden on Home) */}
      {location.pathname !== '/' && (
        <button onClick={() => navigate(-1)} className="text-gray-700 p-2 md:p-3 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
      )}
      
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <img 
          onClick={() => navigate('/')} 
          src={logo} 
          alt="Skills Logo" 
          className="h-10 w-auto cursor-pointer"
        />
        <p className="text-black text-2xl cursor-pointer" onClick={() => navigate('/')}><b>V-Skills</b></p>
      </div>
      
      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => setShowCourseModal(true)}>
          <span>Courses</span>
          <ChevronDown size={16} />
        </div>
        <div className="space-x-4">
          <span className="cursor-pointer" onClick={() => navigate('/practice')}>Practice</span>
          <span className="cursor-pointer"onClick={() => navigate("/interview")}>Interview</span>
        </div>
      </div>
      
      {/* Search and Auth */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Search Course"
            className="pl-8 pr-4 py-1 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-2 text-gray-400" size={16} />
        </div>
        
        {/* Login/Register Button or Profile Icon */}
        {isLoggedIn ? (
          <div className="relative">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <User size={20} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                <button
                  onClick={() => navigate('/enrolled-courses')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Courses
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate('/purchases')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Purchases
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="px-4 py-1 text-red-500 border border-red-500 rounded-md hover:bg-red-50"
            onClick={() => navigate("/signup")}
          >
            Login / Register
          </button>
        )}
      </div>

      {/* Course Modal */}
      <CourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} />
    </nav>
  );
};

export default Navbar;