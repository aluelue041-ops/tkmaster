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
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT-TRC20');
  const [userSubscription, setUserSubscription] = useState('Free');
  const [txHash, setTxHash] = useState('');
  const [cryptoSettings, setCryptoSettings] = useState({ usdtTrc20Address: '', usdtErc20Address: '', btcAddress: '', mpesaEnabled: true, cryptoEnabled: true });

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

    // Fetch crypto settings + payment method availability
    fetch(`${API}/api/settings/crypto`)
      .then(r => r.json())
      .then(data => {
        setCryptoSettings(prev => ({ ...prev, ...data }));
      })
      .catch(() => {});
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
      name: 'VIP',
      price: '2,500',
      cryptoPrice: '20',
      description: 'For corporate & VIPs',
      features: ['Unlimited Tickets', 'Instant Auto-Approve', 'Dedicated Account Manager', 'No screen recording limits'],
      limit: '',
      recommended: true
    }
  ];

  const handleUpgradeClick = (plan, method) => {
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
    setPaymentMethod(method);
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
    if (selectedPlan.name === 'VIP') amount = 2500;

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

  const handleCryptoSubmit = async () => {
    if (!txHash.trim()) {
      toast.error('Please enter your Transaction Hash (TX ID) before submitting.');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');

    let amount = 0;
    if (selectedPlan.name === 'VIP') amount = 20;

    try {
      const res = await fetch(`${API}/api/crypto/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency: selectedCrypto,
          plan: selectedPlan.name,
          txHash: txHash.trim()
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || 'Payment submitted! Admin will verify shortly.');
        setTxHash('');
        setShowModal(false);
      } else {
        toast.error(data.error || 'Payment submission failed.');
      }
    } catch (err) {
      toast.error('Network error while connecting to Crypto service.');
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
                {plan.name !== 'Free' && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: '#e8f4ff', color: '#026cdf', border: '1px solid #b3d9ff' }}>📱 M-Pesa</span>
                  </div>
                )}
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

              {userSubscription === plan.name || plan.name === 'Free' ? (
                <button 
                  style={{ 
                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                    backgroundColor: '#f0f0f0', color: '#111',
                    fontSize: '15px', fontWeight: 700, cursor: 'default',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                  }}
                >
                  Current Plan
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', textAlign: 'center' }}>Pay with</p>
                  {cryptoSettings.mpesaEnabled ? (
                    <button 
                      onClick={() => handleUpgradeClick(plan, 'mpesa')}
                      style={{ 
                        width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none',
                        backgroundColor: '#026cdf', color: 'white',
                        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                        transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                      }}
                    >
                      📱 M-Pesa <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', textAlign: 'center', fontSize: '13px', color: '#f57f17' }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>🔧 M-Pesa — Under Maintenance</div>
                      {cryptoSettings.cryptoEnabled && (
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>Please use <strong>₿ Crypto / USDT</strong> to complete your payment.</div>
                      )}
                    </div>
                  )}
                  {cryptoSettings.cryptoEnabled ? (
                    <button 
                      onClick={() => handleUpgradeClick(plan, 'crypto')}
                      style={{ 
                        width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none',
                        backgroundColor: '#34c759', color: 'white',
                        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                        transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                      }}
                    >
                      ₿ Crypto / USDT <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', textAlign: 'center', fontSize: '13px', color: '#f57f17' }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>🔧 Crypto — Under Maintenance</div>
                      {cryptoSettings.mpesaEnabled && (
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>Please use <strong>📱 M-Pesa</strong> to complete your payment.</div>
                      )}
                    </div>
                  )}
                  {!cryptoSettings.mpesaEnabled && !cryptoSettings.cryptoEnabled && (
                    <div style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#ffeaea', border: '1px solid #ffb3b3', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#cc0000' }}>
                      ⚠️ All payment methods are currently under maintenance. Please check back soon.
                    </div>
                  )}
                </div>
              )}
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
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                  {paymentMethod === 'crypto' ? 'Pay via Crypto' : 'Pay via M-Pesa'}
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                  {paymentMethod === 'crypto' ? selectedCrypto + ' Network' : 'PayHero Integration'}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#555', fontSize: '14px' }}>Selected Plan</span>
                <span style={{ fontWeight: 800, color: '#111' }}>{selectedPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#555', fontSize: '14px' }}>Amount to Pay</span>
                <span style={{ fontWeight: 800, color: '#026cdf' }}>
                  {paymentMethod === 'crypto' ? `${selectedPlan.cryptoPrice} ${selectedCrypto}` : `${selectedPlan.price} KES`}
                </span>
              </div>
            </div>

            {paymentMethod === 'crypto' ? (
              <div style={{ marginBottom: '24px' }}>
                {/* Wallet Type Selector */}
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '8px', textTransform: 'uppercase' }}>Select Network</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { id: 'USDT-TRC20', label: '💰 USDT', sub: 'TRC20 (Tron)' },
                    { id: 'USDT-ERC20', label: '💰 USDT', sub: 'ERC20 (Ethereum)' },
                    { id: 'BTC',        label: '₿ Bitcoin', sub: 'BTC Network' }
                  ].map(w => (
                    <button
                      key={w.id}
                      onClick={() => { setSelectedCrypto(w.id); }}
                      style={{
                        flex: 1, padding: '10px 6px', borderRadius: '10px', cursor: 'pointer',
                        border: selectedCrypto === w.id ? '2px solid #34c759' : '2px solid #eaeaea',
                        backgroundColor: selectedCrypto === w.id ? '#f0fff4' : '#f9f9f9',
                        fontWeight: 700, fontSize: '13px', color: selectedCrypto === w.id ? '#1a1a1a' : '#666',
                        transition: 'all 0.2s'
                      }}
                    >
                      {w.label}<br />
                      <span style={{ fontSize: '10px', fontWeight: 400, color: '#888' }}>{w.sub}</span>
                    </button>
                  ))}
                </div>

                {/* Copyable admin address */}
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#004aad', textTransform: 'uppercase' }}>
                  Send {selectedPlan.cryptoPrice} USDT to this address:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e6f2ff', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
                  <code style={{ flex: 1, fontSize: '12px', fontWeight: 700, wordBreak: 'break-all', color: '#111', lineHeight: 1.6 }}>
                    {selectedCrypto === 'USDT-TRC20'
                      ? (cryptoSettings.usdtTrc20Address || 'Admin has not set a USDT TRC20 address yet.')
                      : selectedCrypto === 'USDT-ERC20'
                        ? (cryptoSettings.usdtErc20Address || 'Admin has not set a USDT ERC20 address yet.')
                        : (cryptoSettings.btcAddress || 'Admin has not set a BTC address yet.')}
                  </code>
                  <button
                    onClick={() => {
                      const addr = selectedCrypto === 'USDT-TRC20'
                        ? cryptoSettings.usdtTrc20Address
                        : selectedCrypto === 'USDT-ERC20'
                          ? cryptoSettings.usdtErc20Address
                          : cryptoSettings.btcAddress;
                      if (addr) {
                        navigator.clipboard.writeText(addr);
                        toast.success('Address copied!');
                      }
                    }}
                    style={{ flexShrink: 0, padding: '8px 14px', backgroundColor: '#026cdf', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    📋 Copy
                  </button>
                </div>

                {/* TX Hash input */}
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Transaction Hash / TX ID <span style={{ color: '#ff3b30' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Paste your TX hash after sending payment..."
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    border: '2px solid #eaeaea', fontSize: '13px',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'monospace', transition: 'border 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#34c759'}
                  onBlur={e => e.target.style.borderColor = '#eaeaea'}
                />
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#888' }}>
                  Copy the TX hash from your wallet or blockchain explorer after sending.
                </p>
              </div>
            ) : (
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
            )}

            {paymentMethod === 'crypto' ? (
              <button 
                onClick={handleCryptoSubmit}
                disabled={loading || !txHash.trim()}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: loading || !txHash.trim() ? '#ccc' : '#34c759', color: 'white', fontSize: '16px', fontWeight: 700, cursor: loading || !txHash.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {loading ? 'Submitting...' : `Submit Payment — ${selectedPlan.cryptoPrice} USDT`}
              </button>
            ) : (
              <button 
                onClick={handlePayHeroSubmit}
                disabled={loading || !phoneNumber}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: loading || !phoneNumber ? '#ccc' : '#34c759', color: 'white', fontSize: '16px', fontWeight: 700, cursor: loading || !phoneNumber ? 'not-allowed' : 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {loading ? 'Initiating STK Push...' : `Pay ${selectedPlan.price} KES`}
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', color: '#aaa' }}>
              <Shield size={14} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Secured by {paymentMethod === 'crypto' ? 'Crypto Network' : 'PayHero'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
