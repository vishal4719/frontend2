import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Home/pages/Navbar';
import Loading from '../Loading/Loading';

const VideoDetail = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideoDetails();
    checkEnrollmentStatus();
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
    } catch (error) {
      console.error('Error fetching video details:', error);
      setError('Failed to load video details');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/enrollment/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsEnrolled(response.data.some(enrollment => enrollment.videoId === videoId));
    } catch (error) {
      console.error("Error checking enrollment status:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signup");
      }
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
      return;
    }
  
    if (window.confirm(`Do you want to enroll in ${video.title}?`)) {
      setEnrolling(true);
      setError(null);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_HOST}/api/enrollment/enroll`,
          {
            videoId: videoId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );
  
        if (response.status === 200) {
          setIsEnrolled(true);
          navigate(`/enrolled-courses`);
        }
      } catch (error) {
        console.error("Error enrolling in video:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert("Your session has expired. Please login again.");
          navigate("/signup");
        } else {
          setError("Failed to enroll in the video. Please try again.");
        }
      } finally {
        setEnrolling(false);
      }
    }
  };

  const handleGoToCourse = () => {
    navigate(`/video/${videoId}`);
  };

  if (loading) return <Loading />;
  if (!video) return <div className="text-white">Video not found</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-300 mb-6">
          <a href="/" className="hover:text-white">Home</a>
          <span className="mx-2">&gt;</span>
          <a href="/courses" className="hover:text-white">Courses</a>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-400">{video.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-1 rounded-lg mb-4">
              #Bestseller
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{video.title}</h1>
            
            <div className="mb-8">
              <p className="text-xl text-white font-semibold mb-4">
                {isEnrolled ? 'You are enrolled in this video' : 'Classes starting soon - Enroll Now!'}
              </p>
              <div className="flex gap-4">
                {isEnrolled ? (
                  <button
                    onClick={handleGoToCourse}
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition font-semibold"
                  >
                    Go to Video
                  </button>
                ) : (
                  <button
                    onClick={handleBuyNow}
                    disabled={enrolling}
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition font-semibold disabled:opacity-50"
                  >
                    {enrolling ? "Enrolling..." : "Buy Now"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold text-white mb-4">About This Video</h2>
              <p className="text-gray-300">{video.description}</p>
            </div>
          </div>

          <div className="relative">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;