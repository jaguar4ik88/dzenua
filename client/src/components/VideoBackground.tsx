import React, { useState } from 'react';
import './VideoBackground.css';

interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number;
}

interface VideoBackgroundProps {
  backgroundMedia?: MediaItem | null;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ backgroundMedia }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setIsLoaded(true);
  };

  const handleVideoError = (e: any) => {
    console.error('Video failed to load:', e);
    console.log('Falling back to CSS background');
    setIsLoaded(true);
  };

  const renderBackground = () => {
    if (backgroundMedia) {
      if (backgroundMedia.type === 'video') {
        return (
          <video
            className={`background-video ${isLoaded ? 'loaded' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
          >
            <source src={backgroundMedia.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      } else if (backgroundMedia.type === 'image') {
        return (
          <img
            src={backgroundMedia.url}
            alt={backgroundMedia.title}
            className={`background-image ${isLoaded ? 'loaded' : ''}`}
            onLoad={handleVideoLoad}
            onError={handleVideoError}
          />
        );
      }
    }
    
    // Default video background - always show when no backgroundMedia
    return (
      <video
        className={`background-video ${isLoaded ? 'loaded' : ''}`}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      >
        <source src="/storage/video/ocean.mp4" type="video/mp4" />
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="video-background">
      {renderBackground()}
      
      {/* Overlay for better text readability */}
      <div className="video-overlay"></div>
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="video-loading">
          <div className="spinner"></div>
          <p>Завантаження фону...</p>
        </div>
      )}
    </div>
  );
};

export default VideoBackground;
