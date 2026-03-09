import React, { useState } from 'react';
import './Sidebar.css';

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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  media: MediaItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  media
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'images' | 'videos' | 'music' | 'contact'>('settings');

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const images = media.filter(item => item.type === 'image');
  const videos = media.filter(item => item.type === 'video');
  const music = media.filter(item => item.type === 'audio');

  const renderSettings = () => (
    <div className="sidebar-content">
      <h3>Налаштування</h3>
      
      <label className="setting-item">
        <input
          type="checkbox"
          checked={settings.hideCurrency}
          onChange={(e) => handleSettingChange('hideCurrency', e.target.checked)}
        />
        <span>Приховати курси валют</span>
      </label>
      
      <label className="setting-item">
        <input
          type="checkbox"
          checked={settings.showTimestamp}
          onChange={(e) => handleSettingChange('showTimestamp', e.target.checked)}
        />
        <span>Показувати час оновлення</span>
      </label>
      
      <label className="setting-item">
        <input
          type="checkbox"
          checked={settings.enableMusic}
          onChange={(e) => handleSettingChange('enableMusic', e.target.checked)}
        />
        <span>Увімкнути музику</span>
      </label>
      
      <div className="volume-control">
        <label>Гучність: {Math.round(settings.volume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.volume}
          onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
        />
      </div>

      {/* Live background preview */}
      {settings.backgroundMediaId && (
        <div className="background-preview">
          <h4>Поточний фон</h4>
          {(() => {
            const bg = media.find(m => m.id === settings.backgroundMediaId);
            if (!bg) return null;
            if (bg.type === 'image') {
              return <img src={bg.url} alt={bg.title} className="background-preview-image" />
            }
            if (bg.type === 'video') {
              return <video src={bg.url} className="background-preview-video" controls muted />
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );

  const handleSetBackground = (item: MediaItem) => {
    if (item.type === 'video' || item.type === 'image') {
      onSettingsChange({
        ...settings,
        backgroundMediaId: item.id
      });
    }
  };

  const renderMedia = (items: MediaItem[], type: string) => (
    <div className="sidebar-content">
      <h3>{type}</h3>
      <div className="media-grid">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`media-item ${settings.backgroundMediaId === item.id ? 'selected' : ''}`}
            onClick={() => handleSetBackground(item)}
          >
            {(item.thumbnail || (item.type === 'image' && item.url)) && (
              <img 
                src={item.thumbnail || item.url} 
                alt={item.title}
                className="media-thumbnail"
              />
            )}
            <div className="media-info">
              <h4>{item.title}</h4>
              {item.duration && (
                <span className="media-duration">
                  {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                </span>
              )}
              {(item.type === 'video' || item.type === 'image') && (
                <button 
                  className="set-background-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetBackground(item);
                  }}
                >
                  {settings.backgroundMediaId === item.id ? '✓ Фон' : 'Встановити фон'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="sidebar-content">
      <h3>Контакти</h3>
      <div className="contact-info">
        <p>Загальні питання: info@zenua.com</p>
        <p>Реклама та співпраця: business@zenua.com</p>
        
        <div className="social-links">
          <a href="#" className="social-link">Facebook</a>
          <a href="#" className="social-link">Twitter</a>
          <a href="#" className="social-link">Instagram</a>
          <a href="#" className="social-link">Telegram</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>ZenUA</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="sidebar-tabs">
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Налаштування
        </button>
        <button 
          className={`tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Зображення ({images.length})
        </button>
        <button 
          className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Відео ({videos.length})
        </button>
        <button 
          className={`tab ${activeTab === 'music' ? 'active' : ''}`}
          onClick={() => setActiveTab('music')}
        >
          Музика ({music.length})
        </button>
        <button 
          className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Контакти
        </button>
      </div>

      <div className="sidebar-body">
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'images' && renderMedia(images, 'Зображення')}
        {activeTab === 'videos' && renderMedia(videos, 'Відео')}
        {activeTab === 'music' && renderMedia(music, 'Музика')}
        {activeTab === 'contact' && renderContact()}
      </div>
    </div>
  );
};

export default Sidebar;
