import React, { useState } from 'react';
import { API_BASE } from '../config';

const ProjectOutcomeModal = ({ projectId, estimateTotal, onClose, showToast }) => {
  const [outcome, setOutcome] = useState('');
  const [winningBid, setWinningBid] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOutcome = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/projects/${projectId}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome,
          winning_bid: outcome === 'lost_price' ? parseFloat(winningBid) : null,
          feedback
        })
      });
      
      if (response.ok) {
        // Show success message
        if (showToast) {
          showToast('Thanks! This helps our AI learn and improve.', 'success');
        } else {
          alert('Thanks! This helps our AI learn and improve.');
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit outcome:', error);
      if (showToast) {
        showToast('Failed to submit feedback. Please try again.', 'error');
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '28rem',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideIn 0.3s ease'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          marginBottom: '1.5rem',
          color: '#1f2937'
        }}>
          How did this estimate go?
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Outcome
            </label>
            <select 
              value={outcome} 
              onChange={(e) => setOutcome(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: 'white',
                color: '#1f2937'
              }}
            >
              <option value="">Select outcome...</option>
              <option value="won">Won the project! 🎉</option>
              <option value="lost_price">Lost - price too high</option>
              <option value="lost_other">Lost - other reasons</option>
              <option value="pending">Still pending</option>
            </select>
          </div>
          
          {outcome === 'lost_price' && (
            <div style={{
              animation: 'slideIn 0.3s ease',
              padding: '1rem',
              background: '#fef3c7',
              borderRadius: '6px',
              border: '1px solid #fde68a'
            }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: '#92400e'
              }}>
                Winning bid amount (helps us calibrate)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }}>$</span>
                <input
                  type="number"
                  value={winningBid}
                  onChange={(e) => setWinningBid(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.5rem 0.5rem 1.75rem',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    background: 'white'
                  }}
                />
              </div>
              {estimateTotal && winningBid && (
                <p style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#92400e'
                }}>
                  Your estimate was {((estimateTotal - parseFloat(winningBid)) / estimateTotal * 100).toFixed(1)}% higher
                </p>
              )}
            </div>
          )}
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Any feedback? (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What could we improve?"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                height: '80px',
                resize: 'vertical',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={submitOutcome}
              disabled={!outcome || isSubmitting}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: !outcome || isSubmitting 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '500',
                cursor: !outcome || isSubmitting ? 'not-allowed' : 'pointer',
                opacity: !outcome || isSubmitting ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (outcome && !isSubmitting) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#e5e7eb',
                color: '#374151',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#e5e7eb';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOutcomeModal;