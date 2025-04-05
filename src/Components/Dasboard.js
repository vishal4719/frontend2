import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Home/pages/Navbar";
import Loading from "./Loading/Loading";

const Dashboard = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [enrolledPlaylists, setEnrolledPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  useEffect(() => {
    fetchPlaylists();
    fetchVideos();
    fetchEnrolledPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/playlists/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const filteredPlaylists = response.data.filter(playlist => playlist.type !== 'Interview' && playlist.type !== 'Aptitude');
      setPlaylists(filteredPlaylists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      if (error.response?.status === 401) {
        setIsTokenExpired(true);
      }
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
      const filteredVideos = response.data.filter(video => video.type !== 'Interview' && video.type !== 'Aptitude');
      setVideos(filteredVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledPlaylists = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/enrollment/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEnrolledPlaylists(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsTokenExpired(true);
      }
    }
  };

  const handleExplore = (playlistId) => {
    navigate(`/coursedetail/${playlistId}`);
  };

  const handleExploreVideo = (videoId) => {
    navigate(`/videodetail/${videoId}`);
  };

  const handleBuyNow = (playlist) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
      return;
    }
    navigate(`/coursedetail/${playlist.playlistId}`);
  };

  const handleBuyNowVideo = (video) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
      return;
    }
    navigate(`/videodetail/${video.videoId}`);
  };

  const handleGoToCourse = () => {
    navigate('/enrolled-courses');
  };

  const isPlaylistEnrolled = (playlistId) => {
    return enrolledPlaylists.some(enrollment => enrollment.playlistId === playlistId);
  };

  const isVideoEnrolled = (videoId) => {
    return enrolledPlaylists.some(enrollment => enrollment.videoId === videoId);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-64 bg-blue-900">
                  <img
                    src={playlist.thumbnailUrl}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                    {playlist.title}
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </h3>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleExplore(playlist.playlistId)}
                      className="flex-1 px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-pink-50 transition"
                    >
                      Explore
                    </button>
                    {isPlaylistEnrolled(playlist.playlistId) ? (
                      <button
                        onClick={handleGoToCourse}
                        className="flex-1 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                      >
                        Go to Course
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyNow(playlist)}
                        className="flex-1 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {videos.map((video) => (
              <div key={video.id} className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-64 bg-blue-900">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                    {video.title}
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </h3>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleExploreVideo(video.videoId)}
                      className="flex-1 px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-pink-50 transition"
                    >
                      Explore
                    </button>
                    {isVideoEnrolled(video.videoId) ? (
                      <button
                        onClick={handleGoToCourse}
                        className="flex-1 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                      >
                        Go to Course
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyNowVideo(video)}
                        className="flex-1 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                      >
                        Buy Now
                      </button>
                    )}
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

export default Dashboard;