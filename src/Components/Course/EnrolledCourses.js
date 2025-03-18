import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Home/pages/Navbar"; // Adjust the path based on your folder structure
import Loading from "../Loading/Loading"
const EnrolledCourses = () => {
  const navigate = useNavigate();
  const [enrolledContent, setEnrolledContent] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledContent();
  }, []);

  const fetchEnrolledContent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/enrollment/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      
      setEnrolledContent(response.data);
      await Promise.all([fetchPlaylists(), fetchVideos()]);
    } catch (error) {
      console.error("Error fetching enrolled content:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/playlists/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlaylists(response.data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
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
    }
  };

  if (loading) {
    return <div><Loading/></div>;
  }

  const getEnrollmentCounts = () => {
    const playlistEnrollments = enrolledContent.filter(e => e.playlistId).length;
    const videoEnrollments = enrolledContent.filter(e => e.videoId).length;
    return { playlistEnrollments, videoEnrollments };
  };

  const { playlistEnrollments, videoEnrollments } = getEnrollmentCounts();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Enrolled Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Playlist Enrollments */}
            {enrolledContent
              .filter(enrollment => enrollment.playlistId)
              .map((enrollment) => {
                const playlist = playlists.find(p => p.playlistId === enrollment.playlistId);
                return playlist ? (
                  <div key={enrollment.id + "-playlist"} className="bg-white p-4 rounded-lg shadow-md">
                    <img
                      src={playlist.thumbnailUrl}
                      alt={playlist.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <h3 className="text-xl font-bold mt-2">{playlist.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">{playlist.description}</p>
                    <div className="mt-3">
                      <button
                        onClick={() => navigate(`/course/${playlist.playlistId}`)}
                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition font-semibold"
                      >
                        Continue Course
                      </button>
                    </div>
                  </div>
                ) : null;
              })}
              
            {/* Individual Video Enrollments */}
            {enrolledContent
              .filter(enrollment => enrollment.videoId)
              .map((enrollment) => {
                const video = videos.find(v => v.videoId === enrollment.videoId);
                return video ? (
                  <div key={enrollment.id + "-video"} className="bg-white p-4 rounded-lg shadow-md">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <h3 className="text-xl font-bold mt-2">{video.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">{video.description}</p>
                    <div className="mt-3">
                      <button
                        onClick={() => navigate(`/video/${video.videoId}`)}
                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition font-semibold"
                      >
                        Watch Video
                      </button>
                    </div>
                  </div>
                ) : null;
              })}

            {/* Display message if no enrollments */}
            {enrolledContent.length === 0 && (
              <div className="col-span-3 text-center p-8 bg-white rounded-lg shadow-md">
                <p className="text-gray-600">You haven't enrolled in any courses or videos yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourses;