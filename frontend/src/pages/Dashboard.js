import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './Dashboard.css';

const SEM_SUBJECTS = {
  SEM3: [
    'All',
    'Discrete Mathematical Structures',
    'Computer Networks',
    'Object Oriented Concepts',
    'Community Engagement Project',
    'Intellectual Property Rights',
  ],
  SEM4: [
    'All',
    'Automata Theory',
    'Data Structures',
    'Advanced Object-Oriented Concepts',
    'Web Development',
    'Technology Used for Project Management and System Design',
    'Trending Technology Laboratory',
  ],
};

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

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('SEM3');
  const [subject, setSubject] = useState('All');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = { semester, type: 'Notes' };
      if (subject !== 'All') params.subject = subject;
      if (search) params.search = search;
      const { data } = await API.get('/notes', { params });
      setNotes(data);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setSubject('All'); }, [semester]);
  useEffect(() => { fetchNotes(); }, [semester, subject]);

  const handleSearch = (e) => { e.preventDefault(); fetchNotes(); };

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
      fetchNotes();
    } catch { toast.error('Download failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await API.delete(`/notes/${id}`);
      toast.success('Note deleted');
      fetchNotes();
    } catch { toast.error('Delete failed'); }
  };

  const subjects = SEM_SUBJECTS[semester];

  return (
    <div className="dashboard">
      <div className="dash-hero">
        <div>
          <h2>Hey, {user?.name} 👋</h2>
          <p>SY CSE — Browse and download study notes</p>
        </div>
        <button className="upload-fab" onClick={() => navigate('/upload')}>+ Upload</button>
      </div>

      {/* Semester Tabs */}
      <div className="sem-tabs">
        {['SEM3', 'SEM4'].map(s => (
          <button key={s} className={`sem-tab ${semester === s ? 'active' : ''}`} onClick={() => setSemester(s)}>
            {s === 'SEM3' ? '📘 Semester 3' : '📗 Semester 4'}
          </button>
        ))}
      </div>

      <div className="dash-controls">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search notes by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div className="subject-filters">
          {subjects.map(s => (
            <button key={s} className={`filter-btn ${subject === s ? 'active' : ''}`} onClick={() => setSubject(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div><p>Loading notes...</p></div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No notes found</h3>
          <p>Be the first to upload notes for this subject!</p>
          <button onClick={() => navigate('/upload')}>Upload Now</button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <div key={note._id} className="note-card">
              <div className="note-top">
                <span className="note-file-icon">{fileIcon(note.fileName)}</span>
                <div className="note-tags">
                  <span className="tag sem-tag">{note.semester}</span>
                  <span className="tag type-tag">{note.type}</span>
                </div>
              </div>
              <div className="note-info">
                <h3>{note.title}</h3>
                <span className="subject-tag">{note.subject}</span>
                {note.description && <p className="note-desc">{note.description}</p>}
                <div className="note-meta">
                  <span>👤 {note.uploaderName}</span>
                  <span>⬇️ {note.downloads}</span>
                  <span>📦 {formatSize(note.fileSize)}</span>
                </div>
              </div>
              <div className="note-actions">
                <button className="btn-download" onClick={() => handleDownload(note)}>⬇ Download</button>
                {note.uploadedBy === user?._id && (
                  <button className="btn-delete" onClick={() => handleDelete(note._id)}>🗑</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
