import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, RouteOff } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './RecentWeaves.css';

// ── Relative time formatter ──────────────────────────────────────────────────

function timeAgo(isoString) {
  if (!isoString) return 'Never';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Single Weave Card ────────────────────────────────────────────────────────

const WeaveCard = ({ roadmap }) => {
  const navigate = useNavigate();
  const isFeasible = roadmap.is_feasible !== 0;

  const pct = isFeasible && roadmap.total_weeks > 0
    ? (roadmap.completed_weeks / roadmap.total_weeks) * 100
    : 0;

  const handleCardClick = () => {
    navigate(`/roadmap/${roadmap.id}`);
  };

  // Helper to get skill level class
  const getSkillClass = (level) => {
    const l = (level || '').toLowerCase();
    if (l.includes('beginner')) return 'rw-badge-skill--beginner';
    if (l.includes('intermediate')) return 'rw-badge-skill--intermediate';
    if (l.includes('advanced')) return 'rw-badge-skill--advanced';
    return '';
  };

  return (
    <div
      className={`rw-card-wrapper ${!isFeasible ? 'is-unfeasible' : ''}`}
      onClick={handleCardClick}
    >
      <div className="rw-card-inner">
        {/* Front Side */}
        <div className="rw-card-front">
          <div className="rw-card__progress">
            {isFeasible ? (
              <CircularProgressbar
                value={pct}
                text={`${Math.round(pct)}%`}
                strokeWidth={8}
                styles={buildStyles({
                  pathColor: 'var(--accent-color)',
                  textColor: 'var(--text-primary)',
                  trailColor: 'rgba(255, 255, 255, 0.07)',
                  pathTransitionDuration: 0.8,
                  textSize: '1.5rem',
                })}
              />
            ) : (
              <div className="rw-card__unfeasible-icon">
                <RouteOff size={44} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="rw-card__body">
            <p className="rw-card__title">{roadmap.career_goal}</p>
            <p className="rw-card__meta-details">
              {isFeasible ? (
                `${roadmap.completed_weeks} / ${roadmap.total_weeks} Weeks Completed`
              ) : (
                <span className="unfeasible-text">Not Feasible</span>
              )}
            </p>
            <p className="rw-card__meta">
              <svg className="rw-card__clock" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {timeAgo(roadmap.last_accessed_at)}
            </p>
          </div>
        </div>

        {/* Back Side */}
        <div className="rw-card-back">
          <div className="rw-card-back__content">
            {isFeasible ? (
              <>
                <div className="rw-card-back__section">
                  <h4 className="rw-card-back__label">Skill Gap Summary</h4>
                  <p className="rw-card-back__text">
                    {roadmap.skill_gap_summary}
                  </p>
                </div>
                <div className="rw-card-back__section">
                  <div className="rw-card-back__subtext">
                    <span className={`rw-badge-skill ${getSkillClass(roadmap.current_skill_level)}`}>
                      <BarChart2 size={12} />
                      {roadmap.current_skill_level}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="rw-card-back__section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h4 className="rw-card-back__label">Mentor's Reality Check</h4>
                <p className="rw-card-back__text reasoning-text">
                  {roadmap.feasibility_reasoning}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main RecentWeaves Section ────────────────────────────────────────────────

const RecentWeaves = ({ roadmaps = [], loading, onViewAll }) => {
  const scrollRef = useRef(null);

  const hasRoadmaps = roadmaps.length > 0;
  const displayedRoadmaps = roadmaps.slice(0, 5); // Limit to 5 cards as requested

  if (loading) {
    return (
      <div className="rw-container">
        <div className="rw-header">
          <h2 className="rw-title">Recent Weaves</h2>
        </div>
        <div className="rw-grid-skeleton">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rw-skeleton-card">
              <div className="rw-skeleton-circle" />
              <div className="rw-skeleton-title" />
              <div className="rw-skeleton-meta" />
              <div className="rw-skeleton-footer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no roadmaps, skip this section entirely
  if (!hasRoadmaps) {
    return null;
  }

  return (
    <div className="rw-container">
      <div className="rw-header">
        <h2 className="rw-title">Recent Weaves</h2>
        <button className="rw-view-all" onClick={onViewAll}>
          View All
        </button>
      </div>

      {/* Grid layout */}
      <div className="rw-grid" ref={scrollRef}>
        {displayedRoadmaps.map(r => <WeaveCard key={r.id} roadmap={r} />)}
      </div>
    </div>
  );
};

export default RecentWeaves;
