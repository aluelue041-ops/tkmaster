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

  const closeModal = () => { setShowModal(false); setTxHash(''); setPhoneNumber(''); };

  const handleUpgradeClick = (method) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please sign in to upgrade.'); navigate('/signin'); return; }
    setSelectedPlan({ name: 'VIP', price: '2,500', cryptoPrice: '20' });
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
        body: JSON.stringify({ phoneNumber, amount: 2500, plan: 'VIP' })
      });
      const data = await res.json();
      if (res.ok) { toast.success('✅ STK Push sent! Enter your M-Pesa PIN on your phone.'); closeModal(); }
      else toast.error(data.error || 'Payment initiation failed.');
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
        body: JSON.stringify({ amount: 20, currency: selectedCrypto, plan: 'VIP', txHash: txHash.trim() })
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message || '✅ Payment submitted! Admin will verify and activate your plan.'); closeModal(); }
      else toast.error(data.error || 'Submission failed.');
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

  const isVIP = userSubscription === 'VIP';

  const sharedFeatures = [
    'Unlimited Tickets',
    'Instant Auto-Approve',
    'Dedicated Account Manager',
    'No screen recording limits',
  ];

  const cardHover = (e, enter) => {
    e.currentTarget.style.transform = enter ? 'translateY(-4px)' : 'translateY(0)';
    e.currentTarget.style.boxShadow = enter
      ? '0 20px 56px rgba(0,0,0,0.13)'
      : '0 4px 20px rgba(0,0,0,0.06)';
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
            Upgrade to instantly auto-approve your tickets and unlock unlimited booking limits.
          </p>
        </div>
        <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '220px', height: '220px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-90px', right: '-30px', width: '320px', height: '320px', backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: '50%' }} />
      </div>

      {/* Benefits strip */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '16px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
          {[
            { icon: '⚡', text: 'Instant Auto-Approve' },
            { icon: '🎟️', text: 'Unlimited Tickets' },
            { icon: '🛡️', text: 'Priority Support' },
            { icon: '📵', text: 'No Recording Limits' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '16px' }}>{b.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#444' }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>

        {isVIP && (
          <div style={{
            background: 'linear-gradient(90deg, #e8f2ff, #f0f8ff)',
            border: '1px solid #b3d9ff', padding: '14px 20px', borderRadius: '14px',
            marginBottom: '32px', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span style={{ fontSize: '14px', color: '#004aad', fontWeight: 700 }}>
              You are on the VIP plan — enjoy unlimited access!
            </span>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#bbb', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
            Select a plan to get started
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>

          {/* ── FREE CARD ── */}
          <div style={{
            flex: '1 1 260px', maxWidth: '300px', backgroundColor: 'white',
            borderRadius: '24px', padding: '28px 24px',
            border: '1.5px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column', transition: 'transform 0.25s, box-shadow 0.25s'
          }}
            onMouseEnter={e => cardHover(e, true)}
            onMouseLeave={e => cardHover(e, false)}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '22px' }}>🎟️</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#111' }}>Free</h3>
            <p style={{ fontSize: '13px', color: '#999', margin: '0 0 20px' }}>For casual event goers</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
              <span style={{ fontSize: '38px', fontWeight: 900, color: '#111', letterSpacing: '-1px', lineHeight: 1 }}>0</span>
              <span style={{ fontSize: '13px', color: '#aaa', fontWeight: 600 }}>KES / mo</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginBottom: '24px' }}>
              {['2 Tickets per month', 'Standard Approval', 'Email Support'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ backgroundColor: '#f0f0f0', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#888" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#555', fontWeight: 600 }}>{f}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
                <div style={{ backgroundColor: '#ffebee', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <X size={12} color="#ff3b30" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '13px', color: '#555', fontWeight: 600 }}>Strict screen recording limits</span>
              </div>
            </div>
            <div style={{ width: '100%', padding: '13px', borderRadius: '12px', backgroundColor: '#f5f5f5', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#aaa' }}>
              {userSubscription === 'Free' ? '✓ Your Current Plan' : 'Free — No Payment Needed'}
            </div>
          </div>

          {/* ── VIP M-PESA CARD ── */}
          <div style={{
            flex: '1 1 260px', maxWidth: '300px', backgroundColor: 'white',
            borderRadius: '24px', padding: '28px 24px', position: 'relative',
            border: '2px solid #026cdf', boxShadow: '0 20px 60px rgba(2,108,223,0.14)',
            display: 'flex', flexDirection: 'column', transition: 'transform 0.25s, box-shadow 0.25s'
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 28px 70px rgba(2,108,223,0.22)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(2,108,223,0.14)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #026cdf, #0052b3)', color: 'white', fontSize: '11px', fontWeight: 800, padding: '4px 16px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(2,108,223,0.35)' }}>
              📱 M-Pesa
            </div>

            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #026cdf, #0052b3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 6px 16px rgba(2,108,223,0.35)' }}>
              <Smartphone size={22} color="white" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#111' }}>VIP</h3>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e8f4ff', color: '#026cdf', border: '1px solid #b3d9ff', letterSpacing: '0.5px' }}>🇰🇪 LOCAL PAYMENT</span>
            </div>
            <p style={{ fontSize: '13px', color: '#999', margin: '0 0 20px' }}>Pay via M-Pesa STK Push</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
              <span style={{ fontSize: '38px', fontWeight: 900, color: '#026cdf', letterSpacing: '-1px', lineHeight: 1 }}>2,500</span>
              <span style={{ fontSize: '13px', color: '#aaa', fontWeight: 600 }}>KES / mo</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginBottom: '24px' }}>
              {sharedFeatures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ backgroundColor: '#e6f2ff', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#026cdf" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#333', fontWeight: 600 }}>{f}</span>
                </div>
              ))}
            </div>

            {isVIP ? (
              <div style={{ width: '100%', padding: '13px', borderRadius: '12px', backgroundColor: '#f0f7ff', border: '1.5px solid #b3d9ff', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#026cdf' }}>
                ✓ Your Current Plan
              </div>
            ) : cryptoSettings.mpesaEnabled ? (
              <button onClick={() => handleUpgradeClick('mpesa')} style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #026cdf, #0052b3)', color: 'white',
                fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                boxShadow: '0 6px 18px rgba(2,108,223,0.35)', transition: 'opacity 0.15s, transform 0.1s'
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Pay with M-Pesa <ArrowRight size={16} />
              </button>
            ) : (
              <div style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', textAlign: 'center', fontSize: '12px', color: '#c97300' }}>
                <div style={{ fontWeight: 700, marginBottom: '3px' }}>🔧 M-Pesa — Under Maintenance</div>
                {cryptoSettings.cryptoEnabled && <div style={{ fontWeight: 600 }}>Please use <strong>₿ Crypto</strong> instead.</div>}
              </div>
            )}
          </div>

          {/* OR divider */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'center', flexShrink: 0 }}>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#e0e0e0' }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f5f5f5', border: '1.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#aaa' }}>OR</div>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#e0e0e0' }} />
          </div>

          {/* ── VIP CRYPTO CARD ── */}
          <div style={{
            flex: '1 1 260px', maxWidth: '300px', backgroundColor: 'white',
            borderRadius: '24px', padding: '28px 24px', position: 'relative',
            border: '2px solid #34c759', boxShadow: '0 20px 60px rgba(40,160,68,0.12)',
            display: 'flex', flexDirection: 'column', transition: 'transform 0.25s, box-shadow 0.25s'
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 28px 70px rgba(40,160,68,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(40,160,68,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #34c759, #28a044)', color: 'white', fontSize: '11px', fontWeight: 800, padding: '4px 16px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(40,160,68,0.35)' }}>
              ₿ Crypto / USDT
            </div>

            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #34c759, #28a044)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 6px 16px rgba(40,160,68,0.35)' }}>
              <Bitcoin size={22} color="white" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#111' }}>VIP</h3>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#f0fff4', color: '#28a044', border: '1px solid #b2f0c8', letterSpacing: '0.5px' }}>🌍 PAY GLOBALLY</span>
            </div>
            <p style={{ fontSize: '13px', color: '#999', margin: '0 0 20px' }}>Pay via Crypto / USDT</p>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '38px', fontWeight: 900, color: '#28a044', letterSpacing: '-1px', lineHeight: 1 }}>$20</span>
                <span style={{ fontSize: '13px', color: '#aaa', fontWeight: 600 }}>USDT / mo</span>
              </div>
              <div style={{ fontSize: '11px', color: '#bbb', fontWeight: 600, marginTop: '3px' }}>≈ KES 2,600 at current rates</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginBottom: '24px' }}>
              {sharedFeatures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ backgroundColor: '#f0fff4', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#28a044" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#333', fontWeight: 600 }}>{f}</span>
                </div>
              ))}
            </div>

            {isVIP ? (
              <div style={{ width: '100%', padding: '13px', borderRadius: '12px', backgroundColor: '#f0fff4', border: '1.5px solid #b2f0c8', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#28a044' }}>
                ✓ Your Current Plan
              </div>
            ) : cryptoSettings.cryptoEnabled ? (
              <button onClick={() => handleUpgradeClick('crypto')} style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #34c759, #28a044)', color: 'white',
                fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                boxShadow: '0 6px 18px rgba(40,160,68,0.35)', transition: 'opacity 0.15s, transform 0.1s'
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Pay with Crypto <ArrowRight size={16} />
              </button>
            ) : (
              <div style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', textAlign: 'center', fontSize: '12px', color: '#c97300' }}>
                <div style={{ fontWeight: 700, marginBottom: '3px' }}>🔧 Crypto — Under Maintenance</div>
                {cryptoSettings.mpesaEnabled && <div style={{ fontWeight: 600 }}>Please use <strong>📱 M-Pesa</strong> instead.</div>}
              </div>
            )}
          </div>

        </div>

        {/* Trust badges */}
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Trusted & Secure Payments</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            {[
              { icon: '🔒', label: 'SSL Encrypted' },
              { icon: '⚡', label: 'Instant Activation' },
              { icon: '🛡️', label: 'Admin Verified' },
              { icon: '↩️', label: 'Cancel Anytime' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', padding: '8px 14px', borderRadius: '20px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '13px' }}>{t.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#666' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Modal ── */}
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
                <span style={{ fontWeight: 800, color: '#111', fontSize: '13px' }}>VIP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #eef2f7' }}>
                <span style={{ color: '#999', fontSize: '13px' }}>Amount</span>
                <span style={{ fontWeight: 800, color: accent, fontSize: '16px' }}>
                  {isMpesa ? 'KES 2,500' : '$20 USDT'}
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
                  Send $20 USDT to this address
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
                    fontSize: '15px', fontWeight: 800,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                    transition: 'opacity 0.2s',
                    boxShadow: isDisabled ? 'none' : `0 6px 20px ${accent}40`
                  }}
                  onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {loading ? '⏳ Please wait...' : isMpesa ? '📱 Pay KES 2,500' : '₿ Submit — $20 USDT'}
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
