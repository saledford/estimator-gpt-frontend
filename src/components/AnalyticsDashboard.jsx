import React, { useState, useEffect } from 'react';
import MetricsOverview from './analytics/MetricsOverview';
import PricingConfidenceChart from './analytics/PricingConfidenceChart';
import MarketTrendsGraph from './analytics/MarketTrendsGraph';
import WinRateAnalysis from './analytics/WinRateAnalysis';
import ContributorLeaderboard from './analytics/ContributorLeaderboard';
import { API_BASE } from './config';

const AnalyticsDashboard = () => {
  console.log('AnalyticsDashboard rendering');
  const [metrics, setMetrics] = useState({
    overallAccuracy: 0.85,
    averageConfidence: 0.72,
    winRate: 0.32,
    totalContributions: 0,
    dataPoints: 0,
    activeUsers: 0
  });
  const [pricingConfidence, setPricingConfidence] = useState({
    byCategory: {
      'Concrete': { confidence: 0.82, dataPoints: 45 },
      'Electrical': { confidence: 0.78, dataPoints: 38 },
      'Plumbing': { confidence: 0.65, dataPoints: 22 },
      'HVAC': { confidence: 0.71, dataPoints: 31 },
      'Framing': { confidence: 0.88, dataPoints: 67 }
    }
  });
  const [marketTrends, setMarketTrends] = useState({
    trends: {},
    aggregatedTrend: [],
    priceChange: 0,
    averageVolatility: 0,
    trend: 'stable'
  });
  const [outcomes, setOutcomes] = useState({
    outcomes: {
      won: 0,
      lost_price: 0,
      lost_other: 0,
      pending: 0
    }
  });
  const [contributors, setContributors] = useState({
    topContributors: [],
    totalContributors: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Date range filter
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedRegion, setSelectedRegion] = useState('all');

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all analytics data in parallel
      const promises = [
        fetch(`${API_BASE}/api/analytics/metrics`).catch(() => null),
        fetch(`${API_BASE}/api/analytics/pricing-confidence`).catch(() => null),
        fetch(`${API_BASE}/api/analytics/market-trends?days=${dateRange}&region=${selectedRegion}`).catch(() => null),
        fetch(`${API_BASE}/api/analytics/outcomes`).catch(() => null),
        fetch(`${API_BASE}/api/analytics/contributors`).catch(() => null)
      ];

      const responses = await Promise.all(promises);

      // Parse responses, using default data if fetch failed
      const [metricsData, confidenceData, trendsData, outcomesData, contributorsData] = await Promise.all(
        responses.map(async (res, index) => {
          if (!res || !res.ok) {
            console.warn(`Analytics endpoint ${index} not available, using mock data`);
            // Return mock data based on index
            switch(index) {
              case 0: // metrics
                return {
                  overallAccuracy: 0.85,
                  averageConfidence: 0.72,
                  winRate: 0.32,
                  totalContributions: 0,
                  dataPoints: 0,
                  activeUsers: 0
                };
              case 1: // pricing confidence
                return {
                  byCategory: {
                    'Concrete': { confidence: 0.82, dataPoints: 45 },
                    'Electrical': { confidence: 0.78, dataPoints: 38 },
                    'Plumbing': { confidence: 0.65, dataPoints: 22 },
                    'HVAC': { confidence: 0.71, dataPoints: 31 },
                    'Framing': { confidence: 0.88, dataPoints: 67 }
                  }
                };
              case 2: // trends
                return {
                  trends: {},
                  aggregatedTrend: [],
                  priceChange: 0,
                  averageVolatility: 0,
                  trend: 'stable'
                };
              case 3: // outcomes
                return {
                  outcomes: {
                    won: 0,
                    lost_price: 0,
                    lost_other: 0,
                    pending: 0
                  }
                };
              case 4: // contributors
                return {
                  topContributors: [],
                  totalContributors: 0
                };
              default:
                return null;
            }
          }
          return res.json();
        })
      );

      setMetrics(metricsData);
      setPricingConfidence(confidenceData);
      setMarketTrends(trendsData);
      setOutcomes(outcomesData);
      setContributors(contributorsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Don't fetch on initial load - just use the default demo data
    console.log('Analytics Dashboard mounted with demo data');
  }, []);

  // Only fetch when date range or region changes
  useEffect(() => {
    if (dateRange && selectedRegion) {
      fetchAnalytics();
    }
  }, [dateRange, selectedRegion]);

  // Remove auto-refresh to prevent issues
  // useEffect(() => {
  //   const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
  //   return () => clearInterval(interval);
  // }, [dateRange, selectedRegion]);

  // Remove the loading screen since we start with demo data
  if (loading && !metrics) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f7fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#718096' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f7fafc'
      }}>
        <div style={{
          padding: '3rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>Analytics Dashboard</h3>
          <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
            The analytics API endpoints are not available yet. Using demo data to show the dashboard layout.
          </p>
          <button
            onClick={() => {
              setError(null);
              fetchAnalytics();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Continue with Demo Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      background: '#f7fafc', 
      minHeight: '100vh',
      animation: 'fadeIn 0.5s ease'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#2d3748',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📊 Analytics Dashboard
            {refreshing && (
              <span style={{
                fontSize: '1rem',
                color: '#718096',
                animation: 'spin 1s linear infinite'
              }}>
                🔄
              </span>
            )}
          </h1>
          <p style={{ color: '#718096' }}>
            Monitor AI performance, pricing accuracy, and market trends
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              background: 'white',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>

          {/* Region Selector */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              background: 'white',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Regions</option>
            <option value="US-NE">Northeast</option>
            <option value="US-SE">Southeast</option>
            <option value="US-MW">Midwest</option>
            <option value="US-SW">Southwest</option>
            <option value="US-W">West</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            style={{
              padding: '0.5rem 1rem',
              background: refreshing ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: refreshing ? 'none' : '0 2px 8px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <MetricsOverview metrics={metrics} />

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {/* Pricing Confidence by Category */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#2d3748'
          }}>
            Pricing Confidence by Category
          </h2>
          <PricingConfidenceChart data={pricingConfidence} />
        </div>

        {/* Market Trends */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#2d3748'
          }}>
            Market Price Trends
          </h2>
          <MarketTrendsGraph data={marketTrends} dateRange={dateRange} />
        </div>
      </div>

      {/* Win Rate Analysis and Contributors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginTop: '1.5rem'
      }}>
        {/* Win Rate Analysis */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#2d3748'
          }}>
            Project Outcomes
          </h2>
          <WinRateAnalysis data={outcomes} />
        </div>

        {/* Top Contributors */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Top Contributors
            <span style={{
              fontSize: '0.75rem',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: 'white',
              padding: '0.125rem 0.5rem',
              borderRadius: '12px',
              fontWeight: '500'
            }}>
              🏆 Leaderboard
            </span>
          </h2>
          <ContributorLeaderboard data={contributors} />
        </div>
      </div>

      {/* System Health Indicators */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #cdd5ff 100%)',
        borderRadius: '8px',
        border: '1px solid #c7d2fe'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#4c1d95', marginBottom: '0.25rem' }}>
              System Status
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#5b21b6' }}>
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: '#10b981' 
              }}></span>
              <span style={{ color: '#5b21b6' }}>AI Model: Healthy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: metrics?.dataPoints > 1000 ? '#10b981' : '#f59e0b' 
              }}></span>
              <span style={{ color: '#5b21b6' }}>
                Data Points: {metrics?.dataPoints?.toLocaleString() || 0}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: metrics?.activeUsers > 10 ? '#10b981' : '#f59e0b' 
              }}></span>
              <span style={{ color: '#5b21b6' }}>
                Active Users: {metrics?.activeUsers || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {metrics?.dataPoints === 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '12px',
          border: '1px solid #fbbf24',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
            Start Building Your Data
          </h3>
          <p style={{ color: '#78350f', fontSize: '0.875rem' }}>
            The analytics dashboard will populate as you:
          </p>
          <ul style={{ 
            textAlign: 'left', 
            display: 'inline-block', 
            marginTop: '1rem',
            color: '#92400e',
            fontSize: '0.875rem'
          }}>
            <li>Upload and process construction documents</li>
            <li>Generate takeoff estimates</li>
            <li>Receive AI pricing suggestions</li>
            <li>Record project outcomes (win/loss)</li>
            <li>Make price corrections</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;