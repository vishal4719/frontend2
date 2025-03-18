import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Enrollment = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_HOST}/api/playlists/${playlistId}`);
        setPlaylist(response.data);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchPlaylist();
  }, [playlistId]);

  if (!playlist) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-gray-900">{playlist.title}</h1>
      <p className="text-gray-600 mt-2">{playlist.description}</p>

      <div className="mt-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlist.videos.map((video) => (
            <div key={video.videoId} className="bg-white p-4 rounded-md shadow-md">
              <h3 className="text-xl font-bold text-gray-900">{video.title}</h3>
              <p className="text-gray-600">{video.description}</p>
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Watch Video
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Enrollment;