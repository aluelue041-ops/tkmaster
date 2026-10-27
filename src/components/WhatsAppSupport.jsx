import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Users, X, ChevronRight } from 'lucide-react';

export default function WhatsAppSupport({ customMessage }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close menu if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Do not render floating button on admin dashboard or My Tickets page
  if (location.pathname.startsWith('/admin') || location.pathname === '/mytickets') {
    return null;
  }

  const defaultMsg = customMessage || 'Hello Admin, I have an inquiry regarding Ticketmaster.';
  const adminWhatsAppUrl = `https://wa.me/254108441326?text=${encodeURIComponent(defaultMsg)}`;
  const groupWhatsAppUrl = 'https://chat.whatsapp.com/CAtsNr2G49E1OHbPKZAafG?s=cl&p=a&mlu=4&ilr=4&iam=2';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '18px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {/* WhatsApp Popup Card */}
      {isOpen && (
        <div
          style={{
            marginBottom: '12px',
            width: '290px',
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.22), 0 4px 12px rgba(37,211,102,0.15)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            animation: 'fadeInUp 0.25s ease-out',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #128C7E, #25D366)',
              padding: '16px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.2px' }}>
                WhatsApp Hub
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>
                Online Support & Community
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp Hub"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Action List */}
          <div style={{ padding: '12px' }}>
            {/* 1. Chat with Admin */}
            <a
              href={adminWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#111827',
                backgroundColor: '#f9fafb',
                border: '1px solid #f3f4f6',
                marginBottom: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ecfdf5';
                e.currentTarget.style.borderColor = '#a7f3d0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#f3f4f6';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <MessageCircle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                    Chat with Admin
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>
                    +254108441326 • Fast Support
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="#9ca3af" />
            </a>

            {/* 2. Join WhatsApp Group */}
            <a
              href={groupWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#111827',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dcfce7';
                e.currentTarget.style.borderColor = '#86efac';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
                e.currentTarget.style.borderColor = '#bbf7d0';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#128C7E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#065f46' }}>
                    Join WhatsApp Group
                  </div>
                  <div style={{ fontSize: '11px', color: '#047857', marginTop: '1px' }}>
                    Official Community & Alerts
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="#059669" />
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="WhatsApp Support & Community (+254108441326)"
        aria-label="Open WhatsApp options"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#25D366',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '32px',
          boxShadow: '0 4px 18px rgba(37, 211, 102, 0.45)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'scale(1.03)' : 'scale(1)',
        }}
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
        <span style={{ fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap' }}>
          {isOpen ? 'Close' : 'WhatsApp'}
        </span>
      </button>
    </div>
  );
}
