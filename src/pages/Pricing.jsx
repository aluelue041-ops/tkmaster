import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Shield, Zap, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userSubscription, setUserSubscription] = useState('Free');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(u => {
          if (u.subscription) setUserSubscription(u.subscription);
        })
        .catch(() => {});
    }
  }, [API]);

  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'For casual event goers',
      features: ['2 Tickets per month', 'Standard Approval', 'Email Support'],
      limit: 'Strict screen recording limits',
      recommended: false
    },
    {
      name: 'Basic',
      price: '15,000',
      description: 'For regular attendees',
      features: ['40 Tickets per month', 'Auto-Approve Tickets', 'Priority Email Support', 'No screen recording limits'],
      limit: '',
      recommended: true
    },
    {
      name: 'Premium',
      price: '30,000',
      description: 'For event enthusiasts',
      features: ['100 Tickets per month', 'Auto-Approve Tickets', '24/7 Priority Support', 'No screen recording limits'],
      limit: '',
      recommended: false
    },
    {
      name: 'VIP',
      price: '50,000',
      description: 'For corporate & VIPs',
      features: ['Unlimited Tickets', 'Instant Auto-Approve', 'Dedicated Account Manager', 'No screen recording limits'],
      limit: '',
      recommended: false
    }
  ];

  const handleUpgradeClick = (plan) => {
    if (plan.name === 'Free') {
      toast.info("You are already on the Free tier or it's free!");
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to upgrade your subscription.');
      navigate('/signin');
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePayHeroSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error('Please enter a valid M-Pesa phone number.');
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    let amount = 0;
    if (selectedPlan.name === 'Basic') amount = 15000;
    if (selectedPlan.name === 'Premium') amount = 30000;
    if (selectedPlan.name === 'VIP') amount = 50000;

    try {
      const res = await fetch(`${API}/api/payhero/stk-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber,
          amount,
          plan: selectedPlan.name
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('STK Push sent! Please check your phone to enter your M-Pesa PIN.');
        setShowModal(false);
      } else {
        toast.error(data.error || 'Payment initiation failed.');
      }
    } catch (err) {
      toast.error('Network error while connecting to PayHero.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page pricing-page" style={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '120px' }}>
      <div style={{ backgroundColor: '#026cdf', padding: '60px 20px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-1px' }}>Choose Your Access Plan</h1>
          <p style={{ fontSize: '16px', maxWidth: '500px', margin: '0 auto', opacity: 0.9, lineHeight: 1.5 }}>
            Upgrade your account to instantly auto-approve your tickets and unlock higher monthly booking limits.
          </p>
        </div>
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', right: '-20px', width: '300px', height: '300px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '50%' }}></div>
      </div>

      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {userSubscription !== 'Free' && (
          <div style={{ backgroundColor: '#e6f2ff', border: '1px solid #b3d9ff', padding: '16px', borderRadius: '12px', marginBottom: '32px', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: '#004aad', fontWeight: 700 }}>
              You are currently on the <span style={{ textTransform: 'uppercase' }}>{userSubscription}</span> plan.
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
          {plans.map(plan => (
            <div 
              key={plan.name} 
              style={{ 
                flex: '1 1 280px', maxWidth: '320px', 
                backgroundColor: 'white', borderRadius: '24px', 
                padding: '32px', position: 'relative',
                boxShadow: plan.recommended ? '0 20px 40px rgba(2,108,223,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                border: plan.recommended ? '2px solid #026cdf' : '1px solid #eaeaea',
                transform: plan.recommended ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.2s',
                display: 'flex', flexDirection: 'column'
              }}
            >
              {plan.recommended && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#026cdf', color: 'white', fontSize: '12px', fontWeight: 800, padding: '4px 16px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Most Popular
                </div>
              )}
              
              <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: '#111' }}>{plan.name}</h3>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px' }}>{plan.description}</p>
              
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: '#888', fontWeight: 600 }}> KES / mo</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, marginBottom: '32px' }}>
                {plan.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ backgroundColor: '#e6f2ff', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                      <Check size={14} color="#026cdf" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '14px', color: '#333', fontWeight: 600, lineHeight: 1.4 }}>{feat}</span>
                  </div>
                ))}
                {plan.limit && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: 0.6 }}>
                    <div style={{ backgroundColor: '#ffebee', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                      <X size={14} color="#ff3b30" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '14px', color: '#333', fontWeight: 600, lineHeight: 1.4 }}>{plan.limit}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleUpgradeClick(plan)}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  backgroundColor: plan.recommended ? '#026cdf' : '#f0f0f0',
                  color: plan.recommended ? 'white' : '#111',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                  transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                {userSubscription === plan.name ? 'Current Plan' : (plan.name === 'Free' ? 'Current Plan' : 'Upgrade via M-Pesa')}
                {plan.name !== 'Free' && userSubscription !== plan.name && <ArrowRight size={18} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PayHero M-Pesa Modal */}
      {showModal && selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: '#f0f0f0', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} color="#333" />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Pay via M-Pesa</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>PayHero Integration</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#555', fontSize: '14px' }}>Selected Plan</span>
                <span style={{ fontWeight: 800, color: '#111' }}>{selectedPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#555', fontSize: '14px' }}>Amount to Pay</span>
                <span style={{ fontWeight: 800, color: '#026cdf' }}>{selectedPlan.price} KES</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '8px', textTransform: 'uppercase' }}>M-Pesa Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '15px', fontSize: '15px', color: '#555', fontWeight: 700 }}>+254</span>
                <input 
                  type="tel"
                  placeholder="712345678"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  style={{ width: '100%', padding: '14px 14px 14px 64px', borderRadius: '10px', border: '2px solid #eaeaea', fontSize: '16px', outline: 'none', boxSizing: 'border-box', fontWeight: 600, transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#34c759'}
                  onBlur={e => e.target.style.borderColor = '#eaeaea'}
                />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#888' }}>Format: 7XXXXXXXX or 07XXXXXXXX</p>
            </div>

            <button 
              onClick={handlePayHeroSubmit}
              disabled={loading || !phoneNumber}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: loading || !phoneNumber ? '#ccc' : '#34c759', color: 'white', fontSize: '16px', fontWeight: 700, cursor: loading || !phoneNumber ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? 'Initiating STK Push...' : `Pay ${selectedPlan.price} KES`}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', color: '#aaa' }}>
              <Shield size={14} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Secured by PayHero</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
