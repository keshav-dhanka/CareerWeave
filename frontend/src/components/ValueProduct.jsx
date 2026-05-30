import React, { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useAnimation } from 'framer-motion';
import './ValueProduct.css';

// Register the GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// --- VISUAL COMPONENTS (Preserved from original) ---

const sequenceData = [
  {
    type: 'realistic',
    inputLabel: 'PYTHON',
    targetLabel: 'BACKEND DEV',
    inputIcon: <path d="M12 18L6 12L12 6 M20 6L26 12L20 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    targetIcon: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="8" y="6" width="16" height="4" rx="1" /><rect x="8" y="14" width="16" height="4" rx="1" /><rect x="8" y="22" width="16" height="4" rx="1" /></g>
  },
  {
    type: 'impossible',
    inputLabel: 'PHOTOGRAPHY',
    targetLabel: 'CYBERSECURITY',
    inputIcon: <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="10" width="20" height="14" rx="2" /><circle cx="16" cy="17" r="4" /><path d="M10 10V8h4l2-2h4l2 2h4v2" /></g>,
    targetIcon: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4L4 9V16C4 21.5 9.5 26.5 16 28C22.5 26.5 28 21.5 28 16V9L16 4Z" /></g>
  },
  {
    type: 'realistic',
    inputLabel: 'WIREFRAMES',
    targetLabel: 'UI DESIGNER',
    inputIcon: <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="8" height="8" rx="1" /><rect x="18" y="6" width="8" height="8" rx="1" /><rect x="6" y="18" width="20" height="8" rx="1" /></g>,
    targetIcon: <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="6" width="24" height="16" rx="2" /><path d="M4 12H28 M16 22V26 M10 26H22" strokeLinecap="round" strokeLinejoin="round" /></g>
  },
  {
    type: 'impossible',
    inputLabel: 'SINGING',
    targetLabel: 'AI ENGINEER',
    inputIcon: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 5a3 3 0 00-3 3v8a3 3 0 006 0V8a3 3 0 00-3-3z" /><path d="M23 11v1a7 7 0 01-14 0v-1M16 23v4M12 27h8" /></g>,
    targetIcon: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="16" r="6" /><path d="M16 4V10M16 22V28M4 16H10M22 16H28" /><path d="M8 8l4 4M20 20l4 4M8 24l4-4M20 12l4-4" /></g>
  }
];

const DustParticles = ({ shattered }) => {
  const particles = useMemo(() => {
    return [...Array(12)].map(() => ({
      r: Math.random() * 3 + 1,
      targetX: 160 + (Math.random() - 0.5) * 100,
      targetY: 150 + (Math.random() - 0.5) * 100
    }));
  }, []);

  return (
    <>
      {particles.map((p, i) => (
        <motion.circle
          key={i}
          className="dust-particle"
          r={p.r}
          initial={{ cx: 160, cy: 150, opacity: 1 }}
          animate={{
            cx: p.targetX,
            cy: p.targetY,
            opacity: 0
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </>
  );
};

const KineticLogicGate = () => {
  const [step, setStep] = useState(0);
  const [visibleStep, setVisibleStep] = useState(0);
  const particleControls = useAnimation();
  const solidPathControls = useAnimation();
  const tooltipControls = useAnimation();
  const [gateClass, setGateClass] = useState('');
  const [targetGlow, setTargetGlow] = useState(false);
  const [shattered, setShattered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const runAnimation = async () => {
      setGateClass('');
      setTargetGlow(false);
      setShattered(false);
      await tooltipControls.start({ opacity: 0, transition: { duration: 0 } });
      if (!isMounted) return;
      setVisibleStep(step);
      await Promise.all([
        particleControls.start({ x: 0, opacity: 1, scale: 1, transition: { duration: 0 } }),
        solidPathControls.start({ pathLength: 0, transition: { duration: 0 } })
      ]);
      const data = sequenceData[step];
      await new Promise(r => setTimeout(r, 600));
      await particleControls.start({ x: 120, transition: { duration: 1.2, ease: "linear" } });
      if (!isMounted) return;
      if (data.type === 'realistic') {
        setGateClass('pulse-orange');
        particleControls.start({ x: 180, opacity: 0, scale: 0.8, transition: { duration: 0.6, ease: "linear" } });
        await solidPathControls.start({ pathLength: 1, transition: { duration: 1.2, ease: "easeOut" } });
        setTargetGlow(true);
        await tooltipControls.start({ opacity: 1, y: 0, transition: { duration: 0.3 } });
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 1500));
      } else {
        setGateClass('pulse-red');
        setShattered(true);
        particleControls.start({ opacity: 0, scale: 0.2, transition: { duration: 0.2 } });
        await tooltipControls.start({ opacity: 1, y: 0, transition: { duration: 0.3 } });
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 2200));
      }
      if (isMounted) setStep(s => (s + 1) % sequenceData.length);
    };
    runAnimation();
    return () => { isMounted = false; };
  }, [step, particleControls, solidPathControls, tooltipControls]);

  const currentData = sequenceData[visibleStep];

  return (
    <div className="visual-container kinetic-gate-container">
      <svg viewBox="0 0 400 300" className="kinetic-svg">
        <path className="timeline-path dashed" d="M 40 150 L 170 150" />
        <path className="timeline-path dashed" d="M 235 150 L 360 150" />
        <motion.path
          className="timeline-path solid"
          d="M 235 150 L 360 150"
          initial={{ pathLength: 0 }}
          animate={solidPathControls}
        />
        <polygon
          className={`gate-hexagon ${gateClass}`}
          points="200,110 235,130 235,170 200,190 165,170 165,130"
        />
        <text x="200" y="154" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle" letterSpacing="2">LLM</text>
        <g transform="translate(360, 150)">
          <circle r="20" className={`target-circle ${targetGlow ? 'target-glow' : ''}`} />
          <g transform="translate(-16, -16)" className={targetGlow ? 'target-glow' : ''}>
            {currentData.targetIcon}
          </g>
          <text y="35" className="particle-label">{currentData.targetLabel}</text>
        </g>
        <motion.g animate={particleControls}>
          {!shattered && (
            <g transform="translate(40, 150)">
              <circle r="20" className="particle-circle" />
              <g transform="translate(-16, -16)" fill="none" stroke="currentColor">
                {currentData.inputIcon}
              </g>
              <text y="35" className="particle-label">{currentData.inputLabel}</text>
            </g>
          )}
        </motion.g>
        {shattered && (
          <DustParticles shattered={shattered} />
        )}
      </svg>
      <motion.div
        className={`feasibility-tooltip ${currentData.type === 'realistic' ? 'tooltip-success' : 'tooltip-error'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={tooltipControls}
      >
        {currentData.type === 'realistic' ? (
          <>
            <span style={{ color: '#fff' }}>SUCCESS:</span> 24-WEEK PATH OPTIMIZED.
          </>
        ) : (
          <>
            <span style={{ color: '#fff' }}>ERROR:</span> PATH &gt; 24 WEEKS. BLOCKED.
          </>
        )}
      </motion.div>
    </div>
  );
};

const weekData = [
  {
    id: 1,
    title: "Core Foundations",
    hours: "12h",
    details: ["Complete syntax modules", "3 Docs, 1 Video included"]
  },
  {
    id: 2,
    title: "Data Structures & Logic",
    hours: "18h",
    details: ["Master Array logic", "Implement Hash Maps", "5 Practice problems"]
  },
  {
    id: 3,
    title: "Advanced Project Build",
    hours: "24h",
    details: ["System architecture setup", "API integration", "Performance profiling"]
  }
];

const FogOfProgress = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      setIsCompleting(true);
      await new Promise(r => setTimeout(r, 400));
      setIsCompleting(false);
      setActiveStep(prev => (prev + 1) % weekData.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="visual-container fog-visual-container">
      <div className="timeline-wrapper">
        <div className="timeline-svg-col">
          <svg width="32" height="100%" viewBox="0 0 32 300" preserveAspectRatio="none">
            <line x1="16" y1="20" x2="16" y2="280" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
            <motion.line
              x1="16" y1="20" x2="16" y2={40 + (activeStep * 100)}
              stroke="var(--accent-orange)"
              strokeWidth="3"
              transition={{ duration: 0.3 }}
            />
            {weekData.map((_, i) => (
              <React.Fragment key={i}>
                <motion.circle
                  cx="16" cy={40 + (i * 100)} r={i === activeStep ? 8 : 6}
                  fill={i <= activeStep ? (i === activeStep ? "#1e293b" : "var(--accent-orange)") : "#0f172a"}
                  stroke={i <= activeStep ? "var(--accent-orange)" : "rgba(255,255,255,0.2)"}
                  strokeWidth="2"
                  animate={{ r: i === activeStep ? 8 : 6 }}
                />
                {i === activeStep && (
                  <motion.circle
                    cx="16" cy={40 + (i * 100)} r="4"
                    fill="var(--accent-orange)"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </React.Fragment>
            ))}
          </svg>
        </div>
        <div className="fog-cards-col">
          <motion.div
            className="fog-cards-slider"
            animate={{ y: -(activeStep * 110) }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            {weekData.map((week, i) => {
              const isActive = i === activeStep;
              const isLocked = i > activeStep;
              const isDone = i < activeStep;
              const showingFlash = isActive && isCompleting;
              return (
                <motion.div
                  key={week.id}
                  className={`fog-card ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${showingFlash ? 'completed-flash' : ''}`}
                  animate={{
                    opacity: isDone ? 0.3 : (isLocked ? 0.5 : 1),
                    scale: isActive ? 1 : 0.95,
                    filter: isLocked ? 'blur(1.5px)' : 'blur(0px)'
                  }}
                >
                  {showingFlash && (
                    <motion.div
                      className="completed-message"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      COMPLETED
                    </motion.div>
                  )}
                  <div className="fog-card-header">
                    <span className="fog-week-badge">Week {week.id}</span>
                    <span className="fog-est-hours">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                      {week.hours}
                    </span>
                  </div>
                  <h4 className="fog-title">{week.title}</h4>
                  {isActive && (
                    <motion.div
                      className="fog-details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {week.details.map((detail, idx) => (
                        <div key={idx} className="fog-detail-row">
                          <svg className="fog-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
      <motion.div
        className="atmospheric-fog"
        animate={{ y: [-5, 5, -5], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
    </div>
  );
};

const JumpStartPath = () => {
  return (
    <div className="visual-container jumpstart-container">
      <div style={{ position: 'relative', width: '100%', maxWidth: '31.25rem', aspectRatio: '5/2' }}>
        <svg viewBox="0 0 500 200" className="jumpstart-svg">
          <motion.path
            d="M 50 160 L 450 160"
            className="generic-path"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          {[50, 150].map((x, i) => (
            <motion.circle
              key={i} cx={`${x}`} cy="160" r="8" className="ghost-node"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 200 }}
            />
          ))}
          <motion.path
            d="M 250 160 Q 300 80 350 80 L 450 80"
            className="weave-path"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
          />
          <motion.circle
            cx="250" cy="160" r="14"
            className="current-node-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
            transition={{
              scale: { delay: 0.4, duration: 2, repeat: Infinity, ease: "easeOut" },
              opacity: { delay: 0.4, duration: 2, repeat: Infinity, ease: "easeOut" },
              default: { duration: 2, repeat: Infinity }
            }}
          />
          <motion.circle
            cx="250" cy="160" r="8"
            className="current-node"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          />
          {[350, 450].map((x, i) => (
            <motion.circle
              key={i} cx={`${x}`} cy="80" r={i === 1 ? "10" : "8"}
              className={`target-node ${i === 1 ? 'final' : ''}`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 1.2 + (i * 0.3), type: "spring", stiffness: 200 }}
            />
          ))}
        </svg>
        <div className="skip-labels">
          <motion.span
            className="jumpstart-badge skipped"
            style={{ left: '10%', bottom: '0%' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >Skipped</motion.span>
          <motion.span
            className="jumpstart-badge skipped"
            style={{ left: '30%', bottom: '0%' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >Skipped</motion.span>
          <motion.span
            className="jumpstart-badge current"
            style={{ left: '50%', top: '60%' }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >You Are Here</motion.span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const ValueProduct = ({ onCTAClick }) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const cards = cardsRef.current;
      const spacer = 40; // The tiny gap between stacked card tops

      cards.forEach((card, index) => {
        // 1. This pins the card so it stays stuck at the top
        const isLast = index === cards.length - 1;
        ScrollTrigger.create({
          trigger: card,
          start: `top-=${index * spacer} 15%`,
          endTrigger: containerRef.current,
          end: `bottom bottom`, // All cards unpin at the exact same moment
          pin: true,
          pinSpacing: isLast, // Only the last card pushes the CTA down
          invalidateOnRefresh: true,
        });

        // 2. This makes the background cards blur only when the NEXT card starts to overlap
        if (index < cards.length - 1) {
          const nextCard = cards[index + 1];
          gsap.to(card, {
            scrollTrigger: {
              trigger: nextCard,
              start: "top 80%", // Starts blurring when next card enters screen
              end: "top 20%",   // Fully blurred when next card reaches center
              scrub: true,
            },
            filter: "blur(4px)",
            scale: 0.94,
            opacity: 0.5,
            ease: "none"
          });
        }
      });
    }, containerRef);

    return () => context.revert();
  }, []);

  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pillars = [
    {
      title: "Realistic Ambition, Not Just Dreams.",
      copy: "We don’t just tell you what you want to hear. Our system ensures your goals are achievable, blocking impossible jumps and providing an honest path to success.",
      visual: KineticLogicGate
    },
    {
      title: "One Step at a Time.",
      copy: "Stop worrying about Week 20 when you’re on Week 1. We hide the noise and only unlock your next milestone when you’re ready to conquer it.",
      visual: FogOfProgress
    },
    {
      title: "Built Around Your \"Gap.\"",
      copy: "We don’t give you a generic course. We analyze exactly what skills you're missing and weave a custom curriculum to fill those gaps—and nothing else.",
      visual: JumpStartPath
    }
  ];

  return (
    <section className="value-product-section" id="value-product" ref={containerRef}>
      {/* Background Particle Gradient */}
      <div className="particle-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      <div className="product-header">
        <h2 className="section-heading">
          <span>A{' '}</span>
          <span className="highlight-wrapper">
            <span>Clear Path,</span>
            <svg className="handdrawn-line" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M 5,15 Q 50,5 100,12 T 195,10" stroke="var(--accent-orange)" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
          </span> Designed{' '}
          <span className="gradient-highlight">Just For You</span>
        </h2>
        <p className="section-subheading">
          CareerWeave turns your goals and current skills into a clear, step-by-step roadmap you can actually follow. No more "what-ifs," just what's next.
        </p>
      </div>

      <div className="stacking-container">
        {pillars.map((pillar, i) => (
          <div
            key={i}
            className="pillar-card"
            ref={el => cardsRef.current[i] = el}
          >
            <div className="card-grid">
              <div className="pillar-content">
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-copy">{pillar.copy}</p>
              </div>
              <div className="visual-wrapper">
                <pillar.visual />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: '3.125em', fontSize: '1.25em' }}><h1>React Crash</h1><pre>{this.state.error.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

const ValueProductWithBoundary = () => (
  <ErrorBoundary>
    <ValueProduct />
  </ErrorBoundary>
);

export default ValueProductWithBoundary;