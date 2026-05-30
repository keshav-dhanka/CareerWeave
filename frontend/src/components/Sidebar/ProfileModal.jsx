import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Lock, ShieldAlert, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, initialTab, user, onUserUpdate, onLogout, showToast, roadmaps = [] }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Reset forms when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setDeletePassword('');
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen && !loading) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName || !email) {
      showToast('Name and email are required.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/me/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ full_name: fullName, email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update profile');
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      if (onUserUpdate) {
        onUserUpdate({ ...user, full_name: fullName, email });
      }
      showToast('Profile updated successfully.', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required.', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update password');
      
      showToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      showToast('Please enter your password to confirm.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/me`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to delete account');
      
      showToast('Account deleted permanently.', 'success');
      onLogout();
    } catch (err) {
      showToast(err.message, 'error');
      setLoading(false);
    }
  };

  return createPortal(
    <div className={`pm-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`pm-container ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="pm-header">
          <div className="pm-header-title">
            <h2>{activeTab === 'general' ? 'Profile Settings' : activeTab === 'security' ? 'Security' : 'Delete Account'}</h2>
          </div>
          <button className="pm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="pm-body">
          <div className="pm-content">
            {activeTab === 'general' && (
              <form className="pm-form" onSubmit={handleUpdateProfile}>
                <div className="pm-form-group">
                  <label>Full Name</label>
                  <div className="pm-input-wrapper">
                    <User size={16} className="pm-input-icon" />
                    <input 
                      type="text" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="pm-form-group">
                  <label>Email Address</label>
                  <div className="pm-input-wrapper">
                    <Mail size={16} className="pm-input-icon" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="john@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" className="pm-btn pm-btn--primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {activeTab === 'security' && (
              <form className="pm-form" onSubmit={handleUpdatePassword}>
                <div className="pm-form-group">
                  <label>Current Password</label>
                  <div className="pm-input-wrapper">
                    <Lock size={16} className="pm-input-icon" />
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)} 
                      placeholder="Enter current password"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="pm-form-group">
                  <label>New Password</label>
                  <div className="pm-input-wrapper">
                    <Lock size={16} className="pm-input-icon" />
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="At least 6 characters"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="pm-form-group">
                  <label>Confirm New Password</label>
                  <div className="pm-input-wrapper">
                    <CheckCircle2 size={16} className="pm-input-icon" />
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder="Repeat new password"
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" className="pm-btn pm-btn--primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            {activeTab === 'danger' && (() => {
              const totalRoadmaps = roadmaps.length;
              const totalMilestones = roadmaps.reduce((acc, r) => acc + (r.total_weeks || 0), 0);
              return (
              <form className="pm-form" onSubmit={handleDeleteAccount}>
                <div className="pm-danger-zone">
                  <div className="pm-danger-warning">
                    <AlertCircle size={20} className="pm-danger-icon" />
                    <p><strong>This action is irreversible.</strong> All your custom woven paths, project tracking history, and saved threads will be wiped forever.</p>
                  </div>
                  
                  <div className="pm-impact-counter">
                    <span>You're about to lose:</span>
                    <div className="pm-impact-stats">
                      <div className="pm-stat-box">
                        <span className="pm-stat-num">{totalRoadmaps}</span>
                        <span className="pm-stat-label">Roadmaps</span>
                      </div>
                      <div className="pm-stat-box">
                        <span className="pm-stat-num">{totalMilestones}</span>
                        <span className="pm-stat-label">Milestones</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pm-form-group">
                  <label>Type Password to Confirm</label>
                  <div className="pm-input-wrapper pm-glass-input">
                    <Lock size={16} className="pm-input-icon" />
                    <input 
                      type="password" 
                      value={deletePassword} 
                      onChange={e => setDeletePassword(e.target.value)} 
                      placeholder="Enter your password to confirm"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="pm-action-split">
                  <button type="submit" className="pm-btn pm-btn--hard-danger" disabled={loading || !deletePassword}>
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </form>
            )})()}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileModal;
