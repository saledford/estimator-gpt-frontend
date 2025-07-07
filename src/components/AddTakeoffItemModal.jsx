import React from 'react';

const AddTakeoffItemModal = ({
  show,
  onClose,
  newItem,
  setNewItem,
  onAdd,
  DIVISIONS
}) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Add Takeoff Item
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Description *
          </label>
          <input
            type="text"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
            placeholder="e.g., Paint interior walls"
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Division (optional - will auto-classify)
          </label>
          <select
            value={newItem.division}
            onChange={(e) => setNewItem({ ...newItem, division: e.target.value })}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Auto-classify based on description</option>
            {DIVISIONS.map(div => (
              <option key={div.id} value={div.id}>
                {div.id} - {div.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Quantity
            </label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Unit
            </label>
            <input
              type="text"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
              placeholder="SF, LF, EA, etc."
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Unit Cost ($)
            </label>
            <input
              type="number"
              value={newItem.unitCost}
              onChange={(e) => setNewItem({ ...newItem, unitCost: e.target.value })}
              step="0.01"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Modifier (%)
            </label>
            <input
              type="number"
              value={newItem.modifier}
              onChange={(e) => setNewItem({ ...newItem, modifier: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              background: '#e2e8f0',
              color: '#2d3748',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!newItem.description}
            style={{
              padding: '0.5rem 1rem',
              background: !newItem.description ? '#cbd5e0' : '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !newItem.description ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTakeoffItemModal;