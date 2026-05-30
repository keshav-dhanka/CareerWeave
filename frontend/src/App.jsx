import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyCareerWeave from './components/WhyCareerWeave';
import TheProblem from './components/TheProblem';
import ValueProduct from './components/ValueProduct';
import Steps from './components/Steps';
import Features from './components/Features';
import ResourceCloud from './components/ResourceCloud';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { ToastContainer } from './components/Toast';
import ConfettiCanvas from './components/ConfettiCanvas';
import Dashboard from './pages/Dashboard/Dashboard';
import RoadmapView from './pages/RoadmapView/RoadmapView';
import ExampleRoadmaps from './pages/ExampleRoadmaps/ExampleRoadmaps';
import { useAuth } from './hooks/useAuth';
import { API_BASE_URL } from './apiConfig';

// Protects routes — redirects to landing with state if no valid token
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          message: "Authentication required to access this feature",
          type: 'warning'
        }}
      />
    );
  }

  return children;
}

const LandingPage = ({
  promptText, setPromptText, heroTrigger,
  handlePromptUpdate, openAuth, isAuthOpen, setIsAuthOpen, authMode, triggerHero,
  userProfile, isAuthenticated, showToast, triggerConfetti
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasShownAuthToast = useRef(false);

  useEffect(() => {
    if (location.state?.message && !hasShownAuthToast.current) {
      // Use a small timeout or check if already handled to prevent loops
      showToast(location.state.message, location.state.type || 'info');
      hasShownAuthToast.current = true;
      openAuth('signup');

      // Clear location state properly using React Router's navigate
      navigate("/", { replace: true, state: {} });
    }
  }, [location.state, navigate, openAuth, showToast]);

  return (
    <div className="app-container">
      <div className="luxury-gradient"></div>
      <Navbar
        onRoadmapSelect={handlePromptUpdate}
        openLogin={() => openAuth('login')}
        openSignup={() => openAuth('signup')}
        user={userProfile}
        isAuthenticated={isAuthenticated}
      />
      <Hero 
        promptText={promptText} 
        setPromptText={setPromptText} 
        externalTrigger={heroTrigger} 
        isAuthenticated={isAuthenticated} 
        showToast={showToast}
        triggerConfetti={triggerConfetti}
      />
      <WhyCareerWeave />
      <TheProblem />
      <ValueProduct onCTAClick={triggerHero} />
      <Steps />
      <Features />
      <ResourceCloud />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

function App() {
  const [promptText, setPromptText] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [heroTrigger, setHeroTrigger] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const { isAuthenticated, token } = useAuth();

  const triggerConfetti = useCallback(() => {
    setShowConfetti(false); // Reset so multiple triggers can stack
    setTimeout(() => {
      setShowConfetti(true);
    }, 50);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setUserProfile(data); })
        .catch(() => { });
    } else {
      setUserProfile(null);
    }
  }, [token]);

  const triggerHero = () => {
    setHeroTrigger(Date.now());
  };

  const handlePromptUpdate = (newPrompt) => {
    setPromptText(newPrompt);
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openAuth = useCallback((mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  return (
    <>
      <ToastContainer toasts={toasts} />
      <ConfettiCanvas active={showConfetti} />
      <Routes>

        {/* Protected Dashboard Route */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard showToast={showToast} triggerConfetti={triggerConfetti} />
          </ProtectedRoute>
        } />

        {/* Protected Roadmap View Route */}
        <Route path="/roadmap/:id" element={
          <ProtectedRoute>
            <RoadmapView triggerConfetti={triggerConfetti} showToast={showToast} />
          </ProtectedRoute>
        } />

        <Route path="/examples" element={
          <ExampleRoadmaps
            openLogin={() => openAuth('login')}
            openSignup={() => openAuth('signup')}
            userProfile={userProfile}
            isAuthenticated={isAuthenticated}
          />
        } />
        <Route path="/examples/roadmap/:id" element={<RoadmapView isExampleView={true} showToast={showToast} />} />
        
        {/* Preview Routes */}
        <Route path="/roadmap/preview" element={<RoadmapView isPreviewView={true} openAuth={() => openAuth('signup')} triggerConfetti={triggerConfetti} showToast={showToast} />} />

        {/* Landing Page Route */}
        <Route path="/" element={
          <LandingPage
            promptText={promptText}
            setPromptText={setPromptText}
            heroTrigger={heroTrigger}
            handlePromptUpdate={handlePromptUpdate}
            openAuth={openAuth}
            isAuthOpen={isAuthOpen}
            setIsAuthOpen={setIsAuthOpen}
            authMode={authMode}
            triggerHero={triggerHero}
            userProfile={userProfile}
            isAuthenticated={isAuthenticated}
            showToast={showToast}
            triggerConfetti={triggerConfetti}
          />
        } />
      </Routes>
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

export default App;
