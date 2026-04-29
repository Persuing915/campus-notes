import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import './Contributors.css';

export default function Contributors() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const { data } = await API.get('/notes/contributors');
        setContributors(data);
      } catch {
        toast.error('Failed to load contributors');
      } finally {
        setLoading(false);
      }
    };
    fetchContributors();
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return { icon: '🥇', label: 'Top Contributor' };
    if (index === 1) return { icon: '🥈', label: '2nd Place' };
    if (index === 2) return { icon: '🥉', label: '3rd Place' };
    return { icon: '⭐', label: `#${index + 1}` };
  };

  const getAvatar = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getAvatarColor = (index) => {
    const colors = [
      '#4f46e5', '#7c3aed', '#059669', '#d97706',
      '#dc2626', '#0ea5e9', '#ec4899', '#10b981'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="contributors-page">
      {/* Hero */}
      <div className="contrib-hero">
        <div className="contrib-hero-text">
          <h2>🌟 Note Contributors</h2>
          <p>Students who shared their knowledge with everyone</p>
        </div>
        <button className="contrib-upload-btn" onClick={() => navigate('/upload')}>
          + Upload & Join
        </button>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <span>📢</span>
        <p>
          <strong>Anyone can contribute!</strong> Create an account, upload your notes, and help your fellow students.
          Every upload you make is accessible to all registered students on this platform.
        </p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading contributors...</p>
        </div>
      ) : contributors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🙋</div>
          <h3>No contributors yet</h3>
          <p>Be the first one to upload notes and appear here!</p>
          <button onClick={() => navigate('/upload')}>Upload Now</button>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-num">{contributors.length}</span>
              <span className="stat-lbl">Contributors</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{contributors.reduce((a, c) => a + c.totalNotes, 0)}</span>
              <span className="stat-lbl">Total Notes</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{contributors.reduce((a, c) => a + c.totalDownloads, 0)}</span>
              <span className="stat-lbl">Total Downloads</span>
            </div>
          </div>

          {/* Contributors Grid */}
          <div className="contrib-grid">
            {contributors.map((c, index) => {
              const badge = getRankBadge(index);
              return (
                <div key={c.uploaderId} className={`contrib-card ${index < 3 ? 'top-card' : ''}`}>
                  <div className="rank-badge">{badge.icon} {badge.label}</div>
                  <div
                    className="contrib-avatar"
                    style={{ background: getAvatarColor(index) }}
                  >
                    {getAvatar(c.uploaderName)}
                  </div>
                  <h3 className="contrib-name">{c.uploaderName}</h3>
                  <p className="contrib-roll">{c.rollNo}</p>
                  <div className="contrib-stats">
                    <div className="cstat">
                      <span className="cstat-num">{c.totalNotes}</span>
                      <span className="cstat-lbl">Notes</span>
                    </div>
                    <div className="cstat-divider"></div>
                    <div className="cstat">
                      <span className="cstat-num">{c.totalDownloads}</span>
                      <span className="cstat-lbl">Downloads</span>
                    </div>
                  </div>
                  <div className="contrib-subjects">
                    {c.subjects.slice(0, 3).map(s => (
                      <span key={s} className="subj-chip">{s}</span>
                    ))}
                    {c.subjects.length > 3 && (
                      <span className="subj-chip more">+{c.subjects.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
