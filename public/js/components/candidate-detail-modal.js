// Fixed CandidateDetailPanel - Replace your entire js/components/candidate-detail-modal.js with this

const CandidateDetailPanel = ({ 
    candidate, 
    currentUser, 
    projects, 
    onClose, 
    onUpdate,
    onAddTimeline 
}) => {
    const [isEditing, setIsEditing] = React.useState(false);
    
    const [editData, setEditData] = React.useState({
        name: candidate.name || '',
        email: candidate.email || '',
        job_title: candidate.job_title || '',
        company: candidate.company || '',
        notes: candidate.notes || '',
        phone: candidate.phone || '',
        location: candidate.location || '',
        linkedin_url: candidate.linkedin_url || '',
        source: candidate.source || '',
        gender: candidate.gender || '',
        project_id: candidate.project_id || null
    });
    
    const [newComment, setNewComment] = React.useState('');
    const [newTag, setNewTag] = React.useState('');
    const [isUpdating, setIsUpdating] = React.useState(false);
    
    // AI Features State
    const [aiProcessing, setAiProcessing] = React.useState(false);
    const [aiInsights, setAiInsights] = React.useState(null);
    const [showAiPanel, setShowAiPanel] = React.useState(false);
    const [smartNotes, setSmartNotes] = React.useState(null);

    // ADD THESE TWO LINES:
const [draggedOver, setDraggedOver] = React.useState(false);
const [uploadedFiles, setUploadedFiles] = React.useState(candidate.documents || []);
// ADD THESE LINES:
const [showFileViewer, setShowFileViewer] = React.useState(false);
const [currentViewingFile, setCurrentViewingFile] = React.useState(null);

     // 🆕 PDF Download Function
     const downloadPDF = (pdfInfo) => {
        try {
            // Convert data URI to blob
            const base64Data = pdfInfo.data.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = pdfInfo.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('📄 PDF downloaded:', pdfInfo.filename);
            
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error downloading PDF. Please try again.');
        }
    };

    // Update editData when candidate prop changes
    React.useEffect(() => {
        console.log('=== CANDIDATE PROP CHANGED - UPDATING EDIT DATA ===');
        console.log('New candidate:', candidate.name, 'ID:', candidate.id);
        console.log('Timeline entries:', (candidate.timeline || []).length);
        
        setEditData({
            name: candidate.name || '',
            email: candidate.email || '',
            job_title: candidate.job_title || '',
            company: candidate.company || '',
            notes: candidate.notes || '',
            phone: candidate.phone || '',
            location: candidate.location || '',
            linkedin_url: candidate.linkedin_url || '',
            source: candidate.source || '',
            gender: candidate.gender || '',
            project_id: candidate.project_id || null
        });
        
        // Clear AI state when candidate changes
        setAiInsights(null);
        setSmartNotes(null);
        setAiProcessing(false);
        setShowAiPanel(false);
        
        // Generate fresh AI insights for new candidate
        if (window.AIAssistant) {
            setTimeout(() => {
                generateAIInsightsForCandidate(candidate);
            }, 100);
        }
        
    }, [candidate.id, candidate.timeline?.length, candidate.interview_feedback?.length]);

    // Debug effect to track timeline changes
    React.useEffect(() => {
        const timelineCount = (candidate.timeline || []).length;
        const feedbackCount = (candidate.interview_feedback || []).length;
        console.log(`📈 Timeline updated for ${candidate.name}: ${timelineCount} entries, ${feedbackCount} feedback`);
    }, [candidate.timeline, candidate.interview_feedback, candidate.name]);

    // Generate AI insights for the candidate
    const generateAIInsightsForCandidate = async (targetCandidate) => {
        if (!window.AIAssistant || !targetCandidate) return;
        
        console.log('🤖 Generating AI insights for:', targetCandidate.name);
        setAiProcessing(true);
        
        try {
            const textData = [
                targetCandidate.notes || '',
                (targetCandidate.interview_feedback || []).map(f => f.feedback?.notes || '').join(' '),
                (targetCandidate.timeline || []).map(t => t.description || '').join(' ')
            ].join(' ');

            if (textData.trim().length > 20) {
                const insights = window.AIAssistant.processNotes(textData, {
                    candidateId: targetCandidate.id,
                    candidateName: targetCandidate.name,
                    jobTitle: targetCandidate.job_title,
                    company: targetCandidate.company
                });
                
                setAiInsights(insights);
                console.log('✅ AI insights generated for', targetCandidate.name);
            } else {
                setAiInsights(null);
            }
        } catch (error) {
            console.error('AI processing error:', error);
            setAiInsights(null);
        } finally {
            setAiProcessing(false);
        }
    };

    // File upload helper functions
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const processFiles = async (files) => {
        const fileArray = Array.from(files);
        const processedFiles = [];

        for (const file of fileArray) {
            try {
                const base64Data = await fileToBase64(file);
                const newDocument = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadDate: new Date().toISOString(),
                    originalFile: base64Data,
                    uploadedBy: currentUser.name
                };
                processedFiles.push(newDocument);
            } catch (error) {
                console.error('Error processing file:', file.name, error);
            }
        }

        const updatedFiles = [...uploadedFiles, ...processedFiles];
        setUploadedFiles(updatedFiles);
        
        // Update the candidate with new documents
        const candidateUpdates = {
            documents: updatedFiles
        };
        
        try {
            const result = await api.updateCandidate(candidate.id, candidateUpdates);
            if (result.error) {
                console.error('Error updating candidate documents:', result.error);
            } else {
                console.log('✅ Documents uploaded successfully');
                
                // SAVE TO LOCALSTORAGE with user attribution
const existingCandidates = JSON.parse(localStorage.getItem('recruitpro_candidates') || '[]');
const updatedCandidates = existingCandidates.map(c => 
    c.id === candidate.id 
        ? window.updateUserAttribution({ ...c, documents: updatedFiles })
        : c
);
localStorage.setItem('recruitpro_candidates', JSON.stringify(updatedCandidates));
                console.log('✅ Documents saved to localStorage');
            }
        } catch (error) {
            console.error('Error saving documents:', error);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggedOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDraggedOver(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggedOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFiles(files);
        }
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            processFiles(files);
        }
    };

     // ADD THESE FUNCTIONS RIGHT HERE:
    // File viewer functions
    const openFileViewer = (file) => {
        setCurrentViewingFile(file);
        setShowFileViewer(true);
    };

    const closeFileViewer = () => {
        setShowFileViewer(false);
        setCurrentViewingFile(null);
    };

    const downloadCurrentFile = () => {
        if (currentViewingFile) {
            const element = document.createElement('a');
            element.href = currentViewingFile.originalFile;
            element.download = currentViewingFile.name;
            element.click();
        }
    };

     // ADD THE ESC KEY HANDLER RIGHT HERE:
    // ESC key handler for file viewer
    React.useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showFileViewer) {
                closeFileViewer();
            }
        };

        if (showFileViewer) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [showFileViewer]);


    // Smart notes processing
    const handleNotesChange = async (newNotes) => {
        setEditData({...editData, notes: newNotes});
        
        if (newNotes.length > 50 && window.AIAssistant) {
            setAiProcessing(true);
            
            try {
                const processed = window.AIAssistant.processNotes(newNotes, {
                    candidateId: candidate.id,
                    candidateName: candidate.name,
                    jobTitle: candidate.job_title,
                    company: candidate.company
                });
                
                setSmartNotes(processed);
            } catch (error) {
                console.error('Smart notes processing error:', error);
            } finally {
                setAiProcessing(false);
            }
        } else {
            setSmartNotes(null);
        }
    };

    const applyAISuggestions = () => {
        if (!smartNotes) return;
        
        setEditData({
            ...editData, 
            notes: smartNotes.formatted
        });
        
        if (smartNotes.tags && smartNotes.tags.length > 0) {
            const currentTags = candidate.tags || [];
            const newTags = [...new Set([...currentTags, ...smartNotes.tags.slice(0, 3)])];
            onUpdate({ tags: newTags });
        }
    };

    const handleSave = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        
        try {
            const updates = {};
            Object.keys(editData).forEach(key => {
                if (candidate[key] !== editData[key]) {
                    updates[key] = editData[key];
                }
            });

            if (Object.keys(updates).length > 0) {
                console.log('Saving updates:', updates);
                await onUpdate(updates);
                onAddTimeline('Information Updated', `Updated: ${Object.keys(updates).join(', ')}`, 'update');
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving candidate updates:', error);
            alert('Error saving changes. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            console.log('✅ Adding comment to timeline:', newComment.trim());
            onAddTimeline('Comment Added', newComment.trim(), 'comment');
            setNewComment('');
        }
    };

    const addTagToCandidate = async (tag) => {
        if (!tag || (candidate.tags || []).includes(tag)) {
            setNewTag('');
            return;
        }
    
        const newTags = [...(candidate.tags || []), tag];
        setNewTag('');
        setIsUpdating(true);
        
        try {
            await onUpdate({ tags: newTags });
            onAddTimeline('Tags Updated', `Added tag: ${tag}`, 'update');
            console.log('✅ Tag added successfully');
        } catch (error) {
            console.error('Error adding tag:', error);
            alert('Error adding tag. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const removeTagFromCandidate = async (tagToRemove) => {
        const newTags = (candidate.tags || []).filter(tag => tag !== tagToRemove);
        setIsUpdating(true);
        
        try {
            await onUpdate({ tags: newTags });
            onAddTimeline('Tags Updated', `Removed tag: ${tagToRemove}`, 'update');
            console.log('✅ Tag removed successfully');
        } catch (error) {
            console.error('Error removing tag:', error);
            alert('Error removing tag. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const project = projects.find(p => p.id === candidate.project_id);

    return (
        <div>
            {isUpdating && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', marginBottom: '10px' }}>🔄</div>
                            <div>Updating candidate...</div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="split-panel-header">
                <h3 style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '20px',
                    fontWeight: '700'
                }}>
                    {candidate.name}
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {window.AIAssistant && (
                        <button 
                            className="btn-secondary"
                            onClick={() => setShowAiPanel(!showAiPanel)}
                            disabled={isUpdating}
                            style={{
                                padding: '8px 16px',
                                fontSize: '12px',
                                borderRadius: '8px',
                                background: showAiPanel ? 'var(--accent-color)' : 'var(--secondary-bg)',
                                color: showAiPanel ? 'white' : 'var(--text-primary)',
                                opacity: isUpdating ? 0.5 : 1
                            }}
                        >
                            🤖 AI Insights
                        </button>
                    )}
                    
                    <button 
                        className="btn-secondary"
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isUpdating}
                        style={{
                            padding: '8px 16px',
                            fontSize: '12px',
                            borderRadius: '8px',
                            opacity: isUpdating ? 0.5 : 1
                        }}
                    >
                        {isEditing ? '❌ Cancel' : '✏️ Edit'}
                    </button>
                    <button 
                        className="split-panel-close"
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* AI Insights Panel */}
            {showAiPanel && (
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '25px',
                    borderRadius: '16px',
                    marginBottom: '25px',
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '25px',
                        paddingBottom: '15px',
                        borderBottom: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <h4 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            margin: 0
                        }}>
                            🤖 AI INSIGHTS FOR {candidate.name.toUpperCase()}
                            {aiProcessing && (
                                <span style={{
                                    fontSize: '12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    animation: 'pulse 2s infinite'
                                }}>
                                    Analyzing...
                                </span>
                            )}
                        </h4>
                        <button
                            onClick={() => setShowAiPanel(false)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    
                    {aiInsights && aiInsights.candidateId === candidate.id ? (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            
                            {/* Performance Overview Section */}
                            {(aiInsights.keywords?.length > 0 || aiInsights.summary) && (
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '18px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        marginBottom: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        📊 PERFORMANCE OVERVIEW
                                    </div>
                                    
                                    {/* Quick Stats */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: '12px',
                                        marginBottom: '15px'
                                    }}>
                                        <div style={{
                                            background: 'rgba(72, 187, 120, 0.3)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                                {aiInsights.keywords?.length || 0}
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                                Skills Detected
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'rgba(255, 193, 7, 0.3)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                                {aiInsights.actionItems?.length || 0}
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                                Actions Needed
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'rgba(129, 140, 248, 0.3)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '18px', fontWeight: '700' }}>
                                                AI
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                                Powered
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary as Bullet Points */}
                                    {aiInsights.summary && (
                                        <div>
                                            <div style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                marginBottom: '10px',
                                                opacity: 0.9
                                            }}>
                                                📄 Key Findings:
                                            </div>
                                            <div style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                lineHeight: '1.6'
                                            }}>
                                                {/* Convert summary to bullet points */}
                                                {aiInsights.summary.split('.').filter(s => s.trim()).map((point, index) => (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '8px',
                                                        marginBottom: index < aiInsights.summary.split('.').filter(s => s.trim()).length - 1 ? '8px' : '0'
                                                    }}>
                                                        <span style={{
                                                            color: '#4ade80',
                                                            fontSize: '16px',
                                                            lineHeight: '1',
                                                            marginTop: '2px'
                                                        }}>
                                                            •
                                                        </span>
                                                        <span>{point.trim()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Skills Section - Improved Layout */}
                            {aiInsights.keywords && aiInsights.keywords.length > 0 && (
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '18px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        marginBottom: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        🎯 KEY SKILLS DETECTED
                                    </div>
                                    
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '12px'
                                    }}>
                                        {aiInsights.keywords.slice(0, 6).map((kw, index) => {
                                            const confidence = Math.round(kw.confidence * 100);
                                            const skillIcon = {
                                                'technical': '💻',
                                                'soft_skills': '🗣️',
                                                'experience': '🏆',
                                                'concerns': '⚠️',
                                                'strengths': '⭐'
                                            }[kw.category] || '🔹';
                                            
                                            return (
                                                <div key={index} style={{
                                                    background: 'rgba(255,255,255,0.15)',
                                                    padding: '12px',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(255,255,255,0.2)'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{ fontSize: '16px' }}>{skillIcon}</span>
                                                        <span style={{
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {kw.keyword}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Confidence Bar */}
                                                    <div style={{
                                                        background: 'rgba(255,255,255,0.2)',
                                                        borderRadius: '10px',
                                                        height: '6px',
                                                        overflow: 'hidden',
                                                        marginBottom: '6px'
                                                    }}>
                                                        <div style={{
                                                            background: confidence >= 80 ? '#10b981' :
                                                                       confidence >= 60 ? '#f59e0b' :
                                                                       confidence >= 40 ? '#ef4444' : '#6b7280',
                                                            height: '100%',
                                                            width: `${confidence}%`,
                                                            borderRadius: '10px',
                                                            transition: 'width 0.8s ease'
                                                        }} />
                                                    </div>
                                                    
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            opacity: 0.8,
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {kw.category.replace('_', ' ')}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '700'
                                                        }}>
                                                            {confidence}%
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            {/* Action Items - Improved Structure */}
                            {aiInsights.actionItems && aiInsights.actionItems.length > 0 && (
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '18px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        marginBottom: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        📋 RECOMMENDED ACTIONS
                                    </div>
                                    
                                    {/* Group actions by priority */}
                                    {['high', 'medium', 'low'].map(priority => {
                                        const priorityActions = aiInsights.actionItems.filter(action => action.priority === priority);
                                        if (priorityActions.length === 0) return null;
                                        
                                        const priorityConfig = {
                                            'high': { color: '#ef4444', icon: '🔴', label: 'HIGH PRIORITY' },
                                            'medium': { color: '#f59e0b', icon: '🟡', label: 'MEDIUM PRIORITY' },
                                            'low': { color: '#10b981', icon: '🟢', label: 'LOW PRIORITY' }
                                        }[priority];
                                        
                                        return (
                                            <div key={priority} style={{ marginBottom: '15px' }}>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    color: priorityConfig.color,
                                                    marginBottom: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    {priorityConfig.icon} {priorityConfig.label}
                                                </div>
                                                
                                                <div style={{ display: 'grid', gap: '8px' }}>
                                                    {priorityActions.map((action, index) => {
                                                        const actionIcon = action.category === 'reference_check' ? '📞' :
                                                                         action.category === 'scheduling' ? '📅' :
                                                                         action.category === 'communication' ? '📧' :
                                                                         action.category === 'negotiation' ? '💰' :
                                                                         action.category === 'review' ? '📝' : '📋';
                                                        
                                                        return (
                                                            <div key={index} style={{
                                                                background: 'rgba(255,255,255,0.1)',
                                                                padding: '12px',
                                                                borderRadius: '8px',
                                                                border: '1px solid rgba(255,255,255,0.2)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: '18px',
                                                                    width: '24px',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    {actionIcon}
                                                                </span>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{
                                                                        fontSize: '13px',
                                                                        fontWeight: '500',
                                                                        lineHeight: '1.4'
                                                                    }}>
                                                                        {action.text}
                                                                    </div>
                                                                    {action.suggested && (
                                                                        <div style={{
                                                                            fontSize: '10px',
                                                                            opacity: 0.8,
                                                                            marginTop: '4px'
                                                                        }}>
                                                                            💡 AI Suggested
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div style={{
                                                                    background: priorityConfig.color,
                                                                    color: 'white',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '9px',
                                                                    fontWeight: '700',
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    {priority}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {/* Additional Insights Footer */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    fontSize: '11px',
                                    opacity: 0.8
                                }}>
                                    🤖 Analysis generated for {aiInsights.candidateName}
                                </div>
                                <button
                                    onClick={() => generateAIInsightsForCandidate(candidate)}
                                    disabled={aiProcessing}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        fontSize: '10px',
                                        cursor: aiProcessing ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        opacity: aiProcessing ? 0.5 : 1
                                    }}
                                >
                                    🔄 Refresh Analysis
                                </button>
                            </div>
                            
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '15px',
                                opacity: 0.7
                            }}>
                                🤖
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '8px'
                            }}>
                                {aiProcessing ? 'Analyzing candidate data...' : 'AI Analysis Ready'}
                            </div>
                            <div style={{
                                fontSize: '13px',
                                opacity: 0.8,
                                lineHeight: '1.4'
                            }}>
                                {aiProcessing ? 
                                    'Please wait while we process the information' :
                                    'Add notes or interview feedback to generate comprehensive AI insights'
                                }
                            </div>
                            {!aiProcessing && (
                                <button
                                    onClick={() => generateAIInsightsForCandidate(candidate)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        marginTop: '15px'
                                    }}
                                >
                                    🚀 Generate AI Insights
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Basic Information */}
            <div style={{
                background: 'rgba(102, 126, 234, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
                <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '15px',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    📋 Basic Information
                </h4>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '12px'
                }}>
                    {/* Name */}
                    <div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '5px'
                        }}>
                            Full Name
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-input"
                                value={editData.name}
                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                style={{ fontSize: '14px', padding: '8px' }}
                                disabled={isUpdating}
                            />
                        ) : (
                            <div style={{
                                fontSize: '16px',
                                color: 'var(--text-primary)',
                                fontWeight: '600'
                            }}>
                                {candidate.name}
                            </div>
                        )}
                    </div>
                    
                    {/* Job Title */}
                    <div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '5px'
                        }}>
                            Job Title
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-input"
                                value={editData.job_title}
                                onChange={(e) => setEditData({...editData, job_title: e.target.value})}
                                style={{ fontSize: '14px', padding: '8px' }}
                                disabled={isUpdating}
                            />
                        ) : (
                            <div style={{
                                fontSize: '16px',
                                color: 'var(--text-primary)',
                                fontWeight: '600'
                            }}>
                                {candidate.job_title}
                            </div>
                        )}
                    </div>
                    
                    {/* Company */}
                    <div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '5px'
                        }}>
                            Company
                        </div>
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-input"
                                value={editData.company}
                                onChange={(e) => setEditData({...editData, company: e.target.value})}
                                style={{ fontSize: '14px', padding: '8px' }}
                                disabled={isUpdating}
                            />
                        ) : (
                            <div style={{
                                fontSize: '16px',
                                color: 'var(--text-primary)',
                                fontWeight: '600'
                            }}>
                                {candidate.company}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '5px'
                        }}>
                            Status & Readiness
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span className={`status-badge status-${candidate.status}`} style={{
                                fontSize: '10px',
                                padding: '4px 8px'
                            }}>
                                {helpers.statusConfig.getStatusLabel(candidate.status)}
                            </span>
                            <span style={{
                                background: helpers.statusConfig.getReadinessConfig(candidate.readiness).color,
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                fontSize: '10px',
                                fontWeight: '600'
                            }}>
                                {helpers.statusConfig.getReadinessConfig(candidate.readiness).emoji} {' '}
                                {helpers.statusConfig.getReadinessConfig(candidate.readiness).label}
                            </span>
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '5px'
                        }}>
                            Gender
                        </div>
                        {isEditing ? (
                            <select
                                className="form-input"
                                value={editData.gender}
                                onChange={(e) => setEditData({...editData, gender: e.target.value})}
                                style={{ padding: '6px', fontSize: '12px' }}
                                disabled={isUpdating}
                            >
                                {helpers.predefinedOptions.genders.map(gender => (
                                    <option key={gender.value} value={gender.value}>
                                        {gender.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                fontWeight: '500'
                            }}>
                                {candidate.gender ? 
                                    candidate.gender.charAt(0).toUpperCase() + candidate.gender.slice(1).replace('_', ' ') :
                                    'Not specified'
                                }
                            </div>
                        )}
                    </div>

                    <div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '5px'
                        }}>
                            Source
                        </div>
                        {isEditing ? (
                            <select
                                className="form-input"
                                value={editData.source}
                                onChange={(e) => setEditData({...editData, source: e.target.value})}
                                style={{ padding: '6px', fontSize: '12px' }}
                                disabled={isUpdating}
                            >
                                <option value="">Select Source</option>
                                {helpers.predefinedOptions.sources.map(source => (
                                    <option key={source} value={source}>{source}</option>
                                ))}
                            </select>
                        ) : (
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                fontWeight: '500'
                            }}>
                                {candidate.source || 'Not specified'}
                            </div>
                        )}
                    </div>

                    {/* Project Assignment */}
                    <div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '5px'
                        }}>
                            Project
                        </div>
                        {isEditing ? (
                            <select
                                className="form-input"
                                value={editData.project_id || ''}
                                onChange={(e) => setEditData({...editData, project_id: e.target.value ? parseInt(e.target.value) : null})}
                                style={{ padding: '6px', fontSize: '12px' }}
                                disabled={isUpdating}
                            >
                                <option value="">No Project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                fontWeight: '500'
                            }}>
                                {project ? `📁 ${project.name}` : 'No project assigned'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div style={{
                background: 'rgba(72, 187, 120, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid rgba(72, 187, 120, 0.1)'
            }}>
                <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '15px',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    📞 Contact Information
                </h4>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '15px'
                }}>
                    {/* Email */}
                    <div>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            display: 'block',
                            marginBottom: '5px'
                        }}>
                            📧 Email
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                className="form-input"
                                value={editData.email}
                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                                style={{ fontSize: '12px', padding: '8px' }}
                                disabled={isUpdating}
                            />
                        ) : (
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                fontWeight: '500'
                            }}>
                                {candidate.email ? (
                                    <a 
                                        href={`mailto:${candidate.email}`}
                                        style={{
                                            color: 'var(--accent-color)',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {candidate.email}
                                    </a>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            display: 'block',
                            marginBottom: '5px'
                        }}>
                            📱 Phone
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                className="form-input"
                                value={editData.phone}
                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                style={{ fontSize: '12px', padding: '8px' }}
                                disabled={isUpdating}
                            />
                        ) : (
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                fontWeight: '500'
                            }}>
                                {candidate.phone ? (
                                    <a 
                                        href={`tel:${candidate.phone}`}
                                        style={{
                                            color: 'var(--accent-color)',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {candidate.phone}
                                    </a>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            display: 'block',
                            marginBottom: '5px'
                        }}>
                            📍 Location
                        </label>
                        {isEditing ? (
                            <select
                                className="form-input"
                                value={editData.location}
                                onChange={(e) => setEditData({...editData, location: e.target.value})}
                                style={{ 
                                    fontSize: '12px', 
                                    padding: '8px'
                                }}
                                disabled={isUpdating}
                            >
                                {helpers.predefinedOptions.countries.map(country => (
                                    <option 
                                        key={country.value} 
                                        value={country.value}
                                        disabled={country.disabled}
                                    >
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                fontWeight: '500'
                            }}>
                                {candidate.location ? (
                                    (() => {
                                        const country = helpers.predefinedOptions.countries.find(c => c.value === candidate.location);
                                        return country ? country.label : candidate.location;
                                    })()
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* LinkedIn */}
                    <div>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            display: 'block',
                            marginBottom: '5px'
                        }}>
                            💼 LinkedIn
                        </label>
                        {isEditing ? (
                            <input
                                type="url"
                                className="form-input"
                                value={editData.linkedin_url}
                                onChange={(e) => setEditData({...editData, linkedin_url: e.target.value})}
                                style={{ fontSize: '12px', padding: '8px' }}
                                disabled={isUpdating}
                            />
                        ) : (
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                fontWeight: '500'
                            }}>
                                {candidate.linkedin_url ? (
                                    <a 
                                        href={candidate.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: 'var(--accent-color)',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        View Profile →
                                    </a>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 📄 ATTACHED DOCUMENTS SECTION */}
{candidate.attached_pdfs && candidate.attached_pdfs.length > 0 && (
    <div style={{
        background: 'var(--card-bg)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '20px'
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
        }}>
            <span style={{ fontSize: '16px' }}>📄</span>
            <h5 style={{ 
                margin: 0, 
                color: 'var(--text-primary)', 
                fontSize: '14px',
                fontWeight: '600'
            }}>
                Attached Documents ({candidate.attached_pdfs.length})
            </h5>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {candidate.attached_pdfs.map((pdf, index) => (
                <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--input-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            marginBottom: '2px'
                        }}>
                            {pdf.filename}
                        </div>
                        <div style={{ 
                            fontSize: '10px', 
                            color: 'var(--text-tertiary)'
                        }}>
                            {new Date(pdf.timestamp).toLocaleString()} • by {pdf.interviewer} • {pdf.type}
                        </div>
                    </div>
                    
                    <button
                        onClick={() => downloadPDF(pdf)}
                        style={{
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Download
                    </button>
                </div>
            ))}
        </div>
    </div>
)}

{/* Documents Upload Section */}
<div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <h4 style={{
                        color: 'var(--text-primary)',
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        📁 Documents & Files
                    </h4>
                    <label style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '600'
                    }}>
                        📤 Upload Files
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                {/* Drag and Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        border: draggedOver ? '2px dashed #3b82f6' : '2px dashed #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        background: draggedOver ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 250, 251, 0.8)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        marginBottom: uploadedFiles.length > 0 ? '20px' : '0'
                    }}
                >
                    <div style={{ 
                        fontSize: '32px', 
                        color: draggedOver ? '#3b82f6' : '#9ca3af',
                        marginBottom: '12px'
                    }}>
                        📎
                    </div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                    }}>
                        {draggedOver ? 'Drop files here!' : 'Drag & drop files here'}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)'
                    }}>
                        or click "Upload Files" above • PDF, DOC, images supported
                    </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {uploadedFiles.map(doc => (
                            <div key={doc.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '18px' }}>
                                        {doc.name.endsWith('.pdf') ? '📄' : 
                                         doc.name.match(/\.(jpg|jpeg|png)$/i) ? '🖼️' : 
                                         doc.name.match(/\.(doc|docx)$/i) ? '📝' : '📎'}
                                    </span>
                                    <div>
                                        <div style={{ 
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {doc.name}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--text-tertiary)'
                                        }}>
                                            {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadDate).toLocaleDateString()}
                                            {doc.uploadedBy && ` • by ${doc.uploadedBy}`}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => openFileViewer(doc)}
                                        style={{
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        onClick={() => {
                                            const element = document.createElement('a');
                                            element.href = doc.originalFile;
                                            element.download = doc.name;
                                            element.click();
                                        }}
                                        style={{
                                            background: 'var(--accent-color)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        📥 Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Interview Feedback Section */}
            <div style={{
                background: 'rgba(159, 122, 234, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid rgba(159, 122, 234, 0.1)'
            }}>
                <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '15px',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    🎤 Interview Feedback History
                </h4>

                {/* 🆕 PDF Downloads Section */}
    {candidate.interviewPDFs && candidate.interviewPDFs.length > 0 && (
        <div style={{
            background: 'var(--card-bg)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
            }}>
                <span style={{ fontSize: '16px' }}>📄</span>
                <h5 style={{ 
                    margin: 0, 
                    color: 'var(--text-primary)', 
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    Interview Reports ({candidate.interviewPDFs.length})
                </h5>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {candidate.interviewPDFs.map(pdf => (
                    <div key={pdf.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--input-bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ 
                                fontSize: '12px', 
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                marginBottom: '2px'
                            }}>
                                {pdf.filename}
                            </div>
                            <div style={{ 
                                fontSize: '10px', 
                                color: 'var(--text-tertiary)'
                            }}>
                                {new Date(pdf.timestamp).toLocaleString()} • by {pdf.interviewer}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                onClick={() => openFileViewer({
                                    id: pdf.id,
                                    name: pdf.filename,
                                    originalFile: pdf.data,
                                    uploadDate: pdf.created_at,
                                    uploadedBy: pdf.created_by,
                                    size: 0
                                })}
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                👁️ View
                            </button>
                            <button
                                onClick={() => downloadPDF(pdf)}
                                style={{
                                    background: '#4299e1',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                📥 Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )}
                
                {candidate.interview_feedback && candidate.interview_feedback.length > 0 ? (
                    <div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            marginBottom: '15px'
                        }}>
                            📊 {candidate.interview_feedback.length} Interview{candidate.interview_feedback.length !== 1 ? 's' : ''} Completed
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {candidate.interview_feedback.map((feedback, index) => {
                            const sentimentColor = {
                                'very_positive': '#48bb78',
                                'positive': '#68d391',
                                'neutral': '#ed8936',
                                'negative': '#fc8181',
                                'very_negative': '#e53e3e'
                            }[feedback.sentiment] || '#a0aec0';

                            return (
                                <div key={feedback.id} style={{
                                    padding: '15px',
                                    marginBottom: '15px',
                                    background: 'var(--card-bg)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    borderLeft: `4px solid ${sentimentColor}`
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '10px'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--text-primary)',
                                                marginBottom: '5px'
                                            }}>
                                                {feedback.interview_type}
                                            </div>
                                            <div style={{
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
}}>
    <span>
        {new Date(feedback.interview_date).toLocaleDateString()} | 
        {feedback.interviewer} | 
        {helpers.formatTimeAgo(feedback.created_at)}
    </span>
    {/* NEW: Project Info Display */}
    {feedback.project_name && (
        <span style={{
            background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600'
        }}>
            📁 {feedback.project_name}
        </span>
    )}
</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div style={{
                                                background: sentimentColor,
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase'
                                            }}>
                                                {feedback.sentiment?.replace('_', ' ')}
                                            </div>
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {feedback.feedback.rating}/10
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Summary */}
                                    {feedback.ai_summary && (
                                        <div style={{
                                            fontSize: '13px',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '10px',
                                            fontStyle: 'italic',
                                            lineHeight: '1.4'
                                        }}>
                                            📋 {feedback.ai_summary}
                                        </div>
                                    )}

                                    {/* Recommendation */}
                                    {feedback.recommended_action && (
                                        <div style={{
                                            fontSize: '12px',
                                            marginBottom: '10px'
                                        }}>
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                Recommendation: 
                                            </span>
                                            <span style={{
                                                color: feedback.recommended_action === 'advance' ? '#48bb78' :
                                                       feedback.recommended_action === 'decline' ? '#fc8181' :
                                                       'var(--text-secondary)',
                                                fontWeight: '500',
                                                marginLeft: '5px'
                                            }}>
                                                {feedback.recommended_action.charAt(0).toUpperCase() + 
                                                 feedback.recommended_action.slice(1)}
                                            </span>
                                        </div>
                                    )}

                                    {/* 🆕 AI ANALYSIS SECTION */}
                                    {feedback.feedback?.ai_analysis && (
                                        <div style={{
                                            background: 'rgba(102, 126, 234, 0.05)',
                                            border: '1px solid rgba(102, 126, 234, 0.1)',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            marginBottom: '15px'
                                        }}>
                                            <div style={{ 
                                                fontSize: '14px', 
                                                fontWeight: '600', 
                                                color: 'var(--text-primary)',
                                                marginBottom: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                🤖 AI Analysis
                                                <span style={{
                                                    fontSize: '12px',
                                                    background: 'var(--accent-color)',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    fontWeight: '500'
                                                }}>
                                                    {Math.round((feedback.feedback.ai_analysis.confidence_score || 0) * 100)}% confidence
                                                </span>
                                            </div>
                                            
                                            {/* Skills Display */}
                                            {feedback.feedback.ai_analysis.detected_skills && feedback.feedback.ai_analysis.detected_skills.length > 0 && (
                                                <div style={{ marginBottom: '15px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                                        🎯 Detected Skills:
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {feedback.feedback.ai_analysis.detected_skills.slice(0, 6).map((skill, skillIndex) => (
                                                            <span key={skillIndex} style={{
                                                                background: `linear-gradient(135deg, rgba(102, 126, 234, ${skill.confidence}) 0%, rgba(118, 75, 162, ${skill.confidence}) 100%)`,
                                                                color: skill.confidence > 0.5 ? 'white' : 'var(--text-primary)',
                                                                padding: '4px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                border: skill.confidence <= 0.5 ? '1px solid rgba(102, 126, 234, 0.3)' : 'none'
                                                            }}>
                                                                {skill.skill} ({Math.round(skill.confidence * 100)}%)
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Performance Bars */}
                                            <div style={{ marginBottom: '10px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                                    📊 Performance Analysis:
                                                </div>
                                                {[
                                                    { label: 'Technical Skills', value: feedback.feedback.ai_analysis.technical_skills, color: '#667eea' },
                                                    { label: 'Communication', value: feedback.feedback.ai_analysis.communication, color: '#764ba2' },
                                                    { label: 'Problem Solving', value: feedback.feedback.ai_analysis.problem_solving, color: '#f093fb' },
                                                    { label: 'Cultural Fit', value: feedback.feedback.ai_analysis.cultural_fit, color: '#f5576c' },
                                                    { label: 'Leadership', value: feedback.feedback.ai_analysis.leadership_potential, color: '#4facfe' },
                                                    { label: 'Growth Potential', value: feedback.feedback.ai_analysis.growth_potential, color: '#43e97b' }
                                                ].map((metric, metricIndex) => (
                                                    <div key={metricIndex} style={{ marginBottom: '6px' }}>
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            fontSize: '12px',
                                                            marginBottom: '3px'
                                                        }}>
                                                            <span>{metric.label}</span>
                                                            <span style={{ fontWeight: '600' }}>
                                                                {Math.round((metric.value || 0) * 100)}%
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            background: 'rgba(0,0,0,0.1)',
                                                            borderRadius: '10px',
                                                            height: '6px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                background: metric.color,
                                                                height: '100%',
                                                                borderRadius: '10px',
                                                                width: `${Math.min(100, (metric.value || 0) * 100)}%`,
                                                                transition: 'width 0.8s ease'
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Feedback Details in Grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '15px',
                                        marginBottom: '10px'
                                    }}>
                                        {feedback.feedback.strengths && (
    <div>
        <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#48bb78',
            textTransform: 'uppercase',
            marginBottom: '5px'
        }}>
            ✅ Strengths
        </div>
        <div 
            style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
            }}
            dangerouslySetInnerHTML={{ __html: feedback.feedback.strengths }}
        />
    </div>
)}

{feedback.feedback.concerns && (
    <div>
        <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#fc8181',
            textTransform: 'uppercase',
            marginBottom: '5px'
        }}>
            ⚠️ Concerns
        </div>
        <div 
            style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
            }}
            dangerouslySetInnerHTML={{ __html: feedback.feedback.concerns }}
        />
    </div>
)}
                                    </div>

                                    {/* Notes */}
{feedback.feedback.notes && (
    <div style={{
        background: 'rgba(102, 126, 234, 0.05)',
        padding: '10px',
        borderRadius: '6px',
        marginTop: '10px'
    }}>
        <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--accent-color)',
            textTransform: 'uppercase',
            marginBottom: '5px'
        }}>
            📝 Notes
        </div>
        <div 
            style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
            }}
            dangerouslySetInnerHTML={{ __html: feedback.feedback.notes }}
        />
    </div>
)}

                                    {/* Question Responses */}
                                    {feedback.feedback.question_responses && 
                                     feedback.feedback.question_responses.some(qr => qr.response) && (
                                        <div style={{ marginTop: '10px' }}>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: 'var(--accent-color)',
                                                textTransform: 'uppercase',
                                                marginBottom: '8px'
                                            }}>
                                                ❓ Question Responses
                                            </div>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                {feedback.feedback.question_responses
                                                    .filter(qr => qr.response)
                                                    .map((qr, qIndex) => (
                                                    <div key={qIndex} style={{
                                                        background: 'rgba(72, 187, 120, 0.05)',
                                                        padding: '8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px'
                                                    }}>
                                                        <div style={{
                                                            fontWeight: '600',
                                                            color: 'var(--text-primary)',
                                                            marginBottom: '3px'
                                                        }}>
                                                            Q: {qr.question}
                                                        </div>
                                                        <div style={{
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    lineHeight: '1.3'
}}>
    A: <span dangerouslySetInnerHTML={{ __html: qr.response }} />
</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{
                                        fontSize: '10px',
                                        color: 'var(--text-muted)',
                                        marginTop: '10px',
                                        textAlign: 'right'
                                    }}>
                                        Added by {feedback.created_by}
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        padding: '40px 20px',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎤</div>
                        <div style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '600' }}>
                            No Interview Feedback Yet
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                            Interview feedback will appear here once interviews are completed with ratings and notes.
                        </div>
                    </div>
                )}
            </div>

            

            {/* Tags Section */}
            <div style={{
                background: 'rgba(102, 126, 234, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                position: 'relative'
            }}>
                {/* Loading overlay for tag operations */}
                {isUpdating && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                    }}>
                        <div style={{
                            background: 'var(--accent-color)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                border: '2px solid white',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            Updating tags...
                        </div>
                    </div>
                )}
                
                <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '15px',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    🏷️ Tags {candidate.tags && candidate.tags.length > 0 && (
                        <span style={{
                            fontSize: '12px',
                            background: 'var(--accent-color)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            marginLeft: '8px'
                        }}>
                            {candidate.tags.length}
                        </span>
                    )}
                </h4>
                
                {/* Tags Display */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '15px'
                }}>
                    {(candidate.tags || []).map(tag => (
                        <span key={tag} style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            {tag}
                            <button
                                onClick={() => removeTagFromCandidate(tag)}
                                disabled={isUpdating}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    padding: '0',
                                    lineHeight: '1',
                                    opacity: isUpdating ? 0.5 : 1
                                }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                
                {/* Add Tag Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add new tag..."
                        disabled={isUpdating}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            opacity: isUpdating ? 0.5 : 1
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isUpdating && newTag.trim()) {
                                addTagToCandidate(newTag);
                            }
                        }}
                    />
                    <button
                        onClick={() => addTagToCandidate(newTag)}
                        disabled={!newTag.trim() || isUpdating}
                        style={{
                            background: (newTag.trim() && !isUpdating) ? 
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                                'var(--text-muted)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            cursor: (newTag.trim() && !isUpdating) ? 'pointer' : 'not-allowed',
                            fontWeight: '600'
                        }}
                    >
                        {isUpdating ? '...' : 'Add'}
                    </button>
                </div>
            </div>

            {/* Enhanced Notes Section with AI Smart Features */}
            <div style={{
                background: 'rgba(237, 137, 54, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid rgba(237, 137, 54, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <h4 style={{
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        📝 Notes {aiProcessing && <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>🤖 Processing...</span>}
                    </h4>
                    
                    {/* Smart Notes Actions */}
                    {smartNotes && isEditing && window.AIAssistant && (
                        <button
                            onClick={applyAISuggestions}
                            disabled={isUpdating}
                            style={{
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            ✨ Apply AI Suggestions
                        </button>
                    )}
                </div>
                
                {isEditing ? (
                    <div>
                        <textarea
                            className="form-textarea"
                            value={editData.notes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            placeholder="Add notes about this candidate..."
                            disabled={isUpdating}
                            style={{ 
                                minHeight: '120px', 
                                fontSize: '14px',
                                opacity: isUpdating ? 0.5 : 1
                            }}
                        />
                        
                        {/* Smart Notes Preview */}
                        {smartNotes && window.AIAssistant && (
                            <div style={{
                                marginTop: '15px',
                                padding: '15px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: '8px',
                                fontSize: '13px'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '10px' }}>
                                    🤖 AI Smart Suggestions:
                                </div>
                                
                                {smartNotes.tags && smartNotes.tags.length > 0 && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong>Suggested Tags:</strong> {smartNotes.tags.slice(0, 5).join(', ')}
                                    </div>
                                )}
                                
                                {smartNotes.actionItems && smartNotes.actionItems.length > 0 && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong>Action Items Found:</strong>
                                        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                            {smartNotes.actionItems.slice(0, 3).map((action, index) => (
                                                <li key={index} style={{ fontSize: '12px' }}>
                                                    {action.text} ({action.priority} priority)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {smartNotes.structure !== 'short' && (
                                    <div>
                                        <strong>Formatting:</strong> Applied {smartNotes.structure} structure
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{
                        padding: '15px',
                        background: 'var(--card-bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        minHeight: '100px',
                        whiteSpace: 'pre-wrap',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        lineHeight: '1.5'
                    }}>
                        {candidate.notes || (
                            <span style={{ 
                                color: 'var(--text-muted)', 
                                fontStyle: 'italic' 
                            }}>
                                No notes yet. Click Edit to add notes with AI assistance.
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Add Comment Section */}
            <div style={{
                background: 'rgba(56, 178, 172, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '1px solid rgba(56, 178, 172, 0.1)'
            }}>
                <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '15px',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    💬 Add Comment
                </h4>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        disabled={isUpdating}
                        style={{
                            flex: 1,
                            minHeight: '60px',
                            padding: '10px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            resize: 'vertical',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            opacity: isUpdating ? 0.5 : 1
                        }}
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isUpdating}
                        style={{
                            background: (newComment.trim() && !isUpdating) ? 
                                'linear-gradient(135deg, #38b2ac 0%, #319795 100%)' : 
                                'var(--text-muted)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 15px',
                            fontSize: '12px',
                            cursor: (newComment.trim() && !isUpdating) ? 'pointer' : 'not-allowed',
                            alignSelf: 'flex-start'
                        }}
                    >
                        Add Comment
                    </button>
                </div>
            </div>

            {/* Timeline Section */}
            <div style={{
                background: 'rgba(102, 126, 234, 0.05)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
                <h4 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '20px',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    📈 Activity Timeline ({(candidate.timeline || []).length} entries)
                </h4>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {(candidate.timeline || []).slice(0, 10).map((item, index) => (
                        <div key={`${item.id}-${item.timestamp}-${index}`} className="timeline-item" style={{
                            marginBottom: '15px',
                            padding: '15px',
                            background: 'var(--card-bg)',
                            borderRadius: '8px',
                            borderLeft: '4px solid var(--accent-color)'
                        }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px',
                                    flexShrink: 0
                                }}>
                                    {item.type === 'created' ? '✨' : 
                                     item.type === 'comment' ? '💬' :
                                     item.type === 'status' ? '🔄' :
                                     item.type === 'readiness' ? '📊' :
                                     item.type === 'interview' ? '🎤' : '📝'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '5px'
                                    }}>
                                        <div style={{
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {item.action}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--accent-color)',
                                            fontWeight: '500'
                                        }}>
                                            {helpers.formatTimeAgo(item.timestamp)}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '3px',
                                        lineHeight: '1.4'
                                    }}>
                                        {item.description}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--text-tertiary)'
                                    }}>
                                        by {item.user}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {(!candidate.timeline || candidate.timeline.length === 0) && (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            padding: '20px'
                        }}>
                            No activity yet
                        </div>
                    )}
                </div>
            </div>
            
            {isEditing && (
                <div style={{ marginTop: '25px' }}>
                    <button 
                        className="btn-primary" 
                        onClick={handleSave}
                        disabled={isUpdating}
                        style={{
                            width: '100%',
                            padding: '15px',
                            fontSize: '16px',
                            opacity: isUpdating ? 0.5 : 1
                        }}
                    >
                        {isUpdating ? '🔄 Saving...' : '💾 Save Changes'}
                    </button>
                </div>
            )}

            {/* File Viewer Modal - PORTAL VERSION */}
            {showFileViewer && currentViewingFile && ReactDOM.createPortal(
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.95)',
                        zIndex: 999999, // Even higher z-index
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeFileViewer();
                        }
                    }}
                >
                    {/* Header */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '15px 25px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        flexShrink: 0
                    }}>
                        <div>
                            <h3 style={{
                                color: 'white',
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                {currentViewingFile.name}
                            </h3>
                            <div style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '12px',
                                marginTop: '4px'
                            }}>
                                {(currentViewingFile.size / 1024).toFixed(1)} KB • 
                                Uploaded {new Date(currentViewingFile.uploadDate).toLocaleDateString()}
                                {currentViewingFile.uploadedBy && ` by ${currentViewingFile.uploadedBy}`}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '12px',
                                marginRight: '10px'
                            }}>
                                Press ESC or click outside to close
                            </div>
                            <button
                                onClick={downloadCurrentFile}
                                style={{
                                    background: 'rgba(59, 130, 246, 0.8)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                📥 Download
                            </button>
                            <button
                                onClick={closeFileViewer}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.8)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    minWidth: '44px'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* File Content */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px',
                        overflow: 'hidden'
                    }}>
                        {/* PDF Viewer */}
                        {currentViewingFile.name.toLowerCase().endsWith('.pdf') && (
                            <iframe
                                src={currentViewingFile.originalFile}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'white'
                                }}
                                title={currentViewingFile.name}
                            />
                        )}

                        {/* Image Viewer */}
                        {currentViewingFile.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) && (
                            <img
                                src={currentViewingFile.originalFile}
                                alt={currentViewingFile.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                                }}
                            />
                        )}

                        {/* Unsupported File Type */}
                        {!currentViewingFile.name.match(/\.(pdf|jpg|jpeg|png|gif|bmp|webp)$/i) && (
                            <div style={{
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📎</div>
                                <h3 style={{ marginBottom: '10px' }}>File Preview Not Available</h3>
                                <p style={{ marginBottom: '20px', opacity: 0.8 }}>
                                    This file type cannot be previewed in the browser.
                                </p>
                                <button
                                    onClick={downloadCurrentFile}
                                    style={{
                                        background: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    📥 Download File
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '10px 20px',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '12px'
                    }}>
                        Click outside or press ESC to close • Use browser zoom to resize content
                    </div>
                </div>,
                document.body
            )}
            
            {/* Add CSS for animations */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

// AddCandidateModal Component - COMPLETE VERSION
const AddCandidateModal = ({ 
    currentUser, 
    projects, 
    onClose, 
    onAdd 
}) => {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        job_title: '',
        company: '',
        phone: '',
        location: '',
        linkedin_url: '',
        notes: '',
        tags: [],
        project_id: null,
        gender: '',
        source: ''
    });

    const [newTag, setNewTag] = React.useState('');

    const addTag = (tag) => {
        if (tag && !formData.tags.includes(tag)) {
            setFormData({...formData, tags: [...formData.tags, tag]});
        }
        setNewTag('');
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const timestamp = new Date().toISOString();
        const candidateData = {
            ...formData,
            status: 'new',
            readiness: 'not_ready',
            created_by: currentUser.name,
            interview_feedback: [], // Initialize empty feedback array
            timeline: [
                {
                    id: 1,
                    action: 'Candidate Created',
                    description: 'Initial candidate record created',
                    user: currentUser.name,
                    timestamp: timestamp,
                    type: 'created'
                }
            ]
        };

        try {
            const result = await api.createCandidate(candidateData);
            if (result.data) {
                onAdd(result.data);
            }
        } catch (error) {
            console.error('Error creating candidate:', error);
            alert('Error creating candidate. Please try again.');
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2 style={{ marginBottom: '30px', color: 'var(--text-primary)' }}>
                    ➕ Add New Candidate
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Enter candidate's full name"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="candidate@email.com"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Job Title *</label>
                            <input
                                type="text"
                                className="form-input"
                                required
                                value={formData.job_title}
                                onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                                placeholder="e.g., Senior Software Engineer"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Company *</label>
                            <input
                                type="text"
                                className="form-input"
                                required
                                value={formData.company}
                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                                placeholder="Current or previous company"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select
                                className="form-input"
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            >
                                {helpers.predefinedOptions.genders.map(gender => (
                                    <option key={gender.value} value={gender.value}>
                                        {gender.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Source *</label>
                            <select
                                className="form-input"
                                required
                                value={formData.source}
                                onChange={(e) => setFormData({...formData, source: e.target.value})}
                            >
                                <option value="">Select Source</option>
                                {helpers.predefinedOptions.sources.map(source => (
                                    <option key={source} value={source}>
                                        {source}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Assign to Project</label>
                            <select
                                className="form-input"
                                value={formData.project_id || ''}
                                onChange={(e) => setFormData({...formData, project_id: e.target.value ? parseInt(e.target.value) : null})}
                            >
                                <option value="">No Project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <select
                                className="form-input"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                style={{ 
                                    padding: '12px 15px',
                                    fontSize: '14px'
                                }}
                            >
                                {helpers.predefinedOptions.countries.map(country => (
                                    <option 
                                        key={country.value} 
                                        value={country.value}
                                        disabled={country.disabled}
                                    >
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">LinkedIn URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={formData.linkedin_url}
                                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Tags</label>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginBottom: '15px'
                        }}>
                            {formData.tags.map(tag => (
                                <span key={tag} style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {tag}
                                    <button 
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            padding: '0'
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add tag..."
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)'
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag(newTag);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => addTag(newTag)}
                                disabled={!newTag.trim()}
                                style={{
                                    background: newTag.trim() ? 
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                                        'var(--text-muted)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 15px',
                                    fontSize: '14px',
                                    cursor: newTag.trim() ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Add
                            </button>
                        </div>
                        
                        <div>
                            <small style={{ color: 'var(--text-tertiary)' }}>Suggested tags:</small>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '5px',
                                marginTop: '8px'
                            }}>
                                {helpers.predefinedOptions.tags.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => addTag(tag)}
                                        style={{
                                            background: 'none',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '12px',
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            color: 'var(--accent-color)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'none';
                                        }}
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Initial notes about the candidate..."
                            style={{ minHeight: '100px' }}
                        />
                    </div>
                    
                    <div className="form-buttons">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Add Candidate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Export both components to global scope
window.CandidateDetailPanel = CandidateDetailPanel;
window.AddCandidateModal = AddCandidateModal;

console.log('✅ Complete CandidateDetailPanel and AddCandidateModal exported to global scope with AI features');
