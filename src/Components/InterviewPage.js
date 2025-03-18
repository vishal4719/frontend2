import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Home/pages/Navbar";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading/Loading";

const InterviewPage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInterviewContent();
  }, []);

  const fetchInterviewContent = async () => {
    try {
      const token = localStorage.getItem("token");

      const [interviewVideosResponse, aptitudeVideosResponse, interviewPlaylistsResponse, aptitudePlaylistsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_HOST}/api/videos/type/Interview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_HOST}/api/videos/type/Aptitude`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_HOST}/api/playlists/type/Interview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_HOST}/api/playlists/type/Aptitude`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      setVideos([...interviewVideosResponse.data, ...aptitudeVideosResponse.data]);
      setPlaylists([...interviewPlaylistsResponse.data, ...aptitudePlaylistsResponse.data]);
    } catch (error) {
      console.error("Error fetching interview content:", error);
      setError("Failed to load interview content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview and Aptitude Content</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
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
                      onClick={() => navigate(`/coursedetail/${playlist.playlistId}`)}
                      className="flex-1 px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-pink-50 transition"
                    >
                      Explore
                    </button>
                    <button
                      onClick={() => navigate(`/coursedetail/${playlist.playlistId}`)}
                      className="flex-1 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                    >
                      Watch Now
                    </button>
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
                      onClick={() => navigate(`/videodetail/${video.videoId}`)}
                      className="flex-1 px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-pink-50 transition"
                    >
                      Explore
                    </button>
                    <button
                      onClick={() => navigate(`/videodetail/${video.videoId}`)}
                      className="flex-1 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                    >
                      Watch Now
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

export default InterviewPage;