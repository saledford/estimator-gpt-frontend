import React, { useState, useEffect } from 'react';
import FilesTab from './components/FilesTab';
import SummaryTab from './components/SummaryTab';
import TakeoffTab from './components/TakeoffTab';
import DiscussionTab from './components/DiscussionTab';
import NotesTab from './components/NotesTab';
import TablesTab from './components/TablesTab';
import AnalyticsDashboard from './components/AnalyticsDashboard';

// API Configuration
const API_BASE = 'https://estimator-gpt-backend.onrender.com';

// Inject spinning and pulse animations into document head (only once)
if (typeof window !== 'undefined' && !document.getElementById('animations')) {
  const style = document.createElement('style');
  style.id = 'animations';
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
    @keyframes slideIn {
      0% { transform: translateX(-10px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    * {
      transition: all 0.2s ease;
    }
  `;
  document.head.appendChild(style);
}

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#e53e3e' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DIVISIONS = [
  { id: '01', title: 'General Requirements' },
  { id: '02', title: 'Existing Conditions' },
  { id: '03', title: 'Concrete' },
  { id: '04', title: 'Masonry' },
  { id: '05', title: 'Metals' },
  { id: '06', title: 'Wood, Plastics, and Composites' },
  { id: '07', title: 'Thermal and Moisture Protection' },
  { id: '08', title: 'Openings (Doors, Windows)' },
  { id: '09', title: 'Finishes' },
  { id: '10', title: 'Specialties' },
  { id: '11', title: 'Equipment' },
  { id: '12', title: 'Furnishings' },
  { id: '13', title: 'Special Construction' },
  { id: '14', title: 'Conveying Equipment (Elevators)' },
  { id: '21', title: 'Fire Suppression' },
  { id: '22', title: 'Plumbing' },
  { id: '23', title: 'HVAC' },
  { id: '25', title: 'Integrated Automation' },
  { id: '26', title: 'Electrical' },
  { id: '27', title: 'Communications' },
  { id: '28', title: 'Electronic Safety and Security' },
  { id: '31', title: 'Earthwork' },
  { id: '32', title: 'Exterior Improvements (Landscaping, Paving)' },
  { id: '33', title: 'Utilities' },
];

const getDivisionName = (divisionId) => {
  const division = DIVISIONS.find((d) => d.id === divisionId);
  return division ? `Division ${division.id} – ${division.title}` : divisionId || 'Unknown';
};

function App() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((project) => ({
        id: project.id || Date.now(),
        name: project.name || 'New Project',
        files: project.files || [],
        summary: project.summary || '',
        divisionDescriptions: project.divisionDescriptions || {},
        takeoff: project.takeoff || [],
        discussion: project.discussion || [],
        notes: project.notes || [],
        tables: project.tables || [],
        preferences: project.preferences || {
          scopeSensitivity: 0.8,
          defaultLaborRate: 0,
          defaultMaterialRate: 0,
        },
        specIndex: project.specIndex || [],
        scanning: false,
        message: '',
      }));
    }
    return [];
  });

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [activeTab, setActiveTab] = useState('files');
  const [userMessage, setUserMessage] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    description: '',
    division: '',
    quantity: 0,
    unit: '',
    unitCost: 0,
    modifier: 0,
  });
  const [contextMenu, setContextMenu] = useState(null);
  const [scanningState, setScanningState] = useState({
    summary: false,
    divisions: false,
    takeoff: false,
    spec: false,
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Persist projects to localStorage
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const updateProject = (projectId, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
  };

  const addProject = () => {
    const newProjectId = Date.now();
    const newProject = {
      id: newProjectId,
      name: 'New Project',
      files: [],
      summary: '',
      divisionDescriptions: {},
      takeoff: [],
      discussion: [],
      notes: [],
      tables: [],
      preferences: {
        scopeSensitivity: 0.8,
        defaultLaborRate: 0,
        defaultMaterialRate: 0,
      },
      specIndex: [],
      scanning: false,
      message: '',
    };
    setProjects([...projects, newProject]);
    setSelectedProjectId(newProjectId);
  };

  const deleteProject = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      try {
        for (const fileMeta of project.files) {
          if (fileMeta.id) {
            await fetch(`${API_BASE}/api/projects/${projectId}/files/${fileMeta.id}`, {
              method: 'DELETE',
            });
          }
        }
      } catch (err) {
        console.error('Failed to delete files:', err);
        updateProject(projectId, { message: `Error deleting files: ${err.message}` });
      }
    }
    setProjects(projects.filter((p) => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(projects.length > 1 ? projects[0].id : null);
    }
  };

  const startEditingProjectName = (id, currentName) => {
    setEditingProjectId(id);
    setEditingProjectName(currentName);
  };

  const saveProjectName = (projectId, newName) => {
    if (newName.trim() === '') {
      setEditingProjectId(null);
      setEditingProjectName('');
      return;
    }
    updateProject(projectId, { name: newName.trim() });
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const handleAddFiles = async (files, fileType) => {
    if (!selectedProjectId) return;

    // Get fresh project state
    const getCurrentProject = () => projects.find(p => p.id === selectedProjectId);
    let currentProject = getCurrentProject();

    const unique = Array.from(files).filter(
      (newFile) =>
        !currentProject.files.some(
          (existing) => existing.name === newFile.name && existing.type === fileType
        )
    );

    // Initialize uploadedFiles with isUploading: true
    let uploadedFiles = unique.map((file) => ({
      id: null,
      name: file.name,
      type: fileType,
      accepted: false,
      isUploading: true,
    }));

    // Add files to state immediately
    setProjects(prev => prev.map(p => 
      p.id === selectedProjectId 
        ? {
            ...p,
            files: [...p.files, ...uploadedFiles],
            message: `Uploading ${unique.length} ${fileType}(s)...`
          }
        : p
    ));

    for (let i = 0; i < unique.length; i++) {
      const file = unique[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setProjects(prev => prev.map(p => 
          p.id === selectedProjectId 
            ? {
                ...p,
                files: p.files.map(f =>
                  f.name === file.name && f.type === fileType && f.isUploading
                    ? { ...f, isUploading: false }
                    : f
                ),
                message: `Only PDF files are supported: ${file.name} skipped.`
              }
            : p
        ));
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(`${API_BASE}/api/projects/${selectedProjectId}/upload`, {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || `Failed to upload ${file.name}`);
        }

        const fileMeta = {
          id: result.fileId,
          name: file.name,
          type: fileType,
          accepted: false,
          isUploading: false,
        };
        uploadedFiles[i] = fileMeta;

        // Use callback to get fresh state
        setProjects(prev => prev.map(p => 
          p.id === selectedProjectId 
            ? {
                ...p,
                files: p.files.map(f =>
                  f.name === file.name && f.type === fileType && f.isUploading
                    ? fileMeta
                    : f
                )
              }
            : p
        ));
      } catch (err) {
        console.error(`Failed to upload ${file.name}: ${err.message}`);
        setProjects(prev => prev.map(p => 
          p.id === selectedProjectId 
            ? {
                ...p,
                files: p.files.map(f =>
                  f.name === file.name && f.type === fileType && f.isUploading
                    ? { ...f, isUploading: false }
                    : f
                ),
                message: `Failed to upload ${file.name}: ${err.message}`
              }
            : p
        ));
        return;
      }
    }

    // Auto-scan for blueprints, specs, or addenda
    if (fileType === 'spec' || fileType === 'blueprint' || fileType === 'addenda') {
      setProjects(prev => prev.map(p => 
        p.id === selectedProjectId 
          ? {
              ...p,
              message: '📄 Scanning uploaded document for summary...'
            }
          : p
      ));

      // Disable screen interactions
      setScanningState((prev) => ({ ...prev, summary: true }));

      try {
        // Get fresh project state for auto-scan
        currentProject = getCurrentProject();
        
        if (fileType === 'spec') {
          for (const specFileMeta of uploadedFiles.filter((f) => f.id)) {
            const fileResponse = await fetch(`${API_BASE}/api/projects/${selectedProjectId}/files/${specFileMeta.id}`);
            if (!fileResponse.ok) throw new Error(`Failed to retrieve ${specFileMeta.name}`);
            const blob = await fileResponse.blob();
            const file = new File([blob], specFileMeta.name, { type: blob.type });
            const specFormData = new FormData();
            specFormData.append('file', file);
            const response = await fetch(`${API_BASE}/api/parse-spec`, {
              method: 'POST',
              body: specFormData,
            });
            if (!response.ok) {
              const errText = await response.text();
              throw new Error(`Spec parse failed for ${specFileMeta.name}: ${errText}`);
            }
            const result = await response.json();
            setProjects(prev => prev.map(p => 
              p.id === selectedProjectId 
                ? {
                    ...p,
                    specIndex: result.specIndex || [],
                    files: p.files.map(f =>
                      f.id === specFileMeta.id ? { ...f, accepted: true } : f
                    )
                  }
                : p
            ));
          }
        }

        // AUTO-SCAN SUMMARY - FIXED ENDPOINT
        const summaryResponse = await fetch(`${API_BASE}/api/projects/${selectedProjectId}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            scan_type: 'summary'
          })
        });
        
        const summaryResult = await summaryResponse.json();
        if (!summaryResponse.ok || !summaryResult.summary) {
          throw new Error(summaryResult.detail || 'Summary generation failed.');
        }

        setProjects(prev => prev.map(p => 
          p.id === selectedProjectId 
            ? {
                ...p,
                summary: summaryResult.summary,
                name: summaryResult.title?.trim() || p.name,
                message: '✅ Summary and specs updated successfully!',
                files: p.files.map(file => 
                  uploadedFiles.find(f => f.id === file.id) 
                    ? { ...file, accepted: true } 
                    : file
                )
              }
            : p
        ));
      } catch (err) {
        setProjects(prev => prev.map(p => 
          p.id === selectedProjectId 
            ? {
                ...p,
                message: `❌ Auto-scan failed: ${err.message}`
              }
            : p
        ));
      } finally {
        setScanningState((prev) => ({ ...prev, summary: false }));
      }
    }
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleAddFiles(files, fileType);
    }
    e.target.style.background = '#f9fafb';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.background = '#e2e8f0';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.background = '#f9fafb';
  };

  const handleDeleteFile = async (fileId) => {
    if (!selectedProjectId) return;
    const fileToDelete = selectedProject.files.find((file) => file.id === fileId);
    if (!fileToDelete) return;

    try {
      await fetch(`${API_BASE}/api/projects/${selectedProjectId}/files/${fileId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error(`Failed to delete ${fileToDelete.name}: ${err.message}`);
      updateProject(selectedProjectId, {
        message: `Failed to delete ${fileToDelete.name}: ${err.message}`,
      });
      return;
    }

    updateProject(selectedProjectId, {
      files: selectedProject.files.filter((file) => file.id !== fileId),
      message: `Deleted ${fileToDelete.name} successfully! ✅`,
    });
  };

  const scanSpec = async () => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project.files.some((f) => f.isUploading)) {
      updateProject(selectedProjectId, { message: 'Please wait for all uploads to finish.' });
      return;
    }
    const specFileMeta = project.files.find((f) => f.type === 'spec');
    if (!specFileMeta?.id) {
      updateProject(selectedProjectId, { message: 'Please upload a specification PDF to parse.' });
      return;
    }

    setScanningState((prev) => ({ ...prev, spec: true }));
    updateProject(selectedProjectId, { message: 'Parsing specification manual...' });

    try {
      const fileResponse = await fetch(`${API_BASE}/api/projects/${selectedProjectId}/files/${specFileMeta.id}`);
      if (!fileResponse.ok) throw new Error(`Failed to retrieve ${specFileMeta.name}`);
      const blob = await fileResponse.blob();
      const file = new File([blob], specFileMeta.name, { type: blob.type });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/parse-spec`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Spec parse failed: ${errText}`);
      }

      const result = await response.json();
      updateProject(selectedProjectId, {
        specIndex: result.specIndex || [],
        message: '✅ Spec manual parsed successfully!',
        files: project.files.map((file) =>
          file.id === specFileMeta.id ? { ...file, accepted: true } : file
        ),
      });
      console.log("Parsed spec sections:", result.specIndex.length);
    } catch (err) {
      console.error('Spec parse error:', err.message);
      updateProject(selectedProjectId, { message: `Spec parse failed: ${err.message}` });
    } finally {
      setScanningState((prev) => ({ ...prev, spec: false }));
    }
  };

  const scanSummary = async () => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project.files.some((f) => f.isUploading)) {
      updateProject(selectedProjectId, { message: 'Please wait for all uploads to finish.' });
      return;
    }
    if (!project || !project.files.length) {
      updateProject(selectedProjectId, { message: 'Please upload at least one file to scan.' });
      return;
    }

    setScanningState((prev) => ({ ...prev, summary: true }));
    updateProject(selectedProjectId, { message: 'Scanning summary...' });

    try {
      const response = await fetch(`${API_BASE}/api/projects/${selectedProjectId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scan_type: 'summary'
        })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to generate summary.');
      }
      if (!result.summary || result.summary.trim() === '') {
        throw new Error("No summary returned by GPT.");
      }
      updateProject(selectedProjectId, {
        summary: result.summary,
        name: result.title?.trim() || project.name,
        message: 'Summary scanned successfully! ✅',
        files: project.files.map((file) => ({ ...file, accepted: true })),
      });
    } catch (err) {
      console.error('Summary scan error:', err.message);
      updateProject(selectedProjectId, { message: `Summary scan failed: ${err.message}` });
    } finally {
      setScanningState((prev) => ({ ...prev, summary: false }));
    }
  };

  const scanDivisions = async () => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project.files.some((f) => f.isUploading)) {
      updateProject(selectedProjectId, { message: 'Please wait for all uploads to finish.' });
      return;
    }
    if (!project || !project.files.length) {
      updateProject(selectedProjectId, { message: 'Please upload at least one file to scan.' });
      return;
    }

    setScanningState((prev) => ({ ...prev, divisions: true }));
    updateProject(selectedProjectId, { message: 'Scanning divisions...' });

    try {
      const response = await fetch(`${API_BASE}/api/projects/${selectedProjectId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scan_type: 'divisions'
        })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to generate divisions.');
      }
      updateProject(selectedProjectId, {
        divisionDescriptions: result.divisionDescriptions || {},
        message: 'Divisions scanned successfully! ✅',
        files: project.files.map((file) => ({ ...file, accepted: true })),
      });
    } catch (err) {
      console.error('Divisions scan error:', err.message);
      updateProject(selectedProjectId, { message: `Divisions scan failed: ${err.message}` });
    } finally {
      setScanningState((prev) => ({ ...prev, divisions: false }));
    }
  };

  const scanTakeoff = async () => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project.files.some((f) => f.isUploading)) {
      updateProject(selectedProjectId, { message: 'Please wait for all uploads to finish.' });
      return;
    }
    if (!project || !project.files.length) {
      updateProject(selectedProjectId, { message: 'Please upload at least one file to scan.' });
      return;
    }

    setScanningState((prev) => ({ ...prev, takeoff: true }));
    updateProject(selectedProjectId, { message: 'Scanning takeoff...' });

    try {
      const response = await fetch(`${API_BASE}/api/projects/${selectedProjectId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scan_type: 'takeoff'
        })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to extract takeoff.');
      }

      const newTakeoffItems = result.takeoff?.map((item, index) => ({
        id: Date.now() + index,
        division: getDivisionName(item.division),
        description: item.description || '',
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || '',
        unitCost: parseFloat(item.unitCost) || 0,
        modifier: parseFloat(item.modifier) || 0,
        sourceFiles: project.files.map((file) => file.name),
        createdAt: new Date().toISOString(),
        hash: item.hash || '',
        userEdited: false,
        source: 'GPT',
        comment: item.comment || '',
      })) || [];

      // Merge strategy
      const existingTakeoff = project.takeoff || [];
      const updatedTakeoff = [...existingTakeoff];

      for (const newItem of newTakeoffItems) {
        const match = existingTakeoff.find(
          (existing) =>
            existing.description.toLowerCase() === newItem.description.toLowerCase() &&
            existing.division === newItem.division
        );
        if (!match) {
          updatedTakeoff.push(newItem);
        } else if (!match.userEdited) {
          const index = updatedTakeoff.findIndex((item) => item.id === match.id);
          updatedTakeoff[index] = { ...newItem, id: match.id, createdAt: match.createdAt };
        }
      }

      updateProject(selectedProjectId, {
        takeoff: updatedTakeoff,
        message: `Takeoff scanned successfully! Added/updated ${newTakeoffItems.length} items. ✅`,
        files: project.files.map((file) => ({ ...file, accepted: true })),
      });
    } catch (err) {
      console.error('Takeoff scan error:', err.message);
      updateProject(selectedProjectId, { message: `Takeoff scan failed: ${err.message}` });
    } finally {
      setScanningState((prev) => ({ ...prev, takeoff: false }));
    }
  };

  const classifyItem = async (description) => {
    try {
      const response = await fetch(`${API_BASE}/api/classify-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Failed to classify item.');
      return result.division || '';
    } catch (err) {
      console.error(`Error classifying item: ${err.message}`);
      return '';
    }
  };

  const addTakeoffItem = async () => {
    if (!selectedProjectId) return;

    let division = newItem.division;
    if (!division && newItem.description) {
      division = await classifyItem(newItem.description);
    }

    const newItemData = {
      id: Date.now(),
      division: division ? getDivisionName(division) : 'Unknown',
      description: newItem.description || '',
      quantity: parseFloat(newItem.quantity) || 0,
      unit: newItem.unit || '',
      unitCost: parseFloat(newItem.unitCost) || 0,
      modifier: parseFloat(newItem.modifier) || 0,
      sourceFiles: [],
      createdAt: new Date().toISOString(),
      hash: '',
      userEdited: true,
      source: 'manual',
      comment: '',
    };

    updateProject(selectedProjectId, {
      takeoff: [...(selectedProject.takeoff || []), newItemData],
      message: 'Takeoff item added successfully! ✅',
    });

    setNewItem({
      description: '',
      division: '',
      quantity: 0,
      unit: '',
      unitCost: 0,
      modifier: 0,
    });
    setShowAddItemModal(false);
  };

  const updateTakeoff = (itemId, field, value) => {
    if (!selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return;

    const item = project.takeoff.find((item) => item.id === itemId);
    if (!item) return;

    let parsedValue = value;
    if (field === 'quantity' || field === 'unitCost' || field === 'modifier') {
      parsedValue = parseFloat(value) || 0;
      if ((field === 'quantity' || field === 'unitCost') && parsedValue < 0) return;
      if (field === 'modifier' && (parsedValue > 100 || parsedValue < -100)) return;
    }

    const isEditableField = ['description', 'quantity', 'unit', 'unitCost', 'modifier'].includes(field);
    updateProject(selectedProjectId, {
      takeoff: project.takeoff.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: parsedValue,
              userEdited: isEditableField ? true : item.userEdited,
            }
          : item
      ),
    });
  };

  const handleSendMessage = async () => {
    if (!selectedProjectId || !userMessage.trim()) return;

    const userMsg = {
      sender: 'User',
      text: userMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    updateProject(selectedProjectId, {
      discussion: [...(selectedProject.discussion || []), userMsg],
    });
    setUserMessage('');

    try {
      const projectData = {
        summary: selectedProject.summary || '',
        notes: selectedProject.notes || [],
        divisionDescriptions: selectedProject.divisionDescriptions || {},
        takeoff: selectedProject.takeoff || [],
        preferences: selectedProject.preferences || {},
        specIndex: selectedProject.specIndex || [],
      };
      console.log('Sending project data to /api/chat:', projectData);

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussion: [...(selectedProject.discussion || []), userMsg],
          project_data: projectData,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Chat failed.');

      // Update discussion with GPT response
      const gptMsg = {
        sender: 'GPT',
        text: data.reply || 'No response.',
        timestamp: new Date().toLocaleTimeString(),
      };
      updateProject(selectedProjectId, {
        discussion: [...(selectedProject.discussion || []), userMsg, gptMsg],
      });

      // Apply actions if present
      if (data.actions && Array.isArray(data.actions)) {
        for (const action of data.actions) {
          if (action.type === 'updateTakeoff') {
            const { description, field, value } = action;
            const match = selectedProject.takeoff.find((item) =>
              item.description.toLowerCase().includes(description.toLowerCase())
            );
            if (match) {
              updateTakeoff(match.id, field, value);
            }
          } else if (action.type === 'addTakeoff') {
            const newItem = {
              id: Date.now(),
              description: action.description || '',
              division: action.division ? getDivisionName(action.division) : 'Unknown',
              quantity: parseFloat(action.quantity) || 0,
              unit: action.unit || '',
              unitCost: parseFloat(action.unitCost) || 0,
              modifier: parseFloat(action.modifier) || 0,
              source: 'GPT',
              userEdited: false,
              comment: action.comment || '',
              sourceFiles: [],
              createdAt: new Date().toISOString(),
              hash: '',
            };
            updateProject(selectedProjectId, {
              takeoff: [...(selectedProject.takeoff || []), newItem],
            });
          }
        }
        updateProject(selectedProjectId, {
          message: `Applied ${data.actions.length} GPT action(s) to takeoff. ✅`,
        });
      }
    } catch (err) {
      updateProject(selectedProjectId, {
        discussion: [
          ...(selectedProject.discussion || []),
          userMsg,
          { sender: 'GPT', text: `Error: ${err.message}`, timestamp: new Date().toLocaleTimeString() },
        ],
      });
    }
  };

  const handleAddNote = () => {
    if (!selectedProjectId) return;
    updateProject(selectedProjectId, {
      notes: [...(selectedProject.notes || []), { 
        id: Date.now(), 
        text: '',
        timestamp: new Date().toISOString()
      }],
    });
  };

  const handleUpdateNote = (id, text) => {
    if (!selectedProjectId) return;
    updateProject(selectedProjectId, {
      notes: (selectedProject.notes || []).map((n) =>
        n.id === id ? { ...n, text } : n
      ),
    });
  };

  const handleDeleteNote = (id) => {
    if (!selectedProjectId) return;
    updateProject(selectedProjectId, {
      notes: (selectedProject.notes || []).filter((n) => n.id !== id),
    });
  };

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <header style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '1.5rem', 
          color: 'white', 
          fontWeight: 'bold', 
          fontSize: '1.75rem', 
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '2rem' }}>🏗️</span>
          Estimator GPT
          <span style={{ 
            fontSize: '0.875rem', 
            background: 'rgba(255,255,255,0.2)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '20px',
            fontWeight: '500'
          }}>
            Pro
          </span>
        </header>
        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <aside style={{ 
            width: '280px', 
            minWidth: '280px', 
            background: '#f8fafc', 
            padding: '1.5rem', 
            overflowY: 'auto', 
            flexShrink: 0,
            borderRight: '1px solid #e2e8f0'
          }}>
            <button
              onClick={addProject}
              style={{
                width: '100%',
                padding: '1rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.3)';
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>➕</span> New Project
            </button>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                color: '#718096', 
                fontWeight: '600',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem'
              }}>
                Your Projects
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {projects.map((project) => (
                <li
                  key={project.id}
                  style={{
                    padding: '0.875rem 1rem',
                    background: selectedProjectId === project.id ? 'white' : 'transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                    fontSize: '0.9375rem',
                    fontWeight: selectedProjectId === project.id ? '600' : '400',
                    color: selectedProjectId === project.id ? '#667eea' : '#2d3748',
                    boxShadow: selectedProjectId === project.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    border: selectedProjectId === project.id ? '1px solid #e2e8f0' : '1px solid transparent',
                    animation: 'slideIn 0.3s ease'
                  }}
                  onClick={() => setSelectedProjectId(project.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, projectId: project.id });
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProjectId !== project.id) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProjectId !== project.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {editingProjectId === project.id ? (
                    <input
                      type="text"
                      value={editingProjectName}
                      onChange={(e) => setEditingProjectName(e.target.value)}
                      onBlur={() => saveProjectName(project.id, editingProjectName)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveProjectName(project.id, editingProjectName);
                        else if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                      style={{ 
                        width: '100%', 
                        padding: '0.25rem', 
                        border: '2px solid #667eea', 
                        borderRadius: '6px', 
                        fontSize: '0.9375rem',
                        outline: 'none',
                        background: 'white'
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.125rem' }}>📁</span>
                      {project.name}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </aside>
          {contextMenu && (
            <div
              style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
                background: 'white',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                zIndex: 1000,
                fontSize: '0.9375rem',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease'
              }}
              onMouseLeave={() => setContextMenu(null)}
            >
              <button
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%', 
                  padding: '0.75rem 1.25rem', 
                  background: 'none', 
                  border: 'none', 
                  textAlign: 'left', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                onClick={() => {
                  const proj = projects.find((p) => p.id === contextMenu.projectId);
                  startEditingProjectName(proj.id, proj.name);
                  setContextMenu(null);
                }}
              >
                ✏️ Rename
              </button>
              <button
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%', 
                  padding: '0.75rem 1.25rem', 
                  background: 'none', 
                  border: 'none', 
                  textAlign: 'left', 
                  color: '#e53e3e', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff5f5';
                  e.currentTarget.style.color = '#c53030';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#e53e3e';
                }}
                onClick={() => {
                  const proj = projects.find((p) => p.id === contextMenu.projectId);
                  const confirmed = window.confirm(`Delete "${proj.name}" and all its data?`);
                  if (confirmed) deleteProject(contextMenu.projectId);
                  setContextMenu(null);
                }}
              >
                🗑️ Delete
              </button>
            </div>
          )}
          <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto', background: '#ffffff' }}>
            {selectedProject && (
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['files', 'summary', 'takeoff', 'tables', 'discussion', 'notes', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: activeTab === tab 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : 'white',
                      color: activeTab === tab ? 'white' : '#4a5568',
                      borderRadius: '10px',
                      border: activeTab === tab ? 'none' : '2px solid #e2e8f0',
                      cursor: 'pointer',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      boxShadow: activeTab === tab 
                        ? '0 4px 14px rgba(102, 126, 234, 0.3)' 
                        : '0 2px 4px rgba(0,0,0,0.04)',
                      transform: 'translateY(0)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                        e.target.style.borderColor = '#667eea';
                        e.target.style.color = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.color = '#4a5568';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>
                      {tab === 'files' && '📁'}
                      {tab === 'summary' && '📝'}
                      {tab === 'takeoff' && '📊'}
                      {tab === 'tables' && '📋'}
                      {tab === 'discussion' && '💬'}
                      {tab === 'notes' && '📌'}
                      {tab === 'analytics' && '📈'}
                    </span>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            )}
            {/* Clean component-based tab rendering */}
            {selectedProject && activeTab === 'files' && (
              <FilesTab
                selectedProject={selectedProject}
                handleAddFiles={handleAddFiles}
                scanSpec={scanSpec}
                scanningState={scanningState}
                handleDeleteFile={handleDeleteFile}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
              />
            )}
            {selectedProject && activeTab === 'summary' && (
              <SummaryTab
                selectedProject={selectedProject}
                scanSummary={scanSummary}
                scanningState={scanningState}
                updateProject={(updates) => updateProject(selectedProjectId, updates)}
              />
            )}
            {selectedProject && activeTab === 'takeoff' && (
              <TakeoffTab
                selectedProject={selectedProject}
                scanDivisions={scanDivisions}
                scanTakeoff={scanTakeoff}
                scanningState={scanningState}
                showAddItemModal={showAddItemModal}
                setShowAddItemModal={setShowAddItemModal}
                newItem={newItem}
                setNewItem={setNewItem}
                addTakeoffItem={addTakeoffItem}
                updateTakeoff={updateTakeoff}
                updateProject={(updates) => updateProject(selectedProjectId, updates)}
                DIVISIONS={DIVISIONS}
                getDivisionName={getDivisionName}
              />
            )}
            {selectedProject && activeTab === 'tables' && (
              <TablesTab
                selectedProject={selectedProject}
                updateProject={(updates) => updateProject(selectedProjectId, updates)}
              />
            )}
            {selectedProject && activeTab === 'discussion' && (
              <DiscussionTab
                selectedProject={selectedProject}
                userMessage={userMessage}
                setUserMessage={setUserMessage}
                handleSendMessage={handleSendMessage}
              />
            )}
            {selectedProject && activeTab === 'notes' && (
              <NotesTab
                selectedProject={selectedProject}
                handleAddNote={handleAddNote}
                handleUpdateNote={handleUpdateNote}
                handleDeleteNote={handleDeleteNote}
              />
            )}
            {!selectedProject && (
              <div style={{ 
                padding: '4rem', 
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease'
              }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  opacity: 0.8
                }}>
                  🏗️
                </div>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: '#2d3748',
                  marginBottom: '0.5rem'
                }}>
                  Welcome to Estimator GPT
                </h2>
                <p style={{ 
                  fontSize: '1.125rem', 
                  color: '#718096',
                  marginBottom: '2rem'
                }}>
                  Select a project from the sidebar or create a new one to get started
                </p>
                <button
                  onClick={addProject}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </main>
        </div>
        {scanningState.summary && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              background: 'white',
              padding: '2rem 3rem',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#2d3748',
                margin: 0
              }}>
                Scanning Document
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Analyzing your uploaded files...
              </p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;