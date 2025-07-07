import React, { useState } from 'react';

const MarketTrendsGraph = ({ data, dateRange }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || !data.trends) return <div>No trend data available</div>;

  // Get categories from data
  const categories = ['all', ...Object.keys(data.trends || {})];
  
  // Get trend data for selected category
  const trendData = selectedCategory === 'all' 
    ? data.aggregatedTrend || []
    : data.trends[selectedCategory] || [];

  // Calculate chart dimensions
  const chartHeight = 300;
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const prices = trendData.map(d => d.averagePrice);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const priceRange = maxPrice - minPrice;

  // Create SVG path for the trend line
  const createPath = (data) => {
    if (data.length === 0) return '';
    
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * plotWidth;
      const y = padding.top + plotHeight - ((d.averagePrice - minPrice) / priceRange) * plotHeight;
      return `${x},${y}`;
    });

    // Create smooth curve
    return `M ${points.join(' L ')}`;
  };

  // Create area path for volatility bands
  const createVolatilityBand = (data) => {
    if (data.length === 0) return '';
    
    const upperPoints = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * plotWidth;
      const y = padding.top + plotHeight - ((d.averagePrice + d.volatility - minPrice) / priceRange) * plotHeight;
      return `${x},${y}`;
    });

    const lowerPoints = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * plotWidth;
      const y = padding.top + plotHeight - ((d.averagePrice - d.volatility - minPrice) / priceRange) * plotHeight;
      return `${x},${y}`;
    }).reverse();

    return `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
  };

  // Format date based on range
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (dateRange <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (dateRange <= 90) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  return (
    <div>
      {/* Category selector */}
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.25rem 0.75rem',
              background: selectedCategory === cat 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : '#f3f4f6',
              color: selectedCategory === cat ? 'white' : '#4b5563',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = padding.top + plotHeight * (1 - ratio);
            const price = minPrice + priceRange * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6b7280"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Volatility band */}
          <path
            d={createVolatilityBand(trendData)}
            fill="url(#volatilityGradient)"
            opacity="0.2"
          />

          {/* Trend line */}
          <path
            d={createPath(trendData)}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {trendData.map((point, i) => {
            const x = padding.left + (i / (trendData.length - 1)) * plotWidth;
            const y = padding.top + plotHeight - ((point.averagePrice - minPrice) / priceRange) * plotHeight;
            
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="white"
                  stroke="#667eea"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ point, x, y, index: i })}
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {trendData.filter((_, i) => i % Math.ceil(trendData.length / 5) === 0).map((point, i) => {
            const index = trendData.indexOf(point);
            const x = padding.left + (index / (trendData.length - 1)) * plotWidth;
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {formatDate(point.date)}
              </text>
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
            <linearGradient id="volatilityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#667eea" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: hoveredPoint.x,
              top: hoveredPoint.y - 80,
              transform: 'translateX(-50%)',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '0.75rem',
              zIndex: 10,
              minWidth: '140px'
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {formatDate(hoveredPoint.point.date)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.125rem' }}>
              <span style={{ color: '#6b7280' }}>Avg Price:</span>
              <span style={{ fontWeight: '600', color: '#667eea' }}>
                ${hoveredPoint.point.averagePrice.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.125rem' }}>
              <span style={{ color: '#6b7280' }}>Volatility:</span>
              <span>±${hoveredPoint.point.volatility.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Samples:</span>
              <span>{hoveredPoint.point.dataPoints}</span>
            </div>
          </div>
        )}
      </div>

      {/* Trend Summary */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRadius: '6px',
        border: '1px solid #7dd3fc'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', marginBottom: '0.25rem' }}>
              Current Price
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0c4a6e' }}>
              ${trendData[trendData.length - 1]?.averagePrice.toFixed(2) || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', marginBottom: '0.25rem' }}>
              {dateRange}d Change
            </div>
            <div style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700',
              color: data.priceChange >= 0 ? '#10b981' : '#ef4444'
            }}>
              {data.priceChange >= 0 ? '+' : ''}{data.priceChange?.toFixed(1) || '0'}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', marginBottom: '0.25rem' }}>
              Volatility
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0c4a6e' }}>
              {data.averageVolatility?.toFixed(1) || '0'}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', marginBottom: '0.25rem' }}>
              Trend
            </div>
            <div style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700',
              color: data.trend === 'increasing' ? '#10b981' : data.trend === 'decreasing' ? '#ef4444' : '#f59e0b'
            }}>
              {data.trend === 'increasing' ? '📈 Up' : data.trend === 'decreasing' ? '📉 Down' : '➡️ Stable'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTrendsGraph;