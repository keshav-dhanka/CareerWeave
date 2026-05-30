import React from 'react';
import './Footer.css';
import { API_BASE_URL } from '../apiConfig';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/fevicon.svg" alt="CareerWeave Logo" className="logo-icon" />
              <span className="logo-text">CareerWeave</span>
            </div>
            <p className="footer-tagline">Weaving the path from tutorial hell to career success.</p>
            <div className="version-tag">
              Version 0.1.0 (Alpha)
              <span className="tooltip-text">
                Currently in Alpha. Data is stored for educational purposes. Formal Terms & Privacy coming soon.
              </span>
            </div>

          </div>

          <div className="footer-links-group">
            <div className="footer-column">
              <h4>Platform</h4>
              <a href="#how-it-works">How it Works</a>
              <a href="#features">Features</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-column">
              <h4>Developers</h4>
              <a href="https://github.com/keshav-dhanka/CareerWeave" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={`${API_BASE_URL}/api/health`} target="_blank" rel="noopener noreferrer" className="api-status">
                <span className="status-dot"></span>
                API Status
              </a>
              <a href="https://github.com/keshav-dhanka/CareerWeave/issues" target="_blank" rel="noopener noreferrer">Report a Bug</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CareerWeave.</p>
          <p>Built by Keshav Dhanka & Team</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;