import React, { useState } from 'react';

const SummaryTab = ({ selectedProject, scanSummary, scanningState, updateProject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(selectedProject.summary || '');

  const handleSave = () => {
    updateProject(selectedProject.id, { summary: editedSummary });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSummary(selectedProject.summary || '');
    setIsEditing(false);
  };

  const hasFiles = selectedProject.files && selectedProject.files.length > 0;
  const isAnyFileUploading = selectedProject.files.some(f => f.isUploading);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Project Summary
        </h2>
        <p style={{ color: '#718096', fontSize: '0.875rem' }}>
          AI-generated overview of your project scope and requirements.
        </p>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={scanSummary}
          disabled={!hasFiles || scanningState.summary || isAnyFileUploading || isEditing}
          style={{
            padding: '0.5rem 1rem',
            background: !hasFiles || scanningState.summary || isAnyFileUploading || isEditing ? '#cbd5e0' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !hasFiles || scanningState.summary || isAnyFileUploading || isEditing ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {scanningState.summary ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
              Scanning Summary...
            </>
          ) : (
            <>
              🔍 Scan Summary
            </>
          )}
        </button>

        {selectedProject.summary && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setEditedSummary(selectedProject.summary);
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            ✏️ Edit
          </button>
        )}

        {isEditing && (
          <>
            <button
              onClick={handleSave}
              style={{
                padding: '0.5rem 1rem',
                background: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              💾 Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1rem',
                background: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              ❌ Cancel
            </button>
          </>
        )}
      </div>

      {!hasFiles && (
        <div style={{
          padding: '2rem',
          background: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#c53030'
        }}>
          <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            No files uploaded yet
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Please upload documents in the Files tab first.
          </p>
        </div>
      )}

      {hasFiles && !selectedProject.summary && !scanningState.summary && (
        <div style={{
          padding: '2rem',
          background: '#f7fafc',
          border: '2px dashed #cbd5e0',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#4a5568'
        }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
            No summary generated yet
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Click "Scan Summary" to analyze your uploaded documents.
          </p>
        </div>
      )}

      {selectedProject.summary && (
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {isEditing ? (
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '1rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              placeholder="Enter project summary..."
            />
          ) : (
            <div style={{
              fontSize: '0.875rem',
              lineHeight: '1.8',
              color: '#2d3748',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedProject.summary}
            </div>
          )}
        </div>
      )}

      {selectedProject.summary && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#e6fffa',
          border: '1px solid #38b2ac',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#234e52'
        }}>
          <strong>Summary Status:</strong> {selectedProject.files.filter(f => f.accepted).length} of {selectedProject.files.length} files processed
        </div>
      )}
    </div>
  );
};

export default SummaryTab;