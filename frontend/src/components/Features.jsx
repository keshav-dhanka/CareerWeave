import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Unlock, Briefcase, Check, Lock } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import confetti from 'canvas-confetti';
import './Features.css';

gsap.registerPlugin(MotionPathPlugin);

const Sparkle = ({ className }) => (
  <div className={`sparkle-wrapper ${className}`}>
    <div className="ray-h"></div>
    <div className="ray-v"></div>
    <div className="ray-d1"></div>
    <div className="ray-d2"></div>
    <div className="spark-core"></div>
  </div>
);

const DustParticles = ({ x, y }) => {
  const particles = useMemo(() => Array.from({ length: 45 }).map((_, i) => {
    const size = Math.random() * 4 + 1;
    const angle = Math.random() * Math.PI * 2;
    const power = Math.random();
    const distance = power * 120 + 30;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;
    const particleColor = i % 2 === 0 ? 'var(--accent-color)' : 'var(--accent-orange)';
    const duration = 0.6 + Math.random() * 0.6;
    const delay = Math.random() * 0.05;
    const rotation = Math.random() * 360;

    return { size, destX, destY, particleColor, duration, delay, rotation, isCircle: i % 4 !== 0 };
  }), []);

  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, pointerEvents: 'none', zIndex: 130 }}>
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: 'absolute',
          width: '1.875rem',
          height: '1.875rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--text-primary) 0%, transparent 70%)',
          left: '-0.9375rem',
          top: '-0.9375rem',
          zIndex: 131
        }}
      />

      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: p.destX,
            y: p.destY,
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.2],
            rotate: p.rotation
          }}
          transition={{
            duration: p.duration,
            ease: [0.16, 1, 0.3, 1],
            delay: p.delay
          }}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.particleColor,
            boxShadow: `0 0 0.75rem ${p.particleColor}`,
            borderRadius: p.isCircle ? '50%' : '1px',
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};

const WeekCard = ({ title, subtitle, details, status, time, className, onHoverChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const confettiIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const localConfettiRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !localConfettiRef.current) {
      localConfettiRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true
      });
    }
  }, []);

  useEffect(() => {
    if (status === 'progressing' && isHovered && localConfettiRef.current) {
      confettiIntervalRef.current = setInterval(() => {
        localConfettiRef.current({
          particleCount: 2,
          angle: 60,
          spread: 45,
          origin: { x: 0, y: 0.8 },
          colors: ['var(--accent-green)', '#22d3ee', '#fbbf24', '#f87171'],
          ticks: 150,
          gravity: 1,
          scalar: 0.6,
        });
        localConfettiRef.current({
          particleCount: 2,
          angle: 120,
          spread: 45,
          origin: { x: 1, y: 0.8 },
          colors: ['var(--accent-green)', '#22d3ee', '#fbbf24', '#f87171'],
          ticks: 150,
          gravity: 1,
          scalar: 0.6,
        });
      }, 200);
    } else {
      if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
    }
    return () => {
      if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
    };
  }, [isHovered, status]);

  return (
    <div
      className={`feature-3d-week-card ${className} ${status}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (onHoverChange) onHoverChange(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (onHoverChange) onHoverChange(false);
      }}
    >
      <div className="card-glass-glow-3d" />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 4,
          borderRadius: '24px'
        }}
      />
      <div className="card-content-inner-3d">
        <div className="main-content-wrapper-3d">
          <div className="card-header-3d">
            <span className="week-label-3d">{title}</span>
            {status === 'progressing' ? (
              <div className="status-indicator-3d">
                <div className="pulse-dot-3d" />
                <div className="status-text-3d">In Progress</div>
              </div>
            ) : status === 'locked' ? (
              <div className="status-indicator-3d locked">
                <Lock size={12} className="lock-icon-3d" />
                <div className="status-text-3d">Locked</div>
              </div>
            ) : status === 'unlocked' ? (
              <div className="status-indicator-3d unlocked">
                <Unlock size={12} className="lock-icon-3d" />
                <div className="status-text-3d">Unlocked</div>
              </div>
            ) : null}
          </div>

          <h3 className="card-title-3d">{subtitle}</h3>
          <p className="card-desc-3d">{details}</p>

          <div className="card-footer-3d">
            <button className="start-btn-3d" disabled={status === 'locked'}>
              {status === 'progressing' ? 'Continue' : status === 'locked' ? 'Locked' : 'Start'}
            </button>
            {time && (
              <div className="time-badge-3d">
                <strong>{time}</strong>
              </div>
            )}
          </div>
        </div>

        {status === 'progressing' && (
          <div className="success-overlay-3d">
            <div className="tick-container-3d">
              <Check size={40} strokeWidth={3} className="success-tick-3d" />
            </div>
          </div>
        )}
      </div>
      <div className="card-accent-blob-3d" />
    </div>
  );
};

const useVerticalSPath = (sx, sy, tx, ty) => {
  const [path, setPath] = useState('');
  useEffect(() => {
    const update = () => {
      // 160 is roughly half the width of the card (20rem / 2)
      // 100 is an offset from top to anchor line roughly in the middle
      const x1 = sx.get() + 160;
      const y1 = sy.get() + 100;
      const x2 = tx.get() + 160;
      const y2 = ty.get() + 100;
      const height = y2 - y1;
      setPath(`M ${x1} ${y1} C ${x1 + 60} ${y1 + height / 3}, ${x2 - 60} ${y2 - height / 3}, ${x2} ${y2}`);
    };
    update();
    const us1 = sx.on("change", update);
    const uy1 = sy.on("change", update);
    const us2 = tx.on("change", update);
    const uy2 = ty.on("change", update);
    return () => { us1(); uy1(); us2(); uy2(); };
  }, [sx, sy, tx, ty]);
  return path;
};

const ThreadPath = ({ sx, sy, tx, ty, color, dashed }) => {
  const path = useVerticalSPath(sx, sy, tx, ty);
  return (
    <path
      d={path}
      stroke={color}
      strokeWidth={3}
      fill="none"
      strokeDasharray={dashed ? "12 12" : "none"}
    />
  );
};

const ThreadPulse = ({ sx, sy, tx, ty }) => {
  const path = useVerticalSPath(sx, sy, tx, ty);
  return (
    <motion.path
      d={path}
      pathLength="1"
      stroke="url(#pulseGradGreen)"
      strokeWidth="4"
      fill="none"
      strokeDasharray="0.15 0.85"
      animate={{ strokeDashoffset: [1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  );
};

const DraggableRoadmapNode = ({ data, x, y, containerRef }) => {
  const { status, title, label, topic, objective, tasks, difficulty, estTime } = data;

  const tasksWords = tasks ? tasks.split(' ') : [];
  const displayTasks = tasksWords.slice(0, 4).join(' ') + '...';

  const difficultyClass = difficulty ? difficulty.toLowerCase().replace(' ', '-') : '';

  return (
    <motion.div
      className={`roadmap-node ${status}`}
      style={{
        x,
        y,
        position: 'absolute',
        rotateX: 20,
        rotateY: 20,
        z: 15,
        scale: 0.45,
        transformStyle: 'preserve-3d',
        cursor: 'default'
      }}
      whileHover={{ scale: 0.48, z: 32, rotateX: 0, rotateY: 0, zIndex: 20 }}
    >
      {status === 'in-progress' && <div className="pulse-dot"></div>}

      <div className="roadmap-node-header">
        <h3 className="roadmap-node-title">{title}</h3>
        <span className="roadmap-node-status">{label}</span>
      </div>

      <div className="roadmap-node-body">
        <h4 className="node-topic">{topic}</h4>
        {objective && <p className="node-objective">{objective}</p>}

        {tasks && (
          <div className="node-tasks">
            {displayTasks}
            <span className="view-more-link" style={{ cursor: 'default', textDecoration: 'none' }}>
              {' View more'}
            </span>
          </div>
        )}

        {status !== 'locked' && (
          <div className="node-extra-info">
            <div className="info-tags">
              {difficulty && <span className={`tag-difficulty ${difficultyClass}`}>{difficulty}</span>}
              {estTime && <span className="tag-time">{estTime}</span>}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Card 1: Personalized Roadmaps (The Skill-to-Path Weaver) ---
const SkillToPathWeaver = () => {
  const [impacts, setImpacts] = useState([]);
  const [iteration, setIteration] = useState(0);
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const badges = useMemo(() => [
    { id: 1, text: "Python", color: "var(--accent-color)", x: 50, y: 30, delay: 0.5 },
    { id: 2, text: "Figma", color: "oklch(65% 0.2 300)", x: 45, y: 45, delay: 2 },
    { id: 3, text: "Marketing", color: "var(--accent-orange)", x: 45, y: 65, delay: 3.5 }
  ], []);

  const paths = useMemo(() => {
    const generatePath = (endX, endY) => {
      const startX = -15;
      const startY = Math.random() * 40 + 30;
      const cp1x = Math.random() * 30;
      const cp1y = Math.random() * 100;
      const cp2x = Math.random() * 30 + 30;
      const cp2y = Math.random() * 100;
      return `M ${startX} ${startY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${endX} ${endY}`;
    };
    return badges.map(b => generatePath(b.x, b.y));
  }, [iteration, badges]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      badges.forEach((b, idx) => {
        const badgeSelector = `.weaving-badge-${b.id}`;
        const pathSelector = `#path-${b.id}`;

        gsap.set(badgeSelector, { opacity: 0 });

        gsap.to(badgeSelector, {
          motionPath: {
            path: pathSelector,
            align: pathSelector,
            alignOrigin: [0.5, 0.5],
            autoRotate: false
          },
          delay: b.delay,
          duration: 3,
          ease: "power1.inOut",
          onStart: () => {
            gsap.set(badgeSelector, { opacity: 1 });
          },
          onComplete: () => {
            gsap.to(badgeSelector, { opacity: 0, duration: 0.2 });
            setImpacts(prev => [...prev, { x: b.x, y: b.y, ts: Date.now() }]);
            setTimeout(() => {
              setImpacts(prev => prev.filter(i => i.x !== b.x || i.y !== b.y));
            }, 2500);
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [iteration, badges]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIteration(prev => prev + 1);
    }, 6700);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="feature-visual skill-weaver-container relative w-full h-full flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="A 3D isometric animation of skills being woven into a path."
      style={{ perspective: '1000px' }}
    >
      <div className="animation-overlay" style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {badges.map((b, idx) => (
            <motion.path
              key={`path-${iteration}-${b.id}`}
              id={`path-${b.id}`}
              d={paths[idx]}
              fill="none"
              stroke={b.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              transition={{
                delay: b.delay,
                duration: 3,
                times: [0, 0.1, 0.8, 1],
                ease: "power1.inOut"
              }}
              className="glow-path"
            />
          ))}
        </svg>

        {badges.map(b => (
          <div
            key={`badge-${iteration}-${b.id}`}
            className={`weaving-badge weaving-badge-${b.id}`}
            style={{
              position: 'absolute',
              backgroundColor: b.color,
              zIndex: 120,
              opacity: 0,
              willChange: 'transform, opacity'
            }}
          >
            {b.text}
          </div>
        ))}

        <AnimatePresence>
          {impacts.map(impact => (
            <DustParticles key={impact.ts} x={impact.x} y={impact.y} />
          ))}
        </AnimatePresence>
      </div>

      <div
        className="visual-3d-wrapper"
        style={{
          '--tilt-y': `${tilt.y}deg`,
          '--tilt-x': `${tilt.x}deg`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="play-card pos-1"></div>
        <div className="play-card-back pos-1"></div>
        <div className="play-card pos-2"></div>
        <div className="play-card-back pos-2"></div>
        <div className="play-card pos-3"></div>
        <div className="play-card-back pos-3"></div>
        <div className="front side">
          <Sparkle className="top-right" />
          <Sparkle className="bottom-left" />
          <Sparkle className="bottom-right" />
          <Sparkle className="top-left" />
          <div className="nav-bar-3d">
            <span>Generating Path</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ rotate: '90deg' }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
        <div className="middle side"></div>
        <div className="back side"></div>
      </div>
    </div>
  );
};

// --- Card 2: Smart Reality Check (The Biometric Audit) ---
const BiometricAuditVisual = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="feature-visual audit-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Scanning animation over a career icon, validating achievable status."
    >
      <div className="absolute w-32 h-32 blur-3xl rounded-full" style={{ background: 'rgba(39, 201, 63, 0.2)', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible' }}></div>
      <div className="scanner-frame">
        <Briefcase className="audit-icon" size={48} color={isHovered ? "var(--accent-green)" : "#fbbf24"} style={{ transition: 'color 0.5s ease' }} />

        {/* Scanning Beam */}
        <motion.div
          className="scan-beam-framer"
          animate={{ y: [0, 120, 0] }}
          transition={{
            duration: isHovered ? 0.8 : 3,
            ease: "linear",
            repeat: Infinity
          }}
        />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="achievable-badge-framer"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Achievable
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Card 3: Sequential Unlocking (The 3D Week Stack) ---
const SequentialUnlockingVisual = () => {
  const [isWeek1Hovered, setIsWeek1Hovered] = useState(false);

  return (
    <div className="feature-visual sequential-3d-container">
      <div className="scene-container-3d">
        {/* Week 3 - Furthest back */}
        <WeekCard
          title="Week 3"
          subtitle="Advanced Scaling"
          details="Optimize for peak performance and global availability."
          className="card-3-3d"
          status="locked"
          time="20h"
        />

        {/* Week 2 - Middle */}
        <WeekCard
          title="Week 2"
          subtitle="System Design"
          details="Architect robust solutions with scalable patterns."
          className="card-2-3d"
          status={isWeek1Hovered ? 'unlocked' : 'locked'}
          time="18h"
        />

        {/* Week 1 - Front & Center */}
        <WeekCard
          title="Week 1"
          subtitle="Core Logic"
          details="Master the foundational architecture of your path."
          className="card-1-3d"
          status="progressing"
          time="12h"
          onHoverChange={setIsWeek1Hovered}
        />
      </div>
      <div className="bg-glow-sequential-3d" />
    </div>
  );
};

// --- Card 4: Interactive Learning Path (The Dynamic Branch) ---
const DynamicBranchVisual = () => {
  const containerRef = useRef(null);

  // Motion values to track node positions
  // Adjusted to center and fit within the small container
  const n1x = useMotionValue(0); const n1y = useMotionValue(-90);
  const n2x = useMotionValue(0); const n2y = useMotionValue(30);
  const n3x = useMotionValue(0); const n3y = useMotionValue(150);

  const nodeData = [
    {
      id: 'week1',
      title: 'Week 1',
      status: 'completed',
      label: 'Completed',
      topic: 'Frontend Fundamentals',
      objective: 'Understand DOM, React basics',
      tasks: 'Build 2 mini projects using React',
      x: n1x, y: n1y
    },
    {
      id: 'week2',
      title: 'Week 2',
      status: 'in-progress',
      label: 'In Progress',
      topic: 'React & State Management',
      objective: 'Master Redux, Context API',
      tasks: 'Implement a global store for a shopping cart',
      x: n2x, y: n2y
    },
    {
      id: 'week3',
      title: 'Week 3',
      status: 'locked',
      label: 'Locked',
      topic: 'Micro-frontends & Webpack',
      objective: 'Learn Module Federation',
      tasks: 'Split app into 2 micro-frontends',
      x: n3x, y: n3y
    }
  ];

  return (
    <div className="feature-visual branch-container" aria-label="Interactive 3D Roadmap">
      <div
        className="roadmap-container-mini"
        ref={containerRef}
      >
        <svg className="glow-threads-svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <linearGradient id="pulseGradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--accent-green)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <ThreadPath sx={n1x} sy={n1y} tx={n2x} ty={n2y} color="var(--accent-green)" dashed={false} />
          <ThreadPath sx={n2x} sy={n2y} tx={n3x} ty={n3y} color="var(--text-secondary)" dashed={true} />

          <ThreadPulse sx={n1x} sy={n1y} tx={n2x} ty={n2y} />
        </svg>

        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          {nodeData.map(node => (
            <DraggableRoadmapNode
              key={node.id}
              data={node}
              x={node.x}
              y={node.y}
              containerRef={containerRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Card 5: Secure Persistence (The Encrypted Shield) ---
const EncryptedShieldVisual = () => {
  return (
    <div className="feature-visual fake-3d-container">
      <div className="scene" style={{ transform: 'scale(0.55)', transformOrigin: 'center' }}>
        <div className="encrypted-label">ENCRYPTED_BCRYPT</div>
        <div className="shield-ring shield-ring-1"></div>
        <div className="shield-ring shield-ring-2"></div>
        <div className="shield-ring shield-ring-3"></div>
        <div className="cube">
          <div className="center-element">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 25 25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key-round-icon lucide-key-round">
              <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
              <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
          </div>
          <div className="face front">
            <div className="glass-content"></div>
          </div>
          <div className="face back">
            <div className="glass-content"></div>
          </div>
          <div className="face right">
            <div className="glass-content"></div>
          </div>
          <div className="face left">
            <div className="glass-content"></div>
          </div>
          <div className="face top">
            <div className="glass-content"></div>
          </div>
          <div className="face bottom">
            <div className="glass-content"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef(null);
  const glow1Ref = useRef(null);
  const glow2Ref = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calculate normalized mouse position (-1 to 1)
      const xPos = (clientX / innerWidth - 0.5) * 2;
      const yPos = (clientY / innerHeight - 0.5) * 2;

      // Move glows in opposite direction of mouse
      gsap.to(glow1Ref.current, {
        x: -xPos * 60,
        y: -yPos * 60,
        duration: 1,
        ease: "power2.out"
      });

      gsap.to(glow2Ref.current, {
        x: -xPos * 100,
        y: -yPos * 100,
        duration: 1.5,
        ease: "power2.out"
      });
    };

    section.addEventListener('mousemove', handleMouseMove);
    return () => section.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="features-section" id="features" ref={sectionRef}>
      <div className="features-bg-layer">
        <div ref={glow1Ref} className="mesh-glow glow-orange"></div>
        <div ref={glow2Ref} className="mesh-glow glow-blue"></div>
        <div className="grain-overlay"></div>
      </div>

      <div className="container relative z-10">
        <div className="features-header">
          <h2 className="section-heading">
            <span className="highlight-wrapper">
              <span>Everything {' '}</span>
              <svg className="handdrawn-line" viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M 5,15 Q 50,5 100,12 T 195,10" stroke="var(--accent-orange)" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span> You Need to {' '}
            <span className="gradient-highlight">Stay On Track</span>
          </h2>
          <p className="section-subheading">
            CareerWeave isn’t just a roadmap — it’s designed to help you stay consistent, focused, and progressing.
          </p>
        </div>

        <div className="features-hub-grid spotlight-container">
          {/* Large - Top Left (Row 1-2, Col 1-2) */}
          <div className="feature-card-pro card-large group">
            <div className="card-glow-border"></div>
            <div className="card-inner">
              <SkillToPathWeaver />
              <div className="feature-content">
                <h3>Architecture Built for You.</h3>
                <p>24-week curriculum based on your specific skills.</p>
              </div>
            </div>
          </div>

          {/* Medium 1 - Top Right (Row 1, Col 3-4) */}
          <div className="feature-card-pro card-medium-tr group">
            <div className="card-glow-border"></div>
            <div className="card-inner">
              <BiometricAuditVisual />
              <div className="feature-content">
                <h3>Honest Career Advice.</h3>
                <p>We audit your goals against reality with transparency.</p>
              </div>
            </div>
          </div>

          {/* Medium 2 - Bottom Left (Row 2, Col 1-2) */}
          <div className="feature-card-pro card-medium-bl group">
            <div className="card-glow-border"></div>
            <div className="card-inner">
              <SequentialUnlockingVisual />
              <div className="feature-content">
                <h3>Focus on the "Now."</h3>
                <p>Redact future tasks until you master the present.</p>
              </div>
            </div>
          </div>

          {/* Small 1 - Bottom Right (Row 2, Col 3) */}
          <div className="feature-card-pro card-small s1 group">
            <div className="card-glow-border"></div>
            <div className="card-inner">
              <DynamicBranchVisual />
              <div className="feature-content">
                <h3>Interactive Path</h3>
                <p>Dynamic skill tree evolution.</p>
              </div>
            </div>
          </div>

          {/* Small 2 - Bottom Right (Row 2, Col 4) */}
          <div className="feature-card-pro card-small s2 group">
            <div className="card-glow-border"></div>
            <div className="card-inner">
              <EncryptedShieldVisual />
              <div className="feature-content text-center">
                <h3>Secure Persistence</h3>
                <p>Private progress tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
