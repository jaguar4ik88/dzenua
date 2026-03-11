import { useState, useEffect } from 'react';
import './App.css';
import CurrencyWidget from './components/CurrencyWidget';
import Sidebar from './components/Sidebar';
import VideoBackground from './components/VideoBackground';
import MusicPlayer from './components/MusicPlayer';

interface UserSettings {
  hideCurrency: boolean;
  enableMusic: boolean;
  showTimestamp: boolean;
  volume: number;
  backgroundMediaId: string | null;
}

interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number;
}

const defaultSettings: UserSettings = {
  hideCurrency: false,
  enableMusic: false,
  showTimestamp: true,
  volume: 0.7,
  backgroundMediaId: null
};

function App() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdateTs, setLastUpdateTs] = useState<string | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('zenua-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('zenua-settings', JSON.stringify(settings));
  }, [settings]);

  // Load media data
  useEffect(() => {
    const loadMedia = async () => {
      try {
        const response = await fetch('/api/media');
        const data = await response.json();
        if (data.success) {
          setMedia(data.data);
        }
      } catch (error) {
        console.error('Error loading media:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, []);

  // Set default background image if none selected
  useEffect(() => {
    if (!settings.backgroundMediaId && media.length > 0) {
      const firstImage = media.find(item => item.type === 'image');
      if (firstImage) {
        setSettings(prev => ({ ...prev, backgroundMediaId: firstImage.id }));
      }
    }
  }, [media, settings.backgroundMediaId]);

  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMusic = () => {
    setSettings(prev => ({
      ...prev,
      enableMusic: !prev.enableMusic
    }));
  };

  // Get background media
  const backgroundMedia = settings.backgroundMediaId 
    ? media.find(item => item.id === settings.backgroundMediaId)
    : null;

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Завантаження dzenua...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Video Background */}
      <VideoBackground backgroundMedia={backgroundMedia} />
      
      {/* Settings Button */}
      <button 
        className="settings-toggle"
        onClick={toggleSidebar}
        title="Налаштування"
      >
        ⚙️
      </button>

      {/* Music Player */}
      <MusicPlayer
        media={media}
        isEnabled={settings.enableMusic}
        volume={settings.volume}
        onToggle={toggleMusic}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        media={media}
      />

      {/* Main Content - Currency in Center */}
      <main className="main-content">
        {!settings.hideCurrency && (
          <div className="currency-center">
            <CurrencyWidget
              currencies={['USD', 'EUR', 'BTC']}
              refreshInterval={900000}
              showTimestamp={settings.showTimestamp}
              apiEndpoint="/api/currency"
              onTimestampUpdate={(ts) => setLastUpdateTs(ts)}
            />
          </div>
        )}
      </main>

      {settings.showTimestamp && lastUpdateTs && (
        <div className="global-timestamp">
          Дані на: {new Date(lastUpdateTs).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

    </div>
  );
}

export default App;