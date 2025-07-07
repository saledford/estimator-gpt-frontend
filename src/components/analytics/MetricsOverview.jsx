import React from 'react';

const MetricsOverview = ({ metrics }) => {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Overall Accuracy',
      value: `${(metrics.overallAccuracy * 100).toFixed(1)}%`,
      icon: '🎯',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      subtitle: 'Price prediction accuracy',
      trend: metrics.accuracyTrend || '+2.3%',
      good: metrics.overallAccuracy > 0.8
    },
    {
      title: 'Average Confidence',
      value: `${(metrics.averageConfidence * 100).toFixed(1)}%`,
      icon: '💪',
      color: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      subtitle: 'AI confidence level',
      trend: metrics.confidenceTrend || '+1.5%',
      good: metrics.averageConfidence > 0.75
    },
    {
      title: 'Win Rate',
      value: `${(metrics.winRate * 100).toFixed(1)}%`,
      icon: '🏆',
      color: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      subtitle: 'Projects won',
      trend: metrics.winRateTrend || '+5.2%',
      good: metrics.winRate > 0.3
    },
    {
      title: 'Data Contributions',
      value: metrics.totalContributions?.toLocaleString() || '0',
      icon: '📈',
      color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      subtitle: 'This month',
      trend: metrics.contributionsTrend || '+124',
      good: true
    }
  ];

  const GaugeChart = ({ value, max = 100, color }) => {
    const percentage = (value / max) * 100;
    const dashArray = `${percentage} ${100 - percentage}`;
    
    return (
      <svg width="60" height="60" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="21"
          cy="21"
          r="15.9155"
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <circle
          cx="21"
          cy="21"
          r="15.9155"
          fill="transparent"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={dashArray}
          strokeDashoffset="0"
          style={{ transition: 'all 0.5s ease' }}
        />
      </svg>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            animation: `slideIn 0.3s ease ${index * 0.1}s both`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: card.color,
            borderRadius: '50%',
            opacity: 0.1
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{ 
                  fontSize: '2rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  background: card.color,
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}>
                  {card.icon}
                </span>
                
                {card.title.includes('Accuracy') || card.title.includes('Confidence') || card.title.includes('Win Rate') ? (
                  <div style={{ position: 'relative' }}>
                    <GaugeChart 
                      value={parseFloat(card.value)} 
                      color={card.color.match(/,(#[a-f0-9]+)/)?.[1] || '#667eea'}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {card.value}
                    </div>
                  </div>
                ) : null}
              </div>
              
              <h3 style={{ 
                fontSize: '0.875rem', 
                color: '#718096',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>
                {card.title}
              </h3>
              
              {!card.title.includes('Accuracy') && !card.title.includes('Confidence') && !card.title.includes('Win Rate') && (
                <p style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700',
                  color: '#2d3748',
                  marginBottom: '0.25rem',
                  background: card.color,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {card.value}
                </p>
              )}
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: '#718096' }}>{card.subtitle}</span>
                {card.trend && (
                  <span style={{
                    color: card.trend.startsWith('+') ? '#10b981' : '#ef4444',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {card.trend.startsWith('+') ? '↑' : '↓'}
                    {card.trend}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: card.good ? '#10b981' : '#f59e0b',
            boxShadow: `0 0 0 4px ${card.good ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
          }} />
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview;