import React, { useState } from 'react';
import './FAQ.css';

const faqData = [
  {
    question: "How is this different from a generic roadmap I can find on Google?",
    answer: "Most roadmaps are static lists for everyone. CareerWeave performs a \"Delta Analysis\" to calculate the exact distance between your current skills and your dream role, building a bridge tailored only to you."
  },
  {
    question: "I’m tired of just watching videos. Will this help me build things?",
    answer: "Yes. Every roadmap is project-based, focusing on deliverables that prove your skills to recruiters rather than just passive consumption of tutorials."
  },
  {
    question: "What if my career goal is too ambitious?",
    answer: "CareerWeave includes a \"Feasibility Gate.\" If a career jump is physically impossible in your chosen timeframe, the system will provide honest, architectural reasoning and help you find a realistic first step."
  },
  {
    question: "Why are future weeks in my roadmap locked?",
    answer: "To prevent \"Week 20\" anxiety. Sequential Unlocking keeps you focused on your current milestone, only revealing future tasks once you’ve mastered the present."
  },
  {
    question: "Is my progress and personal data secure?",
    answer: "Absolutely. We use industry-standard encryption and secure authentication to ensure your roadmap and progress data are strictly private and tied to your account."
  },
  {
    question: "Is CareerWeave free to use?",
    answer: "Yes. You can generate your personalized roadmap and start tracking your progress immediately without any upfront costs."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="faq-header">
          <h2 className="section-heading">
            Still <span className="highlight-wrapper">
              <span>Unsure?</span>
              <svg className="handdrawn-line" viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M 5,15 Q 50,5 100,12 T 195,10" stroke="var(--accent-orange)" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <span> Let’s {' '}</span>
            <span className="gradient-highlight">Clear That Up.</span>
          </h2>
          <p className="section-subheading">
            Here are answers to the most common questions about how CareerWeave works and how it helps you.
          </p>
        </div>

        <div className="faq-container">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`faq-item glass-panel ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <div className="faq-question">
                <h3>{item.question}</h3>
                <span className="faq-icon">{activeIndex === index ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
