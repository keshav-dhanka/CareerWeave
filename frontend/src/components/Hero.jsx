import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen/LoadingScreen';
import { API_BASE_URL } from '../apiConfig';
import './Hero.css';
import { Database, Palette, Camera, Code, Briefcase } from 'lucide-react';

const roles = ["a UI/UX Designer...", "an AI Engineer...", "a Full-Stack Developer...", "a Data Scientist..."];

const suggestions = [
  { label: "Data Scientist", prompt: "My name is [Your Name]. I hold a Bachelor of Science degree in Mathematics and have a technical stack including advanced Excel and basic Python. My explicit career goal is to become an industry-standard Data Scientist. Please architect a realistic learning timeline.", icon: Database },
  { label: "UI/UX Designer", prompt: "My name is [Your Name]. I hold a Bachelor of Arts degree and have a technical stack in Adobe Illustrator and visual layout principles. My explicit career goal is to transition into a UI/UX Designer role for digital products. Please architect a realistic learning timeline.", icon: Palette },
  { label: "Photography", prompt: "My name is [Your Name]. I am a self-taught creator with hands-on skills in basic camera settings and lighting fundamentals. My explicit career goal is to establish a professional workflow as a Commercial Photographer. Please architect a realistic learning timeline.", icon: Camera },
  { label: "Full-Stack Developer", prompt: "My name is [Your Name]. I hold a B.Tech degree and have a reliable technical stack consisting of basic HTML, CSS, and elementary JavaScript. My explicit career goal is to become a Full-Stack Developer specializing in modern frameworks. Please architect a realistic learning timeline.", icon: Code },
  { label: "Product Manager", prompt: "My name is [Your Name]. I am a business professional with a solid technical stack in software lifecycles and team collaboration. My explicit career goal is to pivot to a Product Manager role in a tech company. Please architect a realistic learning timeline.", icon: Briefcase }
];

const Hero = ({ promptText, setPromptText, externalTrigger, isAuthenticated, showToast, triggerConfetti }) => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [animateBox, setAnimateBox] = useState(false);
  const [ghostText, setGhostText] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genComplete, setGenComplete] = useState(false);
  const [generatedRoadmapId, setGeneratedRoadmapId] = useState(null);

  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // External trigger effect (from Mini CTA)
  useEffect(() => {
    if (externalTrigger) {
      // Scroll to absolute top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Delay to allow scroll to complete
      const timer = setTimeout(() => {
        setAnimateBox(true);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        // Keep animation active for a bit longer to ensure it's seen
        setTimeout(() => setAnimateBox(false), 1500);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [externalTrigger]);

  // Typewriter effect logic
  useEffect(() => {
    if (inputValue) return; // Stop typing if user types

    const role = roles[currentRoleIndex];
    let typingSpeed = isDeleting ? 30 : 80;

    if (!isDeleting && typewriterText === role) {
      typingSpeed = 2000; // pause at the end
      setIsDeleting(true);
    } else if (isDeleting && typewriterText === "") {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      typingSpeed = 500; // pause before typing next
    }

    const timeout = setTimeout(() => {
      setTypewriterText(
        isDeleting
          ? role.substring(0, typewriterText.length - 1)
          : role.substring(0, typewriterText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, currentRoleIndex, inputValue]);

  const handleInput = (e) => {
    setInputValue(e.target.value);
    // auto-expand
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  const handleChipClick = (prompt) => {
    setInputValue(prompt);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = (textareaRef.current.scrollHeight) + 'px';
      textareaRef.current.focus();
    }
    setAnimateBox(true);
    setTimeout(() => setAnimateBox(false), 300);
  };

  const generateRoadmap = async (promptToUse) => {
    setGenLoading(true);
    setGenComplete(false);
    setGeneratedRoadmapId(null);

    try {
      let endpoint = `${API_BASE_URL}/generate`;
      let headers = { 'Content-Type': 'application/json' };

      if (!isAuthenticated) {
        endpoint = `${API_BASE_URL}/generate/preview`;
      } else {
        const token = localStorage.getItem('token');
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_prompt: promptToUse }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Generation failed');
      }

      const roadmap = await res.json();
      localStorage.removeItem('cw_prompt_draft');

      if (!isAuthenticated) {
        localStorage.setItem('preview_roadmap', JSON.stringify(roadmap));
        setGeneratedRoadmapId('preview');
      } else {
        const roadmapId = roadmap?.id || roadmap;
        setGeneratedRoadmapId(roadmapId);
      }

      if (triggerConfetti) triggerConfetti();
      setGenComplete(true);
    } catch (err) {
      setGenLoading(false);
      if (showToast) showToast(err.message, 'error');
    }
  };

  return (
    <>
      {genLoading && (
        <LoadingScreen
          isComplete={genComplete}
          onFinish={() => {
            setGenLoading(false);
            if (generatedRoadmapId === 'preview') {
              navigate('/roadmap/preview');
            } else {
              navigate(`/roadmap/${generatedRoadmapId}`);
            }
          }}
        />
      )}
      <section className="hero" id="hero">
        <div className="hero-abstract-pattern">
          <div className="weave-line line-1"></div>
          <div className="weave-line line-2"></div>
          <div className="weave-line line-3"></div>
        </div>
        <h1 className="hero-title">
          Your {' '}
          <span className="hero-highlight">Dream Career,</span>{' '}
          Mapped in {' '}
          <span className="highlight-wrapper">
            <span>Seconds.</span>
            <svg className="handdrawn-line" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M 5,15 Q 50,5 100,12 T 195,10" stroke="var(--accent-orange)" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="hero-subtitle">Instant, personalized learning paths for the world’s most in-demand roles.</p>

        <div className={`hero-prompt-box glass-panel ${isFocused ? 'focused' : ''} ${animateBox ? 'animate-pulse' : ''}`}>

          <div className="prompt-input-container">
            {!inputValue && (
              <div className="custom-placeholder">
                {ghostText ? (
                  <span className="placeholder-ghost">{ghostText}</span>
                ) : (
                  <>
                    <span className="placeholder-fixed">Ask CareerWeave to build a roadmap for </span>
                    <span className="placeholder-typing">{typewriterText}</span>
                    <span className="prompt-cursor">|</span>
                  </>
                )}
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="prompt-textarea"
              value={inputValue}
              onChange={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              spellCheck="false"
            />
          </div>

          <div className="prompt-footer">
            <button
              className="btn-generate"
              disabled={!inputValue.trim() || genLoading}
              onClick={() => {
                const promptToUse = inputValue.trim();
                if (!promptToUse) return;
                generateRoadmap(promptToUse);
              }}>
              <span className="btn-text">{genLoading ? 'Generating...' : 'Generate My Roadmap'}</span>
              {!genLoading && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path>
                  <path d="m14 7 3 3"></path>
                  <path d="M5 6v4"></path>
                  <path d="M19 14v4"></path>
                  <path d="M10 2v2"></path>
                  <path d="M7 8H3"></path>
                  <path d="M21 16h-4"></path>
                  <path d="M11 3H9"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="trust-boosters">
          <span className="trust-item">Instant Access</span>
          <span className="trust-dot">•</span>
          <span className="trust-item">Industry-Backed</span>
          <span className="trust-dot">•</span>
          <span className="trust-item">100% Free</span>
        </div>

        <div className="smart-suggestions">
          <h3 className="suggestions-heading">Trending Roadmaps</h3>
          <div className="suggestion-chips">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                onClick={() => handleChipClick(s.prompt)}
                onMouseEnter={() => setGhostText(s.prompt)}
                onMouseLeave={() => setGhostText("")}
              >
                <span className="chip-icon">
                  {s.icon && <s.icon size={16} />}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
