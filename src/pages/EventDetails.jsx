import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Clock, Share2, Heart, CheckCircle } from 'lucide-react';

export default function EventDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [copied, setCopied] = React.useState(false);

  // If we navigated here with state, use it. Otherwise, use dummy data (since we don't have a real backend yet)
  const event = location.state?.event || {
    id: id || "trending",
    title: "Summer Music Festival",
    date: "Sat, Oct 12 • 8:00 PM",
    location: "Various Artists • City Park",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Concerts",
    description: "Experience the best music festival of the summer with amazing artists performing live! Get ready for a night full of energy, food trucks, and unforgettable memories.",
    price: "$85.00"
  };

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="page event-details-page" style={{ paddingBottom: '80px', backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      {/* Header Image & Back Button */}
      <div style={{ position: 'relative', height: '250px', width: '100%' }}>
        <img 
          src={event.image} 
          alt={event.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <ChevronLeft size={24} color="#333" />
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleCopyLink}
              style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {copied ? <CheckCircle size={20} color="#00c853" /> : <Share2 size={20} color="#333" />}
            </button>
            <button 
              style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <Heart size={20} color="#333" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', backgroundColor: 'var(--card-bg)', borderRadius: '24px 24px 0 0', marginTop: '-24px', position: 'relative', zIndex: 5 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>{event.title}</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 102, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} color="var(--primary-color)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>{event.date.split('•')[0].trim()}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{event.date.split('•')[1]?.trim() || "Time TBD"}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 102, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={24} color="var(--primary-color)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>
                {event.mapLink ? (
                  <a href={event.mapLink} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                    {event.location.split('•')[0].trim()}
                  </a>
                ) : (
                  event.location.split('•')[0].trim()
                )}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{event.location.split('•')[1]?.trim() || "Location TBA"}</div>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-color)', margin: '24px 0' }} />

        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>About this event</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>
            {event.description || "Join us for an unforgettable experience! This event features amazing performances, great atmosphere, and a chance to make lasting memories."}
          </p>
        </div>

        {/* Location Map Placeholder */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Location</h2>
          {event.mapLink ? (
            <a href={event.mapLink} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ 
                width: '100%', height: '180px', backgroundColor: '#e0e0e0', borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer'
              }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ zIndex: 2, padding: '12px', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                   <MapPin size={24} color="#026cdf" />
                </div>
              </div>
            </a>
          ) : (
            <div style={{ 
              width: '100%', height: '180px', backgroundColor: '#e0e0e0', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ zIndex: 2, padding: '12px', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                 <MapPin size={24} color="var(--primary-color)" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px', 
        backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.08)'
      }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Starting from</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-color)' }}>
            {event.currency || '$'}{event.basePrice || 80}
          </div>
        </div>
        <button
          onClick={() => navigate(`/seat-selection/${event._id || id}`, { state: { event } })}
          style={{
            backgroundColor: '#026cdf',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(2,108,223,0.35)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎟️ See Tickets
        </button>
      </div>
      
      {/* Toast Notification */}
      {copied && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#323232',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '24px',
          fontSize: '14px',
          fontWeight: 500,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s'
        }}>
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
