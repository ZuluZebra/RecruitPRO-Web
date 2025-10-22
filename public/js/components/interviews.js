// Enhanced Interviews Component with Project Linking - COMPLETE VERSION
const InterviewsComponent = ({ 
    currentUser, 
    candidates,
    setCandidates,
    interviews,
    setInterviews,
    interviewTemplates,
    setInterviewTemplates,
    projects = [], // Added projects prop with default empty array
    onViewCandidate 
}) => {
    const [showInterviewModal, setShowInterviewModal] = React.useState(false);
    const [showTemplateModal, setShowTemplateModal] = React.useState(false);
    const [showEditTemplateModal, setShowEditTemplateModal] = React.useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
    const [selectedInterview, setSelectedInterview] = React.useState(null);
    const [selectedTemplate, setSelectedTemplate] = React.useState(null);
    const [preSelectedCandidate, setPreSelectedCandidate] = React.useState(null);

    React.useEffect(() => {
        console.log('InterviewsComponent mounted/updated');
        console.log('Current interviews:', interviews.length);
        console.log('Current candidates:', candidates.length);
        console.log('Current projects:', projects?.length || 0);
        
        // Verify storage contents
        const storageInterviews = helpers.storage.load('recruitpro_interviews') || [];
        const storageCandidates = helpers.storage.load('recruitpro_candidates') || [];
        console.log('Storage interviews:', storageInterviews.length);
        console.log('Storage candidates:', storageCandidates.length);
        
        // Check for any candidates with feedback
        const candidatesWithFeedback = storageCandidates.filter(c => c.interview_feedback && c.interview_feedback.length > 0);
        console.log('Candidates with feedback in storage:', candidatesWithFeedback.length);
        candidatesWithFeedback.forEach(c => {
            console.log(`${c.name} has ${c.interview_feedback.length} feedback entries`);
        });
    }, [interviews, candidates, projects]);

    // Filter interviews - FIXED: Remove completed interviews from today's section
    const upcomingInterviews = interviews.filter(i => 
        i.status === 'scheduled' && new Date(i.interview_date) >= new Date()
    );
    const completedInterviews = interviews.filter(i => i.status === 'completed');
    
    // FIXED: Today's interviews should only show scheduled (not completed) interviews
    const todayInterviews = interviews.filter(i => {
        const today = new Date().toDateString();
        const isToday = new Date(i.interview_date).toDateString() === today;
        const isScheduled = i.status === 'scheduled'; // Only show scheduled interviews
        return isToday && isScheduled;
    });

    const scheduleInterview = async (interviewData) => {
        try {
            const result = await api.createInterview({
                ...interviewData,
                scheduled_by: currentUser.name
            });
            
            if (result.data) {
                // FIXED: Update interviews state immediately
                const newInterviews = [result.data, ...interviews];
                setInterviews(newInterviews);
                
                // FIXED: Also update localStorage for immediate persistence
                helpers.storage.save('recruitpro_interviews', newInterviews);
                
                // Add timeline entry for candidate
                addTimelineEntry(
                    interviewData.candidate_id, 
                    'Interview Scheduled', 
                    `${interviewData.template_name} scheduled for ${new Date(interviewData.interview_date).toLocaleDateString()}${interviewData.project_name ? ` (Project: ${interviewData.project_name})` : ''}`, 
                    'interview'
                );
                
                setShowInterviewModal(false);
                setPreSelectedCandidate(null);
                
                console.log('✅ Interview scheduled and state updated immediately');
            }
        } catch (error) {
            console.error('Error scheduling interview:', error);
            alert('Error scheduling interview. Please try again.');
        }
    };

    const createInterviewTemplate = async (templateData) => {
        try {
            const result = await api.createInterviewTemplate({
                ...templateData,
                created_by: currentUser.name
            });
            
            if (result.data) {
                setInterviewTemplates([result.data, ...interviewTemplates]);
                setShowTemplateModal(false);
            }
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Error creating template. Please try again.');
        }
    };

    // NEW: Edit interview template function
    const editInterviewTemplate = async (templateId, templateData) => {
        try {
            const result = await api.updateInterviewTemplate(templateId, {
                ...templateData,
                updated_by: currentUser.name,
                updated_at: new Date().toISOString()
            });
            
            if (result.data) {
                const updatedTemplates = interviewTemplates.map(t => 
                    t.id === templateId ? result.data : t
                );
                setInterviewTemplates(updatedTemplates);
                setShowEditTemplateModal(false);
                setSelectedTemplate(null);
                alert('✅ Template updated successfully!');
            }
        } catch (error) {
            console.error('Error updating template:', error);
            alert('Error updating template. Please try again.');
        }
    };

    // NEW: Delete interview template function
    const deleteInterviewTemplate = async (templateId) => {
        if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            return;
        }

        try {
            await api.deleteInterviewTemplate(templateId);
            const updatedTemplates = interviewTemplates.filter(t => t.id !== templateId);
            setInterviewTemplates(updatedTemplates);
            alert('✅ Template deleted successfully!');
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Error deleting template. Please try again.');
        }
    };

    // FIXED: Enhanced feedback submission with proper state propagation and project info
    const submitInterviewFeedback = async (interviewId, feedbackData) => {
        console.log('=== FEEDBACK SUBMISSION START ===');
        console.log('Interview ID:', interviewId, 'Type:', typeof interviewId);
        
        // FIXED: Ensure consistent ID types
        const numericInterviewId = typeof interviewId === 'string' ? parseInt(interviewId) : interviewId;
        
        // Find interview in current state with flexible ID matching
        const interview = interviews.find(i => i.id == interviewId || i.id == numericInterviewId);
        if (!interview) {
            console.error('Interview not found in current state!');
            alert('Interview not found! Please refresh the page and try again.');
            return;
        }
    
        console.log('Found interview:', interview);
        console.log('Candidate ID from interview:', interview.candidate_id, 'Type:', typeof interview.candidate_id);
    
        try {
            // AI analysis
            const aiAnalysis = analyzeInterviewFeedback(feedbackData);
            
            // 🆕 Generate PDF Report BEFORE saving feedback
            let pdfData = null;
            try {
                const candidate = candidates.find(c => c.id == interview.candidate_id);
                const template = interviewTemplates.find(t => t.id == interview.template_id);
                const project = getProjectInfo(interview.project_id);
                
                if (window.InterviewPDFGenerator && candidate) {
                    const pdfGenerator = new window.InterviewPDFGenerator();
                    
                    const pdfDataPayload = {
                        candidate: candidate,
                        interview: interview,
                        feedback: feedbackData,
                        aiAnalysis: {
                            analysis: aiAnalysis,
                            executiveSummary: aiAnalysis.summary,
                            recommendations: [{
                                type: aiAnalysis.recommendedAction,
                                text: `Recommended action: ${aiAnalysis.recommendedAction}`,
                                confidence: 'medium'
                            }],
                            keyInsights: []
                        },
                        skillsAssessment: feedbackData.skillsAssessment,
                        interviewResponses: feedbackData.question_responses?.reduce((acc, qr, index) => {
                            acc[index] = qr.response;
                            return acc;
                        }, {}) || {},
                        template: template
                    };
                    
                    const pdfResult = await pdfGenerator.generateInterviewPDF(pdfDataPayload);
                    
                    pdfData = {
                        id: `interview_${numericInterviewId}_${Date.now()}`,
                        filename: pdfResult.filename,
                        data: pdfResult.pdfData,
                        timestamp: new Date().toISOString(),
                        interviewId: numericInterviewId,
                        interviewer: interview.interviewer,
                        candidateId: candidate.id
                    };
                    
                    console.log('✅ PDF generated successfully:', pdfResult.filename);
                }
                
            } catch (pdfError) {
                console.error('PDF generation failed:', pdfError);
                // Continue without PDF - don't block feedback submission
            }
            
            // FIXED: Update interview with proper API call
            const interviewUpdates = {
                feedback: feedbackData,
                ai_summary: aiAnalysis.summary,
                sentiment: aiAnalysis.sentiment,
                recommended_action: aiAnalysis.recommendedAction,
                completed_at: new Date().toISOString(),
                status: 'completed'
            };
    
            console.log('Updating interview with:', interviewUpdates);
    
            // Call API to update interview
            const result = await api.updateInterview(numericInterviewId, interviewUpdates);
            if (result.error) {
                throw new Error(result.error);
            }
    
            // Update interview in current state
            const updatedInterview = { ...interview, ...interviewUpdates };
            const newInterviews = interviews.map(i => 
                (i.id == interviewId || i.id == numericInterviewId) ? updatedInterview : i
            );
            setInterviews(newInterviews);
            console.log('✅ Interviews updated in state');
    
            // FIXED: Find and update candidate with proper ID matching
            const candidateId = interview.candidate_id;
            const numericCandidateId = typeof candidateId === 'string' ? parseInt(candidateId) : candidateId;
            
            const candidate = candidates.find(c => c.id == candidateId || c.id == numericCandidateId);
            if (!candidate) {
                throw new Error(`Candidate not found with ID: ${candidateId}`);
            }
    
            console.log('Updating candidate:', candidate.name, 'ID:', candidate.id);
            
            // Create new feedback entry with PROJECT INFORMATION
            const newFeedbackEntry = {
                id: Date.now() + Math.random(),
                interview_id: numericInterviewId,
                interview_type: interview.template_name,
                interview_date: interview.interview_date,
                interviewer: interview.interviewer,
                project_id: interview.project_id, // NEW: Include project ID
                project_name: interview.project_name, // NEW: Include project name
                feedback: feedbackData,
                ai_summary: aiAnalysis.summary,
                sentiment: aiAnalysis.sentiment,
                recommended_action: aiAnalysis.recommendedAction,
                created_at: new Date().toISOString(),
                created_by: currentUser.name
            };
    
            console.log('New feedback entry:', newFeedbackEntry);
    
            // FIXED: Add to existing feedback with proper array handling
            const existingFeedback = candidate.interview_feedback || [];
            const updatedFeedback = [newFeedbackEntry, ...existingFeedback];
            
            // 🆕 Add PDF data to candidate updates
            const candidateUpdates = { 
                interview_feedback: updatedFeedback,
                last_updated: new Date().toISOString()
            };
    
            // Add PDF to candidate record if generated successfully
            if (pdfData) {
                candidateUpdates.interviewPDFs = [
                    ...(candidate.interviewPDFs || []),
                    pdfData
                ];
            }
    
            console.log('Updating candidate API with:', candidateUpdates);
            
            const candidateResult = await api.updateCandidate(candidate.id, candidateUpdates);
            if (candidateResult.error) {
                throw new Error(candidateResult.error);
            }
            
            // FIXED: Update candidates state with proper ID matching
            const newCandidates = candidates.map(c => 
    (c.id == candidateId || c.id == numericCandidateId)
        ? window.updateUserAttribution({ ...c, ...candidateUpdates })
        : c
);
setCandidates(newCandidates);
            
            console.log('✅ Candidates updated in state');
            console.log('Updated candidate feedback length:', updatedFeedback.length);
    
            // FIXED: Force storage update to ensure persistence
            helpers.storage.save('recruitpro_candidates', newCandidates);
            helpers.storage.save('recruitpro_interviews', newInterviews);
            console.log('✅ Storage updated manually');
    
            // Add timeline entry with project info
            addTimelineEntry(
                candidate.id, 
                'Interview Completed', 
                `${interview.template_name} completed - Rating: ${feedbackData.rating}/10${interview.project_name ? ` (Project: ${interview.project_name})` : ''}${pdfData ? ' • PDF report generated' : ''}`, 
                'interview'
            );
    
            // Close modal
            setShowFeedbackModal(false);
            setSelectedInterview(null);
            
            alert(`✅ Interview feedback saved successfully!${pdfData ? '\n📄 PDF report has been generated and attached to candidate record.' : ''}`);
            console.log('=== FEEDBACK SUBMISSION COMPLETED ===');
            
            // FIXED: Force component re-render by updating a timestamp
            // FIXED: Force component re-render with attribution
setCandidates(prev => prev.map(c => 
    (c.id == candidateId || c.id == numericCandidateId)
        ? window.updateUserAttribution({ ...c, _lastUpdate: Date.now() })
        : c
));
            
        } catch (error) {
            console.error('❌ ERROR submitting feedback:', error);
            alert(`Error submitting feedback: ${error.message}. Please try again.`);
        }
    };

    const deleteInterview = async (interviewId) => {
        if (!confirm('Are you sure you want to delete this interview?')) {
            return;
        }

        try {
            await api.deleteInterview(interviewId);
            const newInterviews = interviews.filter(i => i.id !== interviewId);
            setInterviews(newInterviews);
        } catch (error) {
            console.error('Error deleting interview:', error);
            alert('Error deleting interview. Please try again.');
        }
    };

    // FIXED: Enhanced feedback deletion with candidate record cleanup
    const deleteFeedback = async (interviewId) => {
        if (!confirm('Are you sure you want to delete the feedback for this interview?')) {
            return;
        }

        try {
            const interview = interviews.find(i => i.id === interviewId);
            
            const interviewUpdates = {
                feedback: null,
                ai_summary: null,
                sentiment: null,
                recommended_action: null,
                completed_at: null,
                status: 'scheduled'
            };

            await api.updateInterview(interviewId, interviewUpdates);

            const updatedInterview = { ...interview, ...interviewUpdates };
            const newInterviews = interviews.map(i => 
                i.id === interviewId ? updatedInterview : i
            );
            setInterviews(newInterviews);

            // FIXED: Remove feedback from candidate record with proper ID handling
            const candidateId = interview.candidate_id;
            const candidate = candidates.find(c => c.id == candidateId);
            if (candidate && candidate.interview_feedback) {
                const updatedFeedback = candidate.interview_feedback.filter(
                    feedback => feedback.interview_id != interviewId
                );
                
                const candidateUpdates = { 
                    interview_feedback: updatedFeedback,
                    last_updated: new Date().toISOString()
                };
                await api.updateCandidate(candidate.id, candidateUpdates);
                
                // Update local candidate state
                const updatedCandidates = candidates.map(c => 
                    c.id == candidateId
                        ? { ...c, ...candidateUpdates }
                        : c
                );
                setCandidates(updatedCandidates);
                
                // Force storage update
                helpers.storage.save('recruitpro_candidates', updatedCandidates);
            }

            // Add timeline entry for candidate with project info
            addTimelineEntry(
                candidateId, 
                'Interview Feedback Deleted', 
                `Feedback for ${interview.template_name} was removed${interview.project_name ? ` (Project: ${interview.project_name})` : ''}`, 
                'interview'
            );
        } catch (error) {
            console.error('Error deleting feedback:', error);
            alert('Error deleting feedback. Please try again.');
        }
    };

    const addTimelineEntry = async (candidateId, action, description, type = 'update') => {
        const timestamp = new Date().toISOString();
        const timelineEntry = {
            id: Date.now() + Math.random(),
            action,
            description,
            user: currentUser.name,
            timestamp,
            type
        };

        // FIXED: Ensure proper ID matching for timeline updates
        const numericCandidateId = typeof candidateId === 'string' ? parseInt(candidateId) : candidateId;

        setCandidates(prevCandidates => {
            return prevCandidates.map(candidate => {
                if (candidate.id == candidateId || candidate.id == numericCandidateId) {
                    const timeline = candidate.timeline || [];
                    const updatedCandidate = {
                        ...candidate,
                        timeline: [timelineEntry, ...timeline]
                    };
                    
                    // Update in database
                    api.updateCandidate(candidate.id, { timeline: updatedCandidate.timeline });
                    
                    return updatedCandidate;
                }
                return candidate;
            });
        });
    };

    // Mock AI-powered feedback analysis
    const analyzeInterviewFeedback = (feedbackData) => {
        const { rating, notes, strengths, concerns, recommendation } = feedbackData;
        
        let sentiment = 'neutral';
        if (rating >= 8) sentiment = 'very_positive';
        else if (rating >= 6) sentiment = 'positive';
        else if (rating >= 4) sentiment = 'neutral';
        else if (rating >= 2) sentiment = 'negative';
        else sentiment = 'very_negative';

        // Generate AI summary
        let summary = `Interview completed with ${rating}/10 rating. `;
        if (sentiment === 'very_positive') {
            summary += "Candidate demonstrated exceptional performance across all areas.";
        } else if (sentiment === 'positive') {
            summary += "Candidate showed strong capabilities with notable strengths.";
        } else if (sentiment === 'neutral') {
            summary += "Mixed feedback with both strengths and areas for improvement.";
        } else {
            summary += "Several concerns were raised during the interview process.";
        }

        // Recommend action
        let recommendedAction = 'proceed';
        if (rating >= 7) recommendedAction = 'advance';
        else if (rating <= 3) recommendedAction = 'decline';
        else if (rating >= 5) recommendedAction = 'proceed';
        else recommendedAction = 'review';

        return { sentiment, summary, recommendedAction };
    };

    // Helper function to get project info
    const getProjectInfo = (projectId) => {
        if (!projectId || !projects || projects.length === 0) return null;
        return projects.find(p => p.id == projectId);
    };

    return (
        <div>
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px'
            }}>
                <div>
                    <h2 style={{
                        marginBottom: '10px', 
                        color: 'var(--text-primary)',
                        fontSize: '28px',
                        fontWeight: '700'
                    }}>
                        🎤 Interview Management
                    </h2>
                    <p style={{ color: 'var(--text-tertiary)' }}>
                        Schedule interviews, manage templates, and capture feedback
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className="btn-secondary"
                        onClick={() => setShowTemplateModal(true)}
                    >
                        📝 New Template
                    </button>
                    <button 
                        className="add-button"
                        onClick={() => {
                            setPreSelectedCandidate(null);
                            setShowInterviewModal(true);
                        }}
                    >
                        📅 Schedule Interview
                    </button>
                </div>
            </div>

            {/* Interview Statistics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{interviews.length}</div>
                    <div className="stat-label">Total Interviews</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{todayInterviews.length}</div>
                    <div className="stat-label">Today</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{upcomingInterviews.length}</div>
                    <div className="stat-label">Upcoming</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{interviewTemplates.length}</div>
                    <div className="stat-label">Templates</div>
                </div>
            </div>

            {/* Today's Interviews with Project Info */}
            {todayInterviews.length > 0 && (
                <div className="modern-card" style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
                        🕒 Today's Interviews
                    </h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {todayInterviews.map(interview => {
                            const candidate = candidates.find(c => c.id == interview.candidate_id);
                            const project = getProjectInfo(interview.project_id);
                            return (
                                <div key={interview.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px',
                                    background: 'rgba(102, 126, 234, 0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(102, 126, 234, 0.1)'
                                }}>
                                    <div>
                                        <div style={{
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => onViewCandidate(candidate)}>
                                            {candidate?.name} - {interview.template_name}
                                        </div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                                            {new Date(interview.interview_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} | 
                                            {interview.interviewer} | {interview.duration} min
                                            {project && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '600'
                                                }}>
                                                    📁 {project.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => {
                                                setSelectedInterview(interview);
                                                setShowFeedbackModal(true);
                                            }}
                                            style={{ padding: '8px 16px', fontSize: '14px' }}
                                        >
                                            Add Feedback
                                        </button>
                                        <button
                                            onClick={() => deleteInterview(interview.id)}
                                            style={{
                                                background: 'rgba(252, 129, 129, 0.1)',
                                                color: '#fc8181',
                                                border: '1px solid rgba(252, 129, 129, 0.3)',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '30px',
                marginBottom: '30px'
            }}>
                {/* Upcoming Interviews with Project Info */}
                <div className="modern-card">
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
                        📅 Upcoming Interviews
                    </h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {upcomingInterviews.length > 0 ? (
                            upcomingInterviews.map(interview => {
                                const candidate = candidates.find(c => c.id == interview.candidate_id);
                                const project = getProjectInfo(interview.project_id);
                                return (
                                    <div key={interview.id} style={{
                                        padding: '15px',
                                        marginBottom: '10px',
                                        background: 'rgba(102, 126, 234, 0.05)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(102, 126, 234, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div onClick={() => onViewCandidate(candidate)}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer'
                                                }}>
                                                    {candidate?.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: 'var(--text-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {interview.template_name}
                                                    {project && (
                                                        <span style={{
                                                            background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                                                            color: 'white',
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            fontWeight: '600'
                                                        }}>
                                                            📁 {project.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'var(--text-tertiary)'
                                                }}>
                                                    {new Date(interview.interview_date).toLocaleDateString()} at {new Date(interview.interview_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'var(--accent-color)',
                                                    fontWeight: '600'
                                                }}>
                                                    {interview.interviewer}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'var(--text-tertiary)'
                                                }}>
                                                    {interview.duration} min
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedInterview(interview);
                                                        setShowFeedbackModal(true);
                                                    }}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '4px 8px',
                                                        fontSize: '10px',
                                                        cursor: 'pointer',
                                                        marginTop: '5px'
                                                    }}
                                                    title="Add feedback"
                                                >
                                                    📝 Add Feedback
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteInterview(interview.id);
                                                    }}
                                                    style={{
                                                        background: 'rgba(252, 129, 129, 0.1)',
                                                        color: '#fc8181',
                                                        border: '1px solid rgba(252, 129, 129, 0.3)',
                                                        borderRadius: '4px',
                                                        padding: '2px 6px',
                                                        fontSize: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic',
                                padding: '40px'
                            }}>
                                No upcoming interviews scheduled
                            </div>
                        )}
                    </div>
                </div>

                {/* Interview Templates with Edit/Delete Actions */}
                <div className="modern-card">
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
                        📝 Interview Templates
                    </h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {interviewTemplates.map(template => (
                            <div key={template.id} style={{
                                padding: '12px',
                                marginBottom: '10px',
                                background: 'rgba(72, 187, 120, 0.05)',
                                borderRadius: '8px',
                                border: '1px solid rgba(72, 187, 120, 0.1)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    marginBottom: '5px'
                                }}>
                                    {template.name}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '10px'
                                }}>
                                    {template.type} • {template.duration} min • {template.questions?.length || 0} questions
                                </div>
                                
                                {/* Action buttons */}
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '5px',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setShowEditTemplateModal(true);
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                        title="Edit template"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => deleteInterviewTemplate(template.id)}
                                        style={{
                                            background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                        title="Delete template"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {interviewTemplates.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic',
                                padding: '40px'
                            }}>
                                No templates created yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Completed Interviews with Project Info */}
            <div className="modern-card">
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
                    ✅ Recent Completed Interviews
                </h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {completedInterviews.slice(0, 10).map(interview => {
                        const candidate = candidates.find(c => c.id == interview.candidate_id);
                        const project = getProjectInfo(interview.project_id);
                        const sentimentColor = {
                            'very_positive': '#48bb78',
                            'positive': '#68d391',
                            'neutral': '#ed8936',
                            'negative': '#fc8181',
                            'very_negative': '#e53e3e'
                        }[interview.sentiment] || '#a0aec0';

                        return (
                            <div key={interview.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px',
                                marginBottom: '10px',
                                background: 'rgba(102, 126, 234, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onClick={() => onViewCandidate(candidate)}>
                                        {candidate?.name} - {interview.template_name}
                                        {project && (
                                            <span style={{
                                                background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                📁 {project.name}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: 'var(--text-secondary)',
                                        marginTop: '5px',
                                        lineHeight: '1.4'
                                    }}>
                                        {interview.ai_summary}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'var(--text-tertiary)',
                                        marginTop: '5px'
                                    }}>
                                        Completed: {helpers.formatTimeAgo(interview.completed_at)}
                                    </div>
                                </div>
                                <div style={{
                                    textAlign: 'right',
                                    marginLeft: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    <div style={{
                                        background: sentimentColor,
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        {interview.sentiment?.replace('_', ' ')}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {interview.feedback?.rating || 0}/10
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedInterview(interview);
                                                setShowFeedbackModal(true);
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '6px 10px',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                            title="View/Edit feedback"
                                        >
                                            ✏️ Edit Feedback
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to delete this interview feedback? This action cannot be undone.')) {
                                                    deleteFeedback(interview.id);
                                                }
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '6px 10px',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                            title="Delete feedback"
                                        >
                                            🗑️ Delete
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteInterview(interview.id);
                                            }}
                                            style={{
                                                background: 'rgba(252, 129, 129, 0.2)',
                                                color: '#c53030',
                                                border: '1px solid rgba(252, 129, 129, 0.4)',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                fontSize: '10px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                            title="Delete entire interview"
                                        >
                                            🗑️ Interview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {completedInterviews.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            padding: '40px'
                        }}>
                            No completed interviews yet
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showInterviewModal && (
                <ScheduleInterviewModal
                    currentUser={currentUser}
                    candidates={candidates}
                    interviewTemplates={interviewTemplates}
                    projects={projects} // NEW: Pass projects
                    preSelectedCandidate={preSelectedCandidate}
                    onClose={() => {
                        setShowInterviewModal(false);
                        setPreSelectedCandidate(null);
                    }}
                    onSchedule={scheduleInterview}
                />
            )}

            {showTemplateModal && (
                <CreateTemplateModal
                    currentUser={currentUser}
                    onClose={() => setShowTemplateModal(false)}
                    onCreate={createInterviewTemplate}
                />
            )}

            {showEditTemplateModal && selectedTemplate && (
                <EditTemplateModal
                    currentUser={currentUser}
                    template={selectedTemplate}
                    onClose={() => {
                        setShowEditTemplateModal(false);
                        setSelectedTemplate(null);
                    }}
                    onEdit={editInterviewTemplate}
                />
            )}

            {showFeedbackModal && selectedInterview && (
                <InterviewFeedbackModal
                    interview={selectedInterview}
                    candidate={candidates.find(c => c.id == selectedInterview.candidate_id)}
                    template={interviewTemplates.find(t => t.id == selectedInterview.template_id)}
                    project={getProjectInfo(selectedInterview.project_id)} // NEW: Pass project info
                    onClose={() => {
                        setShowFeedbackModal(false);
                        setSelectedInterview(null);
                    }}
                    onSubmit={submitInterviewFeedback}
                />
            )}
        </div>
    );
};

// FIXED: Schedule Interview Modal with Simple Project Dropdown
const ScheduleInterviewModal = ({ 
    currentUser, 
    candidates, 
    interviewTemplates, 
    projects = [], // Default to empty array
    preSelectedCandidate, 
    onClose, 
    onSchedule 
}) => {
    const [formData, setFormData] = React.useState({
        candidate_id: preSelectedCandidate?.id || '',
        template_id: '',
        interview_date: '',
        interviewer: currentUser.name,
        notes: '',
        project_id: '' // Simple project ID storage
    });

    React.useEffect(() => {
        if (preSelectedCandidate) {
            setFormData(prev => ({...prev, candidate_id: preSelectedCandidate.id}));
        }
    }, [preSelectedCandidate]);

    // Get active projects (not archived)
    const activeProjects = React.useMemo(() => {
        if (!projects || !Array.isArray(projects)) return [];
        return projects.filter(project => !project.archived).sort((a, b) => a.name.localeCompare(b.name));
    }, [projects]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const template = interviewTemplates.find(t => t.id === parseInt(formData.template_id));
        const candidate = candidates.find(c => c.id === parseInt(formData.candidate_id));
        const selectedProject = formData.project_id ? activeProjects.find(p => p.id === parseInt(formData.project_id)) : null;
        
        await onSchedule({
            ...formData,
            candidate_id: parseInt(formData.candidate_id),
            template_id: parseInt(formData.template_id),
            project_id: formData.project_id ? parseInt(formData.project_id) : null,
            template_name: template.name,
            candidate_name: candidate.name,
            project_name: selectedProject ? selectedProject.name : null,
            duration: template.duration,
            type: template.type
        });
    };

    return (
        <div className="modal">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <h2 style={{ marginBottom: '30px', color: 'var(--text-primary)' }}>
                    📅 Schedule Interview
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Candidate *</label>
                        <select
                            className="form-input"
                            required
                            value={formData.candidate_id}
                            onChange={(e) => setFormData({...formData, candidate_id: e.target.value})}
                        >
                            <option value="">Select Candidate</option>
                            {candidates.map(candidate => (
                                <option key={candidate.id} value={candidate.id}>
                                    {candidate.name} - {candidate.job_title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* FIXED: Simple Project Dropdown */}
                    <div className="form-group">
                        <label className="form-label">
                            Project (Optional)
                            <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                Select a project for this interview
                            </span>
                        </label>
                        <select
                            className="form-input"
                            value={formData.project_id}
                            onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                        >
                            <option value="">No Project Selected</option>
                            {activeProjects.map(project => (
                                <option key={project.id} value={project.id}>
                                    📁 {project.name} {project.hiring_manager ? `(HM: ${project.hiring_manager})` : ''}
                                </option>
                            ))}
                        </select>
                        
                        {/* Show selected project info */}
                        {formData.project_id && (
                            <div style={{
                                marginTop: '8px',
                                padding: '8px 12px',
                                background: 'rgba(56, 178, 172, 0.1)',
                                border: '1px solid rgba(56, 178, 172, 0.3)',
                                borderRadius: '8px',
                                fontSize: '13px'
                            }}>
                                {(() => {
                                    const selectedProject = activeProjects.find(p => p.id === parseInt(formData.project_id));
                                    return selectedProject ? (
                                        <div>
                                            <div style={{
                                                fontWeight: '600',
                                                color: 'var(--text-primary)',
                                                marginBottom: '2px'
                                            }}>
                                                ✅ Selected: {selectedProject.name}
                                            </div>
                                            {selectedProject.hiring_manager && (
                                                <div style={{ color: 'var(--text-muted)' }}>
                                                    Hiring Manager: {selectedProject.hiring_manager}
                                                </div>
                                            )}
                                            {selectedProject.description && (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                                                    {selectedProject.description.length > 100 
                                                        ? selectedProject.description.substring(0, 100) + '...'
                                                        : selectedProject.description
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Interview Template *</label>
                        <select
                            className="form-input"
                            required
                            value={formData.template_id}
                            onChange={(e) => setFormData({...formData, template_id: e.target.value})}
                        >
                            <option value="">Select Template</option>
                            {interviewTemplates.map(template => (
                                <option key={template.id} value={template.id}>
                                    {template.name} ({template.duration} min)
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Date & Time *</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            required
                            value={formData.interview_date}
                            onChange={(e) => setFormData({...formData, interview_date: e.target.value})}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Interviewer</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.interviewer}
                            onChange={(e) => setFormData({...formData, interviewer: e.target.value})}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Additional notes for the interview..."
                            style={{ minHeight: '80px' }}
                        />
                    </div>
                    
                    <div className="form-buttons">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Schedule Interview
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Create Template Modal Component (unchanged)
const CreateTemplateModal = ({ 
    currentUser, 
    onClose, 
    onCreate 
}) => {
    const [formData, setFormData] = React.useState({
        name: '',
        type: 'technical',
        duration: 60,
        description: '',
        questions: ['']
    });

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, '']
        });
    };

    const updateQuestion = (index, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = value;
        setFormData({
            ...formData,
            questions: newQuestions
        });
    };

    const removeQuestion = (index) => {
        if (formData.questions.length > 1) {
            const newQuestions = formData.questions.filter((_, i) => i !== index);
            setFormData({
                ...formData,
                questions: newQuestions
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onCreate({
            ...formData,
            questions: formData.questions.filter(q => q.trim() !== '')
        });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2 style={{ marginBottom: '30px', color: 'var(--text-primary)' }}>
                    📝 Create Interview Template
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Template Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g., Technical Screen - Frontend"
                        />
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px'
                    }}>
                        <div className="form-group">
                            <label className="form-label">Interview Type</label>
                            <select
                                className="form-input"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="technical">Technical</option>
                                <option value="behavioral">Behavioral</option>
                                <option value="leadership">Leadership</option>
                                <option value="cultural">Cultural Fit</option>
                                <option value="final">Final Round</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Duration (minutes)</label>
                            <input
                                type="number"
                                className="form-input"
                                min="15"
                                max="180"
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe the purpose and focus of this interview..."
                            style={{ minHeight: '80px' }}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Interview Questions *</label>
                        {formData.questions.map((question, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '10px'
                            }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={question}
                                    onChange={(e) => updateQuestion(index, e.target.value)}
                                    placeholder={`Question ${index + 1}...`}
                                    style={{ flex: 1 }}
                                />
                                {formData.questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(index)}
                                        style={{
                                            background: 'rgba(252, 129, 129, 0.1)',
                                            color: '#fc8181',
                                            border: '1px solid rgba(252, 129, 129, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addQuestion}
                            style={{
                                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            + Add Question
                        </button>
                    </div>
                    
                    <div className="form-buttons">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create Template
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// NEW: Edit Template Modal Component
const EditTemplateModal = ({ 
    currentUser, 
    template,
    onClose, 
    onEdit 
}) => {
    const [formData, setFormData] = React.useState({
        name: template.name || '',
        type: template.type || 'technical',
        duration: template.duration || 60,
        description: template.description || '',
        questions: template.questions && template.questions.length > 0 ? [...template.questions] : ['']
    });

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, '']
        });
    };

    const updateQuestion = (index, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = value;
        setFormData({
            ...formData,
            questions: newQuestions
        });
    };

    const removeQuestion = (index) => {
        if (formData.questions.length > 1) {
            const newQuestions = formData.questions.filter((_, i) => i !== index);
            setFormData({
                ...formData,
                questions: newQuestions
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onEdit(template.id, {
            ...formData,
            questions: formData.questions.filter(q => q.trim() !== '')
        });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2 style={{ marginBottom: '30px', color: 'var(--text-primary)' }}>
                    ✏️ Edit Interview Template
                </h2>
                
                <div style={{
                    background: 'rgba(237, 137, 54, 0.1)',
                    border: '1px solid rgba(237, 137, 54, 0.3)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    marginBottom: '20px'
                }}>
                    ✏️ You are editing the template: <strong>{template.name}</strong>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Template Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g., Technical Screen - Frontend"
                        />
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px'
                    }}>
                        <div className="form-group">
                            <label className="form-label">Interview Type</label>
                            <select
                                className="form-input"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="technical">Technical</option>
                                <option value="behavioral">Behavioral</option>
                                <option value="leadership">Leadership</option>
                                <option value="cultural">Cultural Fit</option>
                                <option value="final">Final Round</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Duration (minutes)</label>
                            <input
                                type="number"
                                className="form-input"
                                min="15"
                                max="180"
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe the purpose and focus of this interview..."
                            style={{ minHeight: '80px' }}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Interview Questions *</label>
                        {formData.questions.map((question, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '10px'
                            }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={question}
                                    onChange={(e) => updateQuestion(index, e.target.value)}
                                    placeholder={`Question ${index + 1}...`}
                                    style={{ flex: 1 }}
                                />
                                {formData.questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(index)}
                                        style={{
                                            background: 'rgba(252, 129, 129, 0.1)',
                                            color: '#fc8181',
                                            border: '1px solid rgba(252, 129, 129, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addQuestion}
                            style={{
                                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            + Add Question
                        </button>
                    </div>
                    
                    <div className="form-buttons">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Update Template
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Enhanced Interview Feedback Modal Component with Project Display (unchanged from previous version)
const InterviewFeedbackModal = ({ 
    interview, 
    candidate, 
    template, 
    project, // NEW: Project prop
    onClose, 
    onSubmit 
}) => {

    // ADD THIS DEBUG CODE
    console.log('=== CANDIDATE DEBUG ===');
    console.log('Full candidate object:', candidate);
    console.log('attached_pdfs:', candidate?.attached_pdfs);
    console.log('linkedin_url:', candidate?.linkedin_url);
    console.log('interviewPDFs:', candidate?.interviewPDFs);
    console.log('=======================');
    // Initialize with existing feedback if available
    const [feedbackData, setFeedbackData] = React.useState({
        rating: interview.feedback?.rating || 5,
        notes: interview.feedback?.notes || '',
        strengths: interview.feedback?.strengths || '',
        concerns: interview.feedback?.concerns || '',
        recommendation: interview.feedback?.recommendation || 'proceed',
        question_responses: interview.feedback?.question_responses || 
            template?.questions?.map(q => ({ question: q, response: '' })) || []
    });

    // ✨ AI Features State
    const [aiAnalysis, setAiAnalysis] = React.useState(null);
    const [aiProcessing, setAiProcessing] = React.useState(false);
    const [showAiSummary, setShowAiSummary] = React.useState(false);
    const [realTimeInsights, setRealTimeInsights] = React.useState(null);

    // Document Viewer State
    const [showDocumentViewer, setShowDocumentViewer] = React.useState(false);
    const [selectedDocument, setSelectedDocument] = React.useState(null);
    const [documentPanelWidth, setDocumentPanelWidth] = React.useState(40); // percentage
    const [isResizing, setIsResizing] = React.useState(false);

    // Get all available documents for the candidate
    const candidateDocuments = React.useMemo(() => {
        const docs = [];
        
        // 1. Check uploaded documents (from candidate profile drag-and-drop)
        if (candidate.documents && Array.isArray(candidate.documents) && candidate.documents.length > 0) {
            candidate.documents.forEach((doc, index) => {
                docs.push({
                    id: doc.id || `doc_${index}`,
                    name: doc.name || `Document ${index + 1}`,
                    type: 'pdf',
                    data: doc.originalFile || doc.file || doc.data, // Use originalFile like candidate detail modal
                    size: doc.size,
                    uploadedBy: doc.uploadedBy,
                    uploadedAt: doc.uploadDate
                });
            });
        }
        
        // 2. Check interview PDFs (from feedback submissions)
        if (candidate.interviewPDFs && Array.isArray(candidate.interviewPDFs) && candidate.interviewPDFs.length > 0) {
            candidate.interviewPDFs.forEach((pdf, index) => {
                docs.push({
                    id: pdf.id || `interview_pdf_${index}`,
                    name: pdf.filename || 'Interview Report.pdf',
                    type: 'pdf',
                    data: pdf.data,
                    size: pdf.size,
                    uploadedBy: pdf.interviewer,
                    uploadedAt: pdf.timestamp
                });
            });
        }
        
        // 3. Check attached_pdfs (from recruitment chatbot)
        if (candidate.attached_pdfs && Array.isArray(candidate.attached_pdfs) && candidate.attached_pdfs.length > 0) {
            candidate.attached_pdfs.forEach((pdf, index) => {
                docs.push({
                    id: pdf.id || `attached_pdf_${index}`,
                    name: pdf.filename || 'LinkedIn Profile.pdf',
                    type: 'pdf',
                    data: pdf.data,
                    size: pdf.size,
                    uploadedBy: pdf.interviewer,
                    uploadedAt: pdf.timestamp
                });
            });
        }
        
        // 4. Add LinkedIn URL
        if (candidate.linkedin_url) {
            docs.push({
                id: 'linkedin_url',
                name: 'LinkedIn Profile (Web)',
                type: 'url',
                data: candidate.linkedin_url
            });
        }
        
        return docs;
    }, [candidate]);

    // Auto-select first document when panel opens
    React.useEffect(() => {
        if (showDocumentViewer && !selectedDocument && candidateDocuments.length > 0) {
            setSelectedDocument(candidateDocuments[0]);
        }
    }, [showDocumentViewer, candidateDocuments, selectedDocument]);

    // Handle document panel resizing
    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handleResizeMove = React.useCallback((e) => {
        if (!isResizing) return;
        
        const container = document.querySelector('.interview-feedback-container');
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;
        
        // Constrain between 25% and 60%
        const constrainedWidth = Math.min(Math.max(newWidth, 25), 60);
        setDocumentPanelWidth(constrainedWidth);
    }, [isResizing]);

    const handleResizeEnd = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    // Pop-out document in new window
    const popOutDocument = () => {
        if (!selectedDocument) return;
        
        if (selectedDocument.type === 'pdf') {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <html>
                    <head>
                        <title>${selectedDocument.name}</title>
                        <style>
                            body { margin: 0; padding: 0; }
                            iframe { width: 100vw; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${selectedDocument.data}"></iframe>
                    </body>
                </html>
            `);
        } else if (selectedDocument.type === 'url') {
            window.open(selectedDocument.data, '_blank');
        }
    };

    const isEditMode = !!interview.feedback;

    // ✨ Real-time AI analysis as user types
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (feedbackData.notes.length > 50 || feedbackData.strengths.length > 20 || feedbackData.concerns.length > 20) {
                generateRealTimeInsights();
            }
        }, 2000); // Wait 2 seconds after user stops typing

        return () => clearTimeout(timer);
    }, [feedbackData.notes, feedbackData.strengths, feedbackData.concerns]);

    // ✨ Generate real-time insights
    const generateRealTimeInsights = async () => {
        if (!window.AIAssistant) return;

        try {
            const mockInterviewData = {
                feedback: feedbackData,
                sentiment: 'neutral',
                recommended_action: feedbackData.recommendation
            };

            const insights = window.AIAssistant.generateInterviewSummary(mockInterviewData, candidate);
            setRealTimeInsights(insights);
        } catch (error) {
            console.error('Real-time AI insights error:', error);
        }
    };

    // ✨ Generate comprehensive AI analysis
    const generateAIAnalysis = async () => {
        if (!window.AIAssistant) return;

        setAiProcessing(true);
        try {
            const mockInterviewData = {
                feedback: feedbackData,
                ai_summary: '',
                sentiment: 'neutral',
                recommended_action: feedbackData.recommendation
            };

            const analysis = window.AIAssistant.generateInterviewSummary(mockInterviewData, candidate);
            setAiAnalysis(analysis);
            setShowAiSummary(true);
        } catch (error) {
            console.error('AI analysis error:', error);
        } finally {
            setAiProcessing(false);
        }
    };

   // ✨ Apply AI suggestions to form
const applyAISuggestions = () => {
    if (!aiAnalysis) {
        alert('No AI analysis available to apply.');
        return;
    }

    console.log('🤖 Applying AI suggestions to form...', aiAnalysis);

    // Apply executive summary to notes if notes are empty or short
    if (feedbackData.notes.length < 100 && aiAnalysis.executiveSummary) {
        setFeedbackData(prev => ({
            ...prev,
            notes: aiAnalysis.executiveSummary
        }));
        console.log('✅ Applied executive summary to notes');
    }

    // Apply recommended rating based on analysis
    if (aiAnalysis.analysis && aiAnalysis.analysis.overall_impression) {
        const suggestedRating = Math.round(aiAnalysis.analysis.overall_impression * 10);
        
        if (Math.abs(suggestedRating - feedbackData.rating) > 1) {
            setFeedbackData(prev => ({
                ...prev,
                rating: suggestedRating
            }));
            console.log('✅ Applied suggested rating:', suggestedRating);
        }
    }

    // Apply AI recommendation if different and confident
    if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0) {
        const topRecommendation = aiAnalysis.recommendations[0];
        const currentRec = feedbackData.recommendation;
        
        // Map AI recommendation types to form values
        const recMapping = {
            'strong_advance': 'proceed',
            'advance': 'proceed', 
            'conditional': 'review',
            'decline': 'decline',
            'technical_followup': 'review',
            'reference_check': 'review'
        };
        
        const aiRecommendation = recMapping[topRecommendation.type] || currentRec;
        
        if (aiRecommendation !== currentRec && topRecommendation.confidence !== 'low') {
            setFeedbackData(prev => ({
                ...prev,
                recommendation: aiRecommendation
            }));
            console.log('✅ Applied AI recommendation:', aiRecommendation);
        }
    }

    // Apply key insights to strengths/concerns if they're empty
    if (aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0) {
        const strengthInsights = aiAnalysis.keyInsights.filter(insight => 
            insight.category === 'technical' || insight.category === 'soft_skills' || insight.category === 'performance'
        );
        const concernInsights = aiAnalysis.keyInsights.filter(insight => 
            insight.category === 'risk' || insight.importance === 'critical'
        );
        
        // Apply strengths
        if (feedbackData.strengths.length < 50 && strengthInsights.length > 0) {
            const strengthsText = strengthInsights
                .slice(0, 3)
                .map(insight => `• ${insight.insight}`)
                .join('\n');
            setFeedbackData(prev => ({
                ...prev,
                strengths: strengthsText
            }));
            console.log('✅ Applied AI insights to strengths');
        }
        
        // Apply concerns
        if (feedbackData.concerns.length < 50 && concernInsights.length > 0) {
            const concernsText = concernInsights
                .slice(0, 2)
                .map(insight => `• ${insight.insight}`)
                .join('\n');
            setFeedbackData(prev => ({
                ...prev,
                concerns: concernsText
            }));
            console.log('✅ Applied AI insights to concerns');
        }
    }

    // Show success message
    alert('🤖 AI suggestions applied successfully!\n\nThe form has been updated with:\n• Executive summary\n• Suggested rating\n• Recommendation\n• Key insights');
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhance feedback data with AI analysis before saving
    const enhancedFeedbackData = {
        ...feedbackData,
        // Save AI analysis data
        ai_analysis: aiAnalysis ? {
            overall_impression: aiAnalysis.analysis?.overall_impression,
            technical_skills: aiAnalysis.analysis?.technical_skills,
            communication: aiAnalysis.analysis?.communication,
            problem_solving: aiAnalysis.analysis?.problem_solving,
            cultural_fit: aiAnalysis.analysis?.cultural_fit,
            leadership_potential: aiAnalysis.analysis?.leadership_potential,
            growth_potential: aiAnalysis.analysis?.growth_potential,
            confidence_score: aiAnalysis.confidenceScore,
            detected_skills: aiAnalysis.analysis?._detectedSkills?.slice(0, 10) || [],
            sentiment_score: aiAnalysis.analysis?._sentimentScore,
            generated_at: aiAnalysis.generatedAt
        } : null,
        // Save key insights
        ai_insights: aiAnalysis?.keyInsights?.slice(0, 8) || [],
        // Save recommendations  
        ai_recommendations: aiAnalysis?.recommendations?.slice(0, 5) || [],
        // Save risk factors
        ai_risk_factors: aiAnalysis?.riskFactors?.slice(0, 6) || [],
        // Save executive summary
        ai_executive_summary: aiAnalysis?.executiveSummary || null
    };
    
    console.log('💾 Saving enhanced feedback with AI data:', enhancedFeedbackData);
    
    await onSubmit(interview.id, enhancedFeedbackData);
};

    const handleFieldChange = (field, value) => {
        setFeedbackData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="modal">
            <div 
                className="modal-content interview-feedback-container" 
                style={{ 
                    maxWidth: showDocumentViewer ? '95vw' : '1000px',
                    width: showDocumentViewer ? '95vw' : 'auto',
                    height: showDocumentViewer ? '90vh' : 'auto',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px'
                }}>
                    <div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>
                            📝 {isEditMode ? '✏️ Edit' : '➕ Add'} Interview Feedback
                        </h2>
                        {true && (
                            <button
                                type="button"
                                onClick={() => setShowDocumentViewer(!showDocumentViewer)}
                                style={{
                                    background: showDocumentViewer 
                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                        : 'linear-gradient(135deg, #667eea, #764ba2)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                📄 {showDocumentViewer ? 'Hide' : 'View'} Documents ({candidateDocuments.length})
                            </button>
                        )}
                        {isEditMode && (
                            <div style={{
                                background: 'rgba(237, 137, 54, 0.1)',
                                border: '1px solid rgba(237, 137, 54, 0.3)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: 'var(--text-primary)',
                                fontWeight: '600',
                                marginBottom: '10px'
                            }}>
                                ✏️ You are editing existing feedback. Changes will overwrite the current feedback.
                            </div>
                        )}
                        {realTimeInsights && (
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--accent-color)',
                                fontWeight: '600'
                            }}>
                                🤖 AI Confidence: {Math.round(realTimeInsights.confidenceScore * 100)}%
                            </div>
                        )}
                    </div>
                    
                    {/* ✨ AI Actions */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={generateAIAnalysis}
                            disabled={aiProcessing}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                cursor: aiProcessing ? 'not-allowed' : 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {aiProcessing ? '🤖 Analyzing...' : '🤖 AI Analysis'}
                        </button>
                        
                        {aiAnalysis && (
                            <button
                                type="button"
                                onClick={applyAISuggestions}
                                style={{
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                ✨ Apply AI Suggestions
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Enhanced Interview Info with Project */}
                <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {candidate?.name} - {template?.name}
                    </div>
                    <div style={{ 
                        fontSize: '14px', 
                        color: 'var(--text-tertiary)', 
                        marginTop: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        <span>
                            {new Date(interview.interview_date).toLocaleDateString()} | 
                            {interview.interviewer} | {template?.duration} minutes
                        </span>
                        {/* NEW: Project Info Display */}
                        {project && (
                            <span style={{
                                background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                                color: 'white',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                📁 {project.name}
                            </span>
                        )}
                    </div>
                    {isEditMode && (
                        <div style={{ 
                            fontSize: '12px', 
                            color: 'var(--accent-color)', 
                            marginTop: '10px',
                            fontWeight: '600'
                        }}>
                            ✏️ Editing existing feedback
                        </div>
                    )}
                </div>

                {/* ✨ AI Summary Panel */}
                {showAiSummary && aiAnalysis && (
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                        }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
                                📊 AI Interview Analysis
                            </h4>
                            <button
                                onClick={() => setShowAiSummary(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {/* Executive Summary */}
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                                    📋 Executive Summary:
                                </div>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    lineHeight: '1.5'
                                }}>
                                    {aiAnalysis.executiveSummary}
                                </div>
                            </div>

                            {/* Performance Analysis - Updated to use Interactive Skills Assessment data */}
<div>
    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
        📊 Performance Breakdown:
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {(() => {
            // Use updated skills assessment if available, otherwise fall back to original AI analysis
            const skillsToDisplay = feedbackData.skillsAssessment || aiAnalysis.analysis || {};
            
            return Object.entries(skillsToDisplay).map(([key, skillData]) => {
                // Handle both formats: updated skills (object) vs original analysis (number)
                const value = typeof skillData === 'object' ? 
                    (skillData.humanScore !== null ? skillData.humanScore : skillData.aiScore) : 
                    skillData;
                
                const label = typeof skillData === 'object' && skillData.label ? 
                    skillData.label : 
                    key.replace(/_/g, ' ');
                
                const hasHumanOverride = typeof skillData === 'object' && skillData.humanScore !== null;
                
                return (
                    <div key={key} style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '10px',
                        borderRadius: '6px',
                        position: 'relative'
                    }}>
                        {/* Show indicator if human override exists */}
                        {hasHumanOverride && (
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '6px',
                                height: '6px',
                                background: '#3b82f6',
                                borderRadius: '50%',
                                title: 'Human adjusted'
                            }}></div>
                        )}
                        
                        <div style={{ 
                            fontSize: '11px', 
                            marginBottom: '4px', 
                            textTransform: 'capitalize',
                            fontWeight: hasHumanOverride ? '600' : '400'
                        }}>
                            {label}
                            {hasHumanOverride && (
                                <span style={{ 
                                    fontSize: '10px', 
                                    color: '#3b82f6', 
                                    marginLeft: '4px' 
                                }}>
                                    (Adjusted)
                                </span>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.3)',
                                borderRadius: '10px',
                                height: '6px',
                                flex: 1,
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    background: value > 0.7 ? '#4ade80' : value > 0.4 ? '#fbbf24' : '#ef4444',
                                    height: '100%',
                                    width: `${Math.round(value * 100)}%`,
                                    borderRadius: '10px',
                                    transition: 'all 0.3s ease'
                                }}></div>
                            </div>
                            <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '600',
                                color: hasHumanOverride ? '#3b82f6' : 'white'
                            }}>
                                {Math.round(value * 100)}%
                            </span>
                        </div>
                        
                        {/* Show AI vs Human scores when there's an override */}
                        {hasHumanOverride && typeof skillData === 'object' && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '4px',
                                fontSize: '9px',
                                opacity: 0.7
                            }}>
                                <span>AI: {Math.round(skillData.aiScore * 100)}%</span>
                                <span>You: {Math.round(skillData.humanScore * 100)}%</span>
                            </div>
                        )}
                    </div>
                );
            });
        })()}
    </div>
</div>

                            {/* Key Insights */}
                            {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                                        💡 Key Insights:
                                    </div>
                                    <div style={{ display: 'grid', gap: '6px' }}>
                                        {aiAnalysis.keyInsights.map((insight, index) => (
                                            <div key={index} style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span>{insight.insight}</span>
                                                <span style={{
                                                    background: insight.importance === 'high' ? '#ef4444' : '#fbbf24',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '8px',
                                                    fontSize: '10px'
                                                }}>
                                                    {insight.importance}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                                        🎯 AI Recommendations:
                                    </div>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {aiAnalysis.recommendations.map((rec, index) => (
                                            <div key={index} style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '10px',
                                                borderRadius: '6px'
                                            }}>
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    fontWeight: '600',
                                                    marginBottom: '4px',
                                                    color: rec.type === 'advance' ? '#4ade80' :
                                                           rec.type === 'decline' ? '#ef4444' : '#fbbf24'
                                                }}>
                                                    {rec.type.toUpperCase()}: {rec.text}
                                                </div>
                                                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                                                    {rec.reasoning} (Confidence: {rec.confidence})
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Next Steps */}
                            {aiAnalysis.nextSteps && aiAnalysis.nextSteps.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                                        ➡️ Suggested Next Steps:
                                    </div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '10px',
                                        borderRadius: '6px'
                                    }}>
                                        <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                            {aiAnalysis.nextSteps.slice(0, 4).map((step, index) => (
                                                <li key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ✨ Interactive Skills Assessment */}
                {showAiSummary && aiAnalysis && window.InteractiveSkillsAssessment && (
                    <window.InteractiveSkillsAssessment 
                        aiAnalysis={aiAnalysis}
                        candidate={candidate}
                        onSkillsUpdate={(updatedSkills) => {
                            console.log('Skills updated:', updatedSkills);
                            
                            // Store skills data with feedback
                            setFeedbackData(prev => ({
                                ...prev,
                                skillsAssessment: updatedSkills
                            }));
                            
                            // Force a re-render to ensure the performance breakdown updates immediately
                            setTimeout(() => {
                                console.log('Performance breakdown should now reflect updated skills');
                            }, 0);
                        }}
                    />
                )}

                {/* ✨ Real-time Insights Banner */}
                {realTimeInsights && !showAiSummary && (
                    <div style={{
                        background: 'rgba(72, 187, 120, 0.1)',
                        border: '1px solid rgba(72, 187, 120, 0.3)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '13px'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                            🤖 AI Real-time Insights:
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            Confidence: {Math.round(realTimeInsights.confidenceScore * 100)}% | 
                            {realTimeInsights.recommendations && realTimeInsights.recommendations.length > 0 && (
                                <span> Recommendation: <strong>{realTimeInsights.recommendations[0].type}</strong> | </span>
                            )}
                            {realTimeInsights.riskFactors && realTimeInsights.riskFactors.length > 0 && (
                                <span> ⚠️ {realTimeInsights.riskFactors.length} risk factor(s) identified</span>
                            )}
                        </div>
                        </div>
                )}
                
                <div style={{ display: 'flex', flex: 1, gap: '0', overflow: 'hidden', minHeight: 0 }}>
                    <div style={{ flex: showDocumentViewer ? `0 0 ${100 - documentPanelWidth}%` : '1', overflowY: 'auto', paddingRight: showDocumentViewer ? '20px' : '0' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    {/* Rating Section */}
                    <div className="form-group">
                        <label className="form-label">Overall Rating *</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={feedbackData.rating}
                                onChange={(e) => handleFieldChange('rating', parseInt(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <span style={{
                                fontWeight: '700',
                                fontSize: '18px',
                                color: feedbackData.rating >= 8 ? '#48bb78' :
                                       feedbackData.rating >= 6 ? '#ed8936' : '#fc8181',
                                minWidth: '40px'
                            }}>
                                {feedbackData.rating}/10
                            </span>
                        </div>
                        {realTimeInsights && realTimeInsights.analysis && (
                            <div style={{ 
                                fontSize: '12px', 
                                color: 'var(--text-tertiary)', 
                                marginTop: '5px' 
                            }}>
                                AI suggested rating: {Math.round(Object.values(realTimeInsights.analysis).reduce((sum, val) => sum + val, 0) / Object.keys(realTimeInsights.analysis).length * 10)}/10
                            </div>
                        )}
                    </div>
                    
                    <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px'
}}>
    <div className="form-group">
        <label className="form-label">Key Strengths</label>
        <RichTextEditor
            value={feedbackData.strengths}
            onChange={(content) => handleFieldChange('strengths', content)}
            placeholder="What did the candidate do well? Use bullet points for clear structure..."
            minHeight="180px"  // ← Much bigger!
        />
    </div>
    
    <div className="form-group">
        <label className="form-label">Areas of Concern</label>
        <RichTextEditor
            value={feedbackData.concerns}
            onChange={(content) => handleFieldChange('concerns', content)}
            placeholder="Any concerns or areas for improvement? Use numbered lists for priorities..."
            minHeight="180px"  // ← Much bigger!
        />
    </div>
</div>
                    
                    <div className="form-group">
    <label className="form-label">Interview Notes</label>
    <RichTextEditor
        value={feedbackData.notes}
        onChange={(content) => handleFieldChange('notes', content)}
        placeholder="Detailed notes from the interview..."
        minHeight="220px"
    />
    {realTimeInsights && realTimeInsights.executiveSummary && feedbackData.notes.length < 50 && (
        <div style={{
            fontSize: '12px',
            color: 'var(--accent-color)',
            marginTop: '5px',
            fontStyle: 'italic'
        }}>
            💡 Tip: AI can generate detailed notes based on your strengths and concerns
        </div>
    )}
</div>
                    
                    <div className="form-group">
                        <label className="form-label">Recommendation</label>
                        <select
                            className="form-input"
                            value={feedbackData.recommendation}
                            onChange={(e) => handleFieldChange('recommendation', e.target.value)}
                        >
                            <option value="advance">Advance to Next Round</option>
                            <option value="proceed">Proceed with Caution</option>
                            <option value="review">Further Review Needed</option>
                            <option value="decline">Do Not Proceed</option>
                        </select>
                        {realTimeInsights && realTimeInsights.recommendations && realTimeInsights.recommendations.length > 0 && (
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-tertiary)',
                                marginTop: '5px'
                            }}>
                                AI recommendation: <strong>{realTimeInsights.recommendations[0].type}</strong> 
                                ({realTimeInsights.recommendations[0].confidence} confidence)
                            </div>
                        )}
                    </div>
                    
                    {/* Question Responses */}
                    {template?.questions && template.questions.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Question Responses (Optional)</label>
                            {template.questions.map((question, index) => (
                                <div key={index} style={{ marginBottom: '15px' }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '5px'
                                    }}>
                                        Q{index + 1}: {question}
                                    </div>
                                    <RichTextEditor
    value={feedbackData.question_responses[index]?.response || ''}
    onChange={(content) => {
        const newResponses = [...feedbackData.question_responses];
        newResponses[index] = {
            question,
            response: content
        };
        handleFieldChange('question_responses', newResponses);
    }}
    placeholder="Candidate's response and your assessment..."
    minHeight="140px"
/>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="form-buttons">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {isEditMode ? 'Update' : 'Submit'} Feedback
                        </button>
                    </div>
                </form>
                    </div>
{/* Resize Handle */}
{showDocumentViewer && (
                        <div
                            onMouseDown={handleResizeStart}
                            style={{
                                width: '4px',
                                cursor: 'ew-resize',
                                background: isResizing ? '#667eea' : '#e2e8f0',
                                transition: 'background 0.2s',
                                flexShrink: 0
                            }}
                        />
                    )}

                    {/* Document Viewer Panel */}
                    {showDocumentViewer && (
                        <div style={{
                            flex: `0 0 ${documentPanelWidth}%`,
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'var(--card-bg)',
                            borderLeft: '1px solid var(--border-color)',
                            overflow: 'hidden'
                        }}>
                            {/* Document Header */}
                            <div style={{
                                padding: '16px',
                                borderBottom: '1px solid var(--border-color)',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                                        📄 Documents ({candidateDocuments.length})
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={popOutDocument}
                                        disabled={!selectedDocument}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            cursor: selectedDocument ? 'pointer' : 'not-allowed',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            opacity: selectedDocument ? 1 : 0.5
                                        }}
                                        title="Open in new window"
                                    >
                                        ⤢ Pop Out
                                    </button>
                                </div>
                                
                                {/* Document Tabs */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {candidateDocuments.map(doc => (
                                        <button
                                            key={doc.id}
                                            type="button"
                                            onClick={() => setSelectedDocument(doc)}
                                            style={{
                                                background: selectedDocument?.id === doc.id 
                                                    ? 'rgba(255,255,255,0.3)' 
                                                    : 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: selectedDocument?.id === doc.id 
                                                    ? '2px solid white' 
                                                    : '2px solid transparent',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {doc.type === 'pdf' ? '📄' : '🔗'} {doc.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Document Viewer */}
                            <div style={{ 
                                flex: 1, 
                                overflow: 'auto',
                                background: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {selectedDocument && selectedDocument.type === 'pdf' && (
                                    <iframe
                                        src={selectedDocument.data}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            border: 'none',
                                            borderRadius: '8px',
                                            background: 'white'
                                        }}
                                        title={selectedDocument.name}
                                    />
                                )}
                                {!selectedDocument && (
                                    <div style={{
                                        textAlign: 'center',
                                        color: 'var(--text-tertiary)',
                                        padding: '40px'
                                    }}>
                                        <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📄</p>
                                    <p style={{ margin: 0 }}>Select a document to view</p>
                                </div>
                            )}
                        </div>
                        </div>
                )}
                </div>
            </div>
        </div>
    );
};

// Export to global scope
window.InterviewsComponent = InterviewsComponent;
window.ScheduleInterviewModal = ScheduleInterviewModal;
window.CreateTemplateModal = CreateTemplateModal;
window.EditTemplateModal = EditTemplateModal;
window.InterviewFeedbackModal = InterviewFeedbackModal;
