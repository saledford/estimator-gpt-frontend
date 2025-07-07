import React from 'react';

const FilesTab = ({
  selectedProject,
  handleAddFiles,
  scanSpec,
  scanningState,
  handleDeleteFile,
  handleDrop,
  handleDragOver,
  handleDragLeave
}) => {
  const fileTypes = [
    { type: 'spec', label: 'Specifications', accept: '.pdf' },
    { type: 'blueprint', label: 'Blueprints', accept: '.pdf' },
    { type: 'quote', label: 'Quotes', accept: '.pdf' },
    { type: 'addenda', label: 'Addenda', accept: '.pdf' },
    { type: 'other', label: 'Other Documents', accept: '.pdf' }
  ];

  const getFilesByType = (type) => {
    return selectedProject.files.filter(file => file.type === type);
  };

  const renderFileSection = (fileType) => {
    const files = getFilesByType(fileType.type);
    
    return (
      <div key={fileType.type} style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem', 
          color: '#2d3748',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {fileType.label}
          {files.length > 0 && (
            <span style={{
              background: '#667eea',
              color: 'white',
              padding: '0.125rem 0.5rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {files.length}
            </span>
          )}
        </h3>
        
        <div
          onDrop={(e) => handleDrop(e, fileType.type)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: '2px dashed #cbd5e0',
            borderRadius: '12px',
            padding: '2.5rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e0';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
          }}
        >
          <input
            type="file"
            id={`file-input-${fileType.type}`}
            accept={fileType.accept}
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleAddFiles(e.target.files, fileType.type)}
          />
          
          <label
            htmlFor={`file-input-${fileType.type}`}
            style={{
              cursor: 'pointer',
              color: '#667eea',
              fontWeight: '600',
              fontSize: '0.9375rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '2.5rem', opacity: 0.8 }}>📎</span>
            <span>Click to upload or drag & drop {fileType.label.toLowerCase()}</span>
            <span style={{ fontSize: '0.75rem', color: '#718096' }}>PDF files only</span>
          </label>
          
          {files.length > 0 && (
            <div style={{ marginTop: '1.5rem', width: '100%' }}>
              {files.map((file) => (
                <div
                  key={file.id || file.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 1rem',
                    background: file.accepted ? 'linear-gradient(135deg, #e6fffa 0%, #d1fae5 100%)' : 'white',
                    border: '1px solid',
                    borderColor: file.accepted ? '#10b981' : '#e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    fontSize: '0.9375rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    animation: 'slideIn 0.3s ease'
                  }}
                >
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: file.isUploading ? '#718096' : '#2d3748',
                    fontWeight: '500'
                  }}>
                    {file.isUploading ? (
                      <>
                        <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        {file.accepted ? '✅' : '📄'} {file.name}
                      </>
                    )}
                  </span>
                  
                  {!file.isUploading && (
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        fontSize: '1rem',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#fff5f5';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.transform = 'scale(1)';
                      }}
                      title="Delete file"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasSpecFile = selectedProject.files.some(f => f.type === 'spec' && !f.isUploading);
  const isAnyFileUploading = selectedProject.files.some(f => f.isUploading);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2d3748' }}>
          Project Files
        </h2>
        <p style={{ color: '#718096', fontSize: '1rem' }}>
          Upload your construction documents by type. PDFs only.
        </p>
      </div>

      {selectedProject.message && (
        <div style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          background: selectedProject.message.includes('✅') ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 
                      selectedProject.message.includes('❌') ? 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' : 
                      'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
          color: 'white',
          borderRadius: '10px',
          fontSize: '0.9375rem',
          fontWeight: '500',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.3s ease'
        }}>
          {selectedProject.message}
        </div>
      )}

      {fileTypes.map(renderFileSection)}

      {hasSpecFile && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          borderRadius: '12px',
          border: '1px solid #7dd3fc',
          boxShadow: '0 2px 8px rgba(125, 211, 252, 0.15)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0369a1' }}>
            Specification Parser
          </h3>
          <p style={{ fontSize: '0.9375rem', color: '#0c4a6e', marginBottom: '1rem' }}>
            Parse specification PDFs to extract section index for better GPT context.
          </p>
          <button
            onClick={scanSpec}
            disabled={scanningState.spec || isAnyFileUploading}
            style={{
              padding: '0.875rem 1.5rem',
              background: scanningState.spec || isAnyFileUploading 
                ? '#cbd5e0' 
                : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: scanningState.spec || isAnyFileUploading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.9375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: scanningState.spec || isAnyFileUploading 
                ? 'none' 
                : '0 4px 14px rgba(6, 182, 212, 0.3)',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!scanningState.spec && !isAnyFileUploading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px rgba(6, 182, 212, 0.3)';
            }}
          >
            {scanningState.spec ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
                Parsing Specifications...
              </>
            ) : (
              <>
                📋 Parse Spec Manual
              </>
            )}
          </button>
          
          {selectedProject.specIndex && selectedProject.specIndex.length > 0 && (
            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.875rem', 
              color: '#059669',
              fontWeight: '600'
            }}>
              ✅ {selectedProject.specIndex.length} sections indexed
            </p>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
        borderRadius: '10px',
        fontSize: '0.875rem',
        color: '#78350f'
      }}>
        <strong>💡 Tip:</strong> Uploading specs, blueprints, or addenda will automatically trigger a summary scan.
      </div>
    </div>
  );
};

export default FilesTab;