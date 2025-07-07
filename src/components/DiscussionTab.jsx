import React, { useRef, useEffect } from 'react';

const DiscussionTab = ({
  selectedProject,
  userMessage,
  setUserMessage,
  handleSendMessage
}) => {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedProject.discussion]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text) => {
    // Simple formatting: convert line breaks to <br> tags
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const renderActionSummary = (message) => {
    // Check if this GPT message mentions actions
    if (message.sender === 'GPT' && message.text.includes('added') || message.text.includes('updated')) {
      return (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          background: '#e6fffa',
          border: '1px solid #38b2ac',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#234e52'
        }}>
          ✅ Actions applied to takeoff
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Project Discussion
        </h2>
        <p style={{ color: '#718096', fontSize: '0.875rem' }}>
          Chat with GPT about your project. It can analyze documents and update takeoff items.
        </p>
      </div>

      {/* Messages area */}
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        background: '#f7fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        {selectedProject.discussion && selectedProject.discussion.length > 0 ? (
          <div>
            {selectedProject.discussion.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: msg.sender === 'User' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '0.75rem',
                  background: msg.sender === 'User' ? '#4299e1' : 'white',
                  color: msg.sender === 'User' ? 'white' : '#2d3748',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.8,
                    marginBottom: '0.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: '600' }}>
                      {msg.sender === 'User' ? '👤 You' : '🤖 GPT'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                    {formatMessage(msg.text)}
                  </div>
                  {renderActionSummary(msg)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#718096',
            padding: '3rem'
          }}>
            <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              No messages yet. Start a conversation!
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Try asking GPT to analyze your documents or add items to the takeoff.
            </p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px'
      }}>
        <textarea
          ref={inputRef}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about the project, request takeoff items, or get cost analysis..."
          style={{
            flexGrow: 1,
            padding: '0.75rem',
            border: '1px solid #cbd5e0',
            borderRadius: '4px',
            resize: 'vertical',
            minHeight: '60px',
            maxHeight: '200px',
            fontSize: '0.875rem',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!userMessage.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            background: !userMessage.trim() ? '#cbd5e0' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !userMessage.trim() ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            alignSelf: 'flex-end'
          }}
        >
          Send
        </button>
      </div>

      {/* Example prompts */}
      <div style={{
        marginTop: '0.5rem',
        padding: '0.75rem',
        background: '#edf2f7',
        borderRadius: '4px',
        fontSize: '0.75rem',
        color: '#4a5568'
      }}>
        <strong>Example prompts:</strong>
        <ul style={{ margin: '0.25rem 0 0 1.5rem', padding: 0 }}>
          <li>"Add 500 SF of carpet to the main office area"</li>
          <li>"What electrical work is included in this project?"</li>
          <li>"Update the paint quantity to 3000 SF"</li>
          <li>"Show me all HVAC-related items"</li>
        </ul>
      </div>
    </div>
  );
};

export default DiscussionTab;