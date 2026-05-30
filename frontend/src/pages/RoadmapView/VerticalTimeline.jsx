import React from 'react';
import { Clock, BarChart2 } from 'lucide-react';
import './VerticalTimeline.css';

const VerticalTimeline = ({ 
  curriculum, 
  onOpenDrawer, 
  onToggleMilestone, 
  onShowToast, 
  isExampleView 
}) => {
  if (!curriculum || curriculum.length === 0) return null;

  return (
    <div className="vertical-timeline-container">
      <div className="vertical-timeline">
        {curriculum.map((week, index) => {
          const isCompleted = isExampleView ? false : !!week.is_completed;
          const isLocked = isExampleView ? false : (!!week.is_locked && !isCompleted);
          const isActive = isExampleView ? true : (!isLocked && !isCompleted);
          
          let fogLevel = 0;
          if (isExampleView) {
             fogLevel = index >= 5 ? (index - 4) : 0;
          }
          
          const blurValue = (isExampleView && fogLevel > 0) ? `${fogLevel * 1.5}px` : '0px';
          const opacityValue = (isExampleView && fogLevel > 0) ? Math.max(1 - (fogLevel * 0.15), 0.15) : 1;

          let statusClass = '';
          let label = '';
          if (isExampleView) {
            statusClass = 'status-example';
          } else if (isCompleted) {
            statusClass = 'status-completed';
            label = 'Completed';
          } else if (isLocked) {
            statusClass = 'status-locked';
            label = 'Locked';
          } else {
            statusClass = 'status-active';
            label = 'In Progress';
          }

          const handleCardClick = (e) => {
            e.stopPropagation();
            if (isExampleView && fogLevel > 0) {
              onShowToast(`This milestone is locked in the preview. Sign up to unlock full roadmap!`, 'warning');
              return;
            }
            if (isLocked) {
              onShowToast(`Complete Week ${week.week_number - 1} to unlock this milestone.`, 'warning');
            } else {
              onOpenDrawer(week);
            }
          };

          const taskText = (week.task && typeof week.task === 'string') ? week.task : '';
          const displayTask = taskText.split(' ').slice(0, 15).join(' ') + '...';

          return (
            <div key={week.id} className={`vt-item ${statusClass}`} style={{
              filter: blurValue !== '0px' ? `blur(${blurValue})` : 'none',
              opacity: opacityValue,
              pointerEvents: opacityValue < 0.3 ? 'none' : 'auto'
            }}>
              {/* Connecting Line (except last item) */}
              {index < curriculum.length - 1 && (
                <div className={`vt-line ${statusClass}`}></div>
              )}
              
              {/* Timeline Node */}
              <div className={`vt-node ${statusClass}`}>
                {isActive && !isExampleView && <div className="pulse-dot" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: 0, position: 'absolute' }} />}
              </div>
              
              {/* Card Content */}
              <div className={`vt-card glass-panel ${statusClass}`} onClick={handleCardClick}>
                <div className="rc-header">
                  <div className="rc-meta">
                    <span className="rc-week" style={{ color: '#fff' }}>Week {week.week_number}</span>
                    {!isExampleView && <span className="roadmap-node-status">{label}</span>}
                    {isExampleView && week.estimated_hours && (
                      <span className="rc-badge rc-time" style={{ marginLeft: 'auto' }}>
                        <Clock size={12} />
                        {week.estimated_hours}h
                      </span>
                    )}
                  </div>
                  <h3 className="rc-topic" style={{ marginTop: '0.5rem' }}>{week.topic}</h3>
                  <div className="rc-badges" style={{ marginTop: '0.5rem' }}>
                    {week.difficulty && typeof week.difficulty === 'string' && (
                      <span className={`rc-badge rc-diff rc-diff--${week.difficulty.toLowerCase()}`}>
                        <BarChart2 size={12} />
                        {week.difficulty}
                      </span>
                    )}
                    {!isExampleView && week.estimated_hours && (
                      <span className="rc-badge rc-time">
                        <Clock size={12} />
                        {week.estimated_hours}h
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="rc-body">
                  <p className="rc-objective"><strong>Goal:</strong> {week.key_objective}</p>
                  <div className="rc-details">
                    <p className="rc-locked-task"><strong>Task:</strong> {isLocked ? taskText : displayTask}</p>
                  </div>
                </div>

                {isActive && !isExampleView && (
                  <div className="rc-footer">
                    <button
                      className="rc-btn rc-btn--active"
                      onClick={(e) => { e.stopPropagation(); onToggleMilestone(week.id, isCompleted); }}
                    >
                      Mark as Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalTimeline;
