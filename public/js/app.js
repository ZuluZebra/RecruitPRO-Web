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
    const [companies, setCompanies] = React.useState([]);

    
    // UI state
    const [activeTab, setActiveTab] = React.useState('candidates');
    const [loading, setLoading] = React.useState(false);
    const [isOnline, setIsOnline] = React.useState(false);
    
    // Modal states
    const [showInterviewModal, setShowInterviewModal] = React.useState(false);
    const [preSelectedCandidate, setPreSelectedCandidate] = React.useState(null);

    // Add this right after all the useState declarations, before any useEffect
if (!currentUser) {
    return React.createElement('div', {
        style: { 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            background: '#f8fafc',
            color: '#374151',
            fontFamily: 'Inter, sans-serif'
        }
    }, 'Waiting for authentication...');
}

    // Initialize theme on mount
    React.useEffect(() => {
        helpers.themeManager.init();
    }, []);

    // Listen for the secure auth system - MOVED INSIDE REACT COMPONENT
React.useEffect(() => {
    console.log('🔧 Setting up authentication listener...');
    
    const handleUserAuthenticated = (event) => {
        console.log('🎯 userAuthenticated event received:', event.detail);
        const { user, team } = event.detail;
        console.log(`🔐 Authenticated: ${user.name} from ${team.name}`);
        console.log('🔐 Setting currentUser in React state...');
        setCurrentUser(user);
    };

    document.addEventListener('userAuthenticated', handleUserAuthenticated);
    
    // Also check for immediate authentication on mount
    setTimeout(() => {
        if (window.secureTeamAuth && window.secureTeamAuth.getCurrentUser()) {
            const user = window.secureTeamAuth.getCurrentUser();
            const team = window.secureTeamAuth.getCurrentTeam();
            console.log('🔍 Found existing authenticated user:', user.name);
            setCurrentUser(user);
        }
    }, 100);
    
    // Cleanup
    return () => {
        document.removeEventListener('userAuthenticated', handleUserAuthenticated);
    };
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
                console.log('✅ Candidates with feedback:', candidatesWithFeedback.length);
                
                // Log feedback details for verification
                candidatesWithFeedback.forEach(c => {
                    console.log(`📝 ${c.name}: ${c.interview_feedback.length} feedback entries`);
                });
                
                setCandidates(result.data);
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
            // Fallback to localStorage
            const fallbackCandidates = helpers.storage.load('recruitpro_candidates') || [];
            console.log(`📱 Fallback: ${fallbackCandidates.length} candidates from localStorage`);
            setCandidates(fallbackCandidates);
        }
    };

    const loadProjects = async () => {
        try {
            const result = await api.getProjects();
            if (result.data) {
                setProjects(result.data);
                console.log(`📊 Loaded ${result.data.length} projects`);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            // Fallback to localStorage
            const fallbackProjects = helpers.storage.load('recruitpro_projects') || [];
            setProjects(fallbackProjects);
            console.log(`📱 Fallback: ${fallbackProjects.length} projects from localStorage`);
        }
    };

    const loadInterviews = async () => {
        try {
            const result = await api.getInterviews();
            if (result.data) {
                setInterviews(result.data);
                console.log(`📅 Loaded ${result.data.length} interviews`);
            }
        } catch (error) {
            console.error('Error loading interviews:', error);
            // Fallback to localStorage
            const fallbackInterviews = helpers.storage.load('recruitpro_interviews') || [];
            setInterviews(fallbackInterviews);
            console.log(`📱 Fallback: ${fallbackInterviews.length} interviews from localStorage`);
        }
    };

    const loadInterviewTemplates = async () => {
        try {
            const result = await api.getInterviewTemplates();
            if (result.data) {
                setInterviewTemplates(result.data);
                console.log(`📋 Loaded ${result.data.length} interview templates`);
            }
        } catch (error) {
            console.error('Error loading interview templates:', error);
            // Fallback to localStorage
            const fallbackTemplates = helpers.storage.load('recruitpro_interview_templates') || [];
            setInterviewTemplates(fallbackTemplates);
            console.log(`📱 Fallback: ${fallbackTemplates.length} templates from localStorage`);
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

    


    // Handle user logout
    const handleLogout = () => {
        setCurrentUser(null);
        setActiveTab('candidates');
        
        // Clear any open modals
        setShowInterviewModal(false);
        setPreSelectedCandidate(null);
        
        // Use the proper logout function instead of problematic reload
        if (window.secureTeamAuth) {
            window.secureTeamAuth.logout();
        } else if (window.multiUserAuth) {
            // Clear session and show auth interface properly
            localStorage.removeItem('recruitpro_current_session');
            window.multiUserAuth.showAuthInterface();
        } else {
            // Fallback: reload page
            window.location.reload();
        }
    };

    // Handle scheduling interview from candidate card
    const handleScheduleInterview = (candidate) => {
        setPreSelectedCandidate(candidate);
        setShowInterviewModal(true);
        setActiveTab('interviews'); // Switch to interviews tab
    };

    // Handle viewing candidate details
    const handleViewCandidate = (candidate) => {
        // Switch to candidates tab and scroll to candidate (implement as needed)
        setActiveTab('candidates');
    };

    // FIXED: Interview scheduling with enhanced feedback support
    const handleInterviewSchedule = async (interviewData) => {
        try {
            console.log('📅 Scheduling interview:', interviewData);
            
            // Save to API first
            const result = await api.createInterview(interviewData);
            
            if (result.success) {
                // Update local state
                setInterviews(prev => [interviewData, ...prev]);
                
                // Update candidate timeline if candidate is provided
                if (interviewData.candidate_id) {
                    setCandidates(prev => prev.map(candidate => {
                        if (candidate.id === interviewData.candidate_id) {
                            const updatedCandidate = {
                                ...candidate,
                                timeline: [
                                    {
                                        id: Date.now(),
                                        type: 'interview_scheduled',
                                        message: `Interview scheduled with ${interviewData.interviewer_name}`,
                                        user: currentUser.name,
                                        created_at: new Date().toISOString()
                                    },
                                    ...(candidate.timeline || [])
                                ]
                            };
                            
                            // Also save updated candidate to storage
                            setTimeout(() => {
                                const allCandidates = helpers.storage.load('recruitpro_candidates') || [];
                                const candidateIndex = allCandidates.findIndex(c => c.id === candidate.id);
                                if (candidateIndex >= 0) {
                                    allCandidates[candidateIndex] = updatedCandidate;
                                    helpers.storage.save('recruitpro_candidates', allCandidates);
                                }
                            }, 100);
                            
                            return updatedCandidate;
                        }
                        return candidate;
                    }));
                }
                
                console.log('✅ Interview scheduled successfully');
                
            } else {
                console.error('❌ Failed to schedule interview');
                alert('Failed to schedule interview. Please try again.');
            }
        } catch (error) {
            console.error('❌ Error scheduling interview:', error);
            alert('Error scheduling interview. Please try again.');
        }
    };

    // SecureTeamAuth system handles login automatically - no need to show React LoginComponent
    // The SecureTeamAuth system will show its own login interface when needed

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
                        {isOnline ? 'Connected to server' : 'Working offline with demo data'}
                    </p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'candidates', label: '👥 Candidates' },
        { id: 'projects', label: '📋 Projects' },
        { id: 'companies', label: '🏢 Companies' },
        { id: 'interviews', label: '📅 Interviews' },
        { id: 'organogram', label: '🌳 Organogram' },
        { id: 'warm-pipeline', label: '🔥 Warm Pipeline' },
        { id: 'analytics', label: '📊 Analytics' }
    ];

    return (
        <DashboardComponent
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            tabs={tabs}
            loginSessions={loginSessions}
        >
            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
                <CandidatesComponent
                    currentUser={currentUser}
                    candidates={candidates}
                    setCandidates={setCandidates}
                    projects={projects}
                    interviews={interviews}
                    onScheduleInterview={handleScheduleInterview}
                    onViewCandidate={handleViewCandidate}
                />
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
                <ProjectsComponent
                    currentUser={currentUser}
                    projects={projects}
                    setProjects={setProjects}
                    candidates={candidates}
                />
            )}

{/* Companies Tab */}
{activeTab === 'companies' && (
    <CompaniesComponent
        currentUser={currentUser}
        companies={companies}
        setCompanies={setCompanies}
    />
)}

            {/* Interviews Tab */}
            {activeTab === 'interviews' && (
                <InterviewsComponent
                    currentUser={currentUser}
                    interviews={interviews}
                    setInterviews={setInterviews}
                    candidates={candidates}
                    setCandidates={setCandidates}
                    interviewTemplates={interviewTemplates}
                    setInterviewTemplates={setInterviewTemplates}
                    projects={projects}
                />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <AnalyticsComponent
                    candidates={candidates}
                    projects={projects}
                    interviews={interviews}
                    currentUser={currentUser}
                />
            )}

{/* Organogram Tab */}
{activeTab === 'organogram' && (
    window.OrganogramComponent ? 
        React.createElement(window.OrganogramComponent, {
            currentUser: currentUser
        }) :
        React.createElement('div', 
            { 
                style: { 
                    textAlign: 'center', 
                    padding: '40px', 
                    background: 'var(--card-bg)', 
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
