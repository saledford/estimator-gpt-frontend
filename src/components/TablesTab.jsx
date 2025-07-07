import React, { useState } from 'react';

const TablesTab = ({ selectedProject, updateProject }) => {
  const [expandedTables, setExpandedTables] = useState({});
  const [tableComments, setTableComments] = useState({});
  const [selectedTableType, setSelectedTableType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get tables from project state
  const tables = selectedProject.tables || [];
  
  // Get unique table types
  const getTableTypes = () => {
    const types = new Set();
    tables.forEach(table => {
      if (table.tableType) {
        types.add(table.tableType);
      }
    });
    return Array.from(types).sort();
  };

  const tableTypes = getTableTypes();

  // Filter tables based on selected type and search term
  const filteredTables = tables.filter(table => {
    const matchesType = selectedTableType === 'all' || table.tableType === selectedTableType;
    const matchesSearch = !searchTerm || 
      (table.tableType && table.tableType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (table.filename && table.filename.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (table.text && table.text.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Group tables by type
  const groupedTables = filteredTables.reduce((groups, table) => {
    const type = table.tableType || 'Unclassified';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(table);
    return groups;
  }, {});

  // Get takeoff items linked to tables
  const getLinkedTakeoffItems = (tableId, sourcePage) => {
    if (!selectedProject.takeoff) return [];
    
    return selectedProject.takeoff.filter(item => 
      item.metadata?.source === 'table' && 
      (item.metadata?.tableId === tableId || item.metadata?.sourcePage === sourcePage)
    );
  };

  const toggleTableExpansion = (tableId) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableId]: !prev[tableId]
    }));
  };

  const acceptTableItem = (itemId) => {
    updateProject({
      takeoff: selectedProject.takeoff.map(item =>
        item.id === itemId 
          ? { ...item, metadata: { ...item.metadata, accepted: true } }
          : item
      )
    });
  };

  const rejectTableItem = (itemId) => {
    updateProject({
      takeoff: selectedProject.takeoff.filter(item => item.id !== itemId)
    });
  };

  const addTableComment = (tableId, comment) => {
    setTableComments(prev => ({
      ...prev,
      [tableId]: comment
    }));
    
    // Update project state with comment
    updateProject({
      tables: selectedProject.tables.map(table =>
        table.id === tableId 
          ? { ...table, comment }
          : table
      )
    });
  };

  if (!tables || tables.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Extracted Tables
          </h2>
          <p style={{ color: '#718096', fontSize: '0.875rem' }}>
            Review tables found in your documents and their generated takeoff items.
          </p>
        </div>

        <div style={{
          padding: '3rem',
          background: '#f7fafc',
          border: '2px dashed #cbd5e0',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#4a5568'
        }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
            No tables detected yet
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Tables will appear here when found in your uploaded documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Extracted Tables
        </h2>
        <p style={{ color: '#718096', fontSize: '0.875rem' }}>
          Review tables found in your documents and their generated takeoff items.
        </p>
      </div>

      {/* Filters Section */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem', 
        background: '#f7fafc', 
        borderRadius: '8px',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            fontWeight: '600',
            marginBottom: '0.25rem',
            color: '#4a5568'
          }}>
            Filter by Type:
          </label>
          <select
            value={selectedTableType}
            onChange={(e) => setSelectedTableType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              fontSize: '0.875rem',
              background: 'white'
            }}
          >
            <option value="all">All Types ({tables.length})</option>
            {tableTypes.map(type => {
              const count = tables.filter(t => t.tableType === type).length;
              return (
                <option key={type} value={type}>
                  {type} ({count})
                </option>
              );
            })}
            {tables.some(t => !t.tableType) && (
              <option value="Unclassified">
                Unclassified ({tables.filter(t => !t.tableType).length})
              </option>
            )}
          </select>
        </div>

        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            fontWeight: '600',
            marginBottom: '0.25rem',
            color: '#4a5568'
          }}>
            Search Tables:
          </label>
          <input
            type="text"
            placeholder="Search by content or filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Quick Type Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#4a5568' }}>
            Quick filters:
          </span>
          {['Room Finish Schedule', 'Door Schedule', 'Window Schedule', 'Equipment List'].map(quickType => {
            const hasType = tableTypes.includes(quickType);
            if (!hasType) return null;
            
            return (
              <button
                key={quickType}
                onClick={() => setSelectedTableType(quickType)}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: selectedTableType === quickType ? '#4299e1' : 'white',
                  color: selectedTableType === quickType ? 'white' : '#4299e1',
                  border: '1px solid #4299e1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {quickType}
              </button>
            );
          })}
        </div>
      </div>

      {/* Display grouped tables */}
      {Object.keys(groupedTables).length > 0 ? (
        Object.entries(groupedTables).map(([type, tablesInGroup]) => (
          <div key={type} style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {type}
              <span style={{
                background: '#e2e8f0',
                color: '#4a5568',
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {tablesInGroup.length}
              </span>
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tablesInGroup.map((table) => {
                const linkedItems = getLinkedTakeoffItems(table.id, table.sourcePage);
                const isExpanded = expandedTables[table.id];
                
                return (
                  <div
                    key={table.id}
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Table Header */}
                    <div 
                      style={{
                        padding: '1rem',
                        background: '#f7fafc',
                        borderBottom: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => toggleTableExpansion(table.id)}
                    >
                      <div>
                        <h3 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          📊 {table.title || table.tableType || 'Untitled Table'}
                          {linkedItems.length > 0 && (
                            <span style={{
                              background: '#4299e1',
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {linkedItems.length} items
                            </span>
                          )}
                          {table.tableType && table.title && (
                            <span style={{
                              background: '#9f7aea',
                              color: 'white',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {table.tableType}
                            </span>
                          )}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: '#718096', margin: 0 }}>
                          {table.filename} • Page {table.sourcePage}
                          {table.rowCount && ` • ${table.rowCount} rows`}
                          {table.columnCount && ` × ${table.columnCount} columns`}
                        </p>
                      </div>
                      <span style={{ fontSize: '1.25rem', color: '#718096' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{ padding: '1rem' }}>
                        {/* Table Preview */}
                        <div style={{
                          marginBottom: '1rem',
                          padding: '1rem',
                          background: '#f7fafc',
                          borderRadius: '4px',
                          maxHeight: '300px',
                          overflowY: 'auto'
                        }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Table Preview:
                          </h4>
                          {table.html ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: table.html }}
                              style={{ fontSize: '0.75rem' }}
                            />
                          ) : (
                            <pre style={{ 
                              fontSize: '0.75rem', 
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'monospace',
                              margin: 0
                            }}>
                              {table.text || 'No preview available'}
                            </pre>
                          )}
                        </div>

                        {/* Comment Section */}
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '0.875rem', 
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                          }}>
                            Comments:
                          </label>
                          <textarea
                            value={tableComments[table.id] || table.comment || ''}
                            onChange={(e) => setTableComments(prev => ({
                              ...prev,
                              [table.id]: e.target.value
                            }))}
                            onBlur={(e) => addTableComment(table.id, e.target.value)}
                            placeholder="Add notes about this table..."
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #cbd5e0',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              minHeight: '60px',
                              resize: 'vertical'
                            }}
                          />
                        </div>

                        {/* Linked Takeoff Items */}
                        {linkedItems.length > 0 && (
                          <div>
                            <h4 style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: '600', 
                              marginBottom: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              Generated Takeoff Items:
                              <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '400' }}>
                                ({linkedItems.filter(item => item.metadata?.accepted).length} accepted)
                              </span>
                            </h4>
                            
                            <div style={{ 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              {linkedItems.map((item, index) => (
                                <div
                                  key={item.id}
                                  style={{
                                    padding: '0.75rem',
                                    borderBottom: index < linkedItems.length - 1 ? '1px solid #e2e8f0' : 'none',
                                    background: item.metadata?.accepted ? '#e6fffa' : 'white',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                      <strong>{item.description}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                      {item.quantity} {item.unit} @ ${item.unitCost}/unit
                                      {item.division && ` • ${item.division}`}
                                    </div>
                                  </div>
                                  
                                  {!item.metadata?.accepted && (
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                      <button
                                        onClick={() => acceptTableItem(item.id)}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          background: '#48bb78',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.75rem',
                                          fontWeight: '500'
                                        }}
                                        title="Accept this item"
                                      >
                                        ✓ Accept
                                      </button>
                                      <button
                                        onClick={() => rejectTableItem(item.id)}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          background: '#e53e3e',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '0.75rem',
                                          fontWeight: '500'
                                        }}
                                        title="Remove this item"
                                      >
                                        ✗ Reject
                                      </button>
                                    </div>
                                  )}
                                  
                                  {item.metadata?.accepted && (
                                    <span style={{
                                      color: '#48bb78',
                                      fontSize: '0.875rem',
                                      fontWeight: '500'
                                    }}>
                                      ✓ Accepted
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No linked items message */}
                        {linkedItems.length === 0 && (
                          <div style={{
                            padding: '1rem',
                            background: '#fff5f5',
                            border: '1px solid #feb2b2',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            color: '#c53030'
                          }}>
                            No takeoff items were generated from this table.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div style={{
          padding: '3rem',
          background: '#f7fafc',
          border: '2px dashed #cbd5e0',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#4a5568'
        }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
            {tables.length === 0 ? 'No tables detected yet' : 'No tables match your filters'}
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            {tables.length === 0 
              ? 'Tables will appear here when found in your uploaded documents.'
              : 'Try adjusting your filters or search terms.'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#edf2f7',
        borderRadius: '8px',
        fontSize: '0.875rem'
      }}>
        <strong>Summary:</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <ul style={{ margin: '0', padding: '0 0 0 1.5rem' }}>
              <li>{tables.length} tables found total</li>
              <li>{filteredTables.length} tables shown (filtered)</li>
              <li>{tableTypes.length} unique table types</li>
            </ul>
          </div>
          <div>
            <ul style={{ margin: '0', padding: '0 0 0 1.5rem' }}>
              <li>
                {selectedProject.takeoff?.filter(item => item.metadata?.source === 'table').length || 0} takeoff items from tables
              </li>
              <li>
                {selectedProject.takeoff?.filter(item => item.metadata?.source === 'table' && item.metadata?.accepted).length || 0} items accepted
              </li>
              <li>
                {tables.filter(t => getLinkedTakeoffItems(t.id, t.sourcePage).length > 0).length} tables with items
              </li>
            </ul>
          </div>
        </div>
        
        {tableTypes.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Table Types Found:</strong>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {tableTypes.map(type => (
                <span
                  key={type}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: 'white',
                    border: '1px solid #cbd5e0',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  {type} ({tables.filter(t => t.tableType === type).length})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesTab;