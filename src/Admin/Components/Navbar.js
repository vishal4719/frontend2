import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation,Link } from "react-router-dom";
import { Search, User, ArrowLeft, Menu, X } from 'lucide-react';
import logo from '../../Assests/logo.jpg';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-4 py-4">
        
        {/* Left Section (Back Button + Hamburger Menu) */}
        <div className="flex items-center space-x-3">
          {/* Back Button - Hidden on Home */}
          {location.pathname !== '/' && (
            <button onClick={() => navigate(-1)} className="text-gray-700 p-2 md:p-3 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={24} />
            </button>
          )}

          {/* Hamburger Menu */}
          <button onClick={toggleMenu} className="md:hidden text-gray-700 focus:outline-none">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <img 
              onClick={() => navigate('/admin')} 
              src={logo} 
              alt="Skills Logo" 
              className="h-10 w-auto cursor-pointer"
            />
            <p className="text-black text-2xl cursor-pointer" onClick={() => navigate('/admin')}>
              <b>V-Skills</b>
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <span className="cursor-pointer" onClick={() => navigate('/admin/playlists')}>Add Courses</span>
          <span className="cursor-pointer" onClick={() => navigate('/userdetails')}>Users</span>
          <span className="cursor-pointer" onClick={() => navigate('/admin/subscriptions')}>Subscription</span>
         
          
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
                    onClick={() => navigate('/profile')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
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
      </div>

      {/* Mobile Menu - Sliding from Left */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
            <X size={28} />
          </button>
          <div className="flex flex-col mt-6 space-y-4">
            <span className="cursor-pointer p-2" onClick={() => navigate('/admin/playlists')}>Add Courses</span>
            <span className="cursor-pointer p-2" onClick={() => navigate('/userdetails')}>Users</span>
            <span className="cursor-pointer p-2">Masterclass</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
