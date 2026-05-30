import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Search } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';
import Navbar from '../../components/Navbar';
import './ExampleRoadmaps.css';

export const DOMAINS = [
  { name: 'All', color: '--accent-color' },
  { name: 'Tech', color: '--accent-cyan' },
  { name: 'Creative', color: '--accent-orange' },
  { name: 'Business', color: '--accent-green' },
  { name: 'Lifestyle', color: '--accent-color' },
  { name: 'Public Services', color: '--accent-cyan' },
  { name: 'Skilled Labor', color: '--accent-orange' }
];

export const getDomainColor = (domainName) => {
  const found = DOMAINS.find(d => d.name === domainName);
  return found ? found.color : '--accent-color';
};

export const ExampleCard = ({ roadmap, className }) => {
  const navigate = useNavigate();
  const domainColor = getDomainColor(roadmap.domain);
  
  const cardClass = className ? `example-card-glass ${className}` : "example-card-glass glass-panel";

  return (
    <div className={cardClass}>
      <div className="ec-meta-row">
        <span className="ec-domain-pill" style={{ '--pill-color': `var(${domainColor})` }}>
          {roadmap.domain || "Tech"}
        </span>
        <span className="ec-duration">
          {roadmap.total_weeks ? `${roadmap.total_weeks} Weeks` : '12 Weeks'}
        </span>
      </div>

      <div className="ec-title-row">
        <h3 className="ec-target-heading">{roadmap.career_goal}</h3>
        <div className={`ec-level-badge ec-diff--${(roadmap.current_skill_level || "beginner").toLowerCase()}`}>
          <BarChart2 size={12} />
          <span>{roadmap.current_skill_level || "Beginner"}</span>
        </div>
      </div>

      <p className="ec-context-indicator">
        {roadmap.target_name} • {roadmap.target_degree}
      </p>

      <div className="ec-gap-summary">
        <strong>Gap:</strong> {roadmap.skill_gap_summary}
      </div>

      <button className="btn-master-cta" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => navigate(`/examples/roadmap/${roadmap.id}`)}>
        Preview Example Roadmap
      </button>
    </div>
  );
};

export const SkeletonCard = ({ className }) => {
  const cardClass = className ? `ec-skeleton ${className}` : "ec-skeleton glass-panel";

  return (
    <div className={cardClass}>
    <div className="ec-skeleton__row">
      <div className="ec-skeleton__line pill" />
      <div className="ec-skeleton__line duration" />
    </div>
    <div className="ec-skeleton__line title" />
    <div className="ec-skeleton__line badge" />
    <div className="ec-skeleton__line text" />
    <div className="ec-skeleton__line box" />
    </div>
  );
};

const ExampleRoadmaps = ({ openLogin, openSignup, userProfile, isAuthenticated }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState("All");

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/examples`);
        if (res.ok) {
          const data = await res.json();
          setRoadmaps(data);
        }
      } catch (err) {
        console.error("Failed to fetch examples:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamples();
  }, []);

  const filteredRoadmaps = roadmaps.filter((roadmap) => {
    const matchesSearch =
      (roadmap.career_goal || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (roadmap.target_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (roadmap.skill_gap_summary || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain = activeDomain === "All" || roadmap.domain === activeDomain;

    return matchesSearch && matchesDomain;
  });

  // Group by domain
  const groupedRoadmaps = filteredRoadmaps.reduce((acc, curr) => {
    const d = curr.domain || 'Tech';
    if (!acc[d]) acc[d] = [];
    acc[d].push(curr);
    return acc;
  }, {});

  const availableDomains = activeDomain === "All"
    ? Object.keys(groupedRoadmaps).sort()
    : [activeDomain];

  return (
    <div className="examples-page">
      <div className="examples-bg-gradient"></div>
      <Navbar
        openLogin={openLogin}
        openSignup={openSignup}
        user={userProfile}
        isAuthenticated={isAuthenticated}
      />

      <div className="examples-hero">
        <div className="glow-bg" />
        <h1 className="examples-title">Curated Learning Pathways</h1>
        <p className="examples-subtitle">Explore Example roadmaps designed for your career journey.</p>

        {/* Floating Glass Search Bar */}
        <div className="examples-search-glass">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search roles, skills, or paths..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="examples-content">
        {/* Interactive Filter Header Bar */}
        <div className="filter-pill-bar">
          {DOMAINS.map(d => (
            <button
              key={d.name}
              className={`filter-pill ${activeDomain === d.name ? 'active' : ''}`}
              onClick={() => setActiveDomain(d.name)}
              style={{ '--active-color': `var(${d.color})` }}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Section Container & Grid */}
        <div className="domain-sections-wrapper">
          {loading ? (
            <div className="examples-grid" style={{ marginTop: '2rem' }}>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : availableDomains.length === 0 ? (
            <div className="examples-empty">No roadmaps found for your search.</div>
          ) : (
            availableDomains.map(domain => {
              const tracks = groupedRoadmaps[domain];
              if (!tracks || tracks.length === 0) return null;

              const domainColor = getDomainColor(domain);

              return (
                <div key={domain} className="domain-section">
                  <div className="domain-header">
                    <h2>{domain}</h2>
                  </div>

                  <div className="examples-grid">
                    {tracks.map(roadmap => (
                      <ExampleCard key={roadmap.id} roadmap={roadmap} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ExampleRoadmaps;
