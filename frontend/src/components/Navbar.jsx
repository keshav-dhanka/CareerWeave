import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onRoadmapSelect, openLogin, openSignup, user, isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isExamplesActive = location.pathname.startsWith('/examples');

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleNavClick = (path, hash = false) => {
    setIsMobileMenuOpen(false);
    if (hash && location.pathname !== '/') {
      navigate('/#how-it-works');
    } else if (!hash) {
      navigate(path);
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-logo" onClick={() => handleNavClick('/')} style={{ cursor: 'pointer' }}>
          <img src="/fevicon.svg" alt="CareerWeave Logo" className="logo-icon" />
          <span className="logo-text">CareerWeave</span>
        </div>

        <div className="nav-links desktop-links">
          <a
            href="/examples"
            className={`nav-link ${isExamplesActive ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/examples');
            }}
          >
            Example Roadmaps
          </a>

          <a
            href="/#how-it-works"
            className={`nav-link ${location.hash === '#how-it-works' && !isExamplesActive ? 'active' : ''}`}
            onClick={(e) => {
              if (location.pathname !== '/') {
                e.preventDefault();
                handleNavClick('/#how-it-works', true);
              }
            }}
          >
            How It Works
          </a>

          <a
            href="https://github.com/keshav-dhanka/CareerWeave"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Docs
          </a>
        </div>

        <div className="nav-actions desktop-actions">
          {isAuthenticated ? (
            <div className="nav-profile-group">
              <button className="btn-dashboard" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <div className="nav-avatar" title={user?.full_name}>
                {getInitials(user?.full_name)}
              </div>
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={openLogin}>Login</button>
              <button className="btn-get-started" onClick={openSignup}>Get Started</button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`mobile-dropdown ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-dropdown-content">
          <div className="mobile-nav-links">
            <a
              href="/examples"
              className={`nav-link ${isExamplesActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/examples');
              }}
            >
              Example Roadmaps
            </a>
            <a
              href="/#how-it-works"
              className={`nav-link ${location.hash === '#how-it-works' && !isExamplesActive ? 'active' : ''}`}
              onClick={(e) => {
                if (location.pathname !== '/') {
                  e.preventDefault();
                  handleNavClick('/#how-it-works', true);
                } else {
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              How It Works
            </a>
            <a
              href="https://github.com/keshav-dhanka/CareerWeave"
              className="nav-link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Docs
            </a>
          </div>

          <div className="mobile-nav-actions">
            {isAuthenticated ? (
              <button className="btn-dashboard" style={{ width: '100%' }} onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/dashboard');
              }}>
                Dashboard
              </button>
            ) : (
              <>
                <button className="btn-login" onClick={() => {
                  setIsMobileMenuOpen(false);
                  openLogin();
                }}>Login</button>
                <button className="btn-get-started" onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSignup();
                }}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
