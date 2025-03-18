import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const CourseModal = ({ isOpen, onClose }) => {
  const [courses, setCourses] = useState([]);
  const [courseTypes, setCourseTypes] = useState(['All']);
  const [selectedType, setSelectedType] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      fetchCourseTypes();
      fetchCourses();
    }
  }, [selectedType]);

  const fetchCourseTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/courses/types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseTypes(['All', ...response.data]);
    } catch (error) {
      console.error('Error fetching course types:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const [playlistResponse, videoResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_HOST}/api/playlists/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_HOST}/api/videos/all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const filteredPlaylists = playlistResponse.data.filter(playlist => 
        selectedType === 'All' || playlist.type === selectedType
      );

      const filteredVideos = videoResponse.data.filter(video => 
        selectedType === 'All' || video.type === selectedType
      );

      setCourses([...filteredPlaylists, ...filteredVideos]);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <div className="flex">
          <div className="w-1/4 p-4 border-r">
            <h2 className="text-lg font-bold mb-4">Course Types</h2>
            <ul>
              {courseTypes.map(type => (
                <li key={type} className="mb-2">
                  <button
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left px-3 py-2 rounded ${selectedType === type ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  >
                    {type}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-3/4 p-4">
            <h2 className="text-lg font-bold mb-4">Courses</h2>
            {isLoggedIn ? (
              <ul>
                {courses.map(course => (
                  <li key={course.id || course.videoId} className="mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-16 h-16 object-cover rounded mr-4"
                        />
                        <div>
                          <span className="block font-bold">{course.title}</span>
                          <span className="block text-sm text-gray-500">{course.type}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (course.videoId) {
                            window.location.href = `/videodetail/${course.videoId}`;
                          } else {
                            window.location.href = `/coursedetail/${course.playlistId}`;
                          }
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-red-500">
                Please log in to access the courses.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;