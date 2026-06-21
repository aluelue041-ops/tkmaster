import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Password strength checker
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['#ddd', '#ff3b30', '#ff9500', '#ffcc00', '#34c759'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!strongRegex.test(newPassword)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, a number and a special character.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: '#c62828', fontWeight: 600 }}>❌ Invalid reset link. Please request a new one.</p>
        <button onClick={() => navigate('/signin')} className="btn-primary" style={{ marginTop: '20px' }}>Go to Sign In</button>
      </div>
    );
  }

  return (
    <div className="page auth-page" style={{ paddingBottom: '80px', backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/signin')} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', cursor: 'pointer' }}>
          <ChevronLeft size={24} color="#333" />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Set New Password</h2>
      </div>

      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={56} color="#34c759" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Password Reset!</h2>
              <p style={{ color: '#555', marginBottom: '24px', lineHeight: 1.6 }}>Your password has been updated successfully. You can now sign in with your new password.</p>
              <button onClick={() => navigate('/signin')} className="btn-primary" style={{ width: '100%' }}>Sign In Now</button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>Create New Password</h1>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '28px', fontSize: '14px' }}>Choose a strong password for your account.</p>

              {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 40px 12px 16px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }}
                      placeholder="New password"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showNew ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {newPassword.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ height: '4px', borderRadius: '2px', backgroundColor: '#eee', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(strength / 4) * 100}%`, backgroundColor: strengthColor, transition: 'all 0.3s' }} />
                      </div>
                      <p style={{ fontSize: '12px', color: strengthColor, marginTop: '4px', fontWeight: 600 }}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px 40px 12px 16px', borderRadius: '8px', border: `1px solid ${confirmPassword && confirmPassword !== newPassword ? '#ff3b30' : '#ccc'}`, fontSize: '16px', boxSizing: 'border-box' }}
                      placeholder="Confirm new password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showConfirm ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', width: '100%', opacity: loading ? 0.8 : 1 }}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
