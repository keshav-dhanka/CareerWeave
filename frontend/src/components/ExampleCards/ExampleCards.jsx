import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';
import './ExampleCards.css';

import { ExampleCard, SkeletonCard } from '../../pages/ExampleRoadmaps/ExampleRoadmaps';

const ExampleCards = ({ loading: externalLoading }) => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/examples`);
        if (res.ok) {
          const data = await res.json();

          const targetRoles = [
            "Frontend Engineer",
            "UI/UX Designer",
            "Data Analyst",
            "Product Manager",
            "Automotive Tech",
            "Technical Writer"
          ];

          const filtered = data.filter(ex => targetRoles.includes(ex.career_goal));
          filtered.sort((a, b) => targetRoles.indexOf(a.career_goal) - targetRoles.indexOf(b.career_goal));

          setExamples(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch examples:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamples();
  }, []);

  const isLoading = loading || externalLoading;

  return (
    <div className="bp-container">
      <div className="bp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="bp-section-title">Example Roadmaps</h2>
        <button className="bp-view-all" onClick={() => navigate('/examples')}>
          View All
        </button>
      </div>
      {isLoading ? (
        <div className="examples-grid-dashboard">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} className="ec-skeleton-dashboard" />)}
        </div>
      ) : (
        <div className="examples-grid-dashboard">
          {examples.map(ex => (
            <ExampleCard key={ex.id} roadmap={ex} className="example-card-glass-dashboard" />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExampleCards;
