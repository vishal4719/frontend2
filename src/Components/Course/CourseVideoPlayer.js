import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { 
  FaPlay, FaPause, FaStepForward, FaStepBackward, 
  FaVolumeMute, FaVolumeUp, FaExpand, FaCompress 
} from 'react-icons/fa';

const CourseVideoPlayer = ({ videoId, onVideoComplete, onVideoProgress }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [completionTracked, setCompletionTracked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowRight') {
        skipForward();
      } else if (e.key === 'ArrowLeft') {
        skipBackward();
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setCompleted(false);
    setCompletionTracked(false);
    setIsLoading(true);
    setError(null);
  }, [videoId]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const onReady = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    setIsLoading(false);
  };

  const onError = (event) => {
    setError("Error loading video. Please try again.");
    setIsLoading(false);
  };

  const onStateChange = (event) => {
    setIsPlaying(event.data === 1);
    if (player) {
      const currentTimeValue = player.getCurrentTime();
      setCurrentTime(currentTimeValue);
      if (!completionTracked && currentTimeValue >= duration * 0.95) {
        setCompleted(true);
        setCompletionTracked(true);
        onVideoComplete?.(videoId);
      }
      onVideoProgress?.({
        isPlaying: event.data === 1,
        currentTime: currentTimeValue,
        duration: duration,
        completed: completed || currentTimeValue >= duration * 0.95
      });
    }
  };

  const togglePlayPause = () => {
    isPlaying ? player.pauseVideo() : player.playVideo();
  };

  const toggleMute = () => {
    isMuted ? player.unMute() : player.mute();
    setIsMuted(!isMuted);
  };

  const skipForward = () => player?.seekTo(Math.min(currentTime + 10, duration));
  const skipBackward = () => player?.seekTo(Math.max(currentTime - 10, 0));

  const handleSeek = (e) => player?.seekTo((e.target.value / 100) * duration);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressPercentage = () => (duration > 0 ? (currentTime / duration) * 100 : 0);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      rel: 0,
      modestbranding: 1,
      controls: 0,
      disablekb: 1,
      showinfo: 0,
      fs: 0,
      iv_load_policy: 3,
    },
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-lg shadow-lg bg-black ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`} 
      style={{ aspectRatio: '16/9' }}
    >
      {/* YouTube Player */}
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-white"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
            <p className="text-red-400 mb-2">⚠️ {error}</p>
            <button onClick={() => window.location.reload()} className="bg-blue-500 px-4 py-2 rounded">
              Retry
            </button>
          </div>
        )}
        
        <YouTube videoId={videoId} opts={opts} onReady={onReady} onStateChange={onStateChange} onError={onError} className="w-full h-full" ref={playerRef} />
      </div>

      {/* Custom Controls */}
      {player && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3 flex flex-wrap items-center justify-between text-white">
          {/* Progress Bar */}
          <input type="range" min="0" max="100" value={getProgressPercentage()} onChange={handleSeek} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
          
          {/* Controls */}
          <div className="flex items-center gap-4 mt-2 w-full justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-4">
              <button onClick={togglePlayPause}>{isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}</button>
              <button onClick={skipBackward}><FaStepBackward size={18} /></button>
              <button onClick={skipForward}><FaStepForward size={18} /></button>
              <button onClick={toggleMute}>{isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}</button>
              <span className="text-xs">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              <button onClick={toggleFullscreen}>{isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseVideoPlayer;
