import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css';

interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number;
}

interface MusicPlayerProps {
  media: MediaItem[];
  isEnabled: boolean;
  volume: number;
  onToggle: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  media,
  isEnabled,
  volume,
  onToggle
}) => {
  const [currentTrack, setCurrentTrack] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const musicTracks = media.filter(item => item.type === 'audio');

  useEffect(() => {
    if (musicTracks.length > 0 && !currentTrack) {
      setCurrentTrack(musicTracks[0]);
    }
  }, [musicTracks, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isEnabled && currentTrack && audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isEnabled, currentTrack]);

  const playNext = () => {
    if (musicTracks.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % musicTracks.length;
    const nextTrack = musicTracks[nextIndex];
    
    setCurrentTrack(nextTrack);
    setCurrentIndex(nextIndex);
    
    if (isEnabled) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }, 100);
    }
  };

  const handleEnded = () => {
    playNext();
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="music-player">
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack?.url}
          onEnded={handleEnded}
          onPlay={handlePlay}
          onPause={handlePause}
          loop={false}
          preload="metadata"
        />
      )}
      
      <button
        className={`music-toggle ${isEnabled ? 'enabled' : ''}`}
        onClick={onToggle}
        title={isEnabled ? 'Вимкнути музику' : 'Увімкнути музику'}
      >
        {isEnabled ? '🔊' : '🔇'}
      </button>
      
      {isEnabled && currentTrack && (
        <div className="music-info">
          <span className="music-title">{currentTrack.title}</span>
          <span className="music-status">
            {isPlaying ? '▶️' : '⏸️'}
          </span>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
