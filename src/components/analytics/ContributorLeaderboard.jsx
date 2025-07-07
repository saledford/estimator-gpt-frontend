import React, { useState } from 'react';

const ContributorLeaderboard = ({ data }) => {
  const [sortBy, setSortBy] = useState('contributions');
  const [selectedUser, setSelectedUser] = useState(null);

  if (!data || !data.topContributors) return <div>No contributor data available</div>;

  // Sort contributors based on selected metric
  const sortedContributors = [...data.topContributors].sort((a, b) => {
    switch (sortBy) {
      case 'contributions':
        return b.totalContributions - a.totalContributions;
      case 'accuracy':
        return b.accuracy - a.accuracy;
      case 'recent':
        return b.recentContributions - a.recentContributions;
      default:
        return 0;
    }
  });

  // Get rank emoji
  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}`;
    }
  };

  // Get contribution badge
  const getContributionBadge = (count) => {
    if (count >= 100) return { label: 'Expert', color: '#9333ea' };
    if (count >= 50) return { label: 'Pro', color: '#3b82f6' };
    if (count >= 20) return { label: 'Active', color: '#10b981' };
    return { label: 'Rising', color: '#f59e0b' };
  };

  // Calculate user score
  const calculateScore = (user) => {
    return (user.totalContributions * 0.5) + (user.accuracy * 100 * 0.3) + (user.recentContributions * 0.2);
  };

  return (
    <div>
      {/* Sort buttons */}
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '0.5rem'
      }}>
        {[
          { key: 'contributions', label: 'Total' },
          { key: 'accuracy', label: 'Accuracy' },
          { key: 'recent', label: 'Recent' }
        ].map(sort => (
          <button
            key={sort.key}
            onClick={() => setSortBy(sort.key)}
            style={{
              padding: '0.25rem 0.75rem',
              background: sortBy === sort.key ? '#f3f4f6' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: sortBy === sort.key ? '600' : '400',
              color: sortBy === sort.key ? '#1f2937' : '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {sort.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {sortedContributors.slice(0, 10).map((user, userIndex) => {
          const badge = getContributionBadge(user.totalContributions);
          const score = calculateScore(user);
          const isSelected = selectedUser === user.userId;
          
          return (
            <div
              key={user.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: isSelected ? '#f9fafb' : 'white',
                borderRadius: '6px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: isSelected ? '1px solid #e5e7eb' : '1px solid transparent',
                animation: `slideIn 0.3s ease ${userIndex * 0.05}s both`
              }}
              onClick={() => setSelectedUser(isSelected ? null : user.userId)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {/* Rank */}
              <div style={{
                width: '40px',
                fontSize: userIndex < 3 ? '1.5rem' : '1rem',
                fontWeight: '600',
                color: userIndex < 3 ? '#1f2937' : '#6b7280',
                textAlign: 'center'
              }}>
                {getRankEmoji(userIndex)}
              </div>

              {/* User info */}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: '0.875rem',
                    color: '#1f2937'
                  }}>
                    User{user.userId.slice(-4)}
                  </span>
                  <span style={{
                    fontSize: '0.625rem',
                    padding: '0.125rem 0.5rem',
                    background: badge.color,
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {badge.label}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <span>
                    <strong style={{ color: '#374151' }}>{user.totalContributions}</strong> total
                  </span>
                  <span>
                    <strong style={{ color: '#374151' }}>{(user.accuracy * 100).toFixed(0)}%</strong> accurate
                  </span>
                  <span>
                    <strong style={{ color: '#374151' }}>{user.recentContributions}</strong> this week
                  </span>
                </div>
              </div>

              {/* Score */}
              <div style={{
                textAlign: 'center',
                padding: '0 1rem'
              }}>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {score.toFixed(0)}
                </div>
                <div style={{
                  fontSize: '0.625rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Score
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected user details */}
      {selectedUser && (() => {
        const user = sortedContributors.find(u => u.userId === selectedUser);
        if (!user) return null;
        
        return (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '6px',
            border: '1px solid #7dd3fc',
            animation: 'slideIn 0.3s ease'
          }}>
            <h4 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#0369a1'
            }}>
              Contribution Details
            </h4>
            
            {/* Contribution breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              fontSize: '0.75rem'
            }}>
              <div>
                <span style={{ color: '#0c4a6e' }}>Price Corrections:</span>
                <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                  {user.priceCorrections || Math.floor(user.totalContributions * 0.6)}
                </span>
              </div>
              <div>
                <span style={{ color: '#0c4a6e' }}>Outcome Reports:</span>
                <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                  {user.outcomeReports || Math.floor(user.totalContributions * 0.4)}
                </span>
              </div>
              <div>
                <span style={{ color: '#0c4a6e' }}>Avg Response Time:</span>
                <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                  {user.avgResponseTime || '2.3'} days
                </span>
              </div>
              <div>
                <span style={{ color: '#0c4a6e' }}>Member Since:</span>
                <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                  {user.memberSince || 'Jan 2024'}
                </span>
              </div>
            </div>

            {/* Achievement badges */}
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #7dd3fc'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#0c4a6e', marginBottom: '0.5rem' }}>
                Achievements:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {user.totalContributions >= 100 && (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: '#ddd6fe',
                    color: '#6b21a8',
                    borderRadius: '4px',
                    fontSize: '0.625rem',
                    fontWeight: '500'
                  }}>
                    💯 Century Club
                  </span>
                )}
                {user.accuracy >= 0.9 && (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '4px',
                    fontSize: '0.625rem',
                    fontWeight: '500'
                  }}>
                    🎯 Sharp Shooter
                  </span>
                )}
                {user.recentContributions >= 10 && (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: '#fed7aa',
                    color: '#9a3412',
                    borderRadius: '4px',
                    fontSize: '0.625rem',
                    fontWeight: '500'
                  }}>
                    🔥 On Fire
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Summary stats */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f9fafb',
        borderRadius: '6px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        textAlign: 'center',
        fontSize: '0.75rem'
      }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1f2937' }}>
            {data.totalContributors || sortedContributors.length}
          </div>
          <div style={{ color: '#6b7280' }}>Active Users</div>
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1f2937' }}>
            {data.totalContributions || sortedContributors.reduce((sum, u) => sum + u.totalContributions, 0)}
          </div>
          <div style={{ color: '#6b7280' }}>Total Contributions</div>
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1f2937' }}>
            {((data.averageAccuracy || 0.85) * 100).toFixed(0)}%
          </div>
          <div style={{ color: '#6b7280' }}>Avg Accuracy</div>
        </div>
      </div>
    </div>
  );
};

export default ContributorLeaderboard;