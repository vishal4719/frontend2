import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import Loading from "../../Components/Loading/Loading";

const AdminCoursePreview = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [playlistId]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/playlists/${playlistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourse(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Failed to load course details");
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error || "Course not found"}</p>
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
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600">{course.description}</p>
            </div>

            {course.videos && course.videos.length > 0 && (
  <div className="mt-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h2>
    <div className="space-y-3">
      {course.videos.map((video, index) => (
        <div
          key={video.videoId || `video-${index}`} // Using videoId or fallback to index
          className="flex items-center p-3 bg-gray-50 rounded-lg"
        >
          <span className="mr-4 text-gray-500">{index + 1}.</span>
          <span className="text-gray-700">{video.title}</span>
        </div>
      ))}
    </div>
  </div>
)}

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

export default AdminCoursePreview;