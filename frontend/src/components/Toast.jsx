import React from 'react';
import { PartyPopper, Lock, Info, AlertTriangle, X, Goal, GraduationCap, RouteOff } from 'lucide-react';

const Toast = ({ message, type = 'info', onRemove }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <PartyPopper size={18} />;
      case 'warning': return <Lock size={18} />;
      case 'error': return <AlertTriangle size={18} />;
      case 'role-error': return <Goal size={18} />;
      case 'skills-error': return <GraduationCap size={18} />;
      case 'route-error': return <RouteOff size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className={`rv-toast ${type}`}>
      <div className="rv-toast-icon">
        {getIcon()}
      </div>
      <div className="rv-toast-content">
        <p>{message}</p>
      </div>
      <div className="rv-toast-progress"></div>
      {/* Optional: Add close button if needed */}
    </div>
  );
};

export const ToastContainer = ({ toasts }) => {
  return (
    <div className="rv-toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          message={toast.message} 
          type={toast.type} 
        />
      ))}
    </div>
  );
};

export default Toast;
