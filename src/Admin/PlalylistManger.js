import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Components/Navbar';

const PlaylistManager = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadType, setUploadType] = useState('playlist');
  const [playlistType, setPlaylistType] = useState('');
  const [customType, setCustomType] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Extract playlist ID or video ID from YouTube URL
  const extractId = (url) => {
    try {
      const urlParams = new URL(url).searchParams;
      return uploadType === 'playlist' ? urlParams.get('list') : urlParams.get('v');
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    const id = extractId(youtubeUrl);

    if (!id) {
      setStatus({
        type: 'error',
        message: `Invalid YouTube ${uploadType} URL. Please check the URL and try again.`
      });
      setIsLoading(false);
      return;
    }

    // Determine the type to send
    const selectedType = playlistType === 'other' ? customType : playlistType;

    if (!selectedType) {
      setStatus({
        type: 'error',
        message: `Please enter a ${uploadType} type.`
      });
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = uploadType === 'playlist' ? `playlists/save/${id}?type=${selectedType}` : `videos/save/${id}?type=${selectedType}`;
      const response = await fetch(
        `${process.env.REACT_APP_HOST}/api/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      setStatus({ type: 'success', message: `${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} saved successfully!` });
      setYoutubeUrl('');
      setPlaylistType('');
      setCustomType('');
      navigate('/admin'); // Redirect to /admin page
    } catch (error) {
      setStatus({ type: 'error', message: `Failed to save ${uploadType}. ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="max-w-lg mx-auto mt-20 p-10 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-4 px-6">
          <h1 className="text-2xl font-bold text-white text-center">Admin Playlist Manager</h1>
        </div>
        
        <div className="bg-white p-6">
          {status.message && (
            <div
              className={`p-4 mb-5 rounded-lg text-center ${
                status.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-orange-100 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Upload Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full border border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="playlist">Playlist</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  YouTube {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full border border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={`https://www.youtube.com/${uploadType === 'playlist' ? 'playlist?list=' : 'watch?v='}...`}
                  required
                />
              </div>
            </div>

            <div className="bg-orange-100 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Type
                </label>
                <select
                  value={playlistType}
                  onChange={(e) => setPlaylistType(e.target.value)}
                  className="w-full border border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a type</option>
                  <option value="music">Music</option>
                  <option value="educational">Educational</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {playlistType === 'other' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Enter Custom {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Type
                  </label>
                  <input
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full border border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter custom type"
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                isLoading 
                  ? 'bg-orange-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700 shadow-md hover:shadow-lg transform hover:-translate-y-1'
              }`}
            >
              {isLoading ? 'Saving...' : `Save ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlaylistManager;