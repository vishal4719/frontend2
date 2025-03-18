import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import Loading from "../../Components/Loading/Loading";

const AdminVideoPreview = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideoDetails();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVideo(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching video details:", error);
      setError("Failed to load video details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-6">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error || "Video not found"}</p>
            <button
              onClick={() => navigate("/admin")}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-96">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{video.title}</h1>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600">{video.description}</p>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => navigate("/admin")}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition mr-4"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideoPreview;