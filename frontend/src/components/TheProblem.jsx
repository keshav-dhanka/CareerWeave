import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './TheProblem.css';

// --- MOTION CONFIG ---
const floatTransition = (delay = 0, speed = 1) => ({
  y: {
    duration: 6 / speed,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
    delay
  }
});

// --- SVG VISUALS ---

const EndlessTutorialsSVG = ({ isHovered }) => (
  <svg viewBox="0 0 100 100" className="visual-svg">
    <motion.path
      d="M10,50 Q30,10 50,50 T90,50"
      fill="none"
      stroke="var(--accent-orange)"
      strokeWidth="2"
      opacity="0.3"
      animate={{ d: isHovered ? "M10,60 Q30,20 50,60 T90,60" : "M10,50 Q30,10 50,50 T90,50" }}
    />
    <motion.path
      d="M10,30 Q40,90 90,30"
      fill="none"
      stroke="var(--accent-orange)"
      strokeWidth="1.5"
      opacity="0.2"
      animate={{ d: isHovered ? "M10,20 Q40,80 90,20" : "M10,30 Q40,90 90,30" }}
    />
    <motion.g
      animate={{ scale: isHovered ? 1.3 : 1, y: isHovered ? -5 : 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <circle cx="50" cy="50" r="15" fill="rgba(255, 107, 74, 0.1)" stroke="var(--accent-orange)" strokeWidth="2" />
      <path d="M45,42 L60,50 L45,58 Z" fill="var(--accent-orange)" />
    </motion.g>
  </svg>
);

const ResourceOverloadSVG = ({ isHovered }) => (
  <svg viewBox="0 0 100 100" className="visual-svg">
    {[0, 1, 2, 3].map((i) => (
      <motion.rect
        key={i}
        width="40"
        height="30"
        rx="4"
        fill={i === 3 ? "var(--accent-orange)" : "rgba(255,255,255,0.1)"}
        stroke="rgba(255,255,255,0.2)"
        animate={{
          x: isHovered ? 7.5 + i * 15 : 27 + i * 2,
          y: isHovered ? 35 : 32 + i * 2,
          rotate: isHovered ? (i - 1.5) * 10 : 0,
          scale: isHovered && i === 3 ? 1.2 : 1
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      />
    ))}
  </svg>
);

const HiringGapSVG = ({ isHovered }) => (
  <svg viewBox="0 0 100 100" className="visual-svg">
    <rect x="15" y="35" width="25" height="30" rx="2" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
    <line x1="20" y1="45" x2="35" y2="45" stroke="white" strokeWidth="1" opacity="0.4" />
    <line x1="20" y1="52" x2="35" y2="52" stroke="white" strokeWidth="1" opacity="0.4" />

    <motion.g animate={{ rotate: isHovered ? -10 : 0, x: isHovered ? 5 : 0 }}>
      <path d="M60,40 H85 V65 H60 Z" fill="none" stroke="var(--accent-orange)" strokeWidth="2" />
      <path d="M68,40 V35 Q72,30 77,35 V40" fill="none" stroke="var(--accent-orange)" strokeWidth="1.5" />
    </motion.g>

    <motion.path
      d="M45,20 L55,40 L45,60 L55,80"
      fill="none"
      stroke={isHovered ? "#ffcc00" : "rgba(255,255,255,0.2)"}
      strokeWidth="3"
      animate={{
        strokeDasharray: isHovered ? ["0,100", "100,0"] : "0,0",
        filter: isHovered ? "drop-shadow(0 0 8px #ff6b4a)" : "none"
      }}
    />
  </svg>
);

const ZeroProgressSVG = ({ isHovered }) => {
  const headFrames = [
    { cx: 58, cy: 18 },
    { cx: 58, cy: 18 },
    { cx: 70, cy: 22 },
    { cx: 75, cy: 33 }
  ];

  const bodyFrames = [
    // 0: Stand
    "M58,32 L55,58 M58,32 L64,45 L70,58 M58,32 L45,45 L45,58 M55,58 L65,75 L70,95 M55,58 L50,76.5 L45,95",
    // 1: Walk
    "M54,32 L48,58 M54,32 L60,45 L70,55 M54,32 L38,45 L35,58 M48,58 L59,76.5 L70,95 M48,58 L40,78 L25,95",
    // 2: Run
    "M62,35 L48,62 M62,35 L76,53 L86,44 M62,35 L45,28 L42,44 M48,62 L65,74 L52,95 M48,62 L36,80 L22,85",
    // 3: Sprint
    "M64,44 L38,75 M64,44 L76,57 L88,48 M64,44 L45,35 L40,50 M38,75 L58,78 L45,90 M38,75 L26.5,82.5 L15,90"
  ];

  return (
    <svg viewBox="0 0 100 100" className="visual-svg">
      {/* Stand */}
      <path d="M25,85 L50,50 L75,85" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill="rgba(255,255,255,0.2)" />

      {/* Spinning Wheel */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{
          duration: isHovered ? 1 : 8,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ transformOrigin: "50% 50%" }}
      >
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <line
            key={angle}
            x1="50" y1="12" x2="50" y2="18"
            transform={`rotate(${angle} 50 50)`}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </motion.g>

      {/* The Dynamic Runner - Cycles through silhouettes */}
      <g transform="translate(22.5, 38.5) scale(0.5)">
        {/* Head */}
        <motion.circle
          animate={{
            cx: isHovered ?
              [headFrames[0].cx, headFrames[1].cx, headFrames[2].cx, headFrames[3].cx, headFrames[2].cx, headFrames[1].cx] :
              [headFrames[0].cx, headFrames[1].cx, headFrames[2].cx, headFrames[1].cx, headFrames[0].cx],
            cy: isHovered ?
              [headFrames[0].cy, headFrames[1].cy, headFrames[2].cy, headFrames[3].cy, headFrames[2].cy, headFrames[1].cy] :
              [headFrames[0].cy, headFrames[1].cy, headFrames[2].cy, headFrames[1].cy, headFrames[0].cy]
          }}
          transition={{ duration: isHovered ? 1 : 3, repeat: Infinity, ease: "linear" }}
          r="9"
          fill="var(--accent-orange)"
        />

        {/* Body (Torso, Arms, Legs) */}
        <motion.path
          animate={{
            d: isHovered ?
              [bodyFrames[0], bodyFrames[1], bodyFrames[2], bodyFrames[3], bodyFrames[2], bodyFrames[1]] :
              [bodyFrames[0], bodyFrames[1], bodyFrames[2], bodyFrames[1], bodyFrames[0]]
          }}
          transition={{ duration: isHovered ? 1 : 3, repeat: Infinity, ease: "linear" }}
          fill="none"
          stroke="var(--accent-orange)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Effort particles (flying backward) */}
      {isHovered && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {[1, 2, 3].map(i => (
            <motion.circle
              key={i}
              r="1.2"
              fill="var(--accent-orange)"
              initial={{ x: 55, y: 50, opacity: 1 }}
              animate={{
                x: [52, 38 - i * 6],
                y: [47, 43 - i * 3],
                opacity: [1, 0]
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.g>
      )}
    </svg>
  );
};

// --- COMPONENT ---

const ProblemCard = ({ title, description, Icon, className, delay, containerHovered, initialX, initialY, initialRotate, zIndex }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 50); // Grace period to prevent flickering
  };

  return (
    <motion.div
      className={`problem-card ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: initialX,
        y: isHovered ? initialY : [initialY - 5, initialY + 5],
        rotate: isHovered ? 0 : initialRotate,
        scale: isHovered ? 1.1 : 1,
        zIndex: isHovered ? 100 : zIndex
      }}
      transition={{
        y: isHovered ? { type: "spring", stiffness: 300, damping: 25 } : floatTransition(delay, containerHovered ? 0.2 : 1).y,
        rotate: { type: "spring", stiffness: 200, damping: 20 },
        scale: { type: "spring", stiffness: 400, damping: 25 }
      }}
    >
      <h3 className="card-title">{title}</h3>

      <p className="card-description">
        {description}
      </p>

      <div className="card-visual">
        <motion.div
          animate={{
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            height: '100%',
            aspectRatio: '1/1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon isHovered={isHovered} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- ECHOES OF DOUBT DATA ---
const doubtPhrases = [
  { text: "Am I even learning?", side: "left", top: "20%", size: "28px", offset: "5%", outlined: false, speed: 18, delay: 0, direction: -1 },
  { text: "50+ tabs open", side: "left", top: "45%", size: "40px", offset: "-1%", outlined: true, speed: 12, delay: 2, direction: 1 },
  { text: "Stuck in Chapter 1", side: "left", top: "75%", size: "36px", offset: "1%", outlined: true, speed: 20, delay: 4, direction: -1 },
  { text: "Which course next?", side: "left", top: "90%", size: "22px", offset: "10%", outlined: false, speed: 10, delay: 1, direction: 1 },
  { text: "Feeling behind?", side: "right", top: "15%", size: "38px", offset: "-1%", outlined: true, speed: 15, delay: 3, direction: 1 },
  { text: "Just one more tutorial...", side: "right", top: "40%", size: "24px", offset: "2%", outlined: false, speed: 14, delay: 5, direction: -1 },
  { text: "Will I ever get hired?", side: "right", top: "70%", size: "20px", offset: "7%", outlined: false, speed: 11, delay: 0, direction: -1 },
  { text: "Market is saturated", side: "right", top: "92%", size: "32px", offset: "0%", outlined: true, speed: 22, delay: 2, direction: 1 },
];

const FloatingDoubt = ({ phrase, smoothMouseX, smoothMouseY }) => {
  const parallaxX = useTransform(smoothMouseX, [-0.5, 0.5], [25, -25]);
  const parallaxY = useTransform(smoothMouseY, [-0.5, 0.5], [25, -25]);

  return (
    <motion.div
      className={`floating-phrase ${phrase.outlined ? 'phrase-outlined' : 'phrase-solid'}`}
      style={{
        [phrase.side]: phrase.offset,
        top: phrase.top,
        fontSize: phrase.size,
        x: parallaxX,
        y: parallaxY,
      }}
      animate={{
        y: [0, 20 * phrase.direction, 0]
      }}
      transition={{
        duration: phrase.speed,
        repeat: Infinity,
        ease: "easeInOut",
        delay: phrase.delay
      }}
    >
      {phrase.text}
    </motion.div>
  );
};

const TheProblem = () => {
  const [containerHovered, setContainerHovered] = useState(false);
  const sectionRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth mouse values for parallax
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleGlobalMouseMove = (e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Update motion values
    mouseX.set(x);
    mouseY.set(y);

    // Update CSS variables for gradient
    sectionRef.current.style.setProperty('--mouse-x', `${(x + 0.5) * 100}%`);
    sectionRef.current.style.setProperty('--mouse-y', `${(y + 0.5) * 100}%`);
  };

  const cards = [
    {
      title: "Endless Tutorials",
      description: "Jumping between tutorials. Starting 100 things, finishing zero.",
      Icon: EndlessTutorialsSVG,
      className: "card-1",
      delay: 0,
      initialX: -200,
      initialY: -100,
      initialRotate: -8,
      zIndex: 1
    },
    {
      title: "Too Much Noise",
      description: "Everyone has a different roadmap but none feel right.",
      Icon: ResourceOverloadSVG,
      className: "card-2",
      delay: 1.5,
      initialX: 200,
      initialY: -110,
      initialRotate: 6,
      zIndex: 2
    },
    {
      title: "The Hiring Gap",
      description: "You know how to code, but not how to build a career.",
      Icon: HiringGapSVG,
      className: "card-3",
      delay: 3,
      initialX: -100,
      initialY: 80,
      initialRotate: -12,
      zIndex: 3
    },
    {
      title: "Zero Progress",
      description: "Working hard every day but feeling like you're standing still.",
      Icon: ZeroProgressSVG,
      className: "card-4",
      delay: 4.5,
      initialX: 130,
      initialY: 100,
      initialRotate: 4,
      zIndex: 4
    }
  ];

  return (
    <section className="problem-section" id="the-problem" ref={sectionRef} onMouseMove={handleGlobalMouseMove}>
      {/* Background Mental Noise */}
      <div className="mental-noise-container">
        {doubtPhrases.map((phrase, idx) => (
          <FloatingDoubt key={idx} phrase={phrase} smoothMouseX={smoothMouseX} smoothMouseY={smoothMouseY} />
        ))}
      </div>

      <div className="container problem-container">
        <div className="problem-header text-center">
          <h2 className="section-heading">
            <span className="highlight-wrapper">
              <span>Learning… </span>
              <svg className="handdrawn-line" viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M 5,15 Q 50,5 100,12 T 195,10" stroke="var(--accent-orange)" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span> but still not getting{' '}
            <span className="gradient-highlight">anywhere?</span>
          </h2>
          <p className="section-subheading">
            The internet gave you infinite content, but zero context. You don't need another generic 10-hour course, You need a way out!
          </p>
        </div>

        <div
          className="problem-cards-container"
          onMouseEnter={() => setContainerHovered(true)}
          onMouseLeave={() => setContainerHovered(false)}
        >
          {cards.map((card, idx) => (
            <ProblemCard
              key={idx}
              {...card}
              containerHovered={containerHovered}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheProblem;
