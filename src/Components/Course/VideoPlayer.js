import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';

const VideoPlayer = ({ videoId, onVideoComplete, onVideoProgress }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [completionTracked, setCompletionTracked] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    // Add keyboard event listeners
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        togglePlayPause();
      } else if (completed && e.key === 'ArrowRight') {
        skipForward();
      } else if (completed && e.key === 'ArrowLeft') {
        skipBackward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, completed]);

  // Reset state when video changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setCompleted(false);
    setCompletionTracked(false);
  }, [videoId]);

  const onReady = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
  };

  const onStateChange = (event) => {
    // Update playing state
    setIsPlaying(event.data === 1);
    
    // Update current time
    if (player) {
      const currentTimeValue = player.getCurrentTime();
      setCurrentTime(currentTimeValue);
      
      // Check for completion (95% watched)
      if (!completionTracked && currentTimeValue >= (duration * 0.95)) {
        setCompleted(true);
        setCompletionTracked(true);
        if (onVideoComplete) {
          onVideoComplete(videoId);
        }
      }

      // Pass progress data to parent
      if (onVideoProgress) {
        onVideoProgress({
          isPlaying: event.data === 1,
          currentTime: currentTimeValue,
          duration: duration
        });
      }
    }
  };

  // Timer to update current time during playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (player) {
          const currentTimeValue = player.getCurrentTime();
          setCurrentTime(currentTimeValue);
          
          // Check for completion (95% watched)
          if (!completionTracked && currentTimeValue >= (duration * 0.95)) {
            setCompleted(true);
            setCompletionTracked(true);
            if (onVideoComplete) {
              onVideoComplete(videoId);
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player, videoId, completionTracked, duration, onVideoComplete]);

  const togglePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (player && completed) {
      const newTime = Math.min(player.getCurrentTime() + 10, duration);
      player.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (player && completed) {
      const newTime = Math.max(player.getCurrentTime() - 10, 0);
      player.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleSeek = (e) => {
    if (player && completed) {
      const seekTime = (e.target.value / 100) * duration;
      player.seekTo(seekTime);
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  // YouTube player options
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      rel: 0,
      modestbranding: 1,
      controls: 0, // Hide default controls
      disablekb: !completed, // Disable keyboard controls until completed
      showinfo: 0,
      fs: 0, // Disable fullscreen
      iv_load_policy: 3, // Hide annotations
    },
  };

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      {/* YouTube Player */}
      <div className="relative w-full h-full">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full"
          ref={playerRef}
        />
      </div>
      
      {/* Custom Controls - Only shown when video is loaded */}
      {player && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-4 pt-2 pb-4">
          {/* Progress Bar */}
          <div className="relative w-full h-1 bg-gray-600 mb-3 cursor-pointer">
            <div 
              className="absolute top-0 left-0 h-full bg-red-600" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              value={getProgressPercentage()}
              onChange={handleSeek}
              disabled={!completed}
              className={`absolute top-0 left-0 w-full h-1 opacity-0 cursor-${completed ? 'pointer' : 'not-allowed'}`}
            />
          </div>
          
          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button 
                onClick={togglePlayPause}
                className="text-white p-1"
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              
              {/* Skip Buttons */}
              <button 
                onClick={skipBackward}
                disabled={!completed}
                className={`text-white p-1 ${!completed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaStepBackward />
              </button>
              
              <button 
                onClick={skipForward}
                disabled={!completed}
                className={`text-white p-1 ${!completed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaStepForward />
              </button>
              
              {/* Time Display */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            {/* Completion Indicator */}
            {completed ? (
              <div className="text-sm text-green-400">
                Video Completed ✓
              </div>
            ) : (
              <div className="text-sm text-yellow-400">
                Please watch the full video
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;