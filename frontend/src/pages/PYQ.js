import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import './PYQ.css';

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
  return '📁';
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function PYQ() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('SEM3');
  const [subject, setSubject] = useState('All');
  const navigate = useNavigate();

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const params = { semester, type: 'Previous Year Paper' };
      if (subject !== 'All') params.subject = subject;
      const { data } = await API.get('/notes', { params });
      setPapers(data);
    } catch { toast.error('Failed to load papers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setSubject('All'); }, [semester]);
  useEffect(() => { fetchPapers(); }, [semester, subject]);

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
      fetchPapers();
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="pyq-page">
      <div className="pyq-hero">
        <div>
          <h2>📋 Previous Year Papers</h2>
          <p>SY CSE — Practice with past exam papers</p>
        </div>
        <button className="upload-fab" onClick={() => navigate('/upload')}>+ Upload PYQ</button>
      </div>

      <div className="sem-tabs">
        {['SEM3', 'SEM4'].map(s => (
          <button key={s} className={`sem-tab ${semester === s ? 'active' : ''}`} onClick={() => setSemester(s)}>
            {s === 'SEM3' ? '📘 Semester 3' : '📗 Semester 4'}
          </button>
        ))}
      </div>

      <div className="subject-filters">
        {SEM_SUBJECTS[semester].map(s => (
          <button key={s} className={`filter-btn ${subject === s ? 'active' : ''}`} onClick={() => setSubject(s)}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div><p>Loading papers...</p></div>
      ) : papers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No papers found</h3>
          <p>Upload previous year papers to help your classmates!</p>
          <button onClick={() => navigate('/upload')}>Upload PYQ</button>
        </div>
      ) : (
        <div className="pyq-grid">
          {papers.map(paper => (
            <div key={paper._id} className="pyq-card">
              <div className="pyq-icon">{fileIcon(paper.fileName)}</div>
              <div className="pyq-info">
                <h3>{paper.title}</h3>
                <div className="pyq-tags">
                  <span className="tag sem-tag">{paper.semester}</span>
                  {paper.year && <span className="tag year-tag">📅 {paper.year}</span>}
                </div>
                <span className="subject-tag">{paper.subject}</span>
                {paper.description && <p className="pyq-desc">{paper.description}</p>}
                <div className="pyq-meta">
                  <span>👤 {paper.uploaderName}</span>
                  <span>⬇️ {paper.downloads} downloads</span>
                  <span>📦 {formatSize(paper.fileSize)}</span>
                </div>
              </div>
              <button className="btn-download" onClick={() => handleDownload(paper)}>
                ⬇ Download Paper
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
