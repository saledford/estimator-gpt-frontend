import React from 'react';

const PricingConfidenceChart = ({ data }) => {
  if (!data || !data.byCategory) return <div>No data available</div>;

  // Sort categories by confidence level
  const sortedCategories = Object.entries(data.byCategory)
    .sort(([, a], [, b]) => b.confidence - a.confidence)
    .slice(0, 10); // Top 10 categories

  const maxConfidence = Math.max(...sortedCategories.map(([, cat]) => cat.confidence));

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      {/* Chart */}
      <div style={{ position: 'relative' }}>
        {sortedCategories.map(([category, categoryData], index) => {
          const barWidth = (categoryData.confidence / maxConfidence) * 100;
          const color = getConfidenceColor(categoryData.confidence);
          
          return (
            <div
              key={category}
              style={{
                marginBottom: '1rem',
                animation: `slideIn 0.5s ease ${index * 0.05}s both`
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.25rem'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4a5568',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {category}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: '#718096' }}>
                    {categoryData.dataPoints} samples
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: color
                  }}>
                    {(categoryData.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div style={{
                position: 'relative',
                height: '24px',
                background: '#f3f4f6',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                    borderRadius: '6px',
                    transition: 'width 0.8s ease',
                    boxShadow: `0 2px 4px ${color}40`
                  }}
                >
                  {/* Animated stripes for low confidence */}
                  {categoryData.confidence < 0.6 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(255,255,255,0.1) 10px,
                        rgba(255,255,255,0.1) 20px
                      )`,
                      animation: 'moveStripes 1s linear infinite'
                    }} />
                  )}
                </div>
                
                {/* Threshold indicators */}
                <div style={{
                  position: 'absolute',
                  left: '60%',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  background: '#9ca3af',
                  opacity: 0.5
                }} />
                <div style={{
                  position: 'absolute',
                  left: '80%',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  background: '#9ca3af',
                  opacity: 0.5
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '12px',
            height: '12px',
            background: '#10b981',
            borderRadius: '3px'
          }} />
          <span style={{ color: '#6b7280' }}>High (&gt;=80%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '12px',
            height: '12px',
            background: '#f59e0b',
            borderRadius: '3px'
          }} />
          <span style={{ color: '#6b7280' }}>Medium (60-79%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '12px',
            height: '12px',
            background: '#ef4444',
            borderRadius: '3px'
          }} />
          <span style={{ color: '#6b7280' }}>Low (&lt;60%)</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '6px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
            {sortedCategories.filter(([, cat]) => cat.confidence >= 0.8).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>High Confidence</div>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b' }}>
            {sortedCategories.filter(([, cat]) => cat.confidence >= 0.6 && cat.confidence < 0.8).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Medium</div>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4444' }}>
            {sortedCategories.filter(([, cat]) => cat.confidence < 0.6).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Need Data</div>
        </div>
      </div>

      <style>{`
        @keyframes moveStripes {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
};

export default PricingConfidenceChart;