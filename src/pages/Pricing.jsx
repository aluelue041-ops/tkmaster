import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Shield, Zap, X, Smartphone, Bitcoin } from 'lucide-react';
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
  const [cryptoSettings, setCryptoSettings] = useState({
    usdtTrc20Address: '', usdtErc20Address: '', btcAddress: '',
    mpesaEnabled: true, cryptoEnabled: true
  });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(u => { if (u.subscription) setUserSubscription(u.subscription); })
        .catch(() => {});
    }
    fetch(`${API}/api/settings/crypto`)
      .then(r => r.json())
      .then(data => setCryptoSettings(prev => ({ ...prev, ...data })))
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

  const closeModal = () => { setShowModal(false); setTxHash(''); setPhoneNumber(''); };

  const handleUpgradeClick = (plan, method) => {
    if (plan.name === 'Free') { toast.info("The Free plan requires no payment!"); return; }
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please sign in to upgrade.'); navigate('/signin'); return; }
    setSelectedPlan(plan);
    setPaymentMethod(method);
    setShowModal(true);
  };

  const handlePayHeroSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 9) { toast.error('Please enter a valid M-Pesa phone number.'); return; }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/payhero/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phoneNumber, amount: 2500, plan: selectedPlan.name })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('✅ STK Push sent! Check your phone and enter your M-Pesa PIN.');
        closeModal();
      } else {
        toast.error(data.error || 'Payment initiation failed.');
      }
    } catch { toast.error('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleCryptoSubmit = async () => {
    if (!txHash.trim()) { toast.error('Please paste your Transaction Hash before submitting.'); return; }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/crypto/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: 20, currency: selectedCrypto, plan: selectedPlan.name, txHash: txHash.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || '✅ Payment submitted! Admin will verify and activate your plan.');
        closeModal();
      } else {
        toast.error(data.error || 'Submission failed.');
      }
    } catch { toast.error('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const isMpesa = paymentMethod === 'mpesa';
  const accent = isMpesa ? '#026cdf' : '#34c759';
  const accentDark = isMpesa ? '#0052b3' : '#28a044';

  const walletAddress =
    selectedCrypto === 'USDT-TRC20' ? cryptoSettings.usdtTrc20Address :
    selectedCrypto === 'USDT-ERC20' ? cryptoSettings.usdtErc20Address :
    cryptoSettings.btcAddress;

  const btnBase = {
    width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none',
    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
    transition: 'opacity 0.15s, transform 0.1s',
  };

  return (
    <div className="page pricing-page" style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', paddingBottom: '120px' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #026cdf 0%, #003e9e 100%)',
        padding: '64px 20px 56px', textAlign: 'center', color: 'white',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            borderRadius: '20px', padding: '6px 16px', fontSize: '11px',
            fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '18px'
          }}>
            <Zap size={13} fill="white" /> Plans & Pricing
          </div>
          <h1 style={{ fontSize: '34px', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
            Choose Your Access Plan
          </h1>
          <p style={{ fontSize: '15px', maxWidth: '460px', margin: '0 auto', opacity: 0.85, lineHeight: 1.65 }}>
            Upgrade to instantly auto-approve your tickets and unlock unlimited monthly booking limits.
          </p>
        </div>
        <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '220px', height: '220px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-90px', right: '-30px', width: '320px', height: '320px', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '50%' }} />
      </div>

      {/* Cards */}
      <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>

        {userSubscription !== 'Free' && (
          <div style={{
            background: 'linear-gradient(90deg, #e8f2ff, #f0f8ff)',
            border: '1px solid #b3d9ff', padding: '14px 20px', borderRadius: '14px',
            marginBottom: '32px', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span style={{ fontSize: '14px', color: '#004aad', fontWeight: 700 }}>
              You are on the <span style={{ textTransform: 'uppercase' }}>{userSubscription}</span> plan — enjoy your benefits!
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              flex: '1 1 280px', maxWidth: '340px',
              backgroundColor: 'white', borderRadius: '24px',
              padding: '32px', position: 'relative',
              boxShadow: plan.recommended ? '0 20px 60px rgba(2,108,223,0.16)' : '0 4px 20px rgba(0,0,0,0.06)',
              border: plan.recommended ? '2px solid #026cdf' : '1.5px solid #eaeaea',
              transform: plan.recommended ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.25s, box-shadow 0.25s',
              display: 'flex', flexDirection: 'column'
            }}
              onMouseEnter={e => { if (!plan.recommended) { e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.11)'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
              onMouseLeave={e => { if (!plan.recommended) { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              {plan.recommended && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(90deg, #026cdf, #0052b3)',
                  color: 'white', fontSize: '11px', fontWeight: 800,
                  padding: '5px 18px', borderRadius: '20px',
                  textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(2,108,223,0.35)'
                }}>
                  ⭐ Most Popular
                </div>
              )}

              <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px', color: '#111' }}>{plan.name}</h3>
              <p style={{ fontSize: '13px', color: '#999', margin: '0 0 24px', fontWeight: 500 }}>{plan.description}</p>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '40px', fontWeight: 900, color: '#111', letterSpacing: '-1px', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: '#aaa', fontWeight: 600 }}>KES / mo</span>
                </div>
                {plan.cryptoPrice && cryptoSettings.cryptoEnabled && (
                  <div style={{ marginTop: '5px', color: '#28a044', fontSize: '13px', fontWeight: 700 }}>
                    or ${plan.cryptoPrice} USDT / mo
                  </div>
                )}
                {plan.name !== 'Free' && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {cryptoSettings.mpesaEnabled && (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: '#e8f4ff', color: '#026cdf', border: '1px solid #b3d9ff' }}>📱 M-Pesa</span>
                    )}
                    {cryptoSettings.cryptoEnabled && (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: '#f0fff4', color: '#1a9c3e', border: '1px solid #b2f0c8' }}>₿ Crypto</span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '13px', flex: 1, marginBottom: '28px' }}>
                {plan.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                    <div style={{ backgroundColor: '#e6f2ff', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0 }}>
                      <Check size={13} color="#026cdf" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#333', fontWeight: 600, lineHeight: 1.45 }}>{feat}</span>
                  </div>
                ))}
                {plan.limit && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', opacity: 0.5 }}>
                    <div style={{ backgroundColor: '#ffebee', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0 }}>
                      <X size={13} color="#ff3b30" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#333', fontWeight: 600, lineHeight: 1.45 }}>{plan.limit}</span>
                  </div>
                )}
              </div>

              {userSubscription === plan.name ? (
                <div style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#f0f7ff', border: '1.5px solid #b3d9ff', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#026cdf' }}>
                  ✓ Your Current Plan
                </div>
              ) : plan.name === 'Free' ? (
                <div style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#f5f5f5', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#aaa' }}>
                  Free — No Payment Needed
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 800, color: '#ccc', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '1px' }}>Pay with</p>

                  {cryptoSettings.mpesaEnabled ? (
                    <button onClick={() => handleUpgradeClick(plan, 'mpesa')}
                      style={{ ...btnBase, background: 'linear-gradient(135deg, #026cdf, #0052b3)', color: 'white', boxShadow: '0 4px 14px rgba(2,108,223,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      📱 M-Pesa <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', textAlign: 'center', fontSize: '12px', color: '#c97300' }}>
                      <div style={{ fontWeight: 700, marginBottom: '3px' }}>🔧 M-Pesa — Under Maintenance</div>
                      {cryptoSettings.cryptoEnabled && <div style={{ fontWeight: 600 }}>Please use <strong>₿ Crypto / USDT</strong> instead.</div>}
                    </div>
                  )}

                  {cryptoSettings.cryptoEnabled ? (
                    <button onClick={() => handleUpgradeClick(plan, 'crypto')}
                      style={{ ...btnBase, background: 'linear-gradient(135deg, #34c759, #28a044)', color: 'white', boxShadow: '0 4px 14px rgba(40,160,68,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      ₿ Crypto / USDT <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', textAlign: 'center', fontSize: '12px', color: '#c97300' }}>
                      <div style={{ fontWeight: 700, marginBottom: '3px' }}>🔧 Crypto — Under Maintenance</div>
                      {cryptoSettings.mpesaEnabled && <div style={{ fontWeight: 600 }}>Please use <strong>📱 M-Pesa</strong> instead.</div>}
                    </div>
                  )}

                  {!cryptoSettings.mpesaEnabled && !cryptoSettings.cryptoEnabled && (
                    <div style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#ffeaea', border: '1px solid #ffb3b3', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#cc0000' }}>
                      ⚠️ All payment methods are under maintenance. Please check back soon.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '32px',
            width: '100%', maxWidth: '400px',
            boxShadow: '0 32px 100px rgba(0,0,0,0.25)', position: 'relative'
          }}>
            <button onClick={closeModal} style={{
              position: 'absolute', top: '18px', right: '18px',
              background: '#f0f0f0', borderRadius: '50%', border: 'none', cursor: 'pointer',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#e0e0e0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f0f0f0'}
            >
              <X size={16} color="#444" />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '14px', flexShrink: 0,
                background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 20px ${accent}40`
              }}>
                {isMpesa ? <Smartphone size={24} color="white" /> : <Bitcoin size={24} color="white" />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#111' }}>
                  {isMpesa ? 'Pay via M-Pesa' : 'Pay via Crypto'}
                </h3>
                <p style={{ margin: '2px 0 0', color: '#aaa', fontSize: '12px' }}>
                  {isMpesa ? 'PayHero STK Push' : `${selectedCrypto} Network`}
                </p>
              </div>
            </div>

            {/* Order summary */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #eef2f7', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#999', fontSize: '13px' }}>Plan</span>
                <span style={{ fontWeight: 800, color: '#111', fontSize: '13px' }}>{selectedPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #eef2f7' }}>
                <span style={{ color: '#999', fontSize: '13px' }}>Amount</span>
                <span style={{ fontWeight: 800, color: accent, fontSize: '16px' }}>
                  {isMpesa ? `KES ${selectedPlan.price}` : `$${selectedPlan.cryptoPrice} USDT`}
                </span>
              </div>
            </div>

            {/* Crypto inputs */}
            {!isMpesa ? (
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#777', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Select Network</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                  {[
                    { id: 'USDT-TRC20', label: '💰 USDT', sub: 'TRC20 (Tron)' },
                    { id: 'USDT-ERC20', label: '💰 USDT', sub: 'ERC20 (ETH)' },
                    { id: 'BTC', label: '₿ Bitcoin', sub: 'BTC Network' }
                  ].map(w => (
                    <button key={w.id} onClick={() => setSelectedCrypto(w.id)} style={{
                      flex: 1, padding: '10px 6px', borderRadius: '10px', cursor: 'pointer',
                      border: selectedCrypto === w.id ? '2px solid #34c759' : '2px solid #eaeaea',
                      backgroundColor: selectedCrypto === w.id ? '#f0fff4' : '#fafafa',
                      fontWeight: 700, fontSize: '12px',
                      color: selectedCrypto === w.id ? '#1a1a1a' : '#888',
                      transition: 'all 0.2s'
                    }}>
                      {w.label}<br />
                      <span style={{ fontSize: '9px', fontWeight: 400, color: '#bbb' }}>{w.sub}</span>
                    </button>
                  ))}
                </div>

                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#777', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  Send {selectedPlan.cryptoPrice} USDT to this address
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e8f4ff', padding: '12px', borderRadius: '10px', marginBottom: '18px' }}>
                  <code style={{ flex: 1, fontSize: '11px', fontWeight: 700, wordBreak: 'break-all', color: '#111', lineHeight: 1.7 }}>
                    {walletAddress || 'Admin has not set this address yet.'}
                  </code>
                  <button onClick={() => {
                    if (walletAddress) { navigator.clipboard.writeText(walletAddress); toast.success('Address copied!'); }
                  }} style={{ flexShrink: 0, padding: '7px 12px', background: '#026cdf', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                    📋 Copy
                  </button>
                </div>

                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#777', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  TX Hash / Transaction ID <span style={{ color: '#ff3b30' }}>*</span>
                </label>
                <input type="text" placeholder="Paste TX hash after sending payment..."
                  value={txHash} onChange={e => setTxHash(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid #eaeaea', fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', transition: 'border 0.2s', color: '#111' }}
                  onFocus={e => e.target.style.borderColor = '#34c759'}
                  onBlur={e => e.target.style.borderColor = '#eaeaea'}
                />
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#bbb' }}>Copy from your wallet or blockchain explorer after sending.</p>
              </div>
            ) : (
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#777', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>M-Pesa Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#444', fontWeight: 700 }}>+254</span>
                  <input type="tel" placeholder="712345678"
                    value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 62px', borderRadius: '10px', border: '2px solid #eaeaea', fontSize: '16px', outline: 'none', boxSizing: 'border-box', fontWeight: 600, transition: 'border 0.2s', color: '#111' }}
                    onFocus={e => e.target.style.borderColor = '#026cdf'}
                    onBlur={e => e.target.style.borderColor = '#eaeaea'}
                  />
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#bbb' }}>An STK push will be sent instantly to your phone.</p>
              </div>
            )}

            {/* Submit */}
            {(() => {
              const isDisabled = loading || (isMpesa ? !phoneNumber : !txHash.trim());
              return (
                <button
                  onClick={isMpesa ? handlePayHeroSubmit : handleCryptoSubmit}
                  disabled={isDisabled}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                    background: isDisabled ? '#e0e0e0' : `linear-gradient(135deg, ${accent}, ${accentDark})`,
                    color: isDisabled ? '#aaa' : 'white',
                    fontSize: '15px', fontWeight: 800, cursor: isDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                    transition: 'opacity 0.2s',
                    boxShadow: isDisabled ? 'none' : `0 6px 20px ${accent}40`
                  }}
                  onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {loading ? '⏳ Please wait...' : isMpesa ? `📱 Pay KES ${selectedPlan.price}` : `₿ Submit — $${selectedPlan.cryptoPrice} USDT`}
                </button>
              );
            })()}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '14px', color: '#ccc' }}>
              <Shield size={12} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Secured by {isMpesa ? 'PayHero' : 'Blockchain Network'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
