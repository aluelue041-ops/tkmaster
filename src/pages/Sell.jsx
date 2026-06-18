import React from 'react';
import { DollarSign, Tag, ShieldCheck } from 'lucide-react';

export default function Sell() {
  return (
    <div className="page sell-page">
      <div className="header">
        <h1 className="header-title">Sell Tickets</h1>
      </div>

      <div style={{ padding: '0' }}>
        <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '40px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Sell your tickets safely & securely</h2>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
            Reach millions of fans and get paid easily.
          </p>
          <button 
            style={{ backgroundColor: 'white', color: 'var(--primary-color)', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', width: '100%' }}
            onClick={() => alert('Opening ticket listing form...')}
          >
            List Your Tickets
          </button>
        </div>

        <div style={{ padding: '32px 24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Why sell with us?</h3>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', backgroundColor: '#e6f0ff', borderRadius: '12px', height: 'fit-content' }}>
              <Tag size={24} color="var(--primary-color)" />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Set your price</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                You control how much you want to sell your tickets for. Adjust it anytime before they sell.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', backgroundColor: '#e6f0ff', borderRadius: '12px', height: 'fit-content' }}>
              <DollarSign size={24} color="var(--primary-color)" />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Get paid easily</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                Funds are automatically deposited to your account after the event takes place.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#e6f0ff', borderRadius: '12px', height: 'fit-content' }}>
              <ShieldCheck size={24} color="var(--primary-color)" />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>100% Guaranteed</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                We handle the delivery to the buyer. You are protected from fraud and chargebacks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
