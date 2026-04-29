import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import './MyDownloads.css';

const fileIcon = (name) => {
  const ext = name?.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['ppt', 'pptx'].includes(ext)) return '📊';
  if (['png', 'jpg', 'jpeg'].includes(ext)) return '🖼️';
  return '📁';
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function MyDownloads() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/notes/my-downloads');
        setNotes(data);
      } catch { toast.error('Failed to load downloads'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDownload = async (note) => {
    try {
      const response = await API.get(`/notes/download/${note._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', note.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started!');
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="mydownloads-page">
      <div className="mydownloads-hero">
        <h2>⬇️ My Downloads</h2>
        <p>All notes you've downloaded so far</p>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No downloads yet</h3>
          <p>Go to Notes or PYQ and download something!</p>
        </div>
      ) : (
        <>
          <p className="dl-count">{notes.length} file{notes.length !== 1 ? 's' : ''} downloaded</p>
          <div className="dl-grid">
            {notes.map(note => (
              <div key={note._id} className="dl-card">
                <div className="dl-icon">{fileIcon(note.fileName)}</div>
                <div className="dl-info">
                  <h3>{note.title}</h3>
                  <div className="dl-tags">
                    <span className="tag sem-tag">{note.semester}</span>
                    <span className="tag type-tag">{note.type}</span>
                  </div>
                  <span className="subject-tag">{note.subject}</span>
                  <div className="dl-meta">
                    <span>👤 {note.uploaderName}</span>
                    <span>📦 {formatSize(note.fileSize)}</span>
                  </div>
                </div>
                <button className="btn-redownload" onClick={() => handleDownload(note)}>
                  ⬇ Download Again
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
