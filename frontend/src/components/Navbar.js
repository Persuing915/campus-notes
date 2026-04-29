import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span>📚</span>
        <span>Campus Notes</span>
        <span className="badge">SY CSE</span>
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>📘 Notes</Link>
        <Link to="/pyq" className={isActive('/pyq')} onClick={() => setMenuOpen(false)}>📋 PYQ</Link>
        <Link to="/contributors" className={isActive('/contributors')} onClick={() => setMenuOpen(false)}>🌟 Contributors</Link>
        <Link to="/my-downloads" className={isActive('/my-downloads')} onClick={() => setMenuOpen(false)}>⬇️ My Downloads</Link>
        <Link to="/my-uploads" className={isActive('/my-uploads')} onClick={() => setMenuOpen(false)}>📁 My Uploads</Link>
        <Link to="/upload" className={isActive('/upload')} onClick={() => setMenuOpen(false)}>📤 Upload</Link>
        <div className="nav-user">
          <span>🎓</span>
          <span>{user?.name}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>
    </nav>
  );
}
