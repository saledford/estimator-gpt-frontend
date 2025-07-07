import React, { useState, useMemo } from 'react';
import AddTakeoffItemModal from './AddTakeoffItemModal';
import PricingIntelligence from './PricingIntelligence';
import ProjectOutcomeModal from './ProjectOutcomeModal';

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'https://estimator-gpt-backend.onrender.com';

const TakeoffTab = ({
  selectedProject,
  scanDivisions,
  scanTakeoff,
  scanningState,
  showAddItemModal,
  setShowAddItemModal,
  newItem,
  setNewItem,
  addTakeoffItem,
  updateTakeoff,
  updateProject,
  DIVISIONS,
  getDivisionName
}) => {
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('division');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showTableItemsOnly, setShowTableItemsOnly] = useState(false);
  const [auditReport, setAuditReport] = useState(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [showAuditReport, setShowAuditReport] = useState(false);
  const [selectedItemForPricing, setSelectedItemForPricing] = useState(null);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);

  const hasFiles = selectedProject.files && selectedProject.files.length > 0;
  const isAnyFileUploading = selectedProject.files.some(f => f.isUploading);

  // Filter and sort takeoff items
  const filteredAndSortedTakeoff = useMemo(() => {
    let filtered = selectedProject.takeoff || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.division.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply division filter
    if (selectedDivisions.length > 0) {
      filtered = filtered.filter(item => {
        const divisionId = item.division.split(' ')[1];
        return selectedDivisions.includes(divisionId);
      });
    }

    // Apply table items filter
    if (showTableItemsOnly) {
      filtered = filtered.filter(item => item.metadata?.source === 'table');
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'totalCost') {
        aValue = (a.quantity * a.unitCost * (1 + a.modifier / 100));
        bValue = (b.quantity * b.unitCost * (1 + b.modifier / 100));
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [selectedProject.takeoff, searchTerm, selectedDivisions, sortField, sortDirection, showTableItemsOnly]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleDivisionFilter = (divisionId) => {
    if (selectedDivisions.includes(divisionId)) {
      setSelectedDivisions(selectedDivisions.filter(d => d !== divisionId));
    } else {
      setSelectedDivisions([...selectedDivisions, divisionId]);
    }
  };

  const calculateTotals = () => {
    const totals = (selectedProject.takeoff || []).reduce((acc, item) => {
      const totalCost = item.quantity * item.unitCost * (1 + item.modifier / 100);
      return {
        subtotal: acc.subtotal + totalCost,
        count: acc.count + 1
      };
    }, { subtotal: 0, count: 0 });

    return totals;
  };

  const totals = calculateTotals();

  const exportToCSV = () => {
    const headers = ['Division', 'Description', 'Quantity', 'Unit', 'Unit Cost', 'Modifier %', 'Total Cost'];
    const rows = filteredAndSortedTakeoff.map(item => [
      item.division,
      item.description,
      item.quantity,
      item.unit,
      item.unitCost.toFixed(2),
      item.modifier,
      (item.quantity * item.unitCost * (1 + item.modifier / 100)).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedProject.name}_takeoff_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const runAudit = async () => {
    if (!selectedProject.id) return;
    
    setIsRunningAudit(true);
    setShowAuditReport(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/projects/${selectedProject.id}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takeoff: selectedProject.takeoff || [],
          divisionDescriptions: selectedProject.divisionDescriptions || {},
          specIndex: selectedProject.specIndex || []
        })
      });
      
      if (!response.ok) {
        throw new Error(`Audit failed: ${response.status}`);
      }
      
      const result = await response.json();
      setAuditReport(result.auditReport || []);
    } catch (err) {
      console.error('Audit error:', err);
      setAuditReport([{
        division: 'Error',
        issue: 'Audit Failed',
        detail: err.message,
        page: 'N/A'
      }]);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handlePriceAccept = (itemId, newPrice) => {
    updateTakeoff(itemId, 'unitCost', newPrice);
    setSelectedItemForPricing(null);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2d3748' }}>
          Project Takeoff
        </h2>
        <p style={{ color: '#718096', fontSize: '1rem' }}>
          Line-item cost breakdown by CSI division.
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={scanDivisions}
          disabled={!hasFiles || scanningState.divisions || isAnyFileUploading}
          style={{
            padding: '0.875rem 1.5rem',
            background: !hasFiles || scanningState.divisions || isAnyFileUploading 
              ? '#cbd5e0' 
              : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: !hasFiles || scanningState.divisions || isAnyFileUploading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '0.9375rem',
            boxShadow: !hasFiles || scanningState.divisions || isAnyFileUploading 
              ? 'none' 
              : '0 4px 14px rgba(139, 92, 246, 0.3)',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!(!hasFiles || scanningState.divisions || isAnyFileUploading)) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.3)';
          }}
        >
          {scanningState.divisions ? '🔄 Scanning Divisions...' : '📊 Scan Divisions'}
        </button>

        <button
          onClick={scanTakeoff}
          disabled={!hasFiles || scanningState.takeoff || isAnyFileUploading}
          style={{
            padding: '0.875rem 1.5rem',
            background: !hasFiles || scanningState.takeoff || isAnyFileUploading 
              ? '#cbd5e0' 
              : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: !hasFiles || scanningState.takeoff || isAnyFileUploading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '0.9375rem',
            boxShadow: !hasFiles || scanningState.takeoff || isAnyFileUploading 
              ? 'none' 
              : '0 4px 14px rgba(59, 130, 246, 0.3)',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!(!hasFiles || scanningState.takeoff || isAnyFileUploading)) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
          }}
        >
          {scanningState.takeoff ? '🔄 Scanning Takeoff...' : '🔍 Scan Takeoff'}
        </button>

        <button
          onClick={() => setShowAddItemModal(true)}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9375rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)';
          }}
        >
          ➕ Add Item
        </button>

        {filteredAndSortedTakeoff.length > 0 && (
          <>
            <button
              onClick={exportToCSV}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(6, 182, 212, 0.3)';
              }}
            >
              📥 Export CSV
            </button>
            
            <button
              onClick={runAudit}
              disabled={isRunningAudit}
              style={{
                padding: '0.875rem 1.5rem',
                background: isRunningAudit 
                  ? '#cbd5e0' 
                  : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: isRunningAudit ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.9375rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isRunningAudit 
                  ? 'none' 
                  : '0 4px 14px rgba(239, 68, 68, 0.3)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isRunningAudit) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.3)';
              }}
            >
              {isRunningAudit ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
                  Running Audit...
                </>
              ) : (
                <>
                  🔍 Run Audit
                </>
              )}
            </button>

            <button
              onClick={() => setShowOutcomeModal(true)}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.3)';
              }}
            >
              📋 Project Outcome
            </button>
          </>
        )}
      </div>

      {/* Search and filters */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #cbd5e0',
            borderRadius: '4px',
            fontSize: '0.875rem',
            width: '200px'
          }}
        />

        <button
          onClick={() => setShowTableItemsOnly(!showTableItemsOnly)}
          style={{
            padding: '0.5rem 1rem',
            background: showTableItemsOnly ? '#9f7aea' : '#e2e8f0',
            color: showTableItemsOnly ? 'white' : '#2d3748',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          title="Show only items generated from tables"
        >
          📊 Table Items Only
          {showTableItemsOnly && ' ✓'}
        </button>

        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {DIVISIONS.slice(0, 10).map(div => (
            <button
              key={div.id}
              onClick={() => toggleDivisionFilter(div.id)}
              style={{
                padding: '0.25rem 0.5rem',
                background: selectedDivisions.includes(div.id) ? '#4299e1' : '#e2e8f0',
                color: selectedDivisions.includes(div.id) ? 'white' : '#2d3748',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
              title={div.title}
            >
              {div.id}
            </button>
          ))}
        </div>
      </div>

      {/* Division descriptions */}
      {Object.keys(selectedProject.divisionDescriptions || {}).length > 0 && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: '#f7fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Division Scopes
          </h3>
          <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>
            {Object.entries(selectedProject.divisionDescriptions).map(([divId, desc]) => (
              <div key={divId} style={{ marginBottom: '0.5rem' }}>
                <strong>{getDivisionName(divId)}:</strong> {desc}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Takeoff table */}
      {filteredAndSortedTakeoff.length > 0 ? (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th onClick={() => handleSort('division')} style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', fontWeight: '600' }}>
                    Division {sortField === 'division' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('description')} style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', fontWeight: '600' }}>
                    Description {sortField === 'description' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('quantity')} style={{ padding: '0.75rem', textAlign: 'right', cursor: 'pointer', fontWeight: '600' }}>
                    Qty {sortField === 'quantity' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Unit</th>
                  <th onClick={() => handleSort('unitCost')} style={{ padding: '0.75rem', textAlign: 'right', cursor: 'pointer', fontWeight: '600' }}>
                    Unit $ {sortField === 'unitCost' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Mod %</th>
                  <th onClick={() => handleSort('totalCost')} style={{ padding: '0.75rem', textAlign: 'right', cursor: 'pointer', fontWeight: '600' }}>
                    Total {sortField === 'totalCost' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>AI</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTakeoff.map((item) => {
                  const totalCost = item.quantity * item.unitCost * (1 + item.modifier / 100);
                  return (
                    <tr 
                      key={item.id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        background: item.userEdited ? '#fffaf0' : 
                                  item.metadata?.source === 'table' ? '#f0f9ff' : 'white'
                      }}
                    >
                      <td style={{ padding: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {item.metadata?.source === 'table' && (
                            <span 
                              title={`Generated from table on page ${item.metadata.sourcePage || 'unknown'}`}
                              style={{ fontSize: '0.875rem', cursor: 'help' }}
                            >
                              📊
                            </span>
                          )}
                          {item.division}
                        </div>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateTakeoff(item.id, 'description', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.25rem',
                            border: '1px solid transparent',
                            borderRadius: '2px',
                            background: 'transparent',
                            fontSize: '0.875rem'
                          }}
                          onFocus={(e) => e.target.style.border = '1px solid #4299e1'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                        {item.metadata?.source === 'table' && item.metadata.tableType && (
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#718096', 
                            marginTop: '0.125rem' 
                          }}>
                            From: {item.metadata.tableType}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateTakeoff(item.id, 'quantity', e.target.value)}
                          style={{
                            width: '80px',
                            padding: '0.25rem',
                            border: '1px solid transparent',
                            borderRadius: '2px',
                            background: 'transparent',
                            textAlign: 'right',
                            fontSize: '0.875rem'
                          }}
                          onFocus={(e) => e.target.style.border = '1px solid #4299e1'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateTakeoff(item.id, 'unit', e.target.value)}
                          style={{
                            width: '60px',
                            padding: '0.25rem',
                            border: '1px solid transparent',
                            borderRadius: '2px',
                            background: 'transparent',
                            textAlign: 'center',
                            fontSize: '0.875rem'
                          }}
                          onFocus={(e) => e.target.style.border = '1px solid #4299e1'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateTakeoff(item.id, 'unitCost', e.target.value)}
                          step="0.01"
                          style={{
                            width: '80px',
                            padding: '0.25rem',
                            border: '1px solid transparent',
                            borderRadius: '2px',
                            background: 'transparent',
                            textAlign: 'right',
                            fontSize: '0.875rem'
                          }}
                          onFocus={(e) => e.target.style.border = '1px solid #4299e1'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={item.modifier}
                          onChange={(e) => updateTakeoff(item.id, 'modifier', e.target.value)}
                          style={{
                            width: '60px',
                            padding: '0.25rem',
                            border: '1px solid transparent',
                            borderRadius: '2px',
                            background: 'transparent',
                            textAlign: 'center',
                            fontSize: '0.875rem'
                          }}
                          onFocus={(e) => e.target.style.border = '1px solid #4299e1'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600' }}>
                        ${totalCost.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedItemForPricing(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#f0f9ff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'none';
                          }}
                          title="Get AI price suggestion"
                        >
                          🤖
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f7fafc', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan="6" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                    Subtotal ({totals.count} items):
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                    ${totals.subtotal.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Show pricing intelligence for selected item */}
          {selectedItemForPricing && (
            <div style={{ marginTop: '1rem' }}>
              <PricingIntelligence
                item={selectedItemForPricing}
                location="US"
                projectId={selectedProject.id}
                onPriceAccept={(newPrice) => handlePriceAccept(selectedItemForPricing.id, newPrice)}
              />
            </div>
          )}

          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#718096'
          }}>
            Legend: 
            <span style={{ marginLeft: '1rem' }}>🔒 = User edited (protected)</span>
            <span style={{ marginLeft: '1rem' }}>📊 = Generated from table</span>
            <span style={{ marginLeft: '1rem', display: 'inline-block', width: '12px', height: '12px', background: '#fffaf0', border: '1px solid #e2e8f0' }}></span> = User edited
            <span style={{ marginLeft: '1rem', display: 'inline-block', width: '12px', height: '12px', background: '#f0f9ff', border: '1px solid #e2e8f0' }}></span> = From table
          </div>
        </>
      ) : (
        <div style={{
          padding: '2rem',
          background: '#f7fafc',
          border: '2px dashed #cbd5e0',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#4a5568'
        }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
            No takeoff items yet
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Scan takeoff from your documents or add items manually.
          </p>
        </div>
      )}

      {/* Add Item Modal */}
      <AddTakeoffItemModal
        show={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        onAdd={addTakeoffItem}
        DIVISIONS={DIVISIONS}
      />

      {/* Project Outcome Modal */}
      {showOutcomeModal && (
        <ProjectOutcomeModal
          projectId={selectedProject.id}
          estimateTotal={totals.subtotal}
          onClose={() => setShowOutcomeModal(false)}
          showToast={(message, type) => {
            updateProject({ message: type === 'success' ? `✅ ${message}` : `❌ ${message}` });
          }}
        />
      )}

      {/* Audit Report Section */}
      {showAuditReport && auditReport && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              📋 Audit Report
            </h3>
            <button
              onClick={() => setShowAuditReport(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#718096',
                cursor: 'pointer',
                fontSize: '1.25rem'
              }}
            >
              ✕
            </button>
          </div>

          {auditReport.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#48bb78'
            }}>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                ✅ No issues found!
              </p>
              <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                Your takeoff appears to be complete and consistent.
              </p>
            </div>
          ) : (
            <>
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#fff5f5',
                border: '1px solid #feb2b2',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}>
                <strong>{auditReport.length} potential issues found.</strong> Review the items below:
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  fontSize: '0.875rem' 
                }}>
                  <thead>
                    <tr style={{ 
                      background: '#f7fafc', 
                      borderBottom: '2px solid #e2e8f0' 
                    }}>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        fontWeight: '600',
                        minWidth: '120px'
                      }}>
                        Division
                      </th>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        fontWeight: '600',
                        minWidth: '200px'
                      }}>
                        Issue
                      </th>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        fontWeight: '600',
                        minWidth: '300px'
                      }}>
                        Detail
                      </th>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'center', 
                        fontWeight: '600',
                        minWidth: '80px'
                      }}>
                        Page
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditReport.map((issue, index) => (
                      <tr 
                        key={index}
                        style={{ 
                          borderBottom: '1px solid #e2e8f0',
                          background: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}
                      >
                        <td style={{ padding: '0.75rem' }}>
                          {issue.division || 'General'}
                        </td>
                        <td style={{ 
                          padding: '0.75rem',
                          color: issue.issue === 'Missing Item' ? '#e53e3e' : 
                                 issue.issue === 'Quantity Mismatch' ? '#ed8936' : 
                                 '#2d3748'
                        }}>
                          {issue.issue}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {issue.detail}
                        </td>
                        <td style={{ 
                          padding: '0.75rem', 
                          textAlign: 'center' 
                        }}>
                          {issue.page || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#edf2f7',
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}>
                <strong>Audit Types:</strong>
                <ul style={{ margin: '0.25rem 0 0 1.5rem', padding: 0 }}>
                  <li><span style={{ color: '#e53e3e' }}>Missing Item</span> - Found in specs but not in takeoff</li>
                  <li><span style={{ color: '#ed8936' }}>Quantity Mismatch</span> - Takeoff quantity differs from specs</li>
                  <li><span style={{ color: '#2d3748' }}>Other</span> - General consistency issues</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TakeoffTab;