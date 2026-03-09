import React, { useEffect, useMemo, useState } from 'react';
import './AdminPanel.css';

type MediaType = 'video' | 'audio' | 'image';

interface MediaItem {
  id: number | string;
  type: MediaType;
  url: string;
  filename?: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  file_size?: number;
  mime_type?: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('zenua_admin_2025');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<MediaType | 'all'>('all');

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<MediaType>('image');
  const [title, setTitle] = useState<string>('');

  const authHeader = useMemo(() => {
    const token = btoa(`${username}:${password}`);
    return { Authorization: `Basic ${token}` };
  }, [username, password]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = filter === 'all' ? '' : `?type=${encodeURIComponent(filter)}`;
      const res = await fetch(`/api/media${qs}`);
      const data = await res.json();
      if (data.success) setMedia(data.data || []);
      else setError('Не вдалося завантажити список медіа');
    } catch (e: any) {
      setError(e?.message || 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      setLoading(true);
      setError(null);
      const form = new FormData();
      form.append('type', uploadType);
      if (title) form.append('title', title);
      form.append('file', file);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { ...authHeader },
        body: form
      });

      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      await loadMedia();
      setFile(null);
      setFilePreview(null);
      setTitle('');
    } catch (e: any) {
      setError(e?.message || 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (f: File | null) => {
    setFile(f);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    if (f) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Видалити медіа?')) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader }
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await loadMedia();
    } catch (e: any) {
      setError(e?.message || 'Помилка видалення');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: number | string) => {
    const newTitle = prompt('Нова назва:');
    if (newTitle === null) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ title: newTitle })
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      await loadMedia();
    } catch (e: any) {
      setError(e?.message || 'Помилка оновлення');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-panel__backdrop" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel__header">
          <h3>Admin Panel</h3>
          <button className="admin-btn admin-btn--ghost" onClick={onClose}>Закрити</button>
        </div>

        <div className="admin-panel__auth">
          <input
            type="text"
            placeholder="Користувач"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <form className="admin-panel__upload" onSubmit={handleUpload}>
          <select value={uploadType} onChange={(e) => setUploadType(e.target.value as MediaType)}>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
          <input
            type="text"
            placeholder="Назва (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input type="file" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
          <button className="admin-btn" type="submit" disabled={loading || !file}>Завантажити</button>
        </form>

        {filePreview && (
          <div className="admin-panel__preview">
            <div className="label">Превʼю:</div>
            {uploadType === 'image' && (
              <img src={filePreview} alt="preview" className="preview-image" />
            )}
            {uploadType === 'video' && (
              <video src={filePreview} className="preview-video" controls muted />)
            }
            {uploadType === 'audio' && (
              <audio src={filePreview} className="preview-audio" controls />
            )}
          </div>
        )}

        <div className="admin-panel__toolbar">
          <div className="filter">
            <label>Фільтр:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <option value="all">Всі</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>
          <button className="admin-btn admin-btn--ghost" onClick={loadMedia} disabled={loading}>Оновити</button>
        </div>

        {error && <div className="admin-panel__error">{error}</div>}

        <div className="admin-panel__list">
          {loading ? (
            <div className="admin-panel__loading">Завантаження...</div>
          ) : media.length === 0 ? (
            <div className="admin-panel__empty">Немає медіа</div>
          ) : (
            media.map((m) => (
              <div key={m.id} className="admin-panel__item">
                <div className="meta">
                  <div className="type">{m.type}</div>
                  <div className="title">{m.title || m.filename || '—'}</div>
                  <a className="link" href={m.url} target="_blank" rel="noreferrer">Відкрити</a>
                </div>
                <div className="actions">
                  <button className="admin-btn admin-btn--ghost" onClick={() => handleRename(m.id)}>Перейменувати</button>
                  <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(m.id)}>Видалити</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;


