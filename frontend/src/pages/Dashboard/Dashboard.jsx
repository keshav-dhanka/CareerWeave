import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardPrompt from '../../components/DashboardPrompt/DashboardPrompt';
import RecentWeaves from '../../components/RecentWeaves/RecentWeaves';
import ExampleCards from '../../components/ExampleCards/ExampleCards';
import { API_BASE_URL } from '../../apiConfig';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const Dashboard = ({ showToast, triggerConfetti }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentRoadmaps, setRecentRoadmaps] = useState([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Ref to expose the prompt textarea's focus() method
  const promptFocusRef = useRef(null);
  // Ref to prevent double-toast in StrictMode
  const hasShownToast = useRef(false);

  const { logout } = useAuth();

  // ── Handle system messages from navigation state (like cleanup or route errors) ──
  useEffect(() => {
    if (location.state?.cleanupMessage && !hasShownToast.current) {
      showToast(location.state.cleanupMessage, 'info');
      hasShownToast.current = true;
      // Clear state so it doesn't show again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.toastMessage && !hasShownToast.current) {
      showToast(location.state.toastMessage, location.state.toastType || 'info');
      hasShownToast.current = true;
      // Clear state so it doesn't show again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, showToast]);

  // ── Fetch authenticated user profile ────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 401) {
          logout();
          throw new Error('Unauthorized');
        }
        return r.ok ? r.json() : null;
      })
      .then(data => { if (data) setUser(data); })
      .catch(() => { });
  }, [logout]);

  // ── Fetch recent roadmaps for sidebar ───────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingRoadmaps(false);
      return;
    }

    setLoadingRoadmaps(true);
    fetch(`${API_BASE_URL}/history/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 401) {
          logout();
          throw new Error('Unauthorized');
        }
        return r.ok ? r.json() : [];
      })
      .then(data => setRecentRoadmaps(Array.isArray(data) ? data : []))
      .catch(() => { })
      .finally(() => setLoadingRoadmaps(false));
  }, [logout]);

  // ── Focus prompt on "New Roadmap" click ────────────────────
  const handleNewRoadmap = () => {
    if (promptFocusRef.current) {
      promptFocusRef.current();
    }
    // Close mobile sidebar after navigation
    setMobileSidebarOpen(false);
  };

  // ── Inject example prompt from Blueprint cards ──────────────
  const handlePromptInject = (text) => {
    // Set value in localStorage (DashboardPrompt reads from there on mount)
    localStorage.setItem('cw_prompt_draft', text);
    // Focus the textarea and scroll to it
    if (promptFocusRef.current) promptFocusRef.current();
    // Dispatch a storage event so DashboardPrompt can pick up the new value
    window.dispatchEvent(new StorageEvent('storage', { key: 'cw_prompt_draft', newValue: text }));
  };

  // ── Swipe to open/close mobile sidebar ───────────────────────
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Open if swiped from left edge (touchStart < 50) towards right
    if (isRightSwipe && touchStart < 50) {
      setMobileSidebarOpen(true);
      setIsSidebarCollapsed(false);
    }
    // Close if swiped left anywhere while open
    if (isLeftSwipe && mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  const userFirstName = user?.full_name?.split(' ')[0] || '';

  return (
    <div 
      className="dashboard"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="dashboard__backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile top bar */}
      <div className="dashboard__mobile-bar">
        <button
          className="dashboard__mobile-menu"
          onClick={() => {
            setMobileSidebarOpen(true);
            setIsSidebarCollapsed(false);
          }}
          aria-label="Open navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="dashboard__mobile-logo">CareerWeave</span>
      </div>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <Sidebar
        onNewRoadmap={handleNewRoadmap}
        userFullName={user?.full_name || ''}
        user={user}
        onUserUpdate={setUser}
        collapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
        className={mobileSidebarOpen ? 'sidebar--mobile-open' : ''}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        showToast={showToast}
      />

      {/* ── Main content area ─────────────────────────────────── */}
      <main className="dashboard__main" id="dashboard-main">
        {/* Background glow effect */}
        <div className="dashboard__glow" aria-hidden="true" />

        <div className="dashboard__content">
          {/* Prompt bar + greeting */}
          <div className="dashboard__prompt-wrap">
            <DashboardPrompt
              userFirstName={userFirstName}
              focusRef={promptFocusRef}
              loading={loadingRoadmaps}
              showToast={showToast}
              triggerConfetti={triggerConfetti}
            />
          </div>

          {/* Recent Weaves */}
          <div className="dashboard__weaves-wrap">
            <RecentWeaves
              roadmaps={recentRoadmaps}
              loading={loadingRoadmaps}
              onViewAll={() => {
                setIsSidebarCollapsed(false);
                setMobileSidebarOpen(true);
              }}
            />
          </div>

          {/* Blueprint cards - Now the primary 'next section' */}
          <div className="dashboard__blueprints-wrap">
            <ExampleCards
              onPromptInject={handlePromptInject}
              loading={loadingRoadmaps}
            />
          </div>

          <div className="dashboard__version">v0.1.0</div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
