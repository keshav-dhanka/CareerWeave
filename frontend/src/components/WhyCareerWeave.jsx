import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import './WhyCareerWeave.css';

// SVG Icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const WhyCareerWeave = () => {
  // ========== Master Visual: 3D Tilt ==========
  const masterRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!masterRef.current) return;
    const { left, top, width, height } = masterRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    setTilt({ x: x * 8, y: -y * 8 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  // ========== Master Visual: Scroll-Triggered Pulse ==========
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [activeWeekIndex, setActiveWeekIndex] = useState(-1);

  useEffect(() => {
    if (!isInView) { setActiveWeekIndex(-1); return; }
    setActiveWeekIndex(0);
    const interval = setInterval(() => {
      setActiveWeekIndex(prev => (prev + 1) % 5);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView]);

  const weeksData = [
    { num: '01', title: 'Foundations of Design' },
    { num: '02', title: 'Mastery of Auto-layout' },
    { num: '03', title: 'Mastering State Management', isTooltip: true, task: 'Build a ToDo App', resource: 'React Docs + Video' },
    { num: '04', title: 'Prototyping Interactions' },
    { num: '05', title: 'Advanced Design Systems' },
  ];

  // ========== Card 2: Chaos vs Structure Toggle ==========
  const [isStructured, setIsStructured] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setIsStructured(prev => !prev), 4000);
    return () => clearInterval(interval);
  }, []);

  // ========== Card 4: Gauge Animation ==========
  const gaugeRef = useRef(null);
  const gaugeInView = useInView(gaugeRef, { once: false, amount: 0.5 });
  const [gaugeProgress, setGaugeProgress] = useState(0);
  useEffect(() => {
    if (gaugeInView) {
      const timer = setTimeout(() => setGaugeProgress(58), 300);
      return () => clearTimeout(timer);
    } else {
      setGaugeProgress(0);
    }
  }, [gaugeInView]);

  // Gauge arc math
  const gaugeRadius = 52;
  const gaugeCircumference = Math.PI * gaugeRadius; // semicircle
  const gaugeFill = (gaugeProgress / 100) * gaugeCircumference;

  return (
    <section className="edge-section" id="why-careerweave" ref={sectionRef}>
      <div className="container">
        <div className="edge-header">
          <h2 className="section-heading">
            Why <span className="highlight-wrapper">
              <span>CareerWeave</span>
              <svg className="handdrawn-line" viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M 5,15 Q 50,5 100,12 T 195,10" stroke="var(--accent-orange)" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span> Actually{' '}
            <span className="hero-highlight">Works</span>
          </h2>
          <p className="section-subheading">Stop guessing. Start growing. We turn career chaos into a structured, 24-week blueprint tailored only for you.</p>
        </div>

        <div className="bento-grid">

          {/* ====== Card 1: Built Around You ====== */}
          <div className="bento-card card-weaver glass-card">
            <div className="card-visual">
              <div className="personalize-visual">
                {/* User Icon — source */}
                <div className="pv-user">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div className="pv-user-glow"></div>
                </div>

                {/* Only Skills & Goals badges */}
                {[
                  { label: 'Skills', colorClass: 'skills', yEnd: -22 },
                  { label: 'Goals', colorClass: 'goals', yEnd: 22 },
                ].map((chip, idx) => (
                  <motion.div
                    key={chip.label}
                    className="pv-badge"
                    animate={{
                      x: [0, 50, 85, 85],
                      y: [0, chip.yEnd, 0, 0],
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1, 0.7, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: idx * 0.4, times: [0, 0.3, 0.55, 0.8], ease: 'easeInOut' }}
                  >
                    <span className={`chip-dot ${chip.colorClass}`}></span>
                    <span className="badge-text">{chip.label}</span>
                  </motion.div>
                ))}

                {/* Glowing dotted connectors: user → diamond → path */}
                <svg className="pv-connectors" viewBox="0 0 300 120">
                  {/* User to diamond */}
                  <path d="M42 60 Q80 30 135 60" fill="none" stroke="rgba(79,70,229,0.2)" strokeWidth="1" strokeDasharray="3 5" className="connector-dash-anim" />
                  <path d="M42 60 Q80 90 135 60" fill="none" stroke="rgba(79,70,229,0.2)" strokeWidth="1" strokeDasharray="3 5" className="connector-dash-anim" />
                  {/* Diamond to path output */}
                  <path d="M165 60 L210 60" fill="none" stroke="rgba(255,107,74,0.2)" strokeWidth="1" strokeDasharray="3 5" className="connector-dash-anim-out" />
                  {/* Glow particles along the lines */}
                  <circle r="2" fill="var(--accent-color)" opacity="0.6" className="travel-dot-1">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M42 60 Q80 30 135 60" />
                  </circle>
                  <circle r="2" fill="var(--accent-color)" opacity="0.5" className="travel-dot-2">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M42 60 Q80 90 135 60" begin="0.4s" />
                  </circle>
                  <circle r="1.5" fill="var(--accent-orange)" opacity="0.6" className="travel-dot-3">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M165 60 L210 60" begin="2s" />
                  </circle>
                </svg>

                {/* Center Weave Node (diamond) */}
                <div className="pv-weave-node">
                  <motion.div
                    className="weave-diamond"
                    animate={{ rotate: [0, 180, 360], scale: [1, 1.18, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="url(#weaveGrad)" strokeWidth="1.5" strokeLinejoin="round">
                      <polygon points="12,2 22,12 12,22 2,12" />
                      <defs><linearGradient id="weaveGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--accent-color)" /><stop offset="100%" stopColor="var(--accent-orange)" /></linearGradient></defs>
                    </svg>
                  </motion.div>
                  <div className="weave-glow"></div>
                </div>

                {/* Premium output path — delayed to sync with badge arrival */}
                <div className="pv-output">
                  <svg viewBox="0 0 110 50" className="pv-path-svg">
                    <defs>
                      <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--accent-color)" /><stop offset="100%" stopColor="var(--accent-orange)" /></linearGradient>
                      <linearGradient id="pathGlow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(79,70,229,0.3)" /><stop offset="100%" stopColor="rgba(255,107,74,0.3)" /></linearGradient>
                      <filter id="pathBlur"><feGaussianBlur stdDeviation="3" /></filter>
                    </defs>
                    {/* Glow layer (blurred wider stroke behind) */}
                    <path d="M2 25 C 20 10, 40 40, 55 25 S 85 10, 105 25" fill="none" stroke="url(#pathGlow)" strokeWidth="8" strokeLinecap="round" filter="url(#pathBlur)" className="pv-draw-path" />
                    {/* Main crisp path */}
                    <path d="M2 25 C 20 10, 40 40, 55 25 S 85 10, 105 25" fill="none" stroke="url(#pathGrad)" strokeWidth="2" strokeLinecap="round" className="pv-draw-path" />
                    {/* End dot with glow */}
                    <circle cx="105" cy="25" r="4" fill="var(--accent-orange)" className="pv-end-dot" filter="url(#pathBlur)" />
                    <circle cx="105" cy="25" r="2.5" fill="#fff" className="pv-end-dot" />
                  </svg>
                  <span className="pv-label">Your Unique Path</span>
                </div>
              </div>
            </div>
            <div className="card-content">
              <h3>Built Around You</h3>
              <p>No more "one size fits all." We weave your current skills and goals into a unique path that respects your time.</p>
            </div>
          </div>

          {/* ====== Card 2: Goodbye, Tutorial Hell ====== */}
          <div className="bento-card card-chaos glass-card">
            <div className="card-visual chaos-visual">
              <div className="chaos-container">
                {/* LEFT: Chaos */}
                <div className={`chaos-side ${isStructured ? 'fade-out' : 'fade-in'}`}>
                  <div className="chaos-label">Before</div>
                  {[0, 1, 2, 3, 4].map(i => (
                    <motion.div key={`vid-${i}`} className="chaos-video-rect" style={{
                      top: `${15 + i * 16}%`, left: `${8 + (i % 3) * 20}%`,
                      transform: `rotate(${(i - 2) * 8}deg)`,
                    }} animate={{ y: [0, (i % 2 === 0 ? -3 : 3), 0], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2 + i * 0.3, repeat: Infinity }}>
                      <div className="vid-play"><svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="rgba(255,80,80,0.5)" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
                      <div className="vid-lines"><div /><div /></div>
                    </motion.div>
                  ))}
                  <div className="chaos-question"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,80,80,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                  {/* Tangled lines */}
                  <svg className="tangle-svg" viewBox="0 0 100 100"><path d="M10 20 Q40 80 30 40 T70 60 Q90 20 60 90" fill="none" stroke="rgba(255,80,80,0.25)" strokeWidth="1.5" strokeDasharray="4 4" /></svg>
                </div>

                {/* Divider arrow */}
                <div className="chaos-divider">
                  <div className="divider-arrow-line"></div>
                  <span className="divider-arrow-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                </div>

                {/* RIGHT: Structure */}
                <div className={`structure-side ${isStructured ? 'fade-in' : 'fade-out'}`}>
                  <div className="structure-label">After</div>
                  <div className="struct-ladder">
                    <div className="struct-line"></div>
                    {[1, 2, 3, 4].map(i => (
                      <motion.div key={`step-${i}`} className="struct-step"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: isStructured ? 1 : 0, opacity: isStructured ? 1 : 0 }}
                        transition={{ delay: isStructured ? i * 0.12 + 0.2 : 0, type: 'spring', stiffness: 300 }}>
                        <div className={`struct-dot ${i <= 2 ? 'done' : ''}`}>
                          {i <= 2 ? <CheckIcon /> : i}
                        </div>
                        <span className="struct-text">Module {i}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-content">
              <h3>Goodbye, Tutorial Hell</h3>
              <p>Stop jumping between random videos. Get a singular, logical sequence from Day 1 to Week 24.</p>
            </div>
          </div>

          {/* ====== Master Visual Card ====== */}
          <div
            className="bento-card card-master highlight-card"
            ref={masterRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` }}
          >
            <div className="master-3d-container">
              <div className="pulse-header"><h4>Live Workspace Preview</h4></div>

              <div className="pulse-timeline-container">
                <div className="stem-line">
                  <motion.div className="stem-progress" animate={{ height: `${activeWeekIndex >= 0 ? (activeWeekIndex / 4) * 100 : 0}%` }} transition={{ duration: 0.6, ease: 'easeInOut' }} />
                </div>

                <div className="pulse-nodes">
                  {weeksData.map((week, index) => {
                    const status = activeWeekIndex < 0 ? 'future' : (index < activeWeekIndex ? 'past' : (index === activeWeekIndex ? 'present' : 'future'));
                    return (
                      <div key={week.num} className={`pulse-row ${status}`}>
                        <div className="pulse-node-wrapper">
                          <div className={`pulse-node ${status}`}>
                            {status === 'past' && <CheckIcon />}
                            {status === 'future' && <LockIcon />}
                          </div>
                          {status === 'present' && <div className="node-glow"></div>}
                        </div>
                        <div className="pulse-info">
                          <span className="week-label">Week {week.num}</span>
                          <span className="week-title">{week.title}</span>
                          <AnimatePresence>
                            {status === 'present' && week.isTooltip && (
                              <motion.div className="pulse-tooltip"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                <div className="tooltip-header">Current Objective</div>
                                <div className="tooltip-task"><div className="checkbox-empty"></div><span>{week.task}</span></div>
                                <div className="tooltip-resource"><PlayIcon /> <span>{week.resource}</span></div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="fade-overlay-bottom"></div>
              </div>
            </div>
          </div>

          {/* ====== Card 3: Visual Momentum ====== */}
          <div className="bento-card card-momentum glass-card">
            <div className="card-visual">
              <div className="radar-3d-wrapper">
                <svg viewBox="-10 -10 120 120" className="radar-svg" style={{ overflow: 'visible' }}>
                  {/* Web grid */}
                  <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <polygon points="50,37 63,50 50,63 37,50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                  {/* Before polygon (dimmed) */}
                  <polygon className="radar-before" points="50,38 62,50 50,60 40,50" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
                  {/* Current polygon (animated) */}
                  <polygon className="radar-shape" points="50,18 82,50 50,72 28,50" fill="rgba(79, 70, 229, 0.2)" stroke="var(--accent-color)" strokeWidth="2" strokeLinejoin="round" />

                  {/* Corner dots */}
                  <circle cx="50" cy="18" r="3" fill="var(--accent-color)" className="radar-dot" />
                  <circle cx="82" cy="50" r="3" fill="var(--accent-color)" className="radar-dot" />
                  <circle cx="50" cy="72" r="3" fill="var(--accent-color)" className="radar-dot" />
                  <circle cx="28" cy="50" r="3" fill="var(--accent-color)" className="radar-dot" />

                  {/* Labels */}
                  <text x="50" y="2" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">React</text>
                  <text x="100" y="52" fill="var(--text-secondary)" fontSize="7" textAnchor="start">Logic</text>
                  <text x="50" y="100" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Speed</text>
                  <text x="0" y="52" fill="var(--text-secondary)" fontSize="7" textAnchor="end">Figma</text>
                </svg>
                <div className="radar-growth-badge">
                  <span className="growth-num">78%</span>
                  <span className="growth-label">Growth</span>
                </div>
              </div>
            </div>
            <div className="card-content">
              <h3>Visual Momentum</h3>
              <p>Track your evolution. Seeing how far you've come is the best way to ensure you don't stop.</p>
            </div>
          </div>

          {/* ====== Card 4: Real-World Deadlines ====== */}
          <div className="bento-card card-deadline glass-card" ref={gaugeRef}>
            <div className="card-visual">
              <div className="gauge-visual">
                <div className="gauge-weeks-label">24 WEEKS</div>
                <svg viewBox="0 0 120 70" className="gauge-svg">
                  {/* Tick marks */}
                  {Array.from({ length: 25 }, (_, i) => {
                    const angle = Math.PI + (i / 24) * Math.PI;
                    const x1 = 60 + 52 * Math.cos(angle);
                    const y1 = 62 + 52 * Math.sin(angle);
                    const x2 = 60 + (i % 6 === 0 ? 46 : 49) * Math.cos(angle);
                    const y2 = 62 + (i % 6 === 0 ? 46 : 49) * Math.sin(angle);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i <= (gaugeProgress / 100) * 24 ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'} strokeWidth={i % 6 === 0 ? 1.5 : 0.8} strokeLinecap="round" />;
                  })}
                  {/* Background arc */}
                  <path d={`M ${60 - gaugeRadius} 62 A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${60 + gaugeRadius} 62`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
                  {/* Progress arc */}
                  <path d={`M ${60 - gaugeRadius} 62 A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${60 + gaugeRadius} 62`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={gaugeCircumference} strokeDashoffset={gaugeCircumference - gaugeFill}
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  <defs><linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--accent-color)" /><stop offset="100%" stopColor="var(--accent-orange)" /></linearGradient></defs>
                  {/* Current week marker */}
                  {(() => {
                    const markerAngle = Math.PI + (gaugeProgress / 100) * Math.PI;
                    const mx = 60 + gaugeRadius * Math.cos(markerAngle);
                    const my = 62 + gaugeRadius * Math.sin(markerAngle);
                    return <circle cx={mx} cy={my} r="4" fill="var(--accent-orange)" style={{ transition: 'cx 1.5s, cy 1.5s', filter: 'drop-shadow(0 0 6px var(--accent-orange))' }} />;
                  })()}
                  {/* Week labels */}
                  <text x="5" y="68" fill="var(--text-muted)" fontSize="6" textAnchor="start">Week 1</text>
                  <text x="115" y="68" fill="var(--text-muted)" fontSize="6" textAnchor="end">Week 24</text>
                  {/* Center text */}
                  <text x="60" y="55" fill="#fff" fontSize="14" fontWeight="700" textAnchor="middle">Week 14</text>
                  <text x="60" y="63" fill="var(--text-secondary)" fontSize="6" textAnchor="middle">Current Progress</text>
                </svg>
              </div>
            </div>
            <div className="card-content">
              <h3>Real-World Deadlines</h3>
              <p>A weekly structure designed to be realistic. We don't just give you a list; we give you a timeline.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyCareerWeave;
