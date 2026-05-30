import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './LoadingScreen.css';
import { brainPathsData } from '../Steps';
import {
  CareerWeaveLogo, YouTubeIcon, GitHubIcon, CourseraIcon,
  EdXIcon, LinkedInIcon, MITIcon
} from '../ResourceCloud';

gsap.registerPlugin(MotionPathPlugin);

const LoadingAnalysisVisual = () => {
  const containerRef = useRef(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const keywords = useMemo(() => [
    { id: 1, label: "Core", color: "var(--accent-orange, #ff6b4a)", delay: 0 },
    { id: 2, label: "Target", color: "var(--accent-color, #4f46e5)", delay: 1.0 },
    { id: 3, label: "Outcome", color: "#4ade80", delay: 2.0 },
    { id: 4, label: "Tool", color: "var(--accent-orange, #ff6b4a)", delay: 3.0 },
    { id: 5, label: "Skill", color: "var(--accent-color, #4f46e5)", delay: 4.0 }
  ], []);

  const paths = useMemo(() => {
    return keywords.map(() => {
      const startX = -20;
      const startY = Math.random() * 40 + 30; // 30-70% height
      const cp1x = Math.random() * 30 + 10;
      const cp1y = Math.random() * 80 + 10;
      const cp2x = Math.random() * 30 + 50;
      const cp2y = Math.random() * 80 + 10;
      const endX = 75; // Right before the center of the brain
      const endY = 50; // Exact vertical center
      return `M ${startX} ${startY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${endX} ${endY}`;
    });
  }, [keywords]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      keywords.forEach((b, idx) => {
        const badgeSelector = `.ls-moving-badge-${b.id}`;
        const pathSelector = `#ls-path-${b.id}`;

        // Use a continuous timeline for each badge
        const tl = gsap.timeline({ repeat: -1, repeatDelay: Math.random() * 1.5 + 0.5, delay: b.delay });

        // Initial setup
        tl.set(badgeSelector, { opacity: 0, scale: 0.8 });

        // Fade in quickly
        tl.to(badgeSelector, { opacity: 1, scale: 1, duration: 0.3 }, 0);

        // Move along path
        tl.to(badgeSelector, {
          motionPath: {
            path: pathSelector,
            align: pathSelector,
            alignOrigin: [0.5, 0.5],
            autoRotate: false
          },
          duration: 2.0,
          ease: "power1.inOut"
        }, 0);

        // Fade out right before the end
        tl.to(badgeSelector, { opacity: 0, scale: 0.5, duration: 0.3 }, 1.7);

        // Trigger pulse on the first iteration
        tl.call(() => setIsPulsing(true), [], 2.0);
      });
    }, containerRef);

    return () => ctx.revert();
  }, [keywords, paths]);

  return (
    <div ref={containerRef} className="ls-semantic-box ls-visual-container ls-analysis-container">

      {/* SVG Canvas for paths */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="ls-analysis-svg-canvas">
        {paths.map((d, i) => (
          <path key={`path-bg-${i}`} id={`ls-path-${keywords[i].id}`} d={d} fill="none" stroke="transparent" strokeWidth="2" />
        ))}
        {paths.map((d, i) => (
          <motion.path
            key={`pulse-path-${i}`}
            d={d}
            fill="none"
            stroke={keywords[i].color}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.8, 0] }}
            transition={{ duration: 2.0, delay: keywords[i].delay, ease: "easeInOut", repeat: Infinity, repeatDelay: Math.random() * 1.5 + 0.5 }}
            style={{ filter: `drop-shadow(0 0 4px ${keywords[i].color})` }}
          />
        ))}
      </svg>

      {/* Badges coming from the left */}
      {keywords.map((b) => (
        <div
          key={`badge-pill-${b.id}`}
          className={`ls-moving-badge-${b.id} ls-semantic-pill ls-badge-base`}
          style={{
            border: `1px solid ${b.color}40`,
            background: `${b.color}15`,
            boxShadow: `0 0 0.625rem ${b.color}30`
          }}
        >
          <span className="ls-pill-label" style={{ color: b.color }}>{b.label}:</span>
          <span className="ls-pill-term">
            <div className="skeleton-word" style={{ width: '2.5rem', backgroundColor: b.color }} />
          </span>
        </div>
      ))}

      {/* LLM Brain Section (Right, Enlarged) */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: "-50%" }}
        animate={{ opacity: 1, x: 0, y: "-50%" }}
        transition={{ duration: 0.8 }}
        className="ls-brain-container"
      >
        <svg viewBox="0 0 1200 1000" className="ls-brain-svg">
          {/* Centering wrapper for the brain paths */}
          <g transform="translate(0, 0)">
            <motion.g
              animate={isPulsing ? {
                filter: ['drop-shadow(0 0 10px var(--accent-orange))', 'drop-shadow(0 0 30px var(--accent-orange))', 'drop-shadow(0 0 10px var(--accent-orange))'],
                scale: [1, 1.05, 1], // softer scale
              } : {
                filter: 'drop-shadow(0 0 0px transparent)',
                scale: 1
              }}
              transition={{ duration: 2, ease: "easeInOut", repeat: isPulsing ? Infinity : 0 }} // Smooth 2s breathing
              style={{ transformOrigin: 'center center' }}
            >
              {brainPathsData.map((path, idx) => (
                <motion.path
                  key={idx}
                  d={path.d}
                  fill={path.fill || "none"}
                  stroke={isPulsing ? "var(--accent-orange)" : (path.stroke || "var(--text-secondary)")}
                  strokeWidth={isPulsing ? 8 : (path.strokeWidth || 4)}
                  strokeLinecap={path.strokeLinecap}
                  strokeLinejoin={path.strokeLinejoin}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: isPulsing ? [0.4, 0.9, 0.4] : [0.2, 0.5, 0.2] }} // smoother opacity range
                  transition={{
                    duration: isPulsing ? 1.5 + Math.random() : 2 + Math.random() * 2,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                />
              ))}
            </motion.g>
          </g>
        </svg>
        <span className="ls-brain-text" style={{
          color: isPulsing ? 'var(--accent-orange)' : 'rgba(255,255,255,0.7)'
        }}>
          {isPulsing ? 'ANALYZING...' : 'CAREERWEAVE LLM'}
        </span>
      </motion.div>

    </div>
  );
};

const LoadingSkeletonAnimation = () => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTags, setShowTags] = useState(false);

  const skeletonParagraph = [
    { id: 1, width: '20%', line: 1 },
    { id: 2, width: '30%', line: 1 },
    { id: 3, width: '15%', line: 1, isKeyword: true, color: 'var(--accent-orange, #ff6b4a)' },
    { id: 4, width: '25%', line: 1 },

    { id: 5, width: '40%', line: 2 },
    { id: 6, width: '20%', line: 2, isKeyword: true, color: 'var(--accent-color, #4f46e5)' },
    { id: 7, width: '15%', line: 2 },

    { id: 8, width: '25%', line: 3 },
    { id: 9, width: '15%', line: 3 },
    { id: 10, width: '30%', line: 3, isKeyword: true, color: 'var(--accent-orange, #ff6b4a)' },
  ];

  const keywords = [
    { id: 1, label: "Core", color: "var(--accent-orange, #ff6b4a)" },
    { id: 2, label: "Target", color: "var(--accent-color, #4f46e5)" },
    { id: 3, label: "Outcome", color: "var(--accent-orange, #ff6b4a)" }
  ];

  useEffect(() => {
    let timer;
    if (visibleCount < skeletonParagraph.length) {
      timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, 400); // Slower typing speed (was 150)
    } else if (!showTags) {
      timer = setTimeout(() => setShowTags(true), 1200);
    }
    return () => clearTimeout(timer);
  }, [visibleCount, showTags]);

  const renderLine = (lineNum) => {
    const blocksInLine = skeletonParagraph.filter(p => p.line === lineNum);
    return (
      <div className="skeleton-line" key={lineNum}>
        {visibleCount === 0 && lineNum === 1 && (
          <motion.span
            className="ls-typing-cursor"
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
        {blocksInLine.map((block) => {
          const isVisible = block.id <= visibleCount;
          return (
            <React.Fragment key={block.id}>
              {isVisible && (
                <motion.div
                  className="skeleton-word"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{
                    opacity: 1,
                    scaleX: 1,
                    backgroundColor: showTags && block.isKeyword ? block.color : 'rgba(255,255,255,0.1)'
                  }}
                  transition={{
                    opacity: { duration: 0.1 },
                    scaleX: { duration: 0.2 },
                    backgroundColor: { duration: 0.5 }
                  }}
                  style={{ width: block.width, transformOrigin: 'left' }}
                />
              )}
              {block.id === visibleCount && visibleCount < skeletonParagraph.length && (
                <motion.span
                  className="ls-typing-cursor"
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="ls-semantic-box">
      <div className="ls-sleek-input">
        {renderLine(1)}
        {renderLine(2)}
        {renderLine(3)}
      </div>

      <div className="ls-detected-tags-container">
        <AnimatePresence>
          {showTags && keywords.map((tag) => (
            <motion.div
              key={tag.id}
              className="ls-semantic-pill"
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <span className="ls-pill-label">{tag.label}:</span>
              <span className="ls-pill-term">
                <div className="skeleton-word" style={{ width: '2.5rem', backgroundColor: tag.color }} />
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const LoadingScreen = ({ isComplete, onFinish }) => {
  const [activeVisual, setActiveVisual] = useState('skeleton');
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [loadingText, setLoadingText] = useState("Recruiter Pass: Analyzing your profile, background and skills...");
  const textRef = useRef("Recruiter Pass: Analyzing your profile, background and skills...");

  useEffect(() => {
    const visualTimer1 = setTimeout(() => {
      setActiveVisual('gate');
    }, 7000); // 7s for skeleton

    const visualTimer2 = setTimeout(() => {
      setActiveVisual('weaving');
    }, 14000); // next 7s for gate, then weaving

    const visualTimer3 = setTimeout(() => {
      setActiveVisual('roadmap');
    }, 21000); // next 7s for weaving, then roadmap

    const visualTimer4 = setTimeout(() => {
      setActiveVisual('resources');
    }, 35000); // next 14s for roadmap, then resources

    const visualTimer5 = setTimeout(() => {
      setActiveVisual('polishing');
    }, 42000); // next 7s for resources, then polishing

    const visualTimer6 = setTimeout(() => {
      setActiveVisual('delay');
    }, 72000); // next 30s for polishing, then delay visual

    return () => {
      clearTimeout(visualTimer1);
      clearTimeout(visualTimer2);
      clearTimeout(visualTimer3);
      clearTimeout(visualTimer4);
      clearTimeout(visualTimer5);
      clearTimeout(visualTimer6);
    };
  }, []);


  // Progress Bar Logic
  useEffect(() => {
    let startTime = Date.now();
    let animationFrame;

    const animateProgress = () => {
      if (isComplete) {
        setProgress(100);
        return;
      }

      const elapsed = Date.now() - startTime;
      let currentProgress = 0;

      // Asymptotic Curve Logic stretched to support a 72-second sequence gracefully
      if (elapsed <= 5000) {
        // 0 to 5s: 0% -> 40%
        currentProgress = (elapsed / 5000) * 40;
      } else if (elapsed <= 42000) {
        // 5s to 42s (37s duration): 40% -> 80%
        currentProgress = 40 + ((elapsed - 5000) / 37000) * 40;
      } else if (elapsed <= 72000) {
        // 42s to 72s (30s duration): 80% -> 96%
        currentProgress = 80 + ((elapsed - 42000) / 30000) * 16;
      } else {
        // > 72s: Slowly approach 99%
        currentProgress = 96 + Math.min(3, ((elapsed - 72000) / 30000) * 3);
      }

      setProgress(currentProgress);

      // Text Logic
      const seconds = Math.floor(elapsed / 1000);
      let newText = "";
      if (seconds < 7) newText = "Recruiter Pass: Analyzing your profile, background and skills...";
      else if (seconds < 14) newText = "Feasibility Gate: Evaluating career transition realism...";
      else if (seconds < 21) newText = "Delta Analysis: Calculating semantic skill gaps...";
      else if (seconds < 28) newText = "Architect Pass: Structuring week-by-week deliverables....";
      else if (seconds < 35) newText = "Weaving weekly milestone components...";
      else if (seconds < 42) newText = "Curating 100% free high-quality learning resources...";
      else if (seconds < 72) {
        const weekNum = Math.floor((seconds - 42) / 3) + 1;
        newText = `Polishing milestones: Week ${Math.min(weekNum, 10)} locking resources...`;
      } else {
        newText = "We are taking slightly longer than usual. Hang tight, this is now finishing...";
      }

      if (textRef.current !== newText) {
        textRef.current = newText;
        setLoadingText(newText);
      }

      animationFrame = requestAnimationFrame(animateProgress);
    };

    animationFrame = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [isComplete]);

  // Handle completion snap and fade out
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      // Wait for the bar to visually snap to 100%
      const snapTimer = setTimeout(() => {
        setIsFadingOut(true);
        // Wait for fade out animation
        const fadeTimer = setTimeout(() => {
          if (onFinish) onFinish();
        }, 500); // 500ms fade out duration matching CSS
        return () => clearTimeout(fadeTimer);
      }, 400); // 400ms visual buffer
      return () => clearTimeout(snapTimer);
    }
  }, [isComplete, onFinish]);

  return (
    <div className={`ls-overlay ${isFadingOut ? 'ls-fade-out' : ''}`}>
      <div className="ls-card">
        {/* Dynamic Visual Container */}
        <div className="ls-animation-container" style={{ height: '16.3125rem' }}>
          <AnimatePresence mode="wait">
            {activeVisual === 'skeleton' && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%' }}
              >
                <LoadingSkeletonAnimation />
              </motion.div>
            )}

            {activeVisual === 'gate' && (
              <motion.div
                key="gate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%' }}
              >
                <LoadingAnalysisVisual />
              </motion.div>
            )}

            {activeVisual === 'weaving' && (
              <motion.div
                key="weaving"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%' }}
              >
                <LoadingRevolvingVisual />
              </motion.div>
            )}

            {activeVisual === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%' }}
              >
                <LoadingRoadmapVisual />
              </motion.div>
            )}

            {activeVisual === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%' }}
              >
                <LoadingResourceVisual />
              </motion.div>
            )}

            {activeVisual === 'polishing' && (
              <motion.div
                key="polishing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%' }}
              >
                <LoadingPolishingVisual />
              </motion.div>
            )}

            {activeVisual === 'delay' && (
              <motion.div
                key="delay"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <LoadingHourglassVisual />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rotating Text Module */}
        <div className="ls-text-module">
          <p key={loadingText} className="ls-stage-text">{loadingText}</p>
          <p className="ls-warning-text">
            Please do not close this tab, reload, or go back.
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="ls-progress-wrapper">
          <div className="ls-progress-stat">
            <span className="ls-progress-value">{Math.round(progress)}%</span>
          </div>
          <div className="ls-progress-container">
            <div
              className="ls-progress-bar"
              style={{ width: `${progress}%`, transition: isComplete ? 'width 0.3s ease-out' : 'none' }}
            >
              <div className="ls-progress-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingRevolvingVisual = () => {
  const containerRef = useRef(null);

  const keywords = useMemo(() => [
    { id: 1, label: "Module", color: "var(--accent-color, #4f46e5)" },
    { id: 2, label: "Concept", color: "var(--accent-orange, #ff6b4a)" },
    { id: 3, label: "Project", color: "#4ade80" },
    { id: 4, label: "Review", color: "var(--accent-orange, #ff6b4a)" },
    { id: 5, label: "Milestone", color: "var(--accent-color, #4f46e5)" },
    { id: 6, label: "Practice", color: "#4ade80" },
  ], []);

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.005, duration: 1.2, ease: "easeInOut" },
        opacity: { delay: i * 0.005, duration: 0.4 }
      }
    })
  };

  return (
    <div ref={containerRef} className="ls-semantic-box ls-visual-container ls-revolving-container">

      {/* Brain in the absolute center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        transition={{ duration: 0.8 }}
        className="ls-revolving-brain-container"
      >
        <svg viewBox="0 0 1200 1000" className="ls-brain-svg">
          <g transform="translate(0, 0)">
            <motion.g
              animate={{
                filter: ['drop-shadow(0 0 10px var(--accent-orange))', 'drop-shadow(0 0 30px var(--accent-orange))', 'drop-shadow(0 0 10px var(--accent-orange))'],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              style={{ transformOrigin: 'center center' }}
            >
              {brainPathsData.map((path, idx) => (
                <motion.path
                  key={idx}
                  d={path.d}
                  fill={path.fill || "none"}
                  stroke={"var(--accent-orange)"}
                  strokeWidth={8}
                  strokeLinecap={path.strokeLinecap}
                  strokeLinejoin={path.strokeLinejoin}
                  variants={pathVariants}
                  initial="hidden"
                  animate="visible"
                  custom={idx}
                />
              ))}
            </motion.g>
          </g>
        </svg>
        <span style={{
          position: 'absolute', bottom: '-1.25rem', fontSize: '0.625rem',
          color: 'var(--accent-orange)', opacity: 0.8, whiteSpace: 'nowrap',
          textTransform: 'uppercase', letterSpacing: '0.0625rem'
        }}></span>
      </motion.div>

      {/* Revolving Badges */}
      {keywords.map((b, i) => {
        const angleOffset = (i / keywords.length) * 360;
        return (
          <motion.div
            key={`rev-badge-wrapper-${b.id}`}
            className="ls-revolving-badge-wrapper"
            initial={{ rotate: angleOffset }}
            animate={{ rotate: angleOffset + 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="ls-semantic-pill"
              initial={{ opacity: 0, scale: 0, rotate: -angleOffset }}
              animate={{ opacity: 1, scale: 1, rotate: -(angleOffset + 360) }}
              transition={{
                opacity: { duration: 1, delay: i * 0.2 },
                scale: { duration: 1, delay: i * 0.2, type: "spring" },
                rotate: { duration: 15, repeat: Infinity, ease: "linear" }
              }}
              style={{
                position: 'absolute',
                left: '6.875rem', // Radius of revolution
                top: '-0.9375rem', // Center vertically relative to wrapper
                border: `1px solid ${b.color}40`,
                background: `${b.color}15`,
                boxShadow: `0 0 0.625rem ${b.color}30`,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span className="ls-pill-label" style={{ color: b.color, marginRight: '0.375em' }}>{b.label}:</span>
              <div className="skeleton-word" style={{ width: '1.875rem', backgroundColor: b.color }} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Helper Components for Interactive Threads
const useLsBezierPath = (sx, sy, tx, ty) => {
  const [path, setPath] = useState('');
  useEffect(() => {
    // Offset by roughly half the node width (42.5) and height (35) to anchor at center
    const update = () => {
      const x1 = sx.get() + 42.5;
      const y1 = sy.get() + 35;
      const x2 = tx.get() + 42.5;
      const y2 = ty.get() + 35;
      setPath(`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`);
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

const LsThreadPath = ({ sx, sy, tx, ty, color, delay }) => {
  const path = useLsBezierPath(sx, sy, tx, ty);
  return (
    <motion.path
      d={path}
      stroke={color}
      strokeWidth="2"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.5 }}
      transition={{ duration: 1.0, delay }}
    />
  );
};

const LoadingRoadmapVisual = () => {
  const containerRef = useRef(null);

  // Motion values to track each node's position for the dynamic SVG threads
  // Zig-zag pattern: top, bottom, top, bottom, top
  const n1x = useMotionValue(10); const n1y = useMotionValue(40);
  const n2x = useMotionValue(100); const n2y = useMotionValue(130);
  const n3x = useMotionValue(190); const n3y = useMotionValue(40);
  const n4x = useMotionValue(280); const n4y = useMotionValue(130);
  const n5x = useMotionValue(370); const n5y = useMotionValue(40);
  const n6x = useMotionValue(460); const n6y = useMotionValue(130);
  const n7x = useMotionValue(550); const n7y = useMotionValue(40);
  const n8x = useMotionValue(640); const n8y = useMotionValue(130);
  const n9x = useMotionValue(730); const n9y = useMotionValue(40);
  const n10x = useMotionValue(820); const n10y = useMotionValue(130);

  const nodes = [
    { id: 'w1', label: 'Week 1', color: 'var(--accent-orange)', x: n1x, y: n1y, delay: 0 },
    { id: 'w2', label: 'Week 2', color: 'var(--accent-color)', x: n2x, y: n2y, delay: 1.2 },
    { id: 'w3', label: 'Week 3', color: 'var(--accent-orange)', x: n3x, y: n3y, delay: 2.4 },
    { id: 'w4', label: 'Week 4', color: 'var(--accent-color)', x: n4x, y: n4y, delay: 3.6 },
    { id: 'w5', label: 'Week 5', color: 'var(--accent-orange)', x: n5x, y: n5y, delay: 4.8 },
    { id: 'w6', label: 'Week 6', color: 'var(--accent-color)', x: n6x, y: n6y, delay: 7.0 },
    { id: 'w7', label: 'Week 7', color: 'var(--accent-orange)', x: n7x, y: n7y, delay: 8.2 },
    { id: 'w8', label: 'Week 8', color: 'var(--accent-color)', x: n8x, y: n8y, delay: 9.4 },
    { id: 'w9', label: 'Week 9', color: 'var(--accent-orange)', x: n9x, y: n9y, delay: 10.6 },
    { id: 'w10', label: 'Week 10', color: 'var(--accent-color)', x: n10x, y: n10y, delay: 11.8 },
  ];

  return (
    <div ref={containerRef} className="ls-semantic-box" style={{ position: 'relative', overflow: 'hidden', minHeight: '16.3125rem', width: '100%' }}>

      <motion.div
        animate={{ x: [0, 0, -450] }}
        transition={{ times: [0, 0.5, 1], duration: 14, ease: "easeInOut" }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        {/* SVG Canvas for Threads */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, overflow: 'visible' }}>
          <LsThreadPath sx={n1x} sy={n1y} tx={n2x} ty={n2y} color="var(--accent-color)" delay={0.6} />
          <LsThreadPath sx={n2x} sy={n2y} tx={n3x} ty={n3y} color="var(--accent-orange)" delay={1.8} />
          <LsThreadPath sx={n3x} sy={n3y} tx={n4x} ty={n4y} color="var(--accent-color)" delay={3.0} />
          <LsThreadPath sx={n4x} sy={n4y} tx={n5x} ty={n5y} color="var(--accent-orange)" delay={4.2} />
          <LsThreadPath sx={n5x} sy={n5y} tx={n6x} ty={n6y} color="var(--accent-color)" delay={5.9} />
          <LsThreadPath sx={n6x} sy={n6y} tx={n7x} ty={n7y} color="var(--accent-orange)" delay={7.6} />
          <LsThreadPath sx={n7x} sy={n7y} tx={n8x} ty={n8y} color="var(--accent-color)" delay={8.8} />
          <LsThreadPath sx={n8x} sy={n8y} tx={n9x} ty={n9y} color="var(--accent-orange)" delay={10.0} />
          <LsThreadPath sx={n9x} sy={n9y} tx={n10x} ty={n10y} color="var(--accent-color)" delay={11.2} />
        </svg>

        {/* Draggable Glass Nodes */}
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: node.delay, type: "spring", bounce: 0.4 }}
            style={{ x: node.x, y: node.y, position: 'absolute', zIndex: 10 }}
            drag
            dragConstraints={containerRef}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1, zIndex: 20, cursor: 'grabbing' }}
          >
            {/* The structural card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${node.color}40`,
              borderRadius: '8px',
              padding: '0.75em 0.625em',
              width: '5.3125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5em',
              backdropFilter: 'blur(8px)',
              boxShadow: `0 0 0.625rem ${node.color}20`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25em' }}>
                <span style={{ fontSize: '0.6875rem', color: '#E2E8F0', fontWeight: '500' }}>{node.label}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375em' }}>
                <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
                <div style={{ width: '60%', height: '4px', borderRadius: '2px', background: node.color, opacity: 0.8 }} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <span style={{
        position: 'absolute', bottom: '0.9375rem', right: '1.25rem', fontSize: '0.625rem',
        color: 'var(--text-secondary)', opacity: 0.6, whiteSpace: 'nowrap',
        textTransform: 'uppercase', letterSpacing: '0.0625rem'
      }}></span>
    </div>
  );
};

const LoadingHourglassVisual = () => {
  const [cycle, setCycle] = useState(0);
  const [isFlowing, setIsFlowing] = useState(false);

  useEffect(() => {
    setIsFlowing(true);
    const interval = setInterval(() => {
      setIsFlowing(false);
      setCycle(c => c + 1);
      setTimeout(() => {
        setIsFlowing(true);
      }, 800); // Resume flowing after flip transition finishes
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const frameRotation = (cycle * 180) + 10;
  const isEven = cycle % 2 === 0;

  return (
    <div className="ls-hourglass-container">
      <motion.svg
        width="120"
        height="160"
        viewBox="0 0 120 160"
        animate={{ rotate: frameRotation }}
        transition={{ type: "spring", stiffness: 90, damping: 13 }}
        style={{ transformOrigin: "3.75rem 5rem", overflow: 'visible' }}
      >
        <defs>
          <pattern id="dust-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="var(--accent-orange)" opacity="0.8" />
            <circle cx="4" cy="4" r="1" fill="var(--accent-orange)" opacity="0.5" />
            <circle cx="1" cy="5" r="0.8" fill="var(--accent-orange)" opacity="0.3" />
          </pattern>
        </defs>

        {/* Sleek metallic/wood caps */}
        <rect x="20" y="10" width="80" height="8" rx="4" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <rect x="20" y="142" width="80" height="8" rx="4" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

        {/* Pillars */}
        <line x1="24" y1="18" x2="24" y2="142" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        <line x1="96" y1="18" x2="96" y2="142" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />

        {/* Outer glass bulbs */}
        <path d="M 30 18 Q 30 52, 57 77 C 58 78, 62 78, 63 77 Q 90 52, 90 18 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <path d="M 30 142 Q 30 108, 57 83 C 58 82, 62 82, 63 83 Q 90 108, 90 142 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

        {/* Dynamic Sand with Key to reset on each flip */}
        <motion.g key={cycle}>
          {/* Top Sand */}
          <motion.path
            d="M 32 20 L 88 20 C 88 42, 75 58, 60 74 C 45 58, 32 42, 32 20 Z"
            fill="url(#dust-pattern)"
            initial={{ scaleY: isEven ? 1 : 0 }}
            animate={isFlowing ? { scaleY: isEven ? 0 : 1 } : { scaleY: isEven ? 1 : 0 }}
            transition={{ duration: 4.0, ease: "linear" }}
            className="ls-sand-path"
            style={{ transformOrigin: isEven ? "3.75rem 4.625rem" : "3.75rem 1.25rem" }}
          />

          {/* Bottom Sand */}
          <motion.path
            d="M 32 140 L 88 140 C 88 118, 75 102, 60 86 C 45 102, 32 118, 32 140 Z"
            fill="url(#dust-pattern)"
            initial={{ scaleY: isEven ? 0 : 1 }}
            animate={isFlowing ? { scaleY: isEven ? 1 : 0 } : { scaleY: isEven ? 0 : 1 }}
            transition={{ duration: 4.0, ease: "linear" }}
            className="ls-sand-path"
            style={{ transformOrigin: isEven ? "3.75rem 8.75rem" : "3.75rem 5.375rem" }}
          />

          {/* Mound */}
          <motion.path
            d={isEven ? "M 46 140 L 74 140 L 60 115 Z" : "M 46 20 L 74 20 L 60 45 Z"}
            fill="url(#dust-pattern)"
            initial={{ scaleY: 0 }}
            animate={isFlowing ? { scaleY: [0, 1.2, 1] } : { scaleY: 0 }}
            transition={{ duration: 4.0, ease: "linear" }}
            className="ls-sand-mound"
            style={{ transformOrigin: isEven ? "3.75rem 8.75rem" : "3.75rem 1.25rem" }}
          />

          {/* Falling Dust Particles */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isFlowing ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i}
                cx={60 + (Math.random() * 4 - 2)}
                r={1.2}
                fill="var(--accent-orange)"
                animate={isFlowing ? {
                  cy: isEven ? [76, 136] : [84, 24],
                  opacity: [0, 1, 0]
                } : {}}
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + Math.random() * 0.2,
                  delay: i * 0.1,
                  ease: "linear"
                }}
                className="ls-falling-particle"
              />
            ))}
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
};

const LoadingPolishingVisual = () => {
  const containerRef = useRef(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWeekIndex(prev => {
        if (prev < 9) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const n1x = useMotionValue(10); const n1y = useMotionValue(40);
  const n2x = useMotionValue(100); const n2y = useMotionValue(130);
  const n3x = useMotionValue(190); const n3y = useMotionValue(40);
  const n4x = useMotionValue(280); const n4y = useMotionValue(130);
  const n5x = useMotionValue(370); const n5y = useMotionValue(40);
  const n6x = useMotionValue(460); const n6y = useMotionValue(130);
  const n7x = useMotionValue(550); const n7y = useMotionValue(40);
  const n8x = useMotionValue(640); const n8y = useMotionValue(130);
  const n9x = useMotionValue(730); const n9y = useMotionValue(40);
  const n10x = useMotionValue(820); const n10y = useMotionValue(130);

  const nodeXPositions = [10, 100, 190, 280, 370, 460, 550, 640, 730, 820];
  const targetX = Math.max(-460, Math.min(0, 180 - nodeXPositions[activeWeekIndex]));

  const nodes = [
    { id: 'w1', label: 'Week 1', defaultColor: 'var(--accent-orange)', x: n1x, y: n1y },
    { id: 'w2', label: 'Week 2', defaultColor: 'var(--accent-color)', x: n2x, y: n2y },
    { id: 'w3', label: 'Week 3', defaultColor: 'var(--accent-orange)', x: n3x, y: n3y },
    { id: 'w4', label: 'Week 4', defaultColor: 'var(--accent-color)', x: n4x, y: n4y },
    { id: 'w5', label: 'Week 5', defaultColor: 'var(--accent-orange)', x: n5x, y: n5y },
    { id: 'w6', label: 'Week 6', defaultColor: 'var(--accent-color)', x: n6x, y: n6y },
    { id: 'w7', label: 'Week 7', defaultColor: 'var(--accent-orange)', x: n7x, y: n7y },
    { id: 'w8', label: 'Week 8', defaultColor: 'var(--accent-color)', x: n8x, y: n8y },
    { id: 'w9', label: 'Week 9', defaultColor: 'var(--accent-orange)', x: n9x, y: n9y },
    { id: 'w10', label: 'Week 10', defaultColor: 'var(--accent-color)', x: n10x, y: n10y },
  ];

  return (
    <div ref={containerRef} className="ls-semantic-box ls-visual-container ls-revolving-container">
      <motion.div
        animate={{ x: targetX }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        {/* SVG Canvas for Threads */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, overflow: 'visible' }}>
          <LsThreadPath sx={n1x} sy={n1y} tx={n2x} ty={n2y} color="var(--accent-color)" delay={0} />
          <LsThreadPath sx={n2x} sy={n2y} tx={n3x} ty={n3y} color="var(--accent-orange)" delay={0} />
          <LsThreadPath sx={n3x} sy={n3y} tx={n4x} ty={n4y} color="var(--accent-color)" delay={0} />
          <LsThreadPath sx={n4x} sy={n4y} tx={n5x} ty={n5y} color="var(--accent-orange)" delay={0} />
          <LsThreadPath sx={n5x} sy={n5y} tx={n6x} ty={n6y} color="var(--accent-color)" delay={0} />
          <LsThreadPath sx={n6x} sy={n6y} tx={n7x} ty={n7y} color="var(--accent-orange)" delay={0} />
          <LsThreadPath sx={n7x} sy={n7y} tx={n8x} ty={n8y} color="var(--accent-color)" delay={0} />
          <LsThreadPath sx={n8x} sy={n8y} tx={n9x} ty={n9y} color="var(--accent-orange)" delay={0} />
          <LsThreadPath sx={n9x} sy={n9y} tx={n10x} ty={n10y} color="var(--accent-color)" delay={0} />
        </svg>

        {/* Nodes */}
        {nodes.map((node, idx) => {
          const isProcessed = idx < activeWeekIndex;
          const isProcessing = idx === activeWeekIndex;
          const isLocked = idx > 0 && isProcessed; // Weeks 2-10 lock when processed

          let cardBorder = 'rgba(255, 255, 255, 0.1)';
          let cardBg = 'rgba(255, 255, 255, 0.02)';
          let accentColor = '#94a3b8';

          if (isProcessing) {
            accentColor = 'var(--accent-orange)';
            cardBorder = 'var(--accent-orange)';
            cardBg = 'rgba(255, 107, 74, 0.05)';
          } else if (isProcessed) {
            if (idx === 0) {
              // Week 1 unlocked
              accentColor = 'var(--accent-orange)';
              cardBorder = 'var(--accent-orange)';
              cardBg = 'rgba(255, 107, 74, 0.05)';
            } else {
              // Week 2-10 locked
              accentColor = '#475569';
              cardBorder = 'rgba(71, 85, 105, 0.4)';
              cardBg = 'rgba(15, 23, 42, 0.6)';
            }
          }

          return (
            <motion.div
              key={node.id}
              style={{ x: node.x, y: node.y, position: 'absolute', zIndex: 10 }}
              animate={isProcessing ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } } : { scale: 1 }}
            >
              <div style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '8px',
                padding: '0.75em 0.625em',
                width: '5.3125rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5em',
                backdropFilter: 'blur(8px)',
                boxShadow: isProcessing ? '0 0 0.9375rem rgba(255, 107, 74, 0.2)' : 'none',
                opacity: isProcessed && idx > 0 ? 0.6 : 1,
                transition: 'all 0.5s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6875rem', color: isProcessed && idx > 0 ? '#64748b' : '#E2E8F0', fontWeight: '500' }}>
                    {node.label}
                  </span>
                  {isLocked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375em' }}>
                  {isProcessing ? (
                    // Currently finding resources
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
                      <div className="ls-shimmer" style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255, 107, 74, 0.3)' }} />
                      <span style={{ fontSize: '0.5rem', color: 'var(--accent-orange)', fontWeight: '600' }}>FINDING...</span>
                    </div>
                  ) : isLocked ? (
                    // Locked state - hide content placeholder
                    <div style={{ width: '100%', height: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.5rem', color: '#475569', fontWeight: '500' }}>LOCKED</span>
                    </div>
                  ) : (
                    // Week 1 unlocked or generic skeleton before processing
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375em' }}>
                      <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
                      <div style={{ width: '60%', height: '4px', borderRadius: '2px', background: accentColor, opacity: 0.8 }} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

const LoadingResourceVisual = () => {
  const containerRef = useRef(null);

  const resources = [
    { id: 'yt', Icon: YouTubeIcon, color: '#94a3b8', label: 'YouTube', angle: 0, distance: 95, delay: 0.5 },
    { id: 'gh', Icon: GitHubIcon, color: '#94a3b8', label: 'GitHub', angle: 60, distance: 90, delay: 1.5 },
    { id: 'cs', Icon: CourseraIcon, color: '#94a3b8', label: 'Coursera', angle: 120, distance: 90, delay: 2.5 },
    { id: 'edx', Icon: EdXIcon, color: '#94a3b8', label: 'edX', angle: 180, distance: 95, delay: 3.5 },
    { id: 'li', Icon: LinkedInIcon, color: '#94a3b8', label: 'LinkedIn Learning', angle: 240, distance: 90, delay: 4.5 },
    { id: 'mit', Icon: MITIcon, color: '#94a3b8', label: 'MIT OCW', angle: 300, distance: 90, delay: 5.5 },
  ];

  return (
    <div ref={containerRef} className="ls-semantic-box ls-visual-container ls-resource-container">

      {/* Center Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
        className="ls-resource-logo-box"
        drag
        dragConstraints={containerRef}
      >
        <CareerWeaveLogo size={32} />
      </motion.div>

      {/* Orbiting Resources */}
      {resources.map((res) => {
        // Calculate ending coordinates relative to center (0,0)
        const rad = (res.angle * Math.PI) / 180;
        const x = Math.cos(rad) * res.distance;
        const y = Math.sin(rad) * res.distance;

        return (
          <React.Fragment key={res.id}>
            {/* Thread line from center to resource */}
            <motion.svg
              className="ls-resource-svg-canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: res.delay + 0.4, duration: 0.8 }}
            >
              <line x1="50%" y1="50%" x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} stroke={res.color} strokeWidth="1" strokeDasharray="4 4" />
            </motion.svg>

            {/* Resource Node */}
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: 1, x, y, scale: 1 }}
              transition={{ delay: res.delay, type: 'spring', stiffness: 200, damping: 20 }}
              className="ls-resource-node-wrapper"
            >
              <div className="ls-resource-node-box" style={{
                border: `1px solid ${res.color}50`,
                boxShadow: `0 0 0.625rem ${res.color}20`
              }}>
                <res.Icon size={20} color={res.color} />
              </div>
            </motion.div>
          </React.Fragment>
        );
      })}

      <span className="ls-resource-bottom-text">
        CareerWeave is an independent platform. Trademarks belong to their respective owners.
      </span>
    </div>
  );
};

export default LoadingScreen;
