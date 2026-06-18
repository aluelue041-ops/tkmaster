import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Share2, CheckCircle } from 'lucide-react';

export default function ForYou() {
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/event/trending`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId('trending');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="page for-you-page">
      <div className="header">
        <h1 className="header-title">For You</h1>
      </div>
      
      <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <User size={40} color="#999" />
        </div>
        
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Personalize Your Experience</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
          Sign in to track your favorite artists, venues, and events to get personalized recommendations.
        </p>
        
        <button className="btn-primary" style={{ marginBottom: '16px' }} onClick={() => navigate('/signin')}>Sign In</button>
        <button className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }} onClick={() => navigate('/signin')}>
          Create Account
        </button>
      </div>

      <div style={{ padding: '0 16px', paddingBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Popular Right Now</h3>
        
        <div 
          className="event-card" 
          style={{ marginBottom: '16px', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onClick={() => navigate('/event/trending')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Concert" className="event-image" style={{ height: '140px' }} />
          
          <button 
            onClick={handleCopyLink}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
              zIndex: 2
            }}
            title="Copy event link"
          >
            {copiedId === 'trending' ? (
              <CheckCircle size={18} color="#00c853" />
            ) : (
              <Share2 size={18} color="#333" />
            )}
          </button>

          <div className="event-details">
            <div className="event-date">Trending</div>
            <h3 className="event-title">Summer Music Festival</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Various Artists • City Park</p>
          </div>
          
          {copiedId === 'trending' && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#323232',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 500,
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              animation: 'fadeIn 0.2s'
            }}>
              Link copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
