
// Main RecruitPro Application - FIXED INTERVIEW FEEDBACK STATE MANAGEMENT
const RecruitProApp = () => {
    console.log('RecruitPro starting...');
    
    // Core state
    const [currentUser, setCurrentUser] = React.useState(null);
    const [candidates, setCandidates] = React.useState([]);
    const [projects, setProjects] = React.useState([]);
    const [interviews, setInterviews] = React.useState([]);
    const [interviewTemplates, setInterviewTemplates] = React.useState([]);
    const [loginSessions, setLoginSessions] = React.useState([]);
    const [warmCandidates, setWarmCandidates] = React.useState([]);
    const [companies, setCompanies] = React.useState([]);  // ADD THIS LINE

    // Check for existing session on component mount
    React.useEffect(() => {
        const existingUser = window.multiUserAuth?.getCurrentUser();
        if (existingUser) {
            setCurrentUser(existingUser);
            console.log('🔐 Restored session for:', existingUser.name);
        }
    }, []);

    
    // UI state
    const [activeTab, setActiveTab] = React.useState('candidates');
    const [loading, setLoading] = React.useState(false);
    const [isOnline, setIsOnline] = React.useState(false);
    
    // Modal states
    const [showInterviewModal, setShowInterviewModal] = React.useState(false);
    const [preSelectedCandidate, setPreSelectedCandidate] = React.useState(null);

    // Initialize theme on mount
    React.useEffect(() => {
        helpers.themeManager.init();
    }, []);

    // FIXED: Enhanced debug effect to track candidates state changes and interview feedback
    React.useEffect(() => {
        console.log('📊 App - Candidates state updated:', candidates.length, 'candidates');
        
        // Debug interview feedback for each candidate
        candidates.forEach(c => {
            const feedbackCount = (c.interview_feedback || []).length;
            if (feedbackCount > 0) {
                console.log(`📊 Candidate ${c.name} has ${feedbackCount} feedback entries`);
                c.interview_feedback.forEach((feedback, index) => {
                    console.log(`  📝 Feedback ${index + 1}: Rating ${feedback.feedback?.rating}/10, Sentiment: ${feedback.sentiment}`);
                });
            }
        });
        
        // Log storage contents for verification
        const storageContents = helpers.storage.load('recruitpro_candidates') || [];
        const storageWithFeedback = storageContents.filter(c => c.interview_feedback && c.interview_feedback.length > 0);
        console.log(`📊 Storage verification: ${storageWithFeedback.length}/${storageContents.length} candidates have feedback`);
        
    }, [candidates]);

    // ADD THIS NEW DEBUG CODE HERE:
    React.useEffect(() => {
        console.log('🤖 CHATBOT DEBUG - Candidates state changed. New count:', candidates.length);
        candidates.forEach((candidate, index) => {
            console.log(`🤖 Candidate ${index + 1}:`, candidate.name, '(ID:', candidate.id, ')');
        });
    }, [candidates]);

    // Load data when user logs in
    React.useEffect(() => {
        if (currentUser) {
            console.log('User logged in, loading data...');
            loadData();
        }
    }, [currentUser]);

    // FIXED: Smart auto-refresh that doesn't overwrite chatbot candidates
React.useEffect(() => {
    if (!currentUser) return;

    const refreshInterval = setInterval(async () => {
        try {
            const result = await api.getCandidates();
            if (result.data) {
                // Get current local data
                const currentData = JSON.stringify(candidates);
                const serverData = JSON.stringify(result.data);
                
                if (currentData !== serverData) {
                    console.log('🔄 Auto-refresh detected changes...');
                    
                    // SMART MERGE: Keep any candidates created in last 30 seconds
                    const now = new Date();
                    const recentCandidates = candidates.filter(c => {
                        const createdTime = new Date(c.created_at);
                        const timeDiff = (now - createdTime) / 1000; // seconds
                        const isRecent = timeDiff < 30; // Keep candidates created in last 30 seconds
                        
                        if (isRecent) {
                            console.log(`🤖 Protecting recent candidate: ${c.name} (created ${timeDiff}s ago)`);
                        }
                        
                        return isRecent;
                    });
                    
                    // Merge server data with recent local candidates
                    const serverCandidateIds = new Set(result.data.map(c => c.id));
                    const candidatesToKeep = recentCandidates.filter(c => !serverCandidateIds.has(c.id));
                    
                    if (candidatesToKeep.length > 0) {
                        console.log(`🤖 Keeping ${candidatesToKeep.length} recent chatbot candidates`);
                        const mergedCandidates = [...candidatesToKeep, ...result.data];
                        setCandidates(mergedCandidates);
                    } else {
                        console.log('🔄 Using server data (no recent candidates to protect)');
                        setCandidates(result.data);
                    }
                } else {
                    // console.log('🔄 No changes detected, skipping refresh');
                }
            }
        } catch (error) {
            console.error('Auto-refresh error:', error);
        }
    }, 3000); // Still refresh every 3 seconds, but smarter

    return () => clearInterval(refreshInterval);
}, [currentUser, candidates]);

    // Check API connection and initialize demo data
    const loadData = async () => {
        setLoading(true);
        
        try {
            // Check API connection
            const connectionStatus = await api.checkConnection();
            setIsOnline(connectionStatus);
            
            if (!connectionStatus) {
                console.log('API offline, initializing demo data...');
                await api.initializeDemoData();
            }
            
            // Load all data with enhanced error handling
const results = await Promise.allSettled([
    loadCandidates(),
    loadProjects(),
    loadInterviews(),
    loadInterviewTemplates(),
    loadLoginSessions(),
    loadCompanies()  // ⬅️ ADD THIS LINE
]);
            
            // Log any failures
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Failed to load data ${index}:`, result.reason);
                }
            });

            // ADD THIS LINE HERE ⬇️
loadWarmCandidates();
            
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // FIXED: Enhanced loadCandidates with better feedback verification
    const loadCandidates = async () => {
        try {
            const result = await api.getCandidates();
            if (result.data) {
                // Verify and log interview feedback data
                const candidatesWithFeedback = result.data.filter(c => 
                    c.interview_feedback && c.interview_feedback.length > 0
                );
                
                console.log('✅ Loaded candidates:', result.data.length);
                console.log('🎤 Candidates with interview feedback:', candidatesWithFeedback.length);
                
                candidatesWithFeedback.forEach(c => {
                    console.log(`  📝 ${c.name}: ${c.interview_feedback.length} feedback entries`);
                    c.interview_feedback.forEach((feedback, index) => {
                        console.log(`    - Feedback ${index + 1}: ${feedback.feedback?.rating}/10 (${feedback.sentiment})`);
                    });
                });
                
                setCandidates(result.data);
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
        }
    };

    const loadProjects = async () => {
        try {
            const result = await api.getProjects();
            if (result.data) {
                setProjects(result.data);
                console.log('✅ Loaded projects:', result.data.length);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const loadInterviews = async () => {
        try {
            const result = await api.getInterviews();
            if (result.data) {
                setInterviews(result.data);
                console.log('✅ Loaded interviews:', result.data.length);
            }
        } catch (error) {
            console.error('Error loading interviews:', error);
        }
    };

    const loadInterviewTemplates = async () => {
        try {
            const result = await api.getInterviewTemplates();
            if (result.data) {
                setInterviewTemplates(result.data);
                console.log('✅ Loaded interview templates:', result.data.length);
            }
        } catch (error) {
            console.error('Error loading interview templates:', error);
        }
    };

    const loadLoginSessions = () => {
        const sessions = helpers.storage.load('recruitpro_login_sessions') || [];
        setLoginSessions(sessions);
    };

    // ADD THIS NEW FUNCTION:
const loadWarmCandidates = () => {
    const warmCands = helpers.storage.load('recruitpro_warm_candidates') || [];
    setWarmCandidates(warmCands);
    console.log(`🔥 Loaded ${warmCands.length} warm candidates from localStorage`);
};

    // ADD THIS ENTIRE FUNCTION HERE ⬇️
const loadCompanies = async () => {
    try {
        const result = await api.getCompanies();
        if (result.data) {
            setCompanies(result.data);
            console.log(`🏢 Loaded ${result.data.length} companies`);
        }
    } catch (error) {
        console.error('Error loading companies:', error);
        // Fallback to localStorage if API fails
        const fallbackCompanies = helpers.storage.load('recruitpro_companies') || [];
        setCompanies(fallbackCompanies);
        console.log(`📱 Fallback: ${fallbackCompanies.length} companies from localStorage`);
    }
};
// ⬆️ END OF NEW FUNCTION

    // Handle user login
const handleLogin = (user) => {
    console.log('Login successful');
    setCurrentUser(user);
    
    // Check for folder reconnection after successful login
    setTimeout(() => {
        if (window.folderCollaboration) {
            window.folderCollaboration.checkForReconnection();
        }
    }, 2000); // Wait 2 seconds after login
};

// Listen for the new secure auth system
document.addEventListener('userAuthenticated', (event) => {
    const { user, team } = event.detail;
    console.log(`🔐 Authenticated: ${user.name} from ${team?.name || 'RecruitPro'}`);
    handleLogin(user);
});

    // Handle user logout
    const handleLogout = () => {
        setCurrentUser(null);
        setActiveTab('candidates');
        
        // Clear any open modals
        setShowInterviewModal(false);
        setPreSelectedCandidate(null);
    };

    // Handle scheduling interview from candidate card
    const handleScheduleInterview = (candidate) => {
        setPreSelectedCandidate(candidate);
        setShowInterviewModal(true);
        setActiveTab('interviews'); // Switch to interviews tab
    };

    // Handle viewing candidate details
    const handleViewCandidate = (candidate) => {
        // Switch to candidates tab and trigger candidate view
        setActiveTab('candidates');
        // You could implement additional logic here to focus on specific candidate
        // For now, switching to candidates tab is sufficient
    };

    // Handle keeping candidates warm - NEW FUNCTION
const handleKeepWarm = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
        // Add timestamp when moved to warm with attribution
const baseWarmCandidate = {
    ...candidate,
    movedToWarmDate: new Date().toISOString(),
    lastContact: new Date().toISOString(),
    warmStatus: 'fresh'
};
const warmCandidate = window.updateUserAttribution(baseWarmCandidate);

// Move to warm pipeline
const updatedWarmCandidates = [warmCandidate, ...warmCandidates];
setWarmCandidates(updatedWarmCandidates);
helpers.storage.save('recruitpro_warm_candidates', updatedWarmCandidates);
        
        // Remove from active candidates
        const updatedActiveCandidates = candidates.filter(c => c.id !== candidateId);
        setCandidates(updatedActiveCandidates);
        helpers.storage.save('recruitpro_candidates', updatedActiveCandidates); // ADD THIS LINE
        
        console.log(`✅ Moved ${candidate.name} to warm pipeline`);
    }
};

    // FIXED: Enhanced function to force refresh candidate data after interview feedback
    const refreshCandidateData = async () => {
        console.log('🔄 Force refreshing candidate data after interview feedback...');
        try {
            const result = await api.getCandidates();
            if (result.data) {
                setCandidates(result.data);
                console.log('✅ Candidate data refreshed successfully');
                
                // Verify feedback was updated
                const candidatesWithFeedback = result.data.filter(c => 
                    c.interview_feedback && c.interview_feedback.length > 0
                );
                console.log(`📊 After refresh: ${candidatesWithFeedback.length} candidates have feedback`);
            }
        } catch (error) {
            console.error('Error refreshing candidate data:', error);
        }
    };

    // FIXED: Enhanced interview scheduling with proper state updates
    const handleInterviewSchedule = async (interviewData) => {
        try {
            const result = await api.createInterview({
                ...interviewData,
                scheduled_by: currentUser.name
            });
            
            if (result.data) {
                // Update interviews state
                setInterviews([result.data, ...interviews]);
                
                // FIXED: Update candidate timeline with proper ID handling
                const candidateId = interviewData.candidate_id;
                const updatedCandidates = candidates.map(candidate => {
                    if (candidate.id == candidateId || candidate.id === candidateId) {
                        const timelineEntry = {
                            id: Date.now() + Math.random(),
                            action: 'Interview Scheduled',
                            description: `${interviewData.template_name} scheduled for ${new Date(interviewData.interview_date).toLocaleDateString()}`,
                            user: currentUser.name,
                            timestamp: new Date().toISOString(),
                            type: 'interview'
                        };
                        
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
                
                setCandidates(updatedCandidates);
                setShowInterviewModal(false);
                setPreSelectedCandidate(null);
                
                console.log('✅ Interview scheduled successfully');
            }
        } catch (error) {
            console.error('Error scheduling interview:', error);
            alert('Error scheduling interview. Please try again.');
        }
    };

    // Check if user is authenticated via the multi-user auth system
if (!currentUser) {
    // The multi-user auth system will handle showing login interface
    return null;
}

    // Render loading screen
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--secondary-bg)',
                color: 'var(--text-primary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid var(--border-color)',
                        borderTop: '4px solid var(--accent-color)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }} />
                    <h3 style={{ marginBottom: '10px' }}>Loading RecruitPro...</h3>
                    <p style={{ color: 'var(--text-tertiary)' }}>
                        {isOnline ? 'Syncing with database...' : 'Initializing offline mode...'}
                    </p>
                </div>
                <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
            </div>
        );
    }

    // Main application render
    console.log('Rendering main application');
    
    return (
        <DashboardComponent
            currentUser={currentUser}
            onLogout={handleLogout}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOnline={isOnline}
        >
            {activeTab === 'candidates' && (
    <CandidatesComponent
        currentUser={currentUser}
        candidates={window.candidatePrivacySystem ? 
            window.candidatePrivacySystem.filterCandidatesByPrivacy(candidates, currentUser) : 
            candidates
        }
        setCandidates={setCandidates}
        projects={projects}
        onScheduleInterview={handleScheduleInterview}
        onKeepWarm={handleKeepWarm}
    />
)}

            {activeTab === 'analytics' && (
                <AnalyticsComponent
                    candidates={candidates}
                    interviews={interviews}
                    projects={projects}
                    loginSessions={loginSessions}
                    onViewCandidate={handleViewCandidate}
                />
            )}

            {activeTab === 'interviews' && (
                <InterviewsComponent
                    currentUser={currentUser}
                    candidates={candidates}
                    setCandidates={setCandidates}
                    interviews={interviews}
                    setInterviews={setInterviews}
                    interviewTemplates={interviewTemplates}
                    setInterviewTemplates={setInterviewTemplates}
                    projects={projects}
                    onViewCandidate={handleViewCandidate}
                />
            )}

{activeTab === 'projects' && (
    <ProjectsComponent
        currentUser={currentUser}
        projects={projects}
        setProjects={setProjects}
        candidates={candidates}
        setCandidates={setCandidates}
        interviews={interviews}
        setInterviews={setInterviews}
        onScheduleInterview={handleScheduleInterview}
        onViewCandidate={handleViewCandidate}
    />
)}

{activeTab === 'companies' && (
    <CompaniesComponent
        currentUser={currentUser}
        candidates={candidates}
        setCandidates={setCandidates}
        companies={companies}
        setCompanies={setCompanies}
    />
)}

{/* ADD THIS NEW SECTION */}
{activeTab === 'hiring-info' && (
    <HiringInfoTab
        currentUser={currentUser}
        isOnline={isOnline}
    />
)}

{/* ADD THIS NEW SECTION */}
{activeTab === 'organogram' && (
    window.InteractiveOrganogram ? 
        React.createElement(window.InteractiveOrganogram, {
            currentUser: currentUser,
            isOnline: isOnline
        }) :
        React.createElement('div', { 
            style: { 
                padding: '40px', 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '12px',
                margin: '20px'
            } 
        }, 
            React.createElement('h3', null, '🏢 Organogram Loading...'),
            React.createElement('p', null, 'The organogram component is being loaded. Please refresh if this persists.')
        )
)}

{/* ADD THIS NEW SECTION */}
{activeTab === 'warm-pipeline' && (
    <WarmPipelineComponent
        currentUser={currentUser}
        warmCandidates={warmCandidates}
        setWarmCandidates={setWarmCandidates}
        candidates={candidates}
        setCandidates={setCandidates}
    />
)}

            {/* Global Interview Modal */}
{showInterviewModal && (
    <ScheduleInterviewModal
        currentUser={currentUser}
        candidates={candidates}
        interviewTemplates={interviewTemplates}
        projects={projects} // ← ADD THIS LINE
        preSelectedCandidate={preSelectedCandidate}
        onClose={() => {
            setShowInterviewModal(false);
            setPreSelectedCandidate(null);
        }}
        onSchedule={handleInterviewSchedule}
    />
)}
        {/* Recruitment Chatbot */}
        {React.createElement(window.RecruitmentChatbot, {
                candidates: candidates,
                setCandidates: setCandidates,  // ADD THIS LINE
                projects: projects,
                currentProject: null,
                currentUser: currentUser,
                onAddCandidate: async (candidateData) => {
                    console.log('🤖 Chatbot creating candidate:', candidateData.name);
                    console.log('🤖 Full candidate data:', candidateData);
                    console.log('🤖 Current candidates count before:', candidates.length);
                    
                    try {
                        // Ensure the candidate has all required fields
                        const completeCandidate = {
                            id: candidateData.id || Date.now(),
                            name: candidateData.name || 'Unknown',
                            email: candidateData.email || '',
                            job_title: candidateData.job_title || '',
                            company: candidateData.company || '',
                            phone: candidateData.phone || '',
                            location: candidateData.location || '',
                            linkedin_url: candidateData.linkedin_url || '',
                            notes: candidateData.notes || '',
                            tags: candidateData.tags || [],
                            source: candidateData.source || 'Manual Entry',
                            gender: candidateData.gender || '',
                            project_id: candidateData.project_id || null,
                            status: candidateData.status || 'new',
                            readiness: candidateData.readiness || 'not_ready',
                            created_by: candidateData.created_by || currentUser.name,
                            created_at: candidateData.created_at || new Date().toISOString(),
                            interview_feedback: candidateData.interview_feedback || [],
                            timeline: candidateData.timeline || [],
                            skills: candidateData.skills || [],
                            attached_pdfs: candidateData.attached_pdfs || []  // ADD THIS LINE
                        };
                        
                        console.log('🤖 Complete candidate object:', completeCandidate);
                        
                        // Update state with functional update to avoid stale closure
                        setCandidates(prevCandidates => {
                            // Check if candidate already exists
                            const existingIndex = prevCandidates.findIndex(c => c.id === completeCandidate.id);
                            
                            let newCandidates;
                            if (existingIndex >= 0) {
                                // Update existing candidate
                                newCandidates = [...prevCandidates];
                                newCandidates[existingIndex] = completeCandidate;
                                console.log('🤖 Updated existing candidate at index:', existingIndex);
                            } else {
                                // Add new candidate to the beginning
                                newCandidates = [completeCandidate, ...prevCandidates];
                                console.log('🤖 Added new candidate to list');
                            }
                            
                            console.log('🤖 New candidates count:', newCandidates.length);
                            
                            // Save to storage
                            try {
                                helpers.storage.save('recruitpro_candidates', newCandidates);
                                console.log('🤖 Saved to storage successfully');
                            } catch (storageError) {
                                console.error('🤖 Storage save failed:', storageError);
                            }
                            
                            return newCandidates;
                        });
                        
                        console.log('✅ Candidate creation completed successfully');

                        try {
                            console.log('🤖 Saving candidate to server...');
                            const result = await api.createCandidate(completeCandidate);
                            
                            if (result.success) {
                                console.log('✅ Candidate saved to server successfully');
                            } else {
                                console.log('⚠️ Server save failed, but candidate kept in local storage');
                            }
                        } catch (apiError) {
                            console.error('❌ API save error:', apiError);
                            console.log('⚠️ Continuing with local storage only');
                        }
                        
                    } catch (error) {
                        console.error('❌ Error in onAddCandidate:', error);
                        
                        // Fallback: try to save directly to storage
                        try {
                            const currentCandidates = helpers.storage.load('recruitpro_candidates') || [];
                            const newCandidates = [candidateData, ...currentCandidates];
                            helpers.storage.save('recruitpro_candidates', newCandidates);
                            console.log('🤖 Fallback storage save successful');
                        } catch (fallbackError) {
                            console.error('❌ Fallback storage save failed:', fallbackError);
                        }
                    }
                },


                
                onScheduleInterview: (interviewData) => {
                    console.log('📅 Chatbot scheduling interview:', interviewData);
                    console.log('📅 Candidate ID:', interviewData.candidateId);
                    console.log('📅 Current candidates count:', candidates.length);
                    
                    // Wait a moment to ensure candidate is in the system
                    setTimeout(() => {
                        // Find the candidate in current state
                        const candidateInSystem = candidates.find(c => 
                            c.id === interviewData.candidateId || 
                            c.name === interviewData.candidateName
                        );
                        
                        if (candidateInSystem) {
                            console.log('✅ Found candidate in system:', candidateInSystem.name);
                            setPreSelectedCandidate(candidateInSystem);
                            setShowInterviewModal(true);
                        } else {
                            console.log('⚠️ Candidate not found in system, using provided data');
                            // Use the candidate data from chatbot
                            setPreSelectedCandidate(interviewData.candidate);
                            setShowInterviewModal(true);
                        }
                    }, 500); // Small delay to ensure state is updated
                }
            })}
        </DashboardComponent>
    );
};

// Mount the application
console.log('Mounting React app...');
ReactDOM.render(React.createElement(RecruitProApp), document.getElementById('root'));
console.log('React app mounted!');
