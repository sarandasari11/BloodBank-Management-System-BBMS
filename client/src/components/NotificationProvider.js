import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null); // { message, title, onConfirm }

  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const confirm = (message, onConfirm, title = 'Confirm Action') => {
    setConfirmConfig({
      title,
      message,
      onConfirm: () => {
        setConfirmConfig(null);
        onConfirm();
      }
    });
  };

  return (
    <NotificationContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* 🔔 Toasts UI Overlay */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-content">
              <span className="toast-message">
                {toast.type === 'success' && '✅ '}
                {toast.type === 'error' && '❌ '}
                {toast.type === 'warning' && '⚠️ '}
                {toast.type === 'info' && 'ℹ️ '}
                {toast.message}
              </span>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* 💬 Confirmation Modal Overlay */}
      {confirmConfig && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">
              ❓ {confirmConfig.title}
            </h3>
            <p className="modal-message">{confirmConfig.message}</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 16px' }}
                onClick={() => setConfirmConfig(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '8px 16px' }}
                onClick={confirmConfig.onConfirm}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
