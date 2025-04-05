import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Home/pages/Navbar';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';

const VideoPlayer = () => {
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { videoId } = useParams();
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const timeUpdateInterval = useRef(null);

  useEffect(() => {
    fetchVideoData();
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch video data
      const videoResponse = await axios.get(`${process.env.REACT_APP_HOST}/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVideo(videoResponse.data);
    } catch (error) {
      console.error('Error fetching video data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const onPlayerReady = (event) => {
    setDuration(event.target.getDuration());
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }
    
    timeUpdateInterval.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 1000);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      markVideoAsComplete();
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    }
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  };

  const markVideoAsComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/enrollment/complete-video`,
        { videoId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data?.completed) {
        setCompletionStatus(true);
      }
    } catch (error) {
      console.error('Error marking video as complete:', error);
    }
  };

  const initializePlayer = (videoId) => {
    if (window.YT && window.YT.Player) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      
      playerRef.current = new window.YT.Player('video-player', {
        videoId: videoId,
        playerVars: {
          controls: 0, // Custom controls
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
          enablejsapi: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
  };

  useEffect(() => {
    if (video) {
      const loadYouTubeAPI = () => {
        if (!window.YT) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          window.onYouTubeIframeAPIReady = () => initializePlayer(video.videoId);
        } else {
          initializePlayer(video.videoId);
        }
      };

      loadYouTubeAPI();
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [video]);

  const togglePlayPause = () => {
    if (playerRef.current) {
      isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      isMuted ? playerRef.current.unMute() : playerRef.current.mute();
      setIsMuted(!isMuted);
    }
  };

  const skipForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(Math.min(currentTime + 10, duration));
    }
  };

  const skipBackward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(Math.max(currentTime - 10, 0));
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md">
          {/* Video Player */}
          <div ref={containerRef} className="relative">
            <div className="relative pb-[56.25%] h-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-black">
                <div id="video-player" className="absolute top-0 left-0 w-full h-full"></div>
              </div>
            </div>

            {/* Custom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-4 pt-2 pb-4 flex justify-between items-center">
              <button onClick={togglePlayPause} className="text-white">
                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
              </button>
              <button onClick={skipBackward} className="text-white"><FaStepBackward size={20} /></button>
              <button onClick={skipForward} className="text-white"><FaStepForward size={20} /></button>
              <button onClick={toggleMute} className="text-white">
                {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
              </button>
              <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <button onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
              </button>
            </div>
          </div>

          {/* Video Info */}
          <div className="p-6">
            <h1 className="text-2xl font-bold">{video?.title}</h1>
            <p className="mt-2 text-gray-700">{video?.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
