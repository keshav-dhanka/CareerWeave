import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../apiConfig';
import { Menu, X, WandSparkles, Search, Clock, ChevronRight, LogOut, EllipsisVertical, Edit2, Pin, PinOff, Trash2, Check, User, Mail, Lock } from 'lucide-react';
import SearchModal from '../SearchModal/SearchModal';
import ProfileModal from './ProfileModal';
import './Sidebar.css';

// ── Skeleton Loader ──────────────────────────────────────────────────────────

const SidebarSkeleton = () => (
  <div className="sidebar__skeleton">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="sidebar__skeleton-item">
        <div className="sidebar__skeleton-title" />
        <div className="sidebar__skeleton-meta" />
      </div>
    ))}
  </div>
);

// ── Helper: format relative time ─────────────────────────────────────────────

function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Sidebar Component ─────────────────────────────────────────────────────────

const Sidebar = ({ onNewRoadmap, userFullName = '', collapsed, setCollapsed, className = '', onCloseMobile, user, onUserUpdate, showToast }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModal, setProfileModal] = useState({ isOpen: false, tab: 'general' });
  const [recentRoadmaps, setRecentRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [touchTimer, setTouchTimer] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, roadmap: null });

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setProfileMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const startRenaming = (e, r) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setEditingId(r.id);
    setEditingName(r.career_goal);
  };

  const saveRename = async (e, r) => {
    e.stopPropagation();
    if (!editingName || editingName.trim() === '' || editingName === r.career_goal) {
      setEditingId(null);
      return;
    }

    const finalName = editingName.trim();
    setRecentRoadmaps(prev => prev.map(m => m.id === r.id ? { ...m, career_goal: finalName } : m));
    setEditingId(null);

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/roadmap/${r.id}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ new_name: finalName })
      });
    } catch (err) { console.error(err); }
  };

  const cancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  const handlePinToggle = async (e, r) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const newPinStatus = !r.is_pinned;

    setRecentRoadmaps(prev => {
      const updated = prev.map(m => m.id === r.id ? { ...m, is_pinned: newPinStatus } : m);
      return updated.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.last_accessed_at) - new Date(a.last_accessed_at);
      });
    });

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/roadmap/${r.id}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_pinned: newPinStatus })
      });
    } catch (err) { console.error(err); }
  };

  const openDeleteModal = (e, r) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setDeleteModal({ isOpen: true, roadmap: r });
  };

  const confirmDelete = async () => {
    const { roadmap } = deleteModal;
    setRecentRoadmaps(prev => prev.filter(m => m.id !== roadmap.id));
    setDeleteModal({ isOpen: false, roadmap: null });

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/roadmap/${roadmap.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) { console.error(err); }
  };

  const closeDeleteModal = () => setDeleteModal({ isOpen: false, roadmap: null });

  const handleTouchStart = (e, id) => {
    const timer = setTimeout(() => {
      setOpenMenuId(id);
    }, 500);
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) clearTimeout(touchTimer);
  };

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setRecentRoadmaps(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching roadmap history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggle = () => {
    setCollapsed(prev => !prev);
    setProfileOpen(false);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const initials = userFullName
    ? userFullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleNewRoadmap = useCallback(() => {
    if (onNewRoadmap) onNewRoadmap();
  }, [onNewRoadmap]);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${className}`.trim()}>
      {/* ── TOP SECTION ───────────────────────────────────────────────── */}
      <div className="sidebar__top">
        {/* Toggle button */}
        <button
          className="sidebar__toggle"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        {/* New Roadmap */}
        <button
          id="sidebar-new-roadmap"
          className="sidebar__btn sidebar__btn--primary"
          onClick={handleNewRoadmap}
          title="New Roadmap"
        >
          <span className="sidebar__btn-icon"><WandSparkles size={20} /></span>
          {!collapsed && <span className="sidebar__btn-label">New Roadmap</span>}
        </button>

        {/* Search */}
        <button
          id="sidebar-search"
          className="sidebar__btn sidebar__btn--ghost"
          title="Search roadmaps"
          onClick={() => setIsSearchOpen(true)}
        >
          <span className="sidebar__btn-icon"><Search size={20} /></span>
          {!collapsed && <span className="sidebar__btn-label">Search</span>}
        </button>
      </div>

      {/* Recent Weaves — only visible when expanded */}
      {!collapsed && (
        <div className="sidebar__recent">
          <p className="sidebar__section-label">All Roadmaps</p>
          {loading ? (
            <SidebarSkeleton />
          ) : recentRoadmaps.length > 0 ? (
            <ul className="sidebar__recent-list">
              {recentRoadmaps.map(r => {
                const isFeasible = r.is_feasible !== 0;
                const pct = isFeasible && r.total_weeks > 0
                  ? Math.round((r.completed_weeks / r.total_weeks) * 100)
                  : 0;

                return (
                  <li key={r.id} className="sidebar__recent-li" style={{ position: 'relative' }}>
                    <button
                      className={`sidebar__recent-item ${r.is_pinned ? 'is-pinned' : ''}`}
                      onClick={() => { if (openMenuId !== r.id) navigate(`/roadmap/${r.id}`); }}
                      onTouchStart={(e) => handleTouchStart(e, r.id)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                      title={'Accessed ' + timeAgo(r.last_accessed_at)}
                    >
                      <div className="sidebar__recent-content">
                        {editingId === r.id ? (
                          <input
                            type="text"
                            className="sidebar__inline-rename-input"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename(e, r);
                              if (e.key === 'Escape') cancelRename(e);
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="sidebar__recent-title" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {r.is_pinned ? <Pin size={12} className="sidebar__pin-icon" style={{ flexShrink: 0 }} /> : null}
                            {r.career_goal}
                          </span>
                        )}
                        <span className="sidebar__recent-meta">
                          {isFeasible ? (
                            `${r.total_weeks} Weeks • ${pct}% Done`
                          ) : (
                            'Not Feasible'
                          )}
                        </span>
                      </div>
                      {editingId === r.id ? (
                        <div className="sidebar__recent-actions" style={{ opacity: 1, gap: '0.25rem' }}>
                          <button className="sidebar__inline-action-btn" onClick={(e) => saveRename(e, r)} title="Save"><Check size={14} /></button>
                          <button className="sidebar__inline-action-btn sidebar__inline-action-btn--cancel" onClick={cancelRename} title="Cancel"><X size={14} /></button>
                        </div>
                      ) : (
                        <div
                          className="sidebar__recent-actions"
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === r.id ? null : r.id); }}
                        >
                          <EllipsisVertical size={16} />
                        </div>
                      )}
                    </button>
                    {openMenuId === r.id && (
                      <div className="sidebar__popover" onClick={e => e.stopPropagation()}>
                        <button className="sidebar__popover-btn" onClick={(e) => startRenaming(e, r)}>
                          <Edit2 size={14} /> Rename
                        </button>
                        <button className="sidebar__popover-btn" onClick={(e) => handlePinToggle(e, r)}>
                          {r.is_pinned ? <PinOff size={14} /> : <Pin size={14} />} {r.is_pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button className="sidebar__popover-btn delete-btn" onClick={(e) => openDeleteModal(e, r)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="sidebar__no-data">No roadmaps generated yet.</p>
          )}
        </div>
      )}

      {/* ── BOTTOM SECTION ────────────────────────────────────────────── */}
      <div className="sidebar__bottom">
        <div className="sidebar__profile-wrapper">
          <button
            id="sidebar-profile"
            className="sidebar__profile-btn"
            onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(prev => !prev); }}
            title="Profile"
          >
            <span className="sidebar__avatar">{initials}</span>
            {!collapsed && (
              <span className="sidebar__profile-info">
                <span className="sidebar__profile-name">{userFullName || 'My Profile'}</span>
                <span className="sidebar__profile-role">Career Weaver</span>
              </span>
            )}
          </button>

          {profileMenuOpen && createPortal(
            <div className="sidebar__popover" style={{ position: 'fixed', top: 'auto', bottom: '4.5rem', left: '1.25rem', right: 'auto', zIndex: 1000, width: '14rem' }} onClick={e => e.stopPropagation()}>
              <button className="sidebar__popover-btn" onClick={() => { setProfileModal({ isOpen: true, tab: 'general' }); setProfileMenuOpen(false); }}>
                <User size={14} /> Profile & Email change
              </button>
              <button className="sidebar__popover-btn" onClick={() => { setProfileModal({ isOpen: true, tab: 'security' }); setProfileMenuOpen(false); }}>
                <Lock size={14} /> Change password
              </button>
              <button className="sidebar__popover-btn" onClick={logout}>
                <LogOut size={14} /> Logout
              </button>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />
              <button className="sidebar__popover-btn delete-btn" onClick={() => { setProfileModal({ isOpen: true, tab: 'danger' }); setProfileMenuOpen(false); }}>
                <Trash2 size={14} /> Delete user
              </button>
            </div>,
            document.body
          )}
        </div>
      </div>
      
      <ProfileModal 
        isOpen={profileModal.isOpen}
        initialTab={profileModal.tab}
        onClose={() => setProfileModal({ isOpen: false, tab: 'general' })}
        user={user}
        onUserUpdate={onUserUpdate}
        onLogout={logout}
        showToast={showToast}
        roadmaps={recentRoadmaps}
      />
      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {deleteModal.isOpen && createPortal(
        <div className="sidebar__modal-overlay" onClick={closeDeleteModal}>
          <div className="sidebar__modal" onClick={e => e.stopPropagation()}>
            <h3 className="sidebar__modal-title">Delete roadmap?</h3>
            <p className="sidebar__modal-desc">
              This will delete milestones and feedback from your Career Weave activity, plus any content that you created.
            </p>
            <div className="sidebar__modal-actions">
              <button className="sidebar__modal-btn sidebar__modal-btn--cancel" onClick={closeDeleteModal}>Cancel</button>
              <button className="sidebar__modal-btn sidebar__modal-btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onNewRoadmap={onNewRoadmap} 
      />
    </aside>
  );
};

export default Sidebar;
