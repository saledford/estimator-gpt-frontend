import React, { useState, useEffect } from 'react';

const PricingIntelligence = ({ item, location, projectId, onPriceAccept }) => {
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  // API Configuration
  const API_BASE = 'https://estimator-gpt-backend.onrender.com';

  useEffect(() => {
    fetchPricingIntelligence();
  }, [item.description]);

  const fetchPricingIntelligence = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/intelligence/pricing/${encodeURIComponent(item.description)}?location=${location}`
      );
      const data = await response.json();
      setIntelligence(data);
    } catch (error) {
      console.error('Failed to fetch pricing intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordCorrection = async (newPrice) => {
    await fetch(`${API_BASE}/api/projects/${projectId}/learn/price-correction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: item.id,
        original_price: intelligence.suggested_price,
        corrected_price: newPrice,
        reason: 'manual_adjustment'
      })
    });
  };

  if (loading) return (
    <div style={{
      height: '80px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'pulse 1.5s ease-in-out infinite',
      borderRadius: '8px'
    }} />
  );
  
  if (!intelligence) return null;

  const trend = intelligence.regional_intel?.trend;
  const confidence = intelligence.confidence;

  // Icon components using Unicode
  const TrendingUp = () => <span style={{ color: '#ef4444' }}>📈</span>;
  const TrendingDown = () => <span style={{ color: '#10b981' }}>📉</span>;
  const AlertTriangle = () => <span style={{ color: '#f59e0b' }}>⚠️</span>;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #c7d2fe',
      marginTop: '0.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            fontWeight: '600', 
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            🤖 AI Price Suggestion
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              background: confidence > 0.8 ? '#d1fae5' : confidence > 0.5 ? '#fef3c7' : '#fee2e2',
              color: confidence > 0.8 ? '#065f46' : confidence > 0.5 ? '#92400e' : '#991b1b'
            }}>
              {confidence > 0.8 ? 'High' : confidence > 0.5 ? 'Medium' : 'Low'} Confidence
            </span>
          </h4>
          
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.25rem',
              padding: '0.25rem 0'
            }}>
              <span style={{ color: '#6b7280' }}>Suggested Price:</span>
              <span style={{ fontWeight: '700', fontSize: '1.125rem', color: '#1f2937' }}>
                ${intelligence.suggested_price}/{item.unit}
              </span>
            </div>
            
            {intelligence.your_history?.last_used && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
                padding: '0.25rem 0'
              }}>
                <span style={{ color: '#6b7280' }}>Your Last Price:</span>
                <span>${intelligence.your_history.last_used}</span>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '0.25rem 0'
            }}>
              <span style={{ color: '#6b7280' }}>Regional Average:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                ${intelligence.regional_intel?.average}
                {trend?.direction === 'increasing' ? (
                  <TrendingUp />
                ) : trend?.direction === 'decreasing' ? (
                  <TrendingDown />
                ) : null}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            Based on {intelligence.regional_intel?.data_points || 0} estimates
          </p>
          <button
            onClick={() => {
              onPriceAccept(intelligence.suggested_price);
              recordCorrection(intelligence.suggested_price);
            }}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: 'white',
              fontSize: '0.875rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Use This Price
          </button>
        </div>
      </div>
      
      {intelligence.market_conditions?.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          background: '#fef3c7',
          borderRadius: '6px',
          border: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <AlertTriangle />
          <span style={{ fontWeight: '500' }}>Market Alert:</span>
          {intelligence.market_conditions[0].type}
        </div>
      )}
      
      {intelligence.ai_recommendation && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          background: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#4b5563',
          fontStyle: 'italic'
        }}>
          💡 {intelligence.ai_recommendation}
        </div>
      )}
    </div>
  );
};

export default PricingIntelligence;