import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFieldErrors({});
      setGeneralError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field as user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError('');

    // Custom Validation logic
    const errors = {};

    // Check for blank fields manually
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';

    if (mode === 'signup') {
      if (!formData.fullName) errors.fullName = 'Full Name is required';
      else if (formData.fullName.length < 2) errors.fullName = 'Name is too short';

      if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'signup' ? '/signup' : '/login';
      const body = mode === 'signup'
        ? JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password
        })
        : new URLSearchParams({
          username: formData.email,
          password: formData.password
        });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': mode === 'signup' ? 'application/json' : 'application/x-www-form-urlencoded',
        },
        body: body
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Save token
      localStorage.setItem('token', data.access_token);
      
      const previewRoadmapStr = localStorage.getItem('preview_roadmap');
      if (previewRoadmapStr) {
        try {
          const previewRoadmap = JSON.parse(previewRoadmapStr);
          const saveRes = await fetch(`${API_BASE_URL}/roadmap/save-preview`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.access_token}`
            },
            body: JSON.stringify(previewRoadmap)
          });
          
          if (saveRes.ok) {
            const savedData = await saveRes.json();
            localStorage.removeItem('preview_roadmap');
            onClose();
            navigate(`/roadmap/${savedData.id}`);
            return;
          }
        } catch (e) {
          console.error('Failed to save preview roadmap', e);
        }
      }

      onClose();
      
      const navState = {};
      if (data.deleted_expired > 0) {
        navState.cleanupMessage = `Advisory Notice: ${data.deleted_expired} expired unfeasible roadmaps have been removed.`;
      }
      
      navigate('/dashboard', { state: navState });

    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>&times;</button>

        <div className="auth-container">
          {/* Left Side: 3D SVG Illustration */}
          <div className="auth-visual">
            <div className="svg-wrapper">
              <svg viewBox="0 0 400 400" className="floating-svg">
                <defs>
                  <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-orange)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Orbiting Rings */}
                <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="ring-1" />
                <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" className="ring-2" />

                {/* Connecting Lines */}
                <path d="M100,200 Q200,100 300,200" fill="none" stroke="url(#orbGradient)" strokeWidth="0.5" className="wave-path" />
                <path d="M100,200 Q200,300 300,200" fill="none" stroke="var(--accent-color)" strokeWidth="0.5" className="wave-path-alt" />

                {/* Central Orb */}
                <circle cx="200" cy="200" r="60" fill="url(#orbGradient)" filter="url(#glow)" className="main-orb" />

                {/* Floating Particles */}
                <circle cx="120" cy="150" r="4" fill="var(--accent-orange)" className="p-1" />
                <circle cx="280" cy="250" r="6" fill="var(--accent-color)" className="p-2" />
                <circle cx="200" cy="80" r="3" fill="#fff" className="p-3" />
              </svg>
            </div>
            <div className="auth-visual-text">
              <h2>{mode === 'signup' ? 'Start Your Journey' : 'Welcome Back'}</h2>
              <p>{mode === 'signup' ? 'Join thousands of professionals mapping their futures.' : 'Continue weaving your dream career path.'}</p>
            </div>
          </div>

          {/* Right Side: Auth Form */}
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>{mode === 'signup' ? 'Create Account' : 'Login'}</h1>
              <p className="auth-subtitle">
                {mode === 'signup' ? 'Enter your details to get started' : 'Access your personalized roadmaps'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {mode === 'signup' && (
                <div className={`form-group floating ${fieldErrors.fullName ? 'error' : ''}`}>
                  <input
                    type="text"
                    name="fullName"
                    placeholder=" "
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  <label>Full Name</label>
                  {fieldErrors.fullName && <span className="help-text">{fieldErrors.fullName}</span>}
                </div>
              )}

              <div className={`form-group floating ${fieldErrors.email ? 'error' : ''}`}>
                <input
                  type="email"
                  name="email"
                  placeholder=" "
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <label>Email Address</label>
                {fieldErrors.email && <span className="help-text">{fieldErrors.email}</span>}
              </div>

              <div className={`form-group floating ${fieldErrors.password ? 'error' : ''}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder=" "
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <label>Password</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {fieldErrors.password && <span className="help-text">{fieldErrors.password}</span>}
              </div>

              {/* {mode === 'login' && (
                <button type="button" className="forgot-password-link">
                  forgot password?
                </button>
              )} */}

              {mode === 'signup' && (
                <div className={`form-group floating ${fieldErrors.confirmPassword ? 'error' : ''}`}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder=" "
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <label>Confirm Password</label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {fieldErrors.confirmPassword && <span className="help-text">{fieldErrors.confirmPassword}</span>}
                </div>
              )}

              {generalError && <div className="auth-error">{generalError}</div>}

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Login')}
              </button>

              <div className="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lock-icon">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Your data is secure & private</span>
              </div>
            </form>

            <div className="auth-footer">
              {mode === 'signup' ? (
                <>
                  <p className="switch-mode">
                    Already have an account? <button onClick={() => setMode('login')}>Login</button>
                  </p>
                </>
              ) : (
                <p className="switch-mode">
                  Don't have an account? <button onClick={() => setMode('signup')}>Sign Up</button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
