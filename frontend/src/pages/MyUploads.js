import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import './MyUploads.css';

const fileIcon = (name) => {
  const ext = name?.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['ppt', 'pptx'].includes(ext)) return '📊';
  return '📁';
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function MyUploads() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/notes/my-uploads');
        setNotes(data);
      } catch { toast.error('Failed to load your uploads'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await API.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  return (
    <div className="myuploads-page">
      <div className="myuploads-hero">
        <h2>📁 My Uploaded Notes</h2>
        <p>See who downloaded your notes</p>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>You haven't uploaded anything yet</h3>
        </div>
      ) : (
        <div className="uploads-list">
          {notes.map(note => (
            <div key={note._id} className="upload-item">
              <div className="upload-item-header">
                <div className="upload-item-left">
                  <span className="ufile-icon">{fileIcon(note.fileName)}</span>
                  <div>
                    <h3>{note.title}</h3>
                    <div className="upload-item-tags">
                      <span className="tag sem-tag">{note.semester}</span>
                      <span className="tag type-tag">{note.type}</span>
                      <span className="subject-tag">{note.subject}</span>
                    </div>
                  </div>
                </div>
                <div className="upload-item-right">
                  <div className="dl-stat">
                    <span className="dl-count-big">{note.downloadedBy?.length || 0}</span>
                    <span className="dl-label">students downloaded</span>
                  </div>
                  <button
                    className="btn-see-who"
                    onClick={() => toggleExpand(note._id)}
                    disabled={!note.downloadedBy?.length}
                  >
                    {expanded === note._id ? '🔼 Hide' : '👥 See Who'}
                  </button>
                  <button className="btn-del" onClick={() => handleDelete(note._id)}>🗑</button>
                </div>
              </div>

              {/* Downloaders list */}
              {expanded === note._id && note.downloadedBy?.length > 0 && (
                <div className="downloaders-list">
                  <p className="dl-list-title">Students who downloaded this note:</p>
                  <div className="dl-table">
                    <div className="dl-table-head">
                      <span>#</span>
                      <span>Name</span>
                      <span>Roll No</span>
                      <span>Downloaded On</span>
                    </div>
                    {note.downloadedBy.map((d, i) => (
                      <div key={i} className="dl-table-row">
                        <span>{i + 1}</span>
                        <span>👤 {d.name}</span>
                        <span>{d.rollNo || '—'}</span>
                        <span>{formatDate(d.downloadedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
