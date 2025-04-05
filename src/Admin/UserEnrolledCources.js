import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "../Components/Loading/Loading";
import Navbar from "../Admin/Components/Navbar";

const UserEnrolledCourses = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledVideos, setEnrolledVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledContent();
  }, [userId]);

  const fetchEnrolledContent = async () => {
    try {
      const token = localStorage.getItem("token");
      const [coursesResponse, videosResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_HOST}/api/auth/admin/user/${userId}/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_HOST}/api/auth/admin/user/${userId}/videos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setEnrolledCourses(coursesResponse.data);
      setEnrolledVideos(videosResponse.data);
    } catch (error) {
      console.error("Error fetching enrolled content:", error);
      setError("Failed to fetch enrolled content. Please try again later.");
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
      <div className="max-w-6xl mx-auto p-4">
        

        {error && (
          <div className="bg-red-100 text-red-700 border-l-4 border-red-500 p-4 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enrolled Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-64 bg-blue-900">
                <img
                  src={course.playlist.thumbnailUrl}
                  alt={course.playlist.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-4">{course.playlist.title}</h3>
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Enrollment Date:</span> {new Date(course.enrollmentDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => navigate(`/coursepreview/${course.playlist.playlistId}`)}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                >
                  Go to Course
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Enrolled Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledVideos.map((video, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-64 bg-blue-900">
                <img
                  src={video.video.thumbnailUrl}
                  alt={video.video.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-4">{video.video.title}</h3>
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Enrollment Date:</span> {new Date(video.enrollmentDate).toLocaleDateString()}
                </p>
                <button
                  onClick={() => navigate(`/videopreview/${video.video.videoId}`)}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                >
                  Go to Video
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserEnrolledCourses;