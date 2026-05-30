import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../apiConfig';
import './DashboardPrompt.css';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

import {
  WandSparkles,
  Database,
  Palette,
  Camera,
  Code,
  Briefcase,
  Zap,
  ShieldCheck,
  CircleDollarSign
} from 'lucide-react';

const ROLES = ["a UI/UX Designer...", "an AI Engineer...", "a Full-Stack Developer...", "a Data Scientist..."];

const SUGGESTIONS = [
  { label: "Data Scientist", prompt: "My name is [Your Name]. I hold a Bachelor of Science degree in Mathematics and have a technical stack including advanced Excel and basic Python. My explicit career goal is to become an industry-standard Data Scientist. Please architect a realistic learning timeline.", icon: Database },
  { label: "UI/UX Designer", prompt: "My name is [Your Name]. I hold a Bachelor of Arts degree and have a technical stack in Adobe Illustrator and visual layout principles. My explicit career goal is to transition into a UI/UX Designer role for digital products. Please architect a realistic learning timeline.", icon: Palette },
  { label: "Photography", prompt: "My name is [Your Name]. I am a self-taught creator with hands-on skills in basic camera settings and lighting fundamentals. My explicit career goal is to establish a professional workflow as a Commercial Photographer. Please architect a realistic learning timeline.", icon: Camera },
  { label: "Full-Stack Developer", prompt: "My name is [Your Name]. I hold a B.Tech degree and have a reliable technical stack consisting of basic HTML, CSS, and elementary JavaScript. My explicit career goal is to become a Full-Stack Developer specializing in modern frameworks. Please architect a realistic learning timeline.", icon: Code },
  { label: "Product Manager", prompt: "My name is [Your Name]. I am a business professional with a solid technical stack in software lifecycles and team collaboration. My explicit career goal is to pivot to a Product Manager role in a tech company. Please architect a realistic learning timeline.", icon: Briefcase }
];

const STORAGE_KEY = 'cw_prompt_draft';

const DashboardPrompt = ({ userFirstName = '', onGenerate, focusRef, loading, showToast, triggerConfetti, previewMode = false }) => {
  const [inputValue, setInputValue] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [isFocused, setIsFocused] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genComplete, setGenComplete] = useState(false);
  const [generatedRoadmapId, setGeneratedRoadmapId] = useState(null);
  const [ghostText, setGhostText] = useState("");

  // Typewriter state
  const [roleIndex, setRoleIndex] = useState(0);
  const [typeText, setTypeText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Expose focus function via ref
  useEffect(() => {
    if (focusRef) {
      focusRef.current = () => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
    }
  }, [focusRef]);

  // Persist draft to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, inputValue);
  }, [inputValue]);

  // Auto-resize textarea on mount or when inputValue changes externally
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  // Listen for external prompt injections
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setInputValue(e.newValue);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
          }
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (inputValue) return;
    const role = ROLES[roleIndex];
    let speed = isDeleting ? 30 : 80;

    if (!isDeleting && typeText === role) {
      speed = 2000;
      setIsDeleting(true);
    } else if (isDeleting && typeText === '') {
      setIsDeleting(false);
      setRoleIndex(i => (i + 1) % ROLES.length);
      speed = 500;
    }

    const t = setTimeout(() => {
      setTypeText(isDeleting
        ? role.substring(0, typeText.length - 1)
        : role.substring(0, typeText.length + 1)
      );
    }, speed);

    return () => clearTimeout(t);
  }, [typeText, isDeleting, roleIndex, inputValue]);

  const handleInput = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleChipClick = (prompt) => {
    setInputValue(prompt);
    if (textareaRef.current) {
      textareaRef.current.value = prompt;
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = (textareaRef.current.scrollHeight) + 'px';
      textareaRef.current.focus();
    }
  };

  const extractErrorMessage = (detail) => {
    if (!detail) return 'Generation failed. Please try again.';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(d => d.msg || d.message || JSON.stringify(d)).join('. ');
    }
    return JSON.stringify(detail);
  };

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim()) {
      if (showToast) {
        showToast('Please describe the career path you want to explore.', 'role-error');
      }
      textareaRef.current?.focus();
      return;
    }
    setGenLoading(true);
    setGenComplete(false);
    setGeneratedRoadmapId(null);

    try {
      let endpoint = `${API_BASE_URL}/generate`;
      let headers = { 'Content-Type': 'application/json' };

      if (previewMode) {
        endpoint = `${API_BASE_URL}/generate/preview`;
      } else {
        const token = localStorage.getItem('token');
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_prompt: inputValue.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(extractErrorMessage(data.detail));
      }

      const roadmap = await res.json();
      localStorage.removeItem(STORAGE_KEY);

      if (previewMode) {
        localStorage.setItem('preview_roadmap', JSON.stringify(roadmap));
        setGeneratedRoadmapId('preview');
      } else {
        if (onGenerate) onGenerate(roadmap);
        const roadmapId = roadmap?.id || roadmap;
        setGeneratedRoadmapId(roadmapId);
      }

      // Trigger global celebratory confetti
      if (triggerConfetti) triggerConfetti();

      setGenComplete(true);
      // We do not navigate here; we wait for LoadingScreen's onFinish callback.
    } catch (err) {
      setGenLoading(false);
      const msg = err.message || 'An unexpected error occurred.';

      if (showToast) {
        const lowerMsg = msg.toLowerCase();

        // Handle common network errors
        if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('load failed') || lowerMsg.includes('network')) {
          showToast('Failed to fetch. Please check if the backend server is running!', 'error');
        } else {
          let toastType = 'error';
          // Categorize validator error messages to custom toast types & icons
          if (lowerMsg.includes('role') || lowerMsg.includes('job') || lowerMsg.includes('title')) {
            toastType = 'role-error';
          } else if (lowerMsg.includes('skill') || lowerMsg.includes('background') || lowerMsg.includes('education')) {
            toastType = 'skills-error';
          }
          showToast(msg, toastType);
        }
      }
    }
  }, [inputValue, onGenerate, showToast, triggerConfetti]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const [greetingText, setGreetingText] = useState("");
  const [showSubMessage, setShowSubMessage] = useState(false);

  // Sequential Animation: Logo -> Greeting -> Sub-message
  useEffect(() => {
    const fullGreeting = `Hii ${userFirstName}!`;

    // 1. Wait for logo animation (approx 1.2s for tighter feel)
    const logoTimer = setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i <= fullGreeting.length) {
          setGreetingText(fullGreeting.substring(0, i));
          i++;
        } else {
          clearInterval(typeInterval);
          // 2. Trigger sub-message after typing is done
          setTimeout(() => setShowSubMessage(true), 300);
        }
      }, 70); // Typing speed
    }, 200);

    return () => clearTimeout(logoTimer);
  }, [userFirstName]);

  return (
    <>
      {genLoading && (
        <LoadingScreen
          isComplete={genComplete}
          onFinish={() => {
            setGenLoading(false);
            navigate(`/roadmap/${generatedRoadmapId || ''}`);
          }}
        />
      )}
      <div className="dp-container">
        {/* Header with Logo and Greeting */}
        <div className="dp-header">
          {loading ? (
            <div className="dp-hero-skeleton">
              <div className="dp-hero-skeleton__row">
                <div className="dp-hero-skeleton__logo" />
                <div className="dp-hero-skeleton__line sm" />
              </div>
              <div className="dp-hero-skeleton__line lg" />
            </div>
          ) : (
            <>
              <div className="dp-logo-wrap">
                <svg className="dp-logo-svg" viewBox="-2 -2 28 28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="logo-gradient-dp" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff6b4a" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                  </defs>
                  <path className="dp-logo-path" d="M18 6a6 6 0 0 1 0 12c-4 0-5-5-6-6s-2-6-6-6a6 6 0 0 0 0 12" stroke="url(#logo-gradient-dp)" />
                </svg>
                <h1 className="dp-greeting-text">
                  {greetingText.slice(0, 4)}
                  <span className="highlight-wrapper">
                    <span className="dp-user-name">{greetingText.slice(4, greetingText.length - (greetingText.endsWith('!') ? 1 : 0))}</span>
                    <svg className="handdrawn-line" viewBox="0 0 200 20" preserveAspectRatio="none">
                      <path d="M 5,10 Q 25,5 100,10 T 195,5" stroke="var(--accent-orange)" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>
                  {greetingText.endsWith('!') && '!'}
                  {greetingText.length < `Hii ${userFirstName}!`.length && <span className="dp-greeting-cursor">|</span>}
                </h1>
              </div>
              <p className={`dp-submessage-animated ${showSubMessage ? 'visible' : ''}`}>
                Ready to craft your roadmap?
              </p>
            </>
          )}
        </div>

        {/* Hero-style Prompt Box */}
        <div className={`dp-prompt-box glass-panel ${isFocused ? 'focused' : ''}`}>
          <div className="dp-input-container">
            {!inputValue && (
              <div className="dp-custom-placeholder">
                {ghostText ? (
                  <span className="dp-placeholder-ghost">{ghostText}</span>
                ) : (
                  <>
                    <span className="dp-placeholder-fixed">Ask CareerWeave to build a roadmap for </span>
                    <span className="dp-placeholder-typing">{typeText}</span>
                    <span className="dp-prompt-cursor">|</span>
                  </>
                )}
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="dp-prompt-textarea"
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              spellCheck="false"
              rows={1}
            />
          </div>

          <div className="dp-prompt-footer">
            <span className="dp-hint-text">Ctrl + Enter to generate</span>
            <button
              className="btn-master-cta"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || genLoading}
            >
              <span className="btn-text">{genLoading ? 'Generating...' : 'Generate My Roadmap'}</span>
              {!genLoading && <WandSparkles size={16} />}
            </button>
          </div>
        </div>

        {/* Trust Boosters */}
        <div className="dp-trust-boosters">
          <span className="dp-trust-item">Instant Access</span>
          <span className="dp-trust-dot">•</span>
          <span className="dp-trust-item">Industry-Backed</span>
          <span className="dp-trust-dot">•</span>
          <span className="dp-trust-item">100% Free</span>
        </div>

        {/* Trending Roadmaps */}
        <div className="dp-suggestions">
          <h3 className="dp-suggestions-heading">Trending Roadmaps</h3>
          <div className="dp-suggestion-chips">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                className="dp-suggestion-chip"
                onClick={() => handleChipClick(s.prompt)}
                onMouseEnter={() => setGhostText(s.prompt)}
                onMouseLeave={() => setGhostText("")}
              >
                <span className="dp-chip-icon">
                  {s.icon && <s.icon size={16} />}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPrompt;
