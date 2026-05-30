import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { X, ChevronLeft, Clock, Lock, CheckCircle2, Video, FileText, NotebookPen, Headphones, Hammer, BookOpen, PartyPopper, ExternalLink, BarChart2, Search, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '../../apiConfig';
import { useAuth } from '../../hooks/useAuth';
import VerticalTimeline from './VerticalTimeline';
import './RoadmapView.css';

const getExamplePrompt = (id, userName, roadmap) => {
  const nameToUse = userName || "{Your Name}";
  const prompts = {
    1: `My name is ${nameToUse}. I hold a B.Tech degree and have a reliable foundational technical stack consisting of basic HTML, CSS, and elementary JavaScript logic. My explicit career goal is to become a professional Frontend Engineer specializing in modern production frameworks. Please architect a realistic learning timeline.`,
    2: `My name is ${nameToUse}. I hold a Bachelor of Commerce degree and have a technical stack including advanced Excel, data sorting, and basic formulas. My explicit career goal is to become an industry-standard Data Analyst. Please architect a realistic learning timeline focusing on Python and SQL.`,
    3: `My name is ${nameToUse}. I am an experienced Graphic Designer with a strong technical stack in Adobe Photoshop, vector design, and typography principles. My explicit career goal is to transition into a UI/UX Designer role for digital products using modern layout tools. Please architect a realistic learning timeline.`,
    4: `My name is ${nameToUse}. I am a self-taught amateur photographer with hands-on skills in basic camera settings and lighting fundamentals. My explicit career goal is to establish a professional studio workflow as a Commercial Photographer. Please architect a realistic learning timeline.`,
    5: `My name is ${nameToUse}. I am a traditional marketing representative with a professional background in consumer relations and offline advertising strategies. My explicit career goal is to become a specialized Digital Marketing Strategist. Please architect a realistic learning timeline.`,
    6: `My name is ${nameToUse}. I am a software engineering professional with a solid technical stack in software development lifecycles and team collaboration. My explicit career goal is to pivot to a Product Management Associate role. Please architect a realistic learning timeline.`,
    7: `My name is ${nameToUse}. I hold a degree in Kinesiology and possess practical skills in workout plan design and basic client physical training. My explicit career goal is to scale my practice to become a certified Fitness Coach and Nutrition Consultant. Please architect a realistic learning timeline.`,
    8: `My name is ${nameToUse}. I am an experienced line cook with a deep foundational knowledge of food preparation and commercial kitchen equipment. My explicit career goal is to step up into a Culinary Arts and Catering Lead role. Please architect a realistic learning timeline.`,
    9: `My name is ${nameToUse}. I hold a Bachelor of Laws (LLB) degree and possess a foundational understanding of contract law and regulatory frameworks. My explicit career goal is to become a specialized Corporate Legal Advisor for technology startups. Please architect a realistic learning timeline.`,
    10: `My name is ${nameToUse}. I am a secondary school teacher with a strong background in lesson planning, pedagogy, and student assessment frameworks. My explicit career goal is to transition into an industry-standard Instructional Designer for corporate e-learning. Please architect a realistic learning timeline.`,
    11: `My name is ${nameToUse}. I am a registered electrical apprentice with hands-on experience in basic residential wiring and safety tools. My explicit career goal is to pass my certification and work as a professional Residential Electrician Tech. Please architect a realistic learning timeline.`,
    12: `My name is ${nameToUse}. I am a junior mechanic with practical skills in basic engine maintenance and tool handling. My explicit career goal is to master modern electronic vehicle systems as an Automotive Service Technician. Please architect a realistic learning timeline.`,
    13: `My name is ${nameToUse}. I hold a Bachelor of Arts in English and have basic familiarity with software terms and document structures. My explicit career goal is to work as an industry-level Technical Writer for software companies. Please architect a realistic learning timeline.`,
    14: `My name is ${nameToUse}. I am a project coordinator with practical experience in tracking tasks and managing team schedules. My explicit career goal is to secure professional certification and work as an Agile Scrum Master. Please architect a realistic learning timeline.`
  };

  return prompts[id] || `I am a ${roadmap?.current_skill_level || 'Beginner'} looking to become a ${roadmap?.career_goal}. I want to study for ${roadmap?.total_weeks || 12} weeks. Can you generate this roadmap for me?`;
};


const getResourceIcon = (type) => {
  const t = type.toLowerCase();
  if (t.includes('video')) return <Video size={18} />;
  if (t.includes('article') || t.includes('link') || t.includes('reading') || t.includes('documentation')) return <FileText size={18} />;
  if (t.includes('lab') || t.includes('interactive')) return <NotebookPen size={18} />;
  if (t.includes('audio') || t.includes('podcast')) return <Headphones size={18} />;
  if (t.includes('doing') || t.includes('project') || t.includes('practice')) return <Hammer size={18} />;
  return <BookOpen size={18} />;
};

const RoadmapCard = ({ data, isConnectable }) => {
  const { week, onOpenDrawer, onToggleMilestone, onShowToast, isFirst, isLast, isExampleView, isPreviewView, onOpenAuth, fogLevel } = data;

  const isCompleted = (isExampleView || isPreviewView) ? false : !!week.is_completed;
  const isLocked = (isExampleView || isPreviewView) ? false : (!!week.is_locked && !isCompleted);
  const isActive = (isExampleView || isPreviewView) ? true : (!isLocked && !isCompleted);

  const blurValue = ((isExampleView || isPreviewView) && fogLevel > 0) ? `${fogLevel * 1.5}px` : '0px';
  const opacityValue = ((isExampleView || isPreviewView) && fogLevel > 0) ? Math.max(1 - (fogLevel * 0.15), 0.15) : 1;

  let statusClass = '';
  let label = '';
  if (isExampleView || isPreviewView) {
    statusClass = 'status-example';
    label = '';
  } else if (isCompleted) {
    statusClass = 'status-completed';
    label = 'Completed';
  } else if (isLocked) {
    statusClass = 'status-locked';
    label = 'Locked';
  } else {
    statusClass = 'status-active';
    label = 'In Progress';
  }

  const handleCardClick = (e) => {
    e.stopPropagation();
    if ((isExampleView || isPreviewView) && fogLevel > 0) {
      if (isPreviewView && onOpenAuth) {
        onShowToast(`This milestone is locked in the preview. Sign up to unlock full roadmap!`, 'warning');
        onOpenAuth();
      } else {
        onShowToast(`This milestone is locked in the preview. Sign up to unlock full roadmap!`, 'warning');
      }
      return;
    }
    if (isLocked) {
      onShowToast(`Complete Week ${week.week_number - 1} to unlock this milestone.`, 'warning');
    } else {
      onOpenDrawer(week);
    }
  };

  const taskText = (week.task && typeof week.task === 'string') ? week.task : '';
  const displayTask = taskText.split(' ').slice(0, 15).join(' ') + '...';

  return (
    <div
      className={`rc-node glass-panel ${statusClass} ${(isExampleView || isPreviewView) && fogLevel > 0 ? 'fog-node' : ''}`}
      onClick={handleCardClick}
      style={{
        cursor: (isLocked || ((isExampleView || isPreviewView) && fogLevel > 0)) ? 'not-allowed' : 'pointer',
        filter: blurValue !== '0px' ? `blur(${blurValue})` : 'none',
        opacity: opacityValue,
        pointerEvents: opacityValue < 0.3 ? 'none' : 'auto'
      }}
    >
      {!isFirst && (
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      )}

      {isActive && !(isExampleView || isPreviewView) && <div className="pulse-dot" />}

      {(isExampleView || isPreviewView) ? (
        <>
          <div className="rc-header">
            <div className="rc-meta">
              <span className="rc-week" style={{ color: '#fff' }}>Week {week.week_number}</span>
              {week.estimated_hours && (
                <span className="rc-badge rc-time" style={{ marginLeft: 'auto' }}>
                  <Clock size={12} />
                  {week.estimated_hours}h
                </span>
              )}
            </div>
            <h3 className="rc-topic" style={{ marginTop: '0.5rem' }}>{week.topic}</h3>
            {week.difficulty && typeof week.difficulty === 'string' && (
              <span className={`rc-badge rc-diff rc-diff--${week.difficulty.toLowerCase()}`}>
                <BarChart2 size={12} />
                {week.difficulty}
              </span>
            )}
          </div>
          <div className="rc-body">
            <p className="rc-objective"><strong>Goal:</strong> {week.key_objective}</p>
            <div className="rc-details">
              <p className="rc-locked-task"><strong>Task:</strong> {displayTask}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="rc-header">
            <div className="rc-meta">
              <span className="rc-week" style={{ color: '#fff' }}>Week {week.week_number}</span>
              <span className="roadmap-node-status">{label}</span>
            </div>
            <h3 className="rc-topic">{week.topic}</h3>
            <div className="rc-badges">
              {week.difficulty && typeof week.difficulty === 'string' && (
                <span className={`rc-badge rc-diff rc-diff--${week.difficulty.toLowerCase()}`}>
                  <BarChart2 size={12} />
                  {week.difficulty}
                </span>
              )}
              {week.estimated_hours && (
                <span className="rc-badge rc-time">
                  <Clock size={12} />
                  {week.estimated_hours}h
                </span>
              )}
            </div>
          </div>
          <div className="rc-body">
            <p className="rc-objective"><strong>Goal:</strong> {week.key_objective}</p>
            <div className="rc-details">
              <p className="rc-locked-task"><strong>Task:</strong> {isLocked ? taskText : displayTask}</p>
            </div>
          </div>
        </>
      )}

      {isActive && !(isExampleView || isPreviewView) && (
        <div className="rc-footer">
          <button
            className="rc-btn rc-btn--active"
            onClick={(e) => { e.stopPropagation(); onToggleMilestone(week.id, isCompleted); }}
          >
            Mark as Complete
          </button>
        </div>
      )}
      {!isLast && (
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      )}
    </div>
  );
};

const nodeTypes = {
  roadmapCard: RoadmapCard
};

const RoadmapView = ({ triggerConfetti, isExampleView, isPreviewView, openAuth, showToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, isAuthenticated, token } = useAuth();

  // User name state for Example Prompt injection
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetch(`${API_BASE_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.full_name) {
            const firstName = data.full_name.split(' ')[0];
            setUserName(firstName);
          }
        })
        .catch(() => { });
    }
  }, [isAuthenticated, token]);

  // Data state
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState(null);

  // Drawer state
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Orientation state
  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.matchMedia('(max-width: 48rem)').matches);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleOpenDrawer = useCallback((week) => {
    setSelectedMilestone(week);
    setIsDrawerOpen(true);
  }, []);

  const handleShowToast = useCallback((msg, type = 'info') => {
    if (showToast) showToast(msg, type);

    if (type === 'success' && triggerConfetti) {
      triggerConfetti();
    }
  }, [triggerConfetti, showToast]);

  // Robust Resource URL handling, sanitization & verification
  const handleOpenResource = useCallback((res) => {
    if (!res || !res.url_or_query) return;

    let url = res.url_or_query.trim();

    // Clean markdown style link format if generated, e.g. [React Docs](https://reactjs.org) -> https://reactjs.org
    const markdownUrlMatch = url.match(/\[.*?\]\((https?:\/\/.*?)\)/);
    if (markdownUrlMatch && markdownUrlMatch[1]) {
      url = markdownUrlMatch[1];
    }

    // Clean up any enclosing quotes or brackets
    url = url.replace(/^['"<([]+|['">)\]]+$/g, '');

    // Check if it's a valid/likely URL structure
    const isLikelyUrl = /^(https?:\/\/)?([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(url);

    if (isLikelyUrl) {
      // Add https:// if it starts with www. or doesn't have a protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Check if it's a known placeholder or broken URL format
      const isPlaceholder = /example\.com|placeholder|TODO|broken/i.test(url);
      if (isPlaceholder) {
        const searchQuery = `https://www.google.com/search?q=${encodeURIComponent(res.title)}`;
        window.open(searchQuery, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } else {
      // Not a valid URL structure, search Google
      const searchQuery = `https://www.google.com/search?q=${encodeURIComponent(url || res.title)}`;
      window.open(searchQuery, '_blank');
    }
  }, []);

  const handleSearchResource = useCallback((res, e) => {
    if (e) e.stopPropagation();
    const query = res.title || res.url_or_query || 'React documentation';
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  }, []);

  const [copiedResIndex, setCopiedResIndex] = useState(null);

  const handleCopyResource = useCallback((res, index, e) => {
    if (e) e.stopPropagation();
    if (!res) return;
    const textToCopy = `Title: ${res.title || ''}\nLink/Query: ${res.url_or_query || ''}`;
    navigator.clipboard.writeText(textToCopy);

    setCopiedResIndex(index);
    setTimeout(() => {
      setCopiedResIndex(null);
    }, 2000);
  }, []);

  // Header state (Minimized on interaction)
  const [isMinimized, setIsMinimized] = useState(false);
  const headerTimerRef = useRef(null);
  const containerRef = useRef(null);

  // Mouse tracking for background glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleHeaderInteraction = useCallback(() => {
    setIsMinimized(true);
    if (headerTimerRef.current) clearTimeout(headerTimerRef.current);

    // Return to full size after 10s of inactivity
    headerTimerRef.current = setTimeout(() => {
      setIsMinimized(false);
    }, 10000);
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (headerTimerRef.current) clearTimeout(headerTimerRef.current);
    };
  }, []);

  // Fetch roadmap data
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        if (isPreviewView) {
          const stored = localStorage.getItem('preview_roadmap');
          if (stored) {
             setRoadmap(JSON.parse(stored));
          } else {
             throw new Error('Preview roadmap not found.');
          }
          setLoading(false);
          return;
        }

        const url = isExampleView ? `${API_BASE_URL}/examples/roadmap/${id}` : `${API_BASE_URL}/roadmap/${id}`;

        let headers = {};
        if (!isExampleView) {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token found');
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });

        if (!res.ok) {
          if (res.status === 401) {
            logout();
            return;
          }
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to load roadmap.');
        }

        const data = await res.json();
        setRoadmap(data);
      } catch (err) {
        navigate('/dashboard', {
          replace: true,
          state: {
            toastMessage: err.message || 'Roadmap not found or access denied.',
            toastType: 'route-error'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [id, navigate]);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, milestoneId: null, currentStatus: false });

  // Handle opening the confirm modal
  const requestToggleMilestone = useCallback((milestoneId, currentStatus) => {
    setConfirmModal({ isOpen: true, milestoneId, currentStatus });
  }, []);

  // Handle actual toggle after confirmation
  const confirmToggleMilestone = useCallback(async () => {
    const { milestoneId, currentStatus } = confirmModal;
    setConfirmModal({ isOpen: false, milestoneId: null, currentStatus: false });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/milestone/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_completed: !currentStatus })
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        // We re-fetch to get correct backend locked/unlocked states
        const refreshedRes = await fetch(`${API_BASE_URL}/roadmap/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const refreshedData = await refreshedRes.json();
        setRoadmap(refreshedData);
        // Show success toast
        handleShowToast("Milestone successfully marked as complete!", 'success');
        // Trigger header interaction
        handleHeaderInteraction();
      }
    } catch (err) {
      console.error('Failed to toggle milestone', err);
    }
  }, [confirmModal, id, handleHeaderInteraction, handleShowToast]);

  // Sync ReactFlow nodes/edges when roadmap changes
  useEffect(() => {
    if (!roadmap || !roadmap.curriculum) return;

    const newNodes = roadmap.curriculum.map((week, index) => {
      let fogLevel = 0;
      let extraSpacing = 0;
      if (isExampleView || isPreviewView) {
        fogLevel = index >= 5 ? (index - 4) : 0;
        extraSpacing = fogLevel > 0 ? fogLevel * 100 : 0;
      }

      const weekId = week.id ? week.id.toString() : `w-${week.week_number || index}`;
      
      return {
        id: weekId,
        type: 'roadmapCard',
        position: { x: index * 420 + extraSpacing + 50, y: index % 2 === 0 ? 200 : 350 }, // Zigzag
        data: {
          week,
          onOpenDrawer: handleOpenDrawer,
          onToggleMilestone: requestToggleMilestone,
          onShowToast: handleShowToast,
          isFirst: index === 0,
          isLast: index === roadmap.curriculum.length - 1,
          isExampleView,
          isPreviewView,
          onOpenAuth: openAuth,
          fogLevel
        }
      };
    });

    const newEdges = roadmap.curriculum.map((week, index) => {
      if (index === roadmap.curriculum.length - 1) return null;
      const nextWeek = roadmap.curriculum[index + 1];

      const isSourceCompleted = !!week.is_completed;
      const isSourceLocked = !!week.is_locked && !isSourceCompleted;
      const isSourceActive = !isSourceLocked && !isSourceCompleted;

      let edgeClass = 'edge-path-grey';
      if (isSourceCompleted) {
        edgeClass = 'edge-path-green'; // Continues shine animation
      } else if (isSourceActive) {
        edgeClass = 'edge-path-orange-solid'; // Solid orange, low opacity, no animation
      }

      const weekId = week.id ? week.id.toString() : `w-${week.week_number || index}`;
      const nextWeekId = nextWeek.id ? nextWeek.id.toString() : `w-${nextWeek.week_number || (index + 1)}`;

      return {
        id: `e-${weekId}-${nextWeekId}`,
        source: weekId,
        target: nextWeekId,
        type: 'default', // Rounded Bezier curve path
        className: edgeClass,
      };
    }).filter(Boolean);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [roadmap, handleOpenDrawer, requestToggleMilestone, handleShowToast, setNodes, setEdges]);

  // Auto-center active node when roadmap or nodes change
  useEffect(() => {
    if (rfInstance && nodes.length > 0) {
      if (isExampleView || isPreviewView) {
        // Center around the second node (if it exists) with a smaller zoom to show the first 3 nodes
        const targetNode = nodes.length > 1 ? nodes[1] : nodes[0];
        rfInstance.setCenter(targetNode.position.x + 160, targetNode.position.y + 150, { zoom: 0.55, duration: 1000 });
      } else {
        // Find the first milestone that is NOT completed
        const activeNode = nodes.find(n => !n.data.week.is_completed);
        if (activeNode) {
          // Center on the active node with a slight offset for the card size
          rfInstance.setCenter(activeNode.position.x + 160, activeNode.position.y + 150, { zoom: 0.85, duration: 1000 });
        }
      }
    }
  }, [rfInstance, nodes, isExampleView]);


  if (loading) {
    return (
      <div className="rv-loading">
        <div className="rv-spinner"></div>
        <p>Initializing Interactive Roadmap...</p>
      </div>
    );
  }
  if (!roadmap) return null;

  // ── Strategic Guidance Pivot (Unfeasible Roadmap) ──
  if (roadmap.is_feasible === false || roadmap.is_feasible === 0 || roadmap.is_feasible === '0') {
    const deletionDate = roadmap.created_at
      ? new Date(new Date(roadmap.created_at).getTime() + 72 * 60 * 60 * 1000)
      : new Date(Date.now() + 72 * 60 * 60 * 1000);

    const formattedDeletion = deletionDate.toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });

    return (
      <div className="rv-container rv-rc-container">
        {/* Synchronized Header for Reality Check */}
        <header className="rv-floating-header glass-panel rv-rc-header">
          <div className="rv-noise-overlay" />
          <div className="rv-fh-content">
            <button className="rv-back-btn" onClick={() => navigate(-1)} title="Go Back">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <div className="rv-fh-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 className="rv-fh-greeting">Reality Check for <span>{roadmap.target_name}</span></h1>
              </div>
              <p className="rv-fh-meta">Expert Strategy Assessment for your goal as a {roadmap.career_goal}</p>
            </div>
            <div className="rv-fh-progress-stat" style={{ visibility: 'hidden' }}>
              <span className="rv-progress-value">0%</span>
            </div>
          </div>
        </header>

        <div className="rv-reality-check">
          <div className="rv-rc-bento">
            {/* Main Focus: The Reasoning with Typing Effect */}
            <div className="rv-rc-bento-item bento-main">
              <div className="rv-rc-label">Mentor's Perspective</div>
              <p className="rv-rc-reasoning-text">
                {roadmap.feasibility_reasoning}
              </p>
            </div>

            {/* Side Focus: The Skill Gaps */}
            <div className="rv-rc-bento-item bento-side">
              <div className="rv-rc-label">Requirement Gaps</div>
              <div className="rv-rc-gaps-list">
                {roadmap.skill_gap_summary
                  .split(/,|\sand\s|\sor\s|\n|\(|\)|\./)
                  .map(s => s.trim())
                  .filter(s => s.length > 0 && s.toLowerCase() !== 'and' && s.toLowerCase() !== 'or')
                  .map((gap, i) => (
                    <div key={i} className="rv-rc-gap-badge">{gap}</div>
                  ))}
              </div>
            </div>

            {/* Footer Focus: Meta info / Expiration (No Action Buttons) */}
            <div className="rv-rc-bento-item bento-footer">
              <div className="rv-rc-meta">
                <Clock size={18} />
                <span>Advisory Notice: This roadmap strategy will be removed from your dashboard on <strong>{formattedDeletion}</strong>.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rv-ambient-glow" aria-hidden="true" />
      </div>
    );
  }

  // Calculate Progress
  const completedWeeks = roadmap.curriculum ? roadmap.curriculum.filter(m => m.is_completed).length : 0;
  const totalWeeks = roadmap.curriculum ? roadmap.curriculum.length : 0;
  const progressPct = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  return (
    <div className="rv-container" ref={containerRef}>
      {/* Dynamic Background Glow */}
      <div className="rv-mouse-glow" />
      <div className="rv-dot-grid" />
      {/* ── Status Pill Header ── */}
      <header className={`rv-floating-header glass-panel ${isMinimized ? 'minimized' : ''}`}>
        <div className="rv-noise-overlay" />
        <div className="rv-fh-content">
          <button className="rv-back-btn" onClick={() => navigate(-1)} title="Go Back">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>

          <div className="rv-fh-info">
            <h1 className="rv-fh-greeting">
              {isPreviewView ? (
                <>Your Preview Roadmap: <span>{roadmap.title || roadmap.career_goal}</span></>
              ) : isExampleView ? (
                <>Example Roadmap: <span>{roadmap.title || roadmap.career_goal}</span></>
              ) : (
                <>Welcome Back, <span>{roadmap.target_name}</span></>
              )}
            </h1>
            {!(isExampleView || isPreviewView) && (
              <p className="rv-fh-meta">
                Here is your tailored path to becoming a {roadmap.career_goal}
              </p>
            )}
          </div>

          {!(isExampleView || isPreviewView) && (
            <div className="rv-fh-progress-stat">
              <span className="rv-progress-value">{progressPct}%</span>
              <span className="rv-progress-label">Complete</span>
            </div>
          )}
          {isPreviewView && (
            <div className="rv-fh-progress-stat">
              <button 
                className="rc-btn" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                onClick={openAuth}
              >
                Sign Up to Save
              </button>
            </div>
          )}
        </div>

        {/* Integrated Progress Bar */}
        {!(isExampleView || isPreviewView) && (
          <div className="rv-fh-progress-track">
            <div
              className="rv-fh-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </header>

      {/* ── Content: React Flow or Vertical Timeline ── */}
      {isPortrait ? (
        <div className="rv-mobile-scroll-container" style={{ position: 'absolute', inset: 0, paddingTop: '12rem', paddingBottom: '6rem', overflowY: 'auto', zIndex: 5 }}>
          <VerticalTimeline 
            curriculum={roadmap.curriculum}
            onOpenDrawer={handleOpenDrawer}
            onToggleMilestone={requestToggleMilestone}
            onShowToast={handleShowToast}
            isExampleView={isExampleView || isPreviewView}
          />
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={setRfInstance}
          onMoveStart={handleHeaderInteraction}
          onPaneClick={handleHeaderInteraction}
          onNodeDragStart={handleHeaderInteraction}
          nodesConnectable={false}
          elementsSelectable={false}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(255,255,255,0.05)" gap={20} />
          <Controls showInteractive={false} style={{ marginBottom: '1.25rem' }} />
        </ReactFlow>
      )}

      {/* Ambient background glow */}
      <div className="rv-ambient-glow" aria-hidden="true" />

      {/* ── Detail Drawer ── */}
      <div className={`rv-drawer-overlay ${isDrawerOpen ? 'visible' : ''}`} onClick={() => setIsDrawerOpen(false)} />
      <div className={`rv-drawer glass-panel ${isDrawerOpen ? 'open' : ''}`}>
        {selectedMilestone && (
          <div className="rv-drawer-content">
            <div className="rv-drawer-top">
              <span className="rv-drawer-week">Week {selectedMilestone.week_number}</span>
              <button className="rv-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="rv-drawer-header">
              <h2>{selectedMilestone.topic}</h2>
              <div className="rc-badges" style={{ marginTop: '0.75rem' }}>
                {selectedMilestone.difficulty && (
                  <span className={`rc-badge rc-diff rc-diff--${selectedMilestone.difficulty.toLowerCase()}`}>
                    <BarChart2 size={12} />
                    {selectedMilestone.difficulty}
                  </span>
                )}
                {selectedMilestone.estimated_hours && (
                  <span className="rc-badge rc-time">
                    <Clock size={12} />
                    {selectedMilestone.estimated_hours}h
                  </span>
                )}
              </div>
            </div>

            <div className="rv-drawer-body">
              <div className="rv-drawer-section">
                <h3>Goal</h3>
                <p>{selectedMilestone.key_objective}</p>
              </div>

              <div className="rv-drawer-section">
                <h3>Task</h3>
                <p>{selectedMilestone.task}</p>
              </div>

              {selectedMilestone.resources && selectedMilestone.resources.length > 0 && (
                <div className="rv-drawer-section">
                  <h3>Resources</h3>
                  <ul>
                    {selectedMilestone.resources.map((res, i) => (
                      <li
                        key={i}
                        className="rv-res-item"
                        title={res.url_or_query || res.title}
                        onClick={() => handleOpenResource(res)}
                      >
                        <span className="rv-res-icon">{getResourceIcon(res.type)}</span>
                        <span className="rv-res-title">{res.title}</span>
                        <div className="rv-res-actions">
                          <button
                            className="rv-res-action-btn rv-res-open-btn"
                            onClick={(e) => { e.stopPropagation(); handleOpenResource(res); }}
                            title="Open direct link"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            className="rv-res-action-btn rv-res-search-btn"
                            onClick={(e) => handleSearchResource(res, e)}
                            title="Link not working? Search on Google"
                          >
                            <Search size={14} />
                          </button>
                          <button
                            className="rv-res-action-btn rv-res-copy-btn"
                            onClick={(e) => handleCopyResource(res, i, e)}
                            title={copiedResIndex === i ? "Copied!" : "Copy Title & Link"}
                          >
                            {copiedResIndex === i ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      {confirmModal.isOpen && (
        <div className="rv-modal-overlay">
          <div className="rv-modal glass-panel">
            <div className="rv-modal-icon">
              <CheckCircle2 size={40} strokeWidth={1.5} />
            </div>
            <h2>Mark as Complete?</h2>
            <p>Are you sure you want to mark this milestone as complete?</p>
            <div className="rv-modal-actions">
              <button className="rv-modal-btn rv-modal-btn--cancel" onClick={() => setConfirmModal({ isOpen: false, milestoneId: null, currentStatus: false })}>
                Cancel
              </button>
              <button className="rv-modal-btn rv-modal-btn--confirm" onClick={confirmToggleMilestone}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {isExampleView && (
        <div className="rm-master-cta-wrapper">
          <div className="rm-cta-blur-backdrop" />
          <div className="master-cta-banner">
            <h2 className="master-cta-text">Like what you see?</h2>
            <p className="master-cta-subtext">Sign up to generate this exact blueprint and start tracking your progress.</p>
            <button className="btn-master-cta" onClick={() => {
              const promptDraft = getExamplePrompt(id, userName, roadmap);
              localStorage.setItem('cw_prompt_draft', promptDraft);
              navigate('/dashboard');
            }}>
              Weave this Exact Roadmap to Yourself
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
