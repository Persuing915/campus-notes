import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import './Upload.css';

const SEM_SUBJECTS = {
  SEM3: [
    'Discrete Mathematical Structures',
    'Computer Networks',
    'Object Oriented Concepts',
    'Community Engagement Project',
    'Intellectual Property Rights',
  ],
  SEM4: [
    'Automata Theory',
    'Data Structures',
    'Advanced Object-Oriented Concepts',
    'Web Development',
    'Technology Used for Project Management and System Design',
    'Trending Technology Laboratory',
  ],
  PYQ: [
    'Discrete Mathematical Structures',
    'Computer Networks',
    'Object Oriented Concepts',
    'Community Engagement Project',
    'Intellectual Property Rights',
    'Automata Theory',
    'Data Structures',
    'Advanced Object-Oriented Concepts',
    'Web Development',
    'Technology Used for Project Management and System Design',
    'Trending Technology Laboratory',
  ],
};

export default function Upload() {
  const [form, setForm] = useState({ title: '', subject: '', semester: '', type: 'Notes', year: '', description: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleFile = (f) => { if (f) setFile(f); };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSemesterChange = (e) => {
    const sem = e.target.value;
    setForm({ ...form, semester: sem, subject: '', type: sem === 'PYQ' ? 'Previous Year Paper' : 'Notes' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    if (!form.semester) return toast.error('Please select a semester');
    if (!form.subject) return toast.error('Please select a subject');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    try {
      await API.post('/notes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Uploaded successfully!');
      navigate(form.semester === 'PYQ' ? '/pyq' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const subjects = form.semester ? SEM_SUBJECTS[form.semester] : [];

  return (
    <div className="upload-page">
      <div className="upload-card">
        <div className="upload-header">
          <h2>📤 Upload File</h2>
          <p>Share notes or previous year papers with SY CSE</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">

          {/* Semester */}
          <div className="form-group">
            <label>Semester / Category *</label>
            <div className="sem-selector">
              {[
                { val: 'SEM3', label: '📘 Semester 3', color: '#4f46e5' },
                { val: 'SEM4', label: '📗 Semester 4', color: '#059669' },
                { val: 'PYQ',  label: '📋 Previous Year Paper', color: '#d97706' },
              ].map(({ val, label, color }) => (
                <button
                  key={val}
                  type="button"
                  className={`sem-choice ${form.semester === val ? 'selected' : ''}`}
                  style={form.semester === val ? { borderColor: color, background: color, color: 'white' } : {}}
                  onClick={() => handleSemesterChange({ target: { value: val } })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          {form.semester && (
            <div className="form-group">
              <label>Subject *</label>
              <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Type (only for notes, not PYQ) */}
          {form.semester && form.semester !== 'PYQ' && (
            <div className="form-group">
              <label>Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="Notes">Notes</option>
                <option value="Assignment">Assignment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* Year (only for PYQ) */}
          {form.semester === 'PYQ' && (
            <div className="form-group">
              <label>Exam Year</label>
              <input
                type="text"
                placeholder="e.g. 2023-24"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              placeholder={form.semester === 'PYQ' ? 'e.g. DBMS End Sem 2023' : 'e.g. Unit 3 - Binary Trees'}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              rows={2}
              placeholder="Brief description..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Drop Zone */}
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {file ? (
              <div className="file-preview">
                <span className="file-emoji">📄</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                <button type="button" className="remove-file" onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
              </div>
            ) : (
              <>
                <div className="drop-icon">☁️</div>
                <p>Drag & drop your file here</p>
                <span>or click to browse</span>
                <small>PDF, DOC, PPT, TXT, Images — Max 20MB</small>
              </>
            )}
          </div>

          <input
            id="fileInput"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />

          <div className="upload-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn-upload" disabled={loading}>
              {loading ? 'Uploading...' : '📤 Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
