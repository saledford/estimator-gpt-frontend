import React, { useState } from 'react';

const WinRateAnalysis = ({ data }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  if (!data || !data.outcomes) return <div>No outcome data available</div>;

  const outcomes = data.outcomes;
  const total = Object.values(outcomes).reduce((sum, count) => sum + count, 0);

  // Define colors and labels for each outcome type
  const outcomeConfig = {
    won: { 
      color: '#10b981', 
      label: 'Won', 
      icon: '🎉',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    lost_price: { 
      color: '#ef4444', 
      label: 'Lost (Price)', 
      icon: '💰',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    lost_other: { 
      color: '#f59e0b', 
      label: 'Lost (Other)', 
      icon: '🤔',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    pending: { 
      color: '#6b7280', 
      label: 'Pending', 
      icon: '⏳',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
    }
  };

  // Calculate pie chart segments
  let currentAngle = -90; // Start from top
  const segments = Object.entries(outcomes).map(([outcome, count]) => {
    const percentage = (count / total) * 100;
    const angle = (count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const largeArcFlag = angle > 180 ? 1 : 0;

    const x1 = 150 + 100 * Math.cos(startAngleRad);
    const y1 = 150 + 100 * Math.sin(startAngleRad);
    const x2 = 150 + 100 * Math.cos(endAngleRad);
    const y2 = 150 + 100 * Math.sin(endAngleRad);

    const path = `M 150 150 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      outcome,
      count,
      percentage,
      path,
      config: outcomeConfig[outcome],
      midAngle: (startAngle + endAngle) / 2
    };
  });

  // Calculate win rate
  const winRate = ((outcomes.won || 0) / total) * 100;
  const avgBidDifference = data.averageBidDifference || -12.5;

  return (
    <div>
      {/* Pie Chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Segments */}
            {segments.map((segment) => (
              <g key={segment.outcome}>
                <path
                  d={segment.path}
                  fill={segment.config.color}
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    cursor: 'pointer',
                    filter: hoveredSegment === segment.outcome ? 'brightness(1.1)' : 'none',
                    transform: hoveredSegment === segment.outcome ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: '150px 150px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={() => setHoveredSegment(segment.outcome)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
                
                {/* Label */}
                {segment.percentage > 5 && (
                  <text
                    x={150 + 70 * Math.cos((segment.midAngle * Math.PI) / 180)}
                    y={150 + 70 * Math.sin((segment.midAngle * Math.PI) / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="600"
                    style={{ pointerEvents: 'none' }}
                  >
                    {segment.percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            ))}

            {/* Center circle */}
            <circle
              cx="150"
              cy="150"
              r="50"
              fill="white"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            
            {/* Center text */}
            <text
              x="150"
              y="140"
              textAnchor="middle"
              fontSize="28"
              fontWeight="700"
              fill="#2d3748"
            >
              {winRate.toFixed(0)}%
            </text>
            <text
              x="150"
              y="165"
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              Win Rate
            </text>
          </svg>

          {/* Tooltip */}
          {hoveredSegment && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                pointerEvents: 'none',
                zIndex: 10,
                minWidth: '160px'
              }}
            >
              <div style={{ 
                fontSize: '1.5rem', 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                {segments.find(s => s.outcome === hoveredSegment)?.config.icon}
              </div>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '1rem',
                marginBottom: '0.25rem',
                textAlign: 'center'
              }}>
                {segments.find(s => s.outcome === hoveredSegment)?.config.label}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {segments.find(s => s.outcome === hoveredSegment)?.count} projects
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700',
                textAlign: 'center',
                color: segments.find(s => s.outcome === hoveredSegment)?.config.color
              }}>
                {segments.find(s => s.outcome === hoveredSegment)?.percentage.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {segments.map(segment => (
          <div
            key={segment.outcome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              background: hoveredSegment === segment.outcome ? '#f9fafb' : 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setHoveredSegment(segment.outcome)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <span style={{
              width: '12px',
              height: '12px',
              background: segment.config.gradient,
              borderRadius: '3px',
              flexShrink: 0
            }} />
            <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              {segment.config.label}
            </span>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600',
              marginLeft: 'auto'
            }}>
              {segment.count}
            </span>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div style={{
        padding: '1rem',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '6px',
        border: '1px solid #86efac'
      }}>
        <h4 style={{ 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          color: '#166534'
        }}>
          Key Insights
        </h4>
        <ul style={{ 
          fontSize: '0.75rem', 
          color: '#15803d',
          margin: 0,
          paddingLeft: '1.25rem'
        }}>
          <li>
            Win rate is {winRate >= 35 ? 'above' : 'below'} industry average ({winRate >= 35 ? '✅' : '⚠️'})
          </li>
          <li>
            {outcomes.lost_price > outcomes.lost_other 
              ? 'Most losses are due to pricing - consider adjusting margins'
              : 'Non-price factors are the main reason for losses'}
          </li>
          {avgBidDifference && (
            <li>
              Average bid difference when lost on price: {avgBidDifference.toFixed(1)}%
            </li>
          )}
          <li>
            {outcomes.pending} projects awaiting decision ({((outcomes.pending / total) * 100).toFixed(0)}% of total)
          </li>
        </ul>
      </div>

      {/* Funnel Visualization */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '6px'
      }}>
        <h4 style={{ 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          marginBottom: '0.75rem',
          color: '#374151'
        }}>
          Conversion Funnel
        </h4>
        <div style={{ position: 'relative' }}>
          {[
            { label: 'Total Bids', value: total, width: '100%', color: '#e5e7eb' },
            { label: 'Competitive', value: total - (outcomes.lost_other || 0), width: '80%', color: '#9ca3af' },
            { label: 'Price Range', value: total - (outcomes.lost_other || 0) - (outcomes.lost_price || 0), width: '60%', color: '#6b7280' },
            { label: 'Won', value: outcomes.won || 0, width: '40%', color: '#10b981' }
          ].map((stage, index) => (
            <div
              key={index}
              style={{
                marginBottom: '0.5rem',
                position: 'relative'
              }}
            >
              <div style={{
                height: '32px',
                background: stage.color,
                borderRadius: '4px',
                width: stage.width,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                transition: 'all 0.3s ease'
              }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: index === 3 ? 'white' : '#374151',
                  fontWeight: '500'
                }}>
                  {stage.label}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: index === 3 ? 'white' : '#374151',
                  fontWeight: '600'
                }}>
                  {stage.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinRateAnalysis;