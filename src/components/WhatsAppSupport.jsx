import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function WhatsAppSupport({ customMessage }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  // Do not render floating button on admin dashboard or My Tickets page
  if (location.pathname.startsWith('/admin') || location.pathname === '/mytickets') {
    return null;
  }

  const defaultMsg = customMessage || 'Hello Admin, I have an inquiry regarding Ticketmaster.';
  const whatsappUrl = `https://wa.me/254107692553?text=${encodeURIComponent(defaultMsg)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Chat with Admin on WhatsApp (+254107692553)"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '18px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#25D366',
        color: '#ffffff',
        padding: hovered ? '10px 16px' : '12px',
        borderRadius: '30px',
        boxShadow: hovered 
          ? '0 6px 20px rgba(37, 211, 102, 0.45)' 
          : '0 4px 14px rgba(0, 0, 0, 0.25)',
        textDecoration: 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
      aria-label="Contact Admin on WhatsApp"
    >
      {/* WhatsApp SVG Icon */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        style={{ display: 'block', flexShrink: 0 }}
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.33C9.32 7.33 8.97 7.41 8.68 7.73C8.39 8.04 7.56 8.82 7.56 10.41C7.56 12 8.71 13.54 8.87 13.76C9.03 13.97 11.13 17.21 14.35 18.6C15.12 18.93 15.72 19.13 16.19 19.28C16.97 19.53 17.68 19.49 18.24 19.41C18.87 19.31 20.17 18.62 20.44 17.85C20.71 17.08 20.71 16.42 20.63 16.29C20.55 16.16 20.34 16.08 20.02 15.92C19.71 15.76 18.17 15.01 17.88 14.9C17.6 14.8 17.39 14.75 17.18 15.06C16.97 15.37 16.36 16.08 16.18 16.29C16 16.5 15.82 16.53 15.5 16.37C15.19 16.21 14.19 15.88 13 14.82C12.07 13.99 11.44 12.96 11.26 12.65C11.08 12.34 11.24 12.18 11.4 12.02C11.54 11.88 11.71 11.66 11.87 11.47C12.03 11.28 12.08 11.15 12.19 10.94C12.29 10.73 12.24 10.55 12.16 10.39C12.08 10.23 11.47 8.74 11.21 8.12C10.96 7.53 10.7 7.61 10.51 7.6C10.33 7.6 10.12 7.6 9.91 7.6C9.7 7.6 9.35 7.68 9.53 7.33Z" />
      </svg>
      {hovered && (
        <span style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          Chat with Admin
        </span>
      )}
    </a>
  );
}
