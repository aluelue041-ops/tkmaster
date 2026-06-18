import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, Globe, Heart, CreditCard, HelpCircle, MessageSquare, BookOpen, ChevronRight, Bell } from 'lucide-react';

export default function MyAccount() {
  const [receiveNotifs, setReceiveNotifs] = useState(false);
  const [locationContent, setLocationContent] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const [toastMessage, setToastMessage] = useState('');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToastMessage('Signed out successfully!');
    setTimeout(() => {
      navigate('/signin');
    }, 1500);
  };

  return (
    <div className="page my-account-page dark-mode">
      <div className="header" style={{ backgroundColor: 'var(--dark-bg)', borderBottom: 'none' }}>
        <h1 className="header-title" style={{ color: 'white', fontSize: '16px' }}>My Account</h1>
      </div>

      <div className="profile-header">
        <h2 className="profile-name">{user ? user.email.split('@')[0] : 'Guest'}</h2>
        <p className="profile-email">{user ? user.email : 'Please sign in'}</p>
      </div>

      <div className="settings-list">
        
        {/* Notifications */}
        <div className="settings-group" style={{ marginTop: '24px' }}>
          <div className="settings-group-title" style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'none', margin: 0 }}>
            Notifications
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <Mail size={20} color="#666" />
              <span>My Notifications</span>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <Bell size={20} color="#666" />
              <span>Receive Notifications?</span>
            </div>
            <div className={`toggle-switch ${receiveNotifs ? 'on' : ''}`} onClick={() => setReceiveNotifs(!receiveNotifs)}></div>
          </div>
        </div>

        {/* Location Settings */}
        <div className="settings-group">
          <div className="settings-group-title" style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'none', margin: 0 }}>
            Location Settings
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <MapPin size={20} color="#666" />
              <span>My Location</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
              <span>Texas, TX</span>
            </div>
          </div>

          <div className="settings-item">
            <div className="settings-item-left">
              <Globe size={20} color="#666" />
              <span>My Country</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>🇺🇸</span> United States
              </span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <MapPin size={20} color="#666" />
              <span>Location Based Content</span>
            </div>
            <div className={`toggle-switch ${locationContent ? 'on' : ''}`} onClick={() => setLocationContent(!locationContent)}></div>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-group">
          <div className="settings-group-title" style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'none', margin: 0 }}>
            Preferences
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <Heart size={20} color="#666" />
              <span>My Favourites</span>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <CreditCard size={20} color="#666" />
              <span>Saved Payment Methods</span>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>
        </div>

        {/* Help & Guidance */}
        <div className="settings-group">
          <div className="settings-group-title" style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'none', margin: 0 }}>
            Help & Guidance
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <HelpCircle size={20} color="#666" />
              <span>Need Help?</span>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <MessageSquare size={20} color="#666" />
              <span>Give Us Feedback</span>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <BookOpen size={20} color="#666" />
              <span>Legal</span>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>
        </div>

        {/* Admin Dashboard (Only visible to admin) */}
        {user?.role === 'admin' && (
          <div className="settings-group">
            <div className="settings-item" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
              <div className="settings-item-left">
                <Globe size={20} color="var(--primary-color)" />
                <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Admin Dashboard</span>
              </div>
              <ChevronRight size={20} color="#ccc" />
            </div>
          </div>
        )}

      </div>

      <div style={{ padding: '24px', textAlign: 'center', marginBottom: '80px' }}>
        <button 
          style={{ backgroundColor: 'transparent', color: '#ff3b30', border: '1px solid #ff3b30', padding: '12px 32px', borderRadius: '24px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={handleSignOut}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff0f0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          Sign Out
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#323232',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '24px',
          fontSize: '14px',
          fontWeight: 500,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.3s'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
