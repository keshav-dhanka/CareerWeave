import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './FinalCTA.css';

const FinalCTA = () => {
  const meshRef = useRef(null);
  const circle1 = useRef(null);
  const circle2 = useRef(null);
  const circle3 = useRef(null);

  useEffect(() => {
    const circles = [circle1.current, circle2.current, circle3.current];

    circles.forEach((circle, i) => {
      gsap.to(circle, {
        x: 'random(-100, 100)',
        y: 'random(-100, 100)',
        duration: 'random(15, 25)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 2
      });

      gsap.to(circle, {
        scale: 'random(0.8, 1.2)',
        duration: 'random(10, 15)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }, []);

  return (
    <section className="cta-section">
      <div className="mesh-container" ref={meshRef}>
        <div ref={circle1} className="mesh-circle circle-blue"></div>
        <div ref={circle2} className="mesh-circle circle-purple"></div>
        <div ref={circle3} className="mesh-circle circle-orange"></div>
      </div>
      <div className="container">
        <div className="cta-glass-pane">
          <div className="text-center relative z-10">
            <h2 className="cta-heading">Your roadmap is one prompt away.</h2>
            <p className="cta-subheading">
              Tell us your goal and get a personalized, step-by-step roadmap in seconds.
            </p>

            <div className="cta-actions">
              <a href="#hero" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Generate My Roadmap
              </a>
              <span className="cta-urgency">Free to start • No account required • 100% Personalized</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

