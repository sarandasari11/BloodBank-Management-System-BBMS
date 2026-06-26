import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navLinksRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0, width: 0, transform: 'translateX(0px)' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const updateIndicator = () => {
    const container = navLinksRef.current;
    if (!container) return;

    const activeLink = container.querySelector('a.active');
    if (!activeLink) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - containerRect.left + container.scrollLeft;

    setIndicatorStyle({
      opacity: 1,
      width: linkRect.width,
      transform: `translateX(${left}px)`
    });
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateIndicator);
    window.addEventListener('resize', updateIndicator);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname]);

  // Apply theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Smooth indicator update after theme classes modify widths/spacings
    setTimeout(updateIndicator, 50);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <nav>
      <NavLink to="/" className="nav-brand">
        🩸 BloodBank <span>Management System</span>
      </NavLink>
      <div className="nav-links" ref={navLinksRef}>
        <span className="nav-indicator" style={indicatorStyle} aria-hidden="true" />
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Overview
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'active' : ''}>
          Inventory
        </NavLink>
        <NavLink to="/donors" className={({ isActive }) => isActive ? 'active' : ''}>
          Donors
        </NavLink>
        <NavLink to="/donations" className={({ isActive }) => isActive ? 'active' : ''}>
          Donations
        </NavLink>
        <NavLink to="/hospitals" className={({ isActive }) => isActive ? 'active' : ''}>
          Hospitals
        </NavLink>
        <NavLink to="/requests" className={({ isActive }) => isActive ? 'active' : ''}>
          Requests
        </NavLink>
        
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
