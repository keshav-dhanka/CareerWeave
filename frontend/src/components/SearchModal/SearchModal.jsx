import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, WandSparkles, Clock, Route } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose, onNewRoadmap }) => {
  const [query, setQuery] = useState('');
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all roadmaps for client-side filtering
  useEffect(() => {
    if (!isOpen) return;

    const fetchAllRoadmaps = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRoadmaps(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching roadmaps for search:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRoadmaps();

    // Focus input on open
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);

    // Reset query when opening
    setQuery('');
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNewRoadmapClick = () => {
    onClose();
    if (onNewRoadmap) onNewRoadmap();
  };

  const handleRoadmapClick = (id) => {
    onClose();
    navigate(`/roadmap/${id}`);
  };

  // Client-side filtering logic
  const normalizedQuery = query.toLowerCase().trim();
  const filteredRoadmaps = roadmaps.filter(r => {
    if (!normalizedQuery) return true; // if no query, just return all (or top recents)

    const goalMatch = (r.career_goal || '').toLowerCase().includes(normalizedQuery);
    const domainMatch = (r.domain || '').toLowerCase().includes(normalizedQuery);
    const targetMatch = (r.target_name || '').toLowerCase().includes(normalizedQuery);
    const summaryMatch = (r.skill_gap_summary || '').toLowerCase().includes(normalizedQuery);

    return goalMatch || domainMatch || targetMatch || summaryMatch;
  });

  // If no query, show only top 5 recents
  const displayRoadmaps = normalizedQuery
    ? filteredRoadmaps
    : filteredRoadmaps.slice(0, 5);

  return createPortal(
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-container" onClick={e => e.stopPropagation()}>

        {/* Search Header */}
        <div className="search-modal-header">
          <Search size={20} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search your roadmaps..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="search-modal-close" onClick={onClose} aria-label="Close search">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="search-modal-body">

          {/* New Roadmap Button */}
          <button className="search-modal-new-btn" onClick={handleNewRoadmapClick}>
            <div className="search-modal-new-icon">
              <WandSparkles size={18} />
            </div>
            <span>Create a new roadmap</span>
          </button>

          {/* Results List */}
          <div>
            <h4 className="search-modal-section-title">
              {normalizedQuery ? 'Search Results' : 'Recent Roadmaps'}
            </h4>

            {loading && !roadmaps.length ? (
              <div className="search-modal-loading">Loading...</div>
            ) : displayRoadmaps.length > 0 ? (
              <div className="search-modal-list">
                {displayRoadmaps.map(r => (
                  <button
                    key={r.id}
                    className="search-modal-item"
                    onClick={() => handleRoadmapClick(r.id)}
                  >
                    <div className="search-modal-item-icon">
                      {normalizedQuery ? <Route size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="search-modal-item-content">
                      <div className="search-modal-item-title">{r.career_goal}</div>
                      <div className="search-modal-item-meta">
                        {r.domain || 'Tech'} • {r.target_degree || 'Skill building'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="search-modal-empty">
                No roadmaps found for "{query}"
              </div>
            )}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchModal;
