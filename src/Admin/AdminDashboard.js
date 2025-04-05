import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Admin/Components/Navbar";
import Loading from "../Components/Loading/Loading";
import { MoreVertical } from "react-feather";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]); // New state for videos
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchVideos(); // Fetch videos
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/playlists/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/videos/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // In AdminDashboard.js
const handleDeletePlaylist = async (playlistId) => {
  if (window.confirm("Are you sure you want to delete this course?")) {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_HOST}/api/auth/admin/user/playlist/${playlistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the deleted course from state
      setCourses(courses.filter(course => course.playlistId !== playlistId));
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("Failed to delete course");
    }
  }
};


const handleDeleteVideo = async (videoId) => {
  if (window.confirm("Are you sure you want to delete this video?")) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_HOST}/api/auth/admin/user/video/${videoId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      // Remove the deleted video from state
      setVideos(videos.filter(video => video.videoId !== videoId));
     
    } catch (error) {
      console.error("Failed to delete video:", error.message);
      alert("Failed to delete video");
    }
  }
};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && !event.target.closest('.menu-container')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const handleReadMore = (playlistId) => {
    navigate(`/coursepreview/${playlistId}`);
  };

  const handleWatchVideo = (videoId) => {
    navigate(`/videopreview/${videoId}`);
  };

  const truncateDescription = (description) => {
    if (description?.length > 150) {
      return description.substring(0, 150) + '...';
    }
    return description || '';
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.playlistId} className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-64 bg-blue-900">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Three-dot menu */}
                  <div className="absolute top-2 right-2 menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === course.playlistId ? null : course.playlistId);
                      }}
                      className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-700" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeMenu === course.playlistId && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(course.playlistId);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete Course
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                    {course.title}
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {truncateDescription(course.description)}
                  </p>

                  <div className="flex justify-center">
                    <button
                      onClick={() => handleReadMore(course.playlistId)}
                      className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition w-full"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {videos.map((video) => (
              <div key={video.videoId} className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-64 bg-blue-900">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Three-dot menu */}
                  <div className="absolute top-2 right-2 menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === video.videoId ? null : video.videoId);
                      }}
                      className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-700" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeMenu === video.videoId && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVideo(video.videoId);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete Video
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                    {video.title}
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {truncateDescription(video.description)}
                  </p>

                  <div className="flex justify-center">
                    <button
                      onClick={() => handleWatchVideo(video.videoId)}
                      className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition w-full"
                    >
                      Watch Video
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;