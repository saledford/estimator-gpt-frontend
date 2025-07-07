import React, { useState } from 'react';

const NotesTab = ({
  selectedProject,
  handleAddNote,
  handleUpdateNote,
  handleDeleteNote
}) => {
  const [editingNoteId, setEditingNoteId] = useState(null);

  const startEditing = (noteId) => {
    setEditingNoteId(noteId);
  };

  const stopEditing = () => {
    setEditingNoteId(null);
  };

  const handleNoteChange = (noteId, text) => {
    handleUpdateNote(noteId, text);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Project Notes
        </h2>
        <p style={{ color: '#718096', fontSize: '0.875rem' }}>
          Keep track of important observations, reminders, and action items.
        </p>
      </div>

      <button
        onClick={handleAddNote}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#48bb78',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ➕ Add Note
      </button>

      {selectedProject.notes && selectedProject.notes.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {selectedProject.notes.map((note) => (
            <div
              key={note.id}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#718096'
                }}>
                  {formatDate(note.timestamp) || 'Just now'}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {editingNoteId !== note.id && (
                    <button
                      onClick={() => startEditing(note.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4299e1',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        fontSize: '0.875rem'
                      }}
                      title="Edit note"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                    title="Delete note"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {editingNoteId === note.id ? (
                <div>
                  <textarea
                    value={note.text}
                    onChange={(e) => handleNoteChange(note.id, e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '0.5rem',
                      border: '1px solid #cbd5e0',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Enter your note..."
                    autoFocus
                  />
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={stopEditing}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    color: '#2d3748',
                    whiteSpace: 'pre-wrap',
                    minHeight: '2rem'
                  }}
                  onClick={() => startEditing(note.id)}
                >
                  {note.text || (
                    <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>
                      Click to add content...
                    </span>
                  )}
                </div>
              )}

              {/* Note categories/tags (future enhancement) */}
              {note.tags && note.tags.length > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  gap: '0.25rem',
                  flexWrap: 'wrap'
                }}>
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.125rem 0.5rem',
                        background: '#edf2f7',
                        color: '#4a5568',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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
            No notes yet
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Click "Add Note" to create your first project note.
          </p>
        </div>
      )}

      {/* Quick note templates (future enhancement) */}
      {selectedProject.notes && selectedProject.notes.length === 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#edf2f7',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Quick Templates:
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              'Check ceiling heights',
              'Verify electrical requirements',
              'Confirm material specifications',
              'Schedule site visit',
              'Request additional quotes'
            ].map((template) => (
              <button
                key={template}
                onClick={() => {
                  handleAddNote();
                  // Wait for next render cycle, then update the newly created note
                  setTimeout(() => {
                    const notes = selectedProject.notes || [];
                    if (notes.length > 0) {
                      const newNote = notes[notes.length - 1];
                      handleUpdateNote(newNote.id, template);
                    }
                  }, 100);
                }}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'white',
                  color: '#4a5568',
                  border: '1px solid #cbd5e0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4299e1';
                  e.target.style.color = 'white';
                  e.target.style.borderColor = '#4299e1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#4a5568';
                  e.target.style.borderColor = '#cbd5e0';
                }}
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesTab;