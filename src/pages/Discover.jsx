import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Share2, CheckCircle } from 'lucide-react';

export default function Discover() {
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const events = [
    {
      id: 1,
      title: "Benson Boone",
      date: "Fri, Sep 19 • 7:00 PM",
      location: "Madison Square Garden • New York, NY",
      image: "/images/benson_boone.png",
      category: "Concerts"
    },
    {
      id: 2,
      title: "The Weeknd: After Hours Tour",
      date: "Sat, Oct 12 • 8:00 PM",
      location: "MetLife Stadium • East Rutherford, NJ",
      image: "/images/weeknd.png",
      category: "Concerts"
    },
    {
      id: 3,
      title: "New York Knicks vs. Boston Celtics",
      date: "Wed, Nov 5 • 7:30 PM",
      location: "Madison Square Garden • New York, NY",
      image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Sports"
    }
  ];

  const categories = ["All", "Concerts", "Sports", "Arts & Theater", "Family"];

  const handleCopyLink = (event, e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/event/${event.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const navigate = useNavigate();

  const handleEventClick = (event) => {
    navigate(`/event/${event.id}`, { state: { event } });
  };

  // Filter events based on search query and active category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page discover-page">
      <div className="header">
        <h1 className="header-title">Discover</h1>
      </div>
      
      <div className="search-container">
        <div className="search-bar">
          <Search size={20} color="#666" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for events, artists, or venues" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="categories-scroll" style={{ display: 'flex', overflowX: 'auto', padding: '0 16px 16px', gap: '8px' }}>
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setActiveCategory(cat)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '20px', 
              border: '1px solid var(--border-color)', 
              background: activeCategory === cat ? 'var(--primary-color)' : 'var(--card-bg)',
              color: activeCategory === cat ? 'white' : 'var(--text-primary)',
              whiteSpace: 'nowrap',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: activeCategory === cat ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="event-list">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div 
              key={event.id} 
              className="event-card" 
              style={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.2s ease' }}
              onClick={() => handleEventClick(event)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src={event.image} alt={event.title} className="event-image" />
              
              {/* Share Button Overlay */}
              <button 
                onClick={(e) => handleCopyLink(event, e)}
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
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {copiedId === event.id ? (
                  <CheckCircle size={18} color="#00c853" />
                ) : (
                  <Share2 size={18} color="#333" />
                )}
              </button>

              <div className="event-details">
                <div className="event-date">{event.date}</div>
                <h3 className="event-title">{event.title}</h3>
                <div className="event-location">
                  <MapPin size={14} /> {event.location}
                </div>
              </div>
              
              {/* Toast Notification */}
              {copiedId === event.id && (
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
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            <p>No events found matching your criteria.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
