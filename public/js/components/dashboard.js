// Complete Dashboard Component with Header, Navigation, Tasks System, and ALL COMPONENTS
// Replace your ENTIRE js/components/dashboard.js with this complete version

// ✅ ADD CLOCK COMPONENT HERE (BEFORE DashboardComponent)
const CRMClock = () => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <svg 
                style={{ width: '18px', height: '18px', color: '#667eea' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    color: '#2d3748',
                    lineHeight: '1.2'
                }}>
                    {formatTime(time)}
                </span>
                <span style={{
                    fontSize: '11px',
                    color: '#718096',
                    lineHeight: '1.2'
                }}>
                    {formatDate(time)}
                </span>
            </div>
        </div>
    );
};

// Add this BEFORE the DashboardComponent definition
const FolderCollaborationButton = () => {
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [folderStatus, setFolderStatus] = React.useState('none');
    const [teamCount, setTeamCount] = React.useState(0);
    
    // Check folder status periodically
    React.useEffect(() => {
        const checkFolderStatus = () => {
            if (window.folderCollaboration) {
                const isConnected = window.folderCollaboration.currentFolder !== null;
                const isTeam = window.folderCollaboration.isTeamFolder;
                const members = window.folderCollaboration.teamMembers?.length || 0;
                
                setFolderStatus(isConnected ? (isTeam ? 'team' : 'folder') : 'none');
                setTeamCount(members);
            }
        };
        
        checkFolderStatus();
        const interval = setInterval(checkFolderStatus, 2000);
        
        return () => clearInterval(interval);
    }, []);
    
    const getFolderIcon = () => {
        switch (folderStatus) {
            case 'team': return '👥';
            case 'folder': return '📁';
            default: return '📂';
        }
    };
    
    const getFolderTooltip = () => {
        switch (folderStatus) {
            case 'team': return `Team folder (${teamCount} members)`;
            case 'folder': return 'Folder connected';
            default: return 'Connect folder for team collaboration';
        }
    };
    
    const handleSelectFolder = () => {
        setShowDropdown(false);
        if (window.folderCollaboration) {
            window.folderCollaboration.selectCollaborationFolder();
        }
    };
    
    const handleManageTeam = () => {
        setShowDropdown(false);
        if (window.folderCollaboration) {
            window.folderCollaboration.showTeamManagement();
        }
    };
    
    return (
        <div style={{ position: 'relative' }}>
            <button 
                className="theme-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
                title={getFolderTooltip()}
                style={{
                    background: folderStatus === 'team' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 
                               folderStatus === 'folder' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                               'none',
                    color: folderStatus !== 'none' ? 'white' : 'var(--text-primary)',
                    boxShadow: folderStatus !== 'none' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
            >
                {getFolderIcon()}
                
                {/* Team member count badge */}
                {folderStatus === 'team' && teamCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: '#dc2626',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '10px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        {teamCount > 9 ? '9+' : teamCount}
                    </span>
                )}
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                        }}
                        onClick={() => setShowDropdown(false)}
                    />
                    
                    {/* Dropdown */}
                    <div style={{
                        position: 'absolute',
                        top: '50px',
                        right: '0',
                        background: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        padding: '8px 0',
                        minWidth: '200px',
                        zIndex: 999,
                        fontSize: '14px'
                    }}>
                        {/* Current Status */}
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border-color)',
                            marginBottom: '8px'
                        }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                Folder Status
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {folderStatus === 'team' ? `Team active (${teamCount} members)` :
                                 folderStatus === 'folder' ? 'Folder connected' :
                                 'No folder selected'}
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <button
                            onClick={handleSelectFolder}
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'var(--bg-secondary)'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                        >
                            📁 {folderStatus === 'none' ? 'Select Folder' : 'Change Folder'}
                        </button>
                        
                        {folderStatus !== 'none' && (
                            <button
                                onClick={handleManageTeam}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = 'var(--bg-secondary)'}
                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                            >
                                👥 Manage Team
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};


const DashboardComponent = ({ 
    currentUser, 
    onLogout, 
    activeTab, 
    setActiveTab, 
    isOnline,
    children 
}) => {
    const [currentTheme, setCurrentTheme] = React.useState(helpers.themeManager.current);
    const [loginSessions, setLoginSessions] = React.useState([]);
    
    // ✅ Tasks System State
    // ✅ Tasks System State
const [showTasksModal, setShowTasksModal] = React.useState(false);
const [tasks, setTasks] = React.useState([]);
const [tasksLoading, setTasksLoading] = React.useState(false);
const [showNotesModal, setShowNotesModal] = React.useState(false);
const [categories, setCategories] = React.useState([]);
const [notes, setNotes] = React.useState([]);
const [notesLoading, setNotesLoading] = React.useState(false);
    
    // ✅ FIXED: Load projects and candidates for task linking
    const [projects, setProjects] = React.useState([]);
    const [candidates, setCandidates] = React.useState([]);

    // ✅ ADD THIS LINE RIGHT HERE:
const [companies, setCompanies] = React.useState([]);

    React.useEffect(() => {
        if (currentUser) {
            initializeDashboardData();
        }
    }, [currentUser]);
    
    // CRITICAL FIX: Proper data loading that checks server first
    const initializeDashboardData = async () => {
        console.log('🚀 Initializing dashboard data...');
        
        try {
            // Load login sessions (localStorage only)
            const sessions = helpers.storage.load('recruitpro_login_sessions') || [];
            setLoginSessions(sessions);
            
            // FIXED: Load tasks from server first, fallback to localStorage
            await loadTasks();
            await loadNotesData();
            
            // Load projects and candidates
            await loadProjectsAndCandidates();
            
            // Load companies
            await loadCompanies();
            
        } catch (error) {
            console.error('❌ Error initializing dashboard data:', error);
        }
    };
    
    // CRITICAL FIX: Proper task loading from server
    const loadTasks = async () => {
        setTasksLoading(true);
        console.log('📋 Loading tasks...');
        
        try {
            // FIXED: Try to load from server first
            const result = await api.getTasks();
            
            if (result.data) {
                setTasks(result.data);
                console.log(`✅ Loaded ${result.data.length} tasks from ${isOnline ? 'server' : 'localStorage'}`);
                
                // If we got server data, update localStorage as backup
                if (isOnline && result.data.length > 0) {
                    helpers.storage.save('recruitpro_tasks', result.data);
                    console.log('💾 Tasks synced to localStorage backup');
                }
            } else {
                // If API fails, try localStorage fallback
                console.log('📱 Falling back to localStorage for tasks');
                const localTasks = helpers.storage.load('recruitpro_tasks') || [];
                setTasks(localTasks);
                console.log(`📱 Loaded ${localTasks.length} tasks from localStorage fallback`);
            }
            
        } catch (error) {
            console.error('❌ Error loading tasks:', error);
            
            // Final fallback to localStorage
            const localTasks = helpers.storage.load('recruitpro_tasks') || [];
            setTasks(localTasks);
            console.log(`📱 Emergency fallback: ${localTasks.length} tasks from localStorage`);
        } finally {
            setTasksLoading(false);
        }
    };

    // ✅ FIXED: Function to load projects and candidates
    const loadProjectsAndCandidates = async () => {
        try {
            // Load projects
            const projectsResult = await api.getProjects();
            if (projectsResult.data) {
                setProjects(projectsResult.data);
                console.log(`📁 Loaded ${projectsResult.data.length} projects for task linking`);
            }
            
            // Load candidates
            const candidatesResult = await api.getCandidates();
            if (candidatesResult.data) {
                setCandidates(candidatesResult.data);
                console.log(`👥 Loaded ${candidatesResult.data.length} candidates for task linking`);
            }
        } catch (error) {
            console.error('Error loading projects and candidates:', error);
            // Fallback to localStorage
            const fallbackProjects = helpers.storage.load('recruitpro_projects') || [];
            const fallbackCandidates = helpers.storage.load('recruitpro_candidates') || [];
            setProjects(fallbackProjects);
            setCandidates(fallbackCandidates);
            console.log(`📱 Fallback: ${fallbackProjects.length} projects, ${fallbackCandidates.length} candidates`);
        }
    };

    const loadCompanies = async () => {
        try {
            const result = await api.getCompanies();
            if (result.data) {
                setCompanies(result.data);
                console.log(`🏢 Loaded ${result.data.length} companies`);
            }
        } catch (error) {
            console.error('Error loading companies:', error);
            const fallback = helpers.storage.load('recruitpro_companies') || [];
            setCompanies(fallback);
            console.log(`📱 Fallback: ${fallback.length} companies from localStorage`);
        }
    };

    const handleThemeToggle = () => {
        const newTheme = helpers.themeManager.toggle();
        setCurrentTheme(newTheme);
        
        // Force update the document attribute (this is the fix!)
        document.documentElement.setAttribute('data-theme', newTheme);
        
        console.log('Theme switched to:', newTheme);
    };

    // REPLACE your handleExportData function with this comprehensive analytics version:

// FINAL CLEAN VERSION - Replace your handleExportData function with this:

const handleExportData = async () => {
    try {
        console.log('🔄 Starting comprehensive RecruitPro export...');
        
        // Load projects with the working method from debug
        let projectsData = [];
        const possibleKeys = ['recruitpro_projects', 'projects', 'recruitpro_project', 'project_data'];
        
        for (const key of possibleKeys) {
            const data = helpers.storage.load(key);
            if (data && data.length > 0) {
                projectsData = data;
                break;
            }
        }
        
        // Fallback to API if needed
        if (projectsData.length === 0 && typeof window.api !== 'undefined') {
            try {
                const apiResult = await window.api.getProjects();
                if (apiResult.data && apiResult.data.length > 0) {
                    projectsData = apiResult.data;
                }
            } catch (apiError) {
                console.log('API fallback failed:', apiError);
            }
        }
        
        // Get other data
        const candidatesData = helpers.storage.load('recruitpro_candidates') || [];
        const interviewsData = helpers.storage.load('recruitpro_interviews') || [];
        
        console.log(`📊 Final data: ${candidatesData.length} candidates, ${projectsData.length} projects, ${interviewsData.length} interviews`);
        
        // Helper function to clean CSV values
        const cleanCsvValue = (value) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return '"' + stringValue.replace(/"/g, '""') + '"';
            }
            return stringValue;
        };
        
        // Helper function to get standardized gender
        const getGender = (candidate) => {
            // Check multiple possible field names
            const gender = candidate.gender || candidate.Gender || candidate.sex || candidate.Sex || '';
            
            // Standardize common values
            if (!gender) return '';
            const genderLower = gender.toString().toLowerCase();
            
            if (genderLower === 'm' || genderLower === 'male') return 'Male';
            if (genderLower === 'f' || genderLower === 'female') return 'Female';
            if (genderLower === 'nb' || genderLower === 'non-binary' || genderLower === 'nonbinary') return 'Non-Binary';
            if (genderLower === 'other') return 'Other';
            if (genderLower === 'prefer not to say' || genderLower === 'not specified') return 'Not Specified';
            
            // Return as-is if not in common formats
            return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
        };
        
        // Helper function to convert country codes to full names
        const getFullCountryName = (location) => {
            if (!location) return '';
            
            const countryMap = {
                // Common country codes
                'ZA': 'South Africa',
                'US': 'United States',
                'USA': 'United States', 
                'GB': 'United Kingdom',
                'UK': 'United Kingdom',
                'DE': 'Germany',
                'FR': 'France',
                'IT': 'Italy',
                'ES': 'Spain',
                'NL': 'Netherlands',
                'BE': 'Belgium',
                'CH': 'Switzerland',
                'AT': 'Austria',
                'SE': 'Sweden',
                'NO': 'Norway',
                'DK': 'Denmark',
                'FI': 'Finland',
                'PL': 'Poland',
                'CZ': 'Czech Republic',
                'HU': 'Hungary',
                'RO': 'Romania',
                'BG': 'Bulgaria',
                'HR': 'Croatia',
                'SI': 'Slovenia',
                'SK': 'Slovakia',
                'LT': 'Lithuania',
                'LV': 'Latvia',
                'EE': 'Estonia',
                'IE': 'Ireland',
                'PT': 'Portugal',
                'GR': 'Greece',
                'CY': 'Cyprus',
                'MT': 'Malta',
                'LU': 'Luxembourg',
                'CA': 'Canada',
                'MX': 'Mexico',
                'BR': 'Brazil',
                'AR': 'Argentina',
                'CL': 'Chile',
                'CO': 'Colombia',
                'PE': 'Peru',
                'AU': 'Australia',
                'NZ': 'New Zealand',
                'JP': 'Japan',
                'CN': 'China',
                'KR': 'South Korea',
                'IN': 'India',
                'SG': 'Singapore',
                'MY': 'Malaysia',
                'TH': 'Thailand',
                'PH': 'Philippines',
                'ID': 'Indonesia',
                'VN': 'Vietnam',
                'AE': 'United Arab Emirates',
                'SA': 'Saudi Arabia',
                'IL': 'Israel',
                'TR': 'Turkey',
                'EG': 'Egypt',
                'NG': 'Nigeria',
                'KE': 'Kenya',
                'GH': 'Ghana',
                'MA': 'Morocco',
                'TN': 'Tunisia',
                'RU': 'Russia',
                'UA': 'Ukraine',
                'BY': 'Belarus',
                'KZ': 'Kazakhstan',
                // African countries
                'BW': 'Botswana',
                'NA': 'Namibia',
                'ZW': 'Zimbabwe',
                'ZM': 'Zambia',
                'MW': 'Malawi',
                'MZ': 'Mozambique',
                'SZ': 'Eswatini',
                'LS': 'Lesotho',
                'TZ': 'Tanzania',
                'UG': 'Uganda',
                'RW': 'Rwanda',
                'BI': 'Burundi',
                'ET': 'Ethiopia',
                'SO': 'Somalia',
                'DJ': 'Djibouti',
                'ER': 'Eritrea',
                'SD': 'Sudan',
                'SS': 'South Sudan',
                'LY': 'Libya',
                'DZ': 'Algeria',
                'ML': 'Mali',
                'BF': 'Burkina Faso',
                'NE': 'Niger',
                'TD': 'Chad',
                'CF': 'Central African Republic',
                'CM': 'Cameroon',
                'GQ': 'Equatorial Guinea',
                'GA': 'Gabon',
                'CG': 'Republic of the Congo',
                'CD': 'Democratic Republic of the Congo',
                'AO': 'Angola',
                'ST': 'São Tomé and Príncipe',
                'CV': 'Cape Verde',
                'GW': 'Guinea-Bissau',
                'GN': 'Guinea',
                'SL': 'Sierra Leone',
                'LR': 'Liberia',
                'CI': 'Côte d\'Ivoire',
                'BJ': 'Benin',
                'TG': 'Togo',
                'SN': 'Senegal',
                'GM': 'Gambia',
                'MR': 'Mauritania',
                'MG': 'Madagascar',
                'MU': 'Mauritius',
                'SC': 'Seychelles',
                'KM': 'Comoros'
            };
            
            const locationUpper = location.toUpperCase().trim();
            
            // Check if it's a known country code
            if (countryMap[locationUpper]) {
                return countryMap[locationUpper];
            }
            
            // Check if it already looks like a full country name (contains spaces or is longer than 3 chars)
            if (location.includes(' ') || location.length > 3) {
                return location; // Assume it's already a full name
            }
            
            // If not found in mapping and is short, return as-is with note
            return location;
        };
        
        let csvContent = [];
        
        // ========================================
        // TABLE 1: COMPLETE CANDIDATE DATABASE
        // ========================================
        
        csvContent.push('TABLE 1: COMPLETE CANDIDATE DATABASE');
        csvContent.push('Candidate_Name,Gender,Email,Job_Title,Company,Status,Project_Name,Hiring_Manager,Days_Since_Applied,Interview_Count,Has_Feedback,Latest_Rating,Phone,Location,Source,Created_Date');
        
        candidatesData.forEach(candidate => {
            if (!candidate.name) return;
            
            // Find matching project
            const project = projectsData.find(p => 
                p.id == candidate.project_id || 
                p.id === candidate.project_id || 
                String(p.id) === String(candidate.project_id)
            );
            
            // Get interview and feedback data
            const candidateInterviews = interviewsData.filter(i => i.candidate_id == candidate.id);
            const feedbackEntries = candidate.interview_feedback || [];
            const latestFeedback = feedbackEntries[0];
            const latestRating = latestFeedback && latestFeedback.feedback ? latestFeedback.feedback.rating : '';
            
            // Calculate days since application
            const daysSinceApplied = candidate.created_at ? 
                Math.floor((new Date() - new Date(candidate.created_at)) / (1000 * 60 * 60 * 24)) : '';
            
            const row = [
                cleanCsvValue(candidate.name),
                getGender(candidate),
                candidate.email || '',
                cleanCsvValue(candidate.job_title || ''),
                cleanCsvValue(candidate.company || ''),
                candidate.status || 'applied',
                project ? cleanCsvValue(project.name) : 'No Project Assigned',
                project ? cleanCsvValue(project.hiring_manager || '') : '',
                daysSinceApplied,
                candidateInterviews.length,
                feedbackEntries.length > 0 ? 'Yes' : 'No',
                latestRating,
                candidate.phone || '',
                cleanCsvValue(getFullCountryName(candidate.location || '')),
                cleanCsvValue(candidate.source || ''),
                candidate.created_at || ''
            ];
            
            csvContent.push(row.join(','));
        });
        
        // Add spacing
        csvContent.push('');
        csvContent.push('');
        
        // ========================================
        // TABLE 2: PROJECTS AND THEIR CANDIDATES  
        // ========================================
        
        csvContent.push('TABLE 2: PROJECTS AND THEIR CANDIDATES');
        csvContent.push('Project_Name,Hiring_Manager,Target_Hires,Deadline,Candidate_Name,Gender,Email,Job_Title,Status,Days_Since_Applied,Interview_Count');
        
        projectsData.forEach(project => {
            const projectCandidates = candidatesData.filter(candidate => 
                candidate.project_id == project.id || 
                candidate.project_id === project.id || 
                String(candidate.project_id) === String(project.id)
            );
            
            if (projectCandidates.length === 0) {
                // Project with no candidates
                const row = [
                    cleanCsvValue(project.name),
                    cleanCsvValue(project.hiring_manager || ''),
                    project.target_hires || 1,
                    project.deadline || 'No deadline',
                    'NO CANDIDATES ASSIGNED',
                    '',
                    '',
                    '',
                    '',
                    '',
                    ''
                ];
                csvContent.push(row.join(','));
            } else {
                // Project with candidates
                projectCandidates.forEach(candidate => {
                    const candidateInterviews = interviewsData.filter(i => i.candidate_id == candidate.id);
                    const daysSinceApplied = candidate.created_at ? 
                        Math.floor((new Date() - new Date(candidate.created_at)) / (1000 * 60 * 60 * 24)) : '';
                    
                    const row = [
                        cleanCsvValue(project.name),
                        cleanCsvValue(project.hiring_manager || ''),
                        project.target_hires || 1,
                        project.deadline || 'No deadline',
                        cleanCsvValue(candidate.name),
                        getGender(candidate),
                        candidate.email || '',
                        cleanCsvValue(candidate.job_title || ''),
                        candidate.status || 'applied',
                        daysSinceApplied,
                        candidateInterviews.length
                    ];
                    csvContent.push(row.join(','));
                });
            }
        });
        
        // Add candidates not assigned to any project
        const unassignedCandidates = candidatesData.filter(c => {
            return !c.project_id || !projectsData.some(p => 
                p.id == c.project_id || 
                p.id === c.project_id || 
                String(p.id) === String(c.project_id)
            );
        });
        
        if (unassignedCandidates.length > 0) {
            unassignedCandidates.forEach(candidate => {
                if (!candidate.name) return;
                
                const candidateInterviews = interviewsData.filter(i => i.candidate_id == candidate.id);
                const daysSinceApplied = candidate.created_at ? 
                    Math.floor((new Date() - new Date(candidate.created_at)) / (1000 * 60 * 60 * 24)) : '';
                
                const row = [
                    'UNASSIGNED TO PROJECT',
                    'N/A',
                    'N/A',
                    'N/A',
                    cleanCsvValue(candidate.name),
                    getGender(candidate),
                    candidate.email || '',
                    cleanCsvValue(candidate.job_title || ''),
                    candidate.status || 'applied',
                    daysSinceApplied,
                    candidateInterviews.length
                ];
                csvContent.push(row.join(','));
            });
        }
        
        // Add spacing
        csvContent.push('');
        csvContent.push('');
        
        // ========================================
        // TABLE 3: PROJECT PERFORMANCE SUMMARY
        // ========================================
        
        csvContent.push('TABLE 3: PROJECT PERFORMANCE SUMMARY');
        csvContent.push('Project_Name,Status,Hiring_Manager,Target_Hires,Total_Candidates,Hired_Count,Success_Rate_%,Interview_Count,Deadline,Days_Until_Deadline,Overdue');
        
        projectsData.forEach(project => {
            const projectCandidates = candidatesData.filter(c => 
                c.project_id == project.id || 
                c.project_id === project.id || 
                String(c.project_id) === String(project.id)
            );
            const projectInterviews = interviewsData.filter(i => i.project_id == project.id);
            
            const hiredCount = projectCandidates.filter(c => c.status === 'hired').length;
            const successRate = projectCandidates.length > 0 ? 
                Math.round((hiredCount / projectCandidates.length) * 100) : 0;
            
            const isOverdue = project.deadline && new Date(project.deadline) < new Date();
            const daysUntilDeadline = project.deadline ? 
                Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 'No deadline';
            
            const row = [
                cleanCsvValue(project.name),
                project.status || 'active',
                cleanCsvValue(project.hiring_manager || ''),
                project.target_hires || 1,
                projectCandidates.length,
                hiredCount,
                successRate,
                projectInterviews.length,
                project.deadline || 'No deadline',
                daysUntilDeadline,
                isOverdue ? 'YES' : 'No'
            ];
            
            csvContent.push(row.join(','));
        });
        
        // Add spacing
        csvContent.push('');
        csvContent.push('');
        
        // ========================================
        // TABLE 4: ANALYTICS BY COMPANY
        // ========================================
        
        csvContent.push('TABLE 4: ANALYTICS BY COMPANY');
        csvContent.push('Company,Total_Candidates,Applied,Screening,Interview,Offer,Hired,Success_Rate_%');
        
        const companyStats = {};
        candidatesData.forEach(candidate => {
            if (!candidate.name) return;
            
            const company = candidate.company || 'Unknown';
            if (!companyStats[company]) {
                companyStats[company] = {
                    total: 0,
                    applied: 0,
                    screening: 0,
                    interview: 0,
                    offer: 0,
                    hired: 0
                };
            }
            
            const stats = companyStats[company];
            stats.total++;
            
            const status = (candidate.status || 'applied').toLowerCase();
            if (status === 'applied' || status === 'new') stats.applied++;
            else if (status === 'screening') stats.screening++;
            else if (status === 'interview' || status === 'interviewing') stats.interview++;
            else if (status === 'offer') stats.offer++;
            else if (status === 'hired') stats.hired++;
        });
        
        Object.entries(companyStats)
            .sort(([,a], [,b]) => b.total - a.total)
            .forEach(([company, stats]) => {
                const successRate = stats.total > 0 ? Math.round((stats.hired / stats.total) * 100) : 0;
                
                const row = [
                    cleanCsvValue(company),
                    stats.total,
                    stats.applied,
                    stats.screening,
                    stats.interview,  
                    stats.offer,
                    stats.hired,
                    successRate
                ];
                
                csvContent.push(row.join(','));
            });
        
        // Add spacing
        csvContent.push('');
        csvContent.push('');
        
        // ========================================
        // TABLE 5: ANALYTICS BY JOB TITLE
        // ========================================
        
        csvContent.push('TABLE 5: ANALYTICS BY JOB TITLE');
        csvContent.push('Job_Title,Total_Candidates,Applied,Screening,Interview,Offer,Hired,Success_Rate_%');
        
        const titleStats = {};
        candidatesData.forEach(candidate => {
            if (!candidate.name) return;
            
            const title = candidate.job_title || 'Unknown';
            if (!titleStats[title]) {
                titleStats[title] = {
                    total: 0,
                    applied: 0,
                    screening: 0,
                    interview: 0,
                    offer: 0,
                    hired: 0
                };
            }
            
            const stats = titleStats[title];
            stats.total++;
            
            const status = (candidate.status || 'applied').toLowerCase();
            if (status === 'applied' || status === 'new') stats.applied++;
            else if (status === 'screening') stats.screening++;
            else if (status === 'interview' || status === 'interviewing') stats.interview++;
            else if (status === 'offer') stats.offer++;
            else if (status === 'hired') stats.hired++;
        });
        
        Object.entries(titleStats)
            .sort(([,a], [,b]) => b.total - a.total)
            .forEach(([title, stats]) => {
                const successRate = stats.total > 0 ? Math.round((stats.hired / stats.total) * 100) : 0;
                
                const row = [
                    cleanCsvValue(title),
                    stats.total,
                    stats.applied,
                    stats.screening,
                    stats.interview,
                    stats.offer,
                    stats.hired,
                    successRate
                ];
                
                csvContent.push(row.join(','));
            });
        
        // Add spacing
        csvContent.push('');
        csvContent.push('');
        
        // ========================================
        // TABLE 6: SUMMARY STATISTICS
        // ========================================
        
        csvContent.push('TABLE 6: SUMMARY STATISTICS');
        csvContent.push('Metric,Value,Percentage');
        
        const validCandidates = candidatesData.filter(c => c.name);
        const candidatesWithProjects = validCandidates.filter(c => {
            return c.project_id && projectsData.some(p => 
                p.id == c.project_id || 
                p.id === c.project_id || 
                String(p.id) === String(c.project_id)
            );
        });
        
        // Calculate gender distribution
        const genderStats = {};
        validCandidates.forEach(candidate => {
            const gender = getGender(candidate) || 'Not Specified';
            genderStats[gender] = (genderStats[gender] || 0) + 1;
        });
        
        // Calculate dual statistics for export
        const activeValidCandidates = validCandidates.filter(c => !c.archived);
        const totalEverHired = validCandidates.filter(c => c.status === 'hired').length;
        const activeHired = activeValidCandidates.filter(c => c.status === 'hired').length;
        const overallSuccessRate = validCandidates.length > 0 ? Math.round((totalEverHired / validCandidates.length) * 100) : 0;
        
        const summary = [
            ['--- OPERATIONAL METRICS (ACTIVE PIPELINE) ---', '', ''],
            ['Active Projects', projectsData.filter(p => p.status !== 'archived').length, ''],
            ['Active Candidates', activeValidCandidates.length, Math.round((activeValidCandidates.length / validCandidates.length) * 100) + '%'],
            ['Currently Hired (Active)', activeHired, activeValidCandidates.length > 0 ? Math.round((activeHired / activeValidCandidates.length) * 100) + '%' : '0%'],
            ['In Pipeline (Active)', activeValidCandidates.filter(c => c.status !== 'hired').length, ''],
            ['--- HISTORICAL ANALYTICS (ALL TIME) ---', '', ''],
            ['Total Projects Ever', projectsData.length, ''],
            ['Total Candidates Ever Processed', validCandidates.length, '100%'],
            ['Total Ever Hired (Including Archived)', totalEverHired, overallSuccessRate + '%'],
            ['Overall Success Rate', overallSuccessRate + '%', ''],
            ['Archived Candidates', validCandidates.filter(c => c.archived).length, ''],
            ['Candidates with Projects', candidatesWithProjects.length, Math.round((candidatesWithProjects.length / validCandidates.length) * 100) + '%'],
            ['Unassigned Candidates', validCandidates.length - candidatesWithProjects.length, Math.round(((validCandidates.length - candidatesWithProjects.length) / validCandidates.length) * 100) + '%'],
            ['--- GENDER DISTRIBUTION ---', '', ''],
            ...Object.entries(genderStats).map(([gender, count]) => [
                `Gender - ${gender}`, 
                count, 
                Math.round((count / validCandidates.length) * 100) + '%'
            ]),
            ['--- OTHER METRICS ---', '', ''],
            ['Total Interviews', interviewsData.length, ''],
            ['Unique Companies', new Set(validCandidates.filter(c => c.company).map(c => c.company)).size, ''],
            ['Unique Job Titles', new Set(validCandidates.filter(c => c.job_title).map(c => c.job_title)).size, ''],
            ['Export Date', new Date().toISOString().split('T')[0], ''],
            ['Export Time', new Date().toTimeString().split(' ')[0], '']
        ];
        
        summary.forEach(([metric, value, percentage]) => {
            csvContent.push([cleanCsvValue(metric), value, percentage].join(','));
        });
        
        // Create and download CSV
        const csvString = csvContent.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const fileName = `RecruitPro-Complete-Analytics-${new Date().toISOString().split('T')[0]}.csv`;
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        console.log('✅ Complete RecruitPro export finished successfully');
        alert(`🎉 Complete Analytics Export Successful!\n\nFile: ${fileName}\n\n📊 Contains 6 structured tables:\n\n1️⃣ Complete Candidate Database (${validCandidates.length} candidates)\n2️⃣ Projects & Their Candidates (${projectsData.length} projects)\n3️⃣ Project Performance Summary\n4️⃣ Analytics by Company\n5️⃣ Analytics by Job Title  \n6️⃣ Summary Statistics\n\n✅ All candidates properly matched to projects!\n✅ Ready for Excel/Google Sheets analysis!\n✅ Perfect for creating pivot tables and charts!`);
        
    } catch (error) {
        console.error('❌ Export failed:', error);
        alert(`Export failed: ${error.message}\n\nPlease check the browser console for details.`);
    }
};

    // ✅ ENHANCED: Task Management Functions with immediate state updates
    const createTask = async (taskData) => {
        console.log('🆕 Creating new task:', taskData.title);
        
        const newTask = {
            id: Date.now(),
            ...taskData,
            created_by: currentUser.name,
            created_at: new Date().toISOString(),
            status: 'pending'
        };
        
        // CRITICAL FIX: Update state immediately (optimistic update)
        const updatedTasks = [newTask, ...tasks];
        setTasks(updatedTasks);
        
        // CRITICAL FIX: Save to localStorage immediately as backup
        helpers.storage.save('recruitpro_tasks', updatedTasks);
        
        try {
            // Try to sync to server
            const result = await api.createTask(newTask);
            
            if (result.data && result.data.id !== newTask.id) {
                // Server assigned a different ID, update our local state
                console.log('🔄 Server assigned new ID, updating local state');
                const serverTask = result.data;
                const correctedTasks = updatedTasks.map(t => 
                    t.id === newTask.id ? serverTask : t
                );
                setTasks(correctedTasks);
                helpers.storage.save('recruitpro_tasks', correctedTasks);
            }
            
            console.log('✅ Task created and synced to server');
        } catch (error) {
            console.error('❌ Failed to sync task to server:', error);
            console.log('📱 Task saved locally, will sync when server is available');
        }
        
        console.log(`✅ Task created successfully. Total tasks: ${updatedTasks.length}`);
    };
    
    const updateTask = async (taskId, updates) => {
        console.log('📝 Updating task:', taskId, updates);
        
        const timestamp = new Date().toISOString();
        const updatesWithTimestamp = {
            ...updates,
            updated_at: timestamp
        };
        
        // CRITICAL FIX: Update state immediately
        const updatedTasks = tasks.map(task => 
            task.id === taskId ? { 
                ...task, 
                ...updatesWithTimestamp
            } : task
        );
        
        setTasks(updatedTasks);
        
        // CRITICAL FIX: Save to localStorage immediately
        helpers.storage.save('recruitpro_tasks', updatedTasks);
        
        try {
            // Try to sync to server
            const result = await api.updateTask(taskId, updatesWithTimestamp);
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            console.log('✅ Task update synced to server');
        } catch (error) {
            console.error('❌ Failed to sync task update to server:', error);
            console.log('📱 Task updated locally, will sync when server is available');
        }
        
        console.log('✅ Task updated successfully');
    };
    
    const deleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        console.log('🗑️ Deleting task:', taskId);
        
        // CRITICAL FIX: Update state immediately
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
        
        // CRITICAL FIX: Save to localStorage immediately
        helpers.storage.save('recruitpro_tasks', updatedTasks);
        
        try {
            // Try to sync to server
            const result = await api.deleteTask(taskId);
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            console.log('✅ Task deletion synced to server');
        } catch (error) {
            console.error('❌ Failed to sync task deletion to server:', error);
            console.log('📱 Task deleted locally, will sync when server is available');
        }
        
        console.log(`✅ Task deleted successfully. Remaining tasks: ${updatedTasks.length}`);
    };

    // ✅ NOTES FUNCTIONS - ADD ALL OF THESE AFTER YOUR deleteTask FUNCTION

// Load categories and notes function
const loadNotesData = async () => {
    setNotesLoading(true);
    console.log('📝 Loading notes and categories...');
    
    try {
        // Try to load from server first
        const [categoriesResult, notesResult] = await Promise.all([
            api.getCategories(),
            api.getNotes()
        ]);
        
        if (categoriesResult.data) {
            setCategories(categoriesResult.data);
            console.log(`📁 Loaded ${categoriesResult.data.length} categories from ${isOnline ? 'server' : 'localStorage'}`);
        }
        
        if (notesResult.data) {
            setNotes(notesResult.data);
            console.log(`📝 Loaded ${notesResult.data.length} notes from ${isOnline ? 'server' : 'localStorage'}`);
        }
        
    } catch (error) {
        console.error('❌ Error loading notes data:', error);
        setCategories([]);
        setNotes([]);
    } finally {
        setNotesLoading(false);
    }
};

// Category CRUD operations
const createCategory = async (categoryData) => {
    try {
        const newCategoryData = {
            name: categoryData.name,
            description: categoryData.description || '',
            color: categoryData.color || '#667eea',
            created_by: currentUser.name
        };

        const result = await api.createCategory(newCategoryData);
        
        if (result.data) {
            // Update state immediately (optimistic update)
            const updatedCategories = [result.data, ...categories];
            setCategories(updatedCategories);
            console.log('✅ Category created and synced to server');
            return { success: true };
        } else {
            console.error('❌ Failed to create category:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ Error creating category:', error);
        return { success: false, error };
    }
};

const updateCategory = async (categoryId, updates) => {
    try {
        const result = await api.updateCategory(categoryId, updates);
        
        if (result.data) {
            // Update state immediately
            const updatedCategories = categories.map(cat => 
                cat.id === categoryId ? result.data : cat
            );
            setCategories(updatedCategories);
            console.log('✅ Category updated and synced to server');
            return { success: true };
        } else {
            console.error('❌ Failed to update category:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ Error updating category:', error);
        return { success: false, error };
    }
};

const deleteCategory = async (categoryId) => {
    try {
        const result = await api.deleteCategory(categoryId);
        
        if (result.data) {
            // Update state immediately
            const updatedCategories = categories.filter(cat => cat.id !== categoryId);
            setCategories(updatedCategories);
            
            // Remove all notes in this category
            const updatedNotes = notes.filter(note => note.category_id !== categoryId);
            setNotes(updatedNotes);
            
            console.log('✅ Category and its notes deleted and synced to server');
            return { success: true };
        } else {
            console.error('❌ Failed to delete category:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ Error deleting category:', error);
        return { success: false, error };
    }
};

// Notes CRUD operations
const createNote = async (noteData) => {
    try {
        const newNoteData = {
            title: noteData.title,
            content: noteData.content,
            category_id: noteData.category_id,
            tags: noteData.tags || [],
            created_by: currentUser.name
        };

        const result = await api.createNote(newNoteData);
        
        if (result.data) {
            // Update state immediately (optimistic update)
            const updatedNotes = [result.data, ...notes];
            setNotes(updatedNotes);
            console.log('✅ Note created and synced to server');
            return { success: true };
        } else {
            console.error('❌ Failed to create note:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ Error creating note:', error);
        return { success: false, error };
    }
};

const updateNote = async (noteId, updates) => {
    try {
        const result = await api.updateNote(noteId, updates);
        
        if (result.data) {
            // Update state immediately
            const updatedNotes = notes.map(note => 
                note.id === noteId ? result.data : note
            );
            setNotes(updatedNotes);
            console.log('✅ Note updated and synced to server');
            return { success: true };
        } else {
            console.error('❌ Failed to update note:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ Error updating note:', error);
        return { success: false, error };
    }
};

const deleteNote = async (noteId) => {
    try {
        const result = await api.deleteNote(noteId);
        
        if (result.data) {
            // Update state immediately
            const updatedNotes = notes.filter(note => note.id !== noteId);
            setNotes(updatedNotes);
            console.log('✅ Note deleted and synced to server');
            return { success: true };
        } else {
            console.error('❌ Failed to delete note:', result.error);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error('❌ Error deleting note:', error);
        return { success: false, error };
    }
};

// ✅ END OF NOTES FUNCTIONS

    // ✅ Calculate task statistics for button badge
    const taskStats = React.useMemo(() => {
        const pending = tasks.filter(t => t.status === 'pending');
        const overdue = pending.filter(t => {
            if (!t.due_date) return false;
            return new Date(t.due_date) < new Date();
        });
        const highPriority = pending.filter(t => t.priority === 'high');
        
        return {
            total: tasks.length,
            pending: pending.length,
            overdue: overdue.length,
            highPriority: highPriority.length
        };
    }, [tasks]);

    const tabs = [
        { id: 'candidates', label: '📋 Candidates', icon: '📋' },
        { id: 'analytics', label: '📊 Analytics', icon: '📊' },
        { id: 'interviews', label: '🎤 Interviews', icon: '🎤' },
        { id: 'projects', label: '📁 Projects', icon: '📁' },
        { id: 'companies', label: '🏢 Companies', icon: '🏢' },
        { id: 'warm-pipeline', label: '🔥 Warm Pipeline', icon: '🔥' },  // ⬅️ ADD THIS LINE
        { id: 'hiring-info', label: '🌍 Hiring Info', icon: '🌍' },
        { id: 'organogram', label: '🏛️ Organogram', icon: '🏛️' }
    ];

    return (
        <div className="main-app">
            {/* Enhanced Header with Tasks Button */}
            <header className="header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 className="header-title">
                        RecruitPro CRM
                    </h1>
                    <div style={{
                        fontSize: '12px',
                        color: isOnline ? 'green' : 'orange',
                        fontWeight: '600'
                    }}>
                        ● {isOnline ? 'Database Connected' : 'Offline Mode'}
                    </div>
                    <CRMClock />
                </div>

                
                
                <div className="header-controls">
    {/* ✅ NOTES BUTTON - NO BADGE */}
    <button 
        className="btn-secondary"
        onClick={() => setShowNotesModal(true)}
        disabled={notesLoading}
        style={{
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px',
            background: notesLoading ? 'var(--text-muted)' : 'var(--secondary-bg)',
            color: notesLoading ? 'white' : 'var(--text-primary)',
            border: notesLoading ? 'none' : '1px solid var(--border-color)',
            transition: 'all 0.3s ease'
        }}
        title={notesLoading ? 'Loading notes...' : `${categories.length} categories, ${notes.length} notes`}
    >
        {notesLoading ? '⏳ Loading...' : '📝 Notes'}
    </button>

    {/* ✅ Enhanced Tasks Button - YOUR EXISTING CODE */}
    <button 
        className="btn-secondary"
        onClick={() => setShowTasksModal(true)}
        disabled={tasksLoading}
        style={{
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px',
            position: 'relative',
            background: tasksLoading ? 'var(--text-muted)' :
                       taskStats.overdue > 0 ? 
                'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)' :
                taskStats.pending > 0 ?
                'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' :
                'var(--secondary-bg)',
            color: taskStats.pending > 0 || tasksLoading ? 'white' : 'var(--text-primary)',
            border: taskStats.pending > 0 || tasksLoading ? 'none' : '1px solid var(--border-color)',
            transition: 'all 0.3s ease'
        }}
        title={tasksLoading ? 'Loading tasks...' : 
               `${taskStats.pending} pending tasks${taskStats.overdue > 0 ? `, ${taskStats.overdue} overdue` : ''}`}
    >
        {tasksLoading ? '⏳ Loading...' : '✅ Tasks'}
        {!tasksLoading && taskStats.pending > 0 && (
            <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: taskStats.overdue > 0 ? '#e53e3e' : 
                           taskStats.highPriority > 0 ? '#ed8936' : '#48bb78',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                animation: taskStats.overdue > 0 ? 'pulse 2s infinite' : 'none'
            }}>
                {taskStats.pending > 99 ? '99+' : taskStats.pending}
            </span>
        )}
    </button>

    <button 
        className="btn-secondary"
        onClick={handleExportData}
        style={{
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '8px'
        }}
    >
        📥 Export Data
    </button>
    
    <button 
        className="theme-toggle"
        onClick={handleThemeToggle}
        title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
    >
        {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>

        {/* ADD THIS FOLDER COLLABORATION BUTTON */}
<FolderCollaborationButton />
    
    <div className="user-info">
        <span>{currentUser.name}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Last login: {loginSessions.length > 1 ? 
                helpers.formatTimeAgo(loginSessions[1]?.loginTime) : 
                'First time'
            }
        </span>
        <button className="logout-btn" onClick={onLogout}>
            Sign Out
        </button>
    </div>
</div>
            </header>

            {/* Navigation Tabs */}
            <nav className="nav-tabs">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Main Dashboard Content */}
            <div className="dashboard">
                {children}
            </div>

            {/* ✅ FIXED: Tasks Management Modal with projects and candidates */}
            {showTasksModal && (
                <TasksManagementModal
                    currentUser={currentUser}
                    tasks={tasks}
                    projects={projects}
                    candidates={candidates}
                    onClose={() => setShowTasksModal(false)}
                    onCreateTask={createTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                />
            )}

            {/* ✅ Categorized Notes Modal - ADD THIS */}
{showNotesModal && (
    <CategorizedNotesModal
        currentUser={currentUser}
        categories={categories}
        notes={notes}
        onClose={() => setShowNotesModal(false)}
        onCreateCategory={createCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onCreateNote={createNote}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
    />
)}

            {/* ✅ Add pulse animation for overdue tasks */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.1);
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    );
};

// ✅ FIXED: Tasks Management Modal Component with projects and candidates
const TasksManagementModal = ({ 
    currentUser, 
    tasks, 
    projects,
    candidates,
    onClose, 
    onCreateTask, 
    onUpdateTask, 
    onDeleteTask 
}) => {
    const [showCreateForm, setShowCreateForm] = React.useState(false);
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [filterPriority, setFilterPriority] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('priority');

    // Filter and sort tasks
    const filteredAndSortedTasks = React.useMemo(() => {
        let filtered = tasks.filter(task => {
            const statusMatch = filterStatus === 'all' || task.status === filterStatus;
            const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
            return statusMatch && priorityMatch;
        });

        return filtered.sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === 'pending' ? -1 : 1;
            }

            switch (sortBy) {
                case 'priority':
                    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
                    const aPriority = priorityOrder[a.priority] || 2;
                    const bPriority = priorityOrder[b.priority] || 2;
                    if (aPriority !== bPriority) return aPriority - bPriority;
                    break;
                
                case 'due_date':
                    if (a.due_date && b.due_date) {
                        return new Date(a.due_date) - new Date(b.due_date);
                    }
                    if (a.due_date && !b.due_date) return -1;
                    if (!a.due_date && b.due_date) return 1;
                    break;
                
                case 'created_at':
                    return new Date(b.created_at) - new Date(a.created_at);
                
                default:
                    break;
            }
            
            return new Date(b.created_at) - new Date(a.created_at);
        });
    }, [tasks, filterStatus, filterPriority, sortBy]);

    const handleCompleteTask = (taskId) => {
        onUpdateTask(taskId, { 
            status: 'completed', 
            completed_at: new Date().toISOString() 
        });
    };

    const handleReopenTask = (taskId) => {
        onUpdateTask(taskId, { 
            status: 'pending', 
            completed_at: null 
        });
    };

    // Task statistics
    const stats = React.useMemo(() => {
        const pending = tasks.filter(t => t.status === 'pending');
        const completed = tasks.filter(t => t.status === 'completed');
        const overdue = pending.filter(t => t.due_date && new Date(t.due_date) < new Date());
        const highPriority = pending.filter(t => t.priority === 'high');
        
        return { 
            total: tasks.length,
            pending: pending.length, 
            completed: completed.length, 
            overdue: overdue.length, 
            highPriority: highPriority.length 
        };
    }, [tasks]);

    return (
        <div className="modal notes-modal">
            <div className="modal-content" style={{ 
                maxWidth: '1200px', 
                height: '85vh', 
                display: 'flex', 
                flexDirection: 'column',
                padding: '30px'
            }}>
                {/* Header with Statistics */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid var(--border-color)'
                }}>
                    <div>
                        <h2 style={{ 
                            color: 'var(--text-primary)', 
                            marginBottom: '10px',
                            fontSize: '24px',
                            fontWeight: '700'
                        }}>
                            ✅ Task Management
                        </h2>
                        <div style={{ 
                            display: 'flex', 
                            gap: '20px', 
                            fontSize: '13px', 
                            color: 'var(--text-tertiary)',
                            fontWeight: '600'
                        }}>
                            <span style={{ 
                                background: 'rgba(102, 126, 234, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '8px'
                            }}>
                                📋 {stats.pending} Pending
                            </span>
                            <span style={{ 
                                background: 'rgba(72, 187, 120, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '8px'
                            }}>
                                ✅ {stats.completed} Completed
                            </span>
                            <span style={{ 
                                background: 'rgba(229, 62, 62, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '8px'
                            }}>
                                ⚠️ {stats.overdue} Overdue
                            </span>
                            <span style={{ 
                                background: 'rgba(237, 137, 54, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '8px'
                            }}>
                                🔥 {stats.highPriority} High Priority
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            style={{
                                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            ➕ New Task
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--secondary-bg)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '12px 18px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--border-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'var(--secondary-bg)';
                            }}
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>

                {/* Enhanced Filters and Sorting */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '25px',
                    padding: '18px',
                    background: 'var(--secondary-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div>
                        <label style={{ 
                            fontSize: '12px', 
                            fontWeight: '700', 
                            marginBottom: '6px', 
                            display: 'block',
                            color: 'var(--text-secondary)'
                        }}>
                            Status Filter
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                minWidth: '120px'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style={{ 
                            fontSize: '12px', 
                            fontWeight: '700', 
                            marginBottom: '6px', 
                            display: 'block',
                            color: 'var(--text-secondary)'
                        }}>
                            Priority Filter
                        </label>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                minWidth: '120px'
                            }}
                        >
                            <option value="all">All Priority</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style={{ 
                            fontSize: '12px', 
                            fontWeight: '700', 
                            marginBottom: '6px', 
                            display: 'block',
                            color: 'var(--text-secondary)'
                        }}>
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                minWidth: '120px'
                            }}
                        >
                            <option value="priority">Priority</option>
                            <option value="due_date">Due Date</option>
                            <option value="created_at">Created Date</option>
                        </select>
                    </div>
                </div>

                {/* Tasks List */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredAndSortedTasks.length > 0 ? (
                        filteredAndSortedTasks.map(task => (
                            <TaskItem
                                key={`task-${task.id}-${task.updated_at || task.created_at}`}
                                task={task}
                                onComplete={handleCompleteTask}
                                onReopen={handleReopenTask}
                                onDelete={onDeleteTask}
                                onUpdate={onUpdateTask}
                            />
                        ))
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: 'var(--text-muted)'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                            <h3 style={{ 
                                marginBottom: '12px', 
                                color: 'var(--text-secondary)',
                                fontSize: '20px',
                                fontWeight: '600'
                            }}>
                                {filterStatus !== 'all' || filterPriority !== 'all' ? 
                                    'No tasks match your filters' : 
                                    'No tasks created yet'
                                }
                            </h3>
                            <p style={{ marginBottom: '20px', fontSize: '14px' }}>
                                {filterStatus !== 'all' || filterPriority !== 'all' ? 
                                    'Try adjusting your filters to see more tasks.' :
                                    'Create your first task to stay organized and track your recruiting activities!'
                                }
                            </p>
                            {(filterStatus === 'all' && filterPriority === 'all') && (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create Your First Task
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ✅ FIXED: Create Task Form with projects and candidates */}
                {showCreateForm && (
                    <CreateTaskForm
                        currentUser={currentUser}
                        projects={projects}
                        candidates={candidates}
                        onClose={() => setShowCreateForm(false)}
                        onCreateTask={(taskData) => {
                            onCreateTask(taskData);
                            setShowCreateForm(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

// ✅ ENHANCED: Task Item Component with Linked Entity Details and Detail View
const TaskItem = ({ task, onComplete, onReopen, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [showDetailModal, setShowDetailModal] = React.useState(false);
    const [editData, setEditData] = React.useState({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date
    });

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === 'pending';
    const isPriorityHigh = task.priority === 'high';

    const handleSave = () => {
        onUpdate(task.id, editData);
        setIsEditing(false);
    };

    const priorityColors = {
        high: '#e53e3e',
        medium: '#ed8936',
        low: '#48bb78'
    };

    return (
        <>
            <div style={{
                padding: '18px',
                marginBottom: '15px',
                background: task.status === 'completed' ? 'rgba(72, 187, 120, 0.05)' : 
                            isOverdue ? 'rgba(229, 62, 62, 0.05)' :
                            isPriorityHigh ? 'rgba(237, 137, 54, 0.05)' : 'var(--card-bg)',
                borderRadius: '12px',
                border: `1px solid ${task.status === 'completed' ? 'rgba(72, 187, 120, 0.2)' : 
                                      isOverdue ? 'rgba(229, 62, 62, 0.2)' :
                                      isPriorityHigh ? 'rgba(237, 137, 54, 0.2)' : 'var(--border-color)'}`,
                borderLeft: `4px solid ${task.status === 'completed' ? '#48bb78' : priorityColors[task.priority] || '#a0aec0'}`,
                opacity: task.status === 'completed' ? 0.75 : 1,
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                }}>
                    <div style={{ flex: 1 }}>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.title}
                                onChange={(e) => setEditData({...editData, title: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h4 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '8px',
                                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                    flex: 1
                                }}>
                                    {task.title}
                                </h4>
                                
                                {/* ✅ View Detail Button */}
                                <button
                                    onClick={() => setShowDetailModal(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                    title="View task details"
                                >
                                    👁️ View Details
                                </button>
                            </div>
                        )}
                        
                        {isEditing ? (
                            <textarea
                                value={editData.description}
                                onChange={(e) => setEditData({...editData, description: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    minHeight: '70px',
                                    resize: 'vertical',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit'
                                }}
                            />
                        ) : (
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.5',
                                marginBottom: '12px'
                            }}>
                                {task.description}
                            </p>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '20px', flexWrap: 'wrap' }}>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        background: '#48bb78',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    ✓ Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    style={{
                                        background: '#e53e3e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    ✕ Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                {task.status === 'pending' ? (
                                    <button
                                        onClick={() => onComplete(task.id)}
                                        style={{
                                            background: '#48bb78',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        ✓ Complete
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onReopen(task.id)}
                                        style={{
                                            background: '#ed8936',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        ↺ Reopen
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        background: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                                
                                <button
                                    onClick={() => onDelete(task.id)}
                                    style={{
                                        background: '#e53e3e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    🗑️
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                {/* ✅ Enhanced linked entities display with specific names */}
                {(task.linked_candidate_name || task.linked_project_name) && (
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.08)',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.15)'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'var(--accent-color)',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                            letterSpacing: '0.5px'
                        }}>
                            🔗 Linked To:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {task.linked_candidate_name && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 10px',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: '700'
                                    }}>
                                        👤 CANDIDATE
                                    </span>
                                    <strong style={{ color: 'var(--text-primary)' }}>
                                        {task.linked_candidate_name}
                                    </strong>
                                </div>
                            )}
                            {task.linked_project_name && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 10px',
                                    background: 'rgba(72, 187, 120, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: '700'
                                    }}>
                                        📁 PROJECT
                                    </span>
                                    <strong style={{ color: 'var(--text-primary)' }}>
                                        {task.linked_project_name}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Task metadata */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'var(--text-tertiary)'
                }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Priority badge */}
                        <span style={{
                            background: priorityColors[task.priority] || '#a0aec0',
                            color: 'white',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                        }}>
                            {task.priority} Priority
                        </span>
                        
                        {/* Due date */}
                        {task.due_date && (
                            <span style={{
                                color: isOverdue ? '#e53e3e' : 'var(--text-tertiary)',
                                fontWeight: isOverdue ? '700' : 'normal',
                                background: isOverdue ? 'rgba(229, 62, 62, 0.1)' : 'transparent',
                                padding: isOverdue ? '2px 8px' : '0',
                                borderRadius: isOverdue ? '6px' : '0'
                            }}>
                                📅 Due: {new Date(task.due_date).toLocaleDateString()}
                                {isOverdue && ' (OVERDUE)'}
                            </span>
                        )}
                    </div>
                    
                    <div>
                        Created by {task.created_by} • {helpers.formatTimeAgo(task.created_at)}
                        {task.status === 'completed' && task.completed_at && (
                            <span> • Completed {helpers.formatTimeAgo(task.completed_at)}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Task Detail Modal */}
            {showDetailModal && (
                <TaskDetailModal
                    task={task}
                    onClose={() => setShowDetailModal(false)}
                    onUpdate={onUpdate}
                    onComplete={onComplete}
                    onReopen={onReopen}
                    onDelete={onDelete}
                />
            )}
        </>
    );
};

// ✅ ENHANCED: CreateTaskForm with Searchable Project Input
const CreateTaskForm = ({ currentUser, projects, candidates, onClose, onCreateTask }) => {
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        candidate_id: null,
        project_id: null
    });

    // Enhanced state for searchable inputs
    const [candidateSearch, setCandidateSearch] = React.useState('');
    const [projectSearch, setProjectSearch] = React.useState('');
    const [selectedCandidate, setSelectedCandidate] = React.useState(null);
    const [selectedProject, setSelectedProject] = React.useState(null);
    const [showCandidateDropdown, setShowCandidateDropdown] = React.useState(false);
    const [showProjectDropdown, setShowProjectDropdown] = React.useState(false);

    React.useEffect(() => {
        console.log('📋 CreateTaskForm received data:');
        console.log(`  👥 Candidates: ${candidates.length}`);
        console.log(`  📁 Projects: ${projects.length}`);
    }, [candidates, projects]);

    // Filter candidates based on search
    const filteredCandidates = React.useMemo(() => {
        if (!candidateSearch.trim()) return candidates.slice(0, 10);
        
        return candidates.filter(candidate => {
            const searchText = candidateSearch.toLowerCase();
            return (
                candidate.name.toLowerCase().includes(searchText) ||
                candidate.job_title.toLowerCase().includes(searchText) ||
                candidate.company.toLowerCase().includes(searchText) ||
                candidate.email?.toLowerCase().includes(searchText)
            );
        }).slice(0, 10);
    }, [candidates, candidateSearch]);

    // ✅ Filter projects based on search
    const filteredProjects = React.useMemo(() => {
        if (!projectSearch.trim()) return projects.slice(0, 10);
        
        return projects.filter(project => {
            const searchText = projectSearch.toLowerCase();
            return (
                project.name.toLowerCase().includes(searchText) ||
                project.description?.toLowerCase().includes(searchText) ||
                project.created_by?.toLowerCase().includes(searchText)
            );
        }).slice(0, 10);
    }, [projects, projectSearch]);

    const handleCandidateSelect = (candidate) => {
        setSelectedCandidate(candidate);
        setCandidateSearch(candidate.name);
        setFormData({...formData, candidate_id: candidate.id});
        setShowCandidateDropdown(false);
    };

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setProjectSearch(project.name);
        setFormData({...formData, project_id: project.id});
        setShowProjectDropdown(false);
    };

    const handleCandidateSearchChange = (value) => {
        setCandidateSearch(value);
        setShowCandidateDropdown(true);
        
        if (selectedCandidate && value !== selectedCandidate.name) {
            setSelectedCandidate(null);
            setFormData({...formData, candidate_id: null});
        }
    };

    const handleProjectSearchChange = (value) => {
        setProjectSearch(value);
        setShowProjectDropdown(true);
        
        if (selectedProject && value !== selectedProject.name) {
            setSelectedProject(null);
            setFormData({...formData, project_id: null});
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Please enter a task title');
            return;
        }
        
        console.log('📝 Creating task with data:', {
            ...formData,
            candidate_name: selectedCandidate?.name,
            project_name: selectedProject?.name
        });
        
        onCreateTask({
            ...formData,
            candidate_id: formData.candidate_id || null,
            project_id: formData.project_id || null,
            // ✅ Store linked entity names for easy display
            linked_candidate_name: selectedCandidate?.name || null,
            linked_project_name: selectedProject?.name || null
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
        }}>
            <div style={{
                background: 'var(--card-bg)',
                padding: '30px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <h3 style={{
                    marginBottom: '25px',
                    color: 'var(--text-primary)',
                    fontSize: '20px',
                    fontWeight: '700'
                }}>
                    ➕ Create New Task
                </h3>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)'
                        }}>
                            Task Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Enter task title..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)'
                            }}
                            required
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)'
                        }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe the task..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                minHeight: '100px',
                                resize: 'vertical',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        marginBottom: '20px'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)'
                            }}>
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)'
                            }}>
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        marginBottom: '25px'
                    }}>
                        {/* Searchable Candidate Input */}
                        <div style={{ position: 'relative' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)'
                            }}>
                                Link to Candidate
                                <span style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--text-tertiary)',
                                    fontWeight: 'normal',
                                    marginLeft: '8px'
                                }}>
                                    ({candidates.length} available)
                                </span>
                            </label>
                            
                            <input
                                type="text"
                                value={candidateSearch}
                                onChange={(e) => handleCandidateSearchChange(e.target.value)}
                                onFocus={() => setShowCandidateDropdown(true)}
                                placeholder={candidates.length > 0 ? "Search candidates..." : "No candidates available"}
                                disabled={candidates.length === 0}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            
                            {selectedCandidate && (
                                <div style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '42px',
                                    color: '#48bb78',
                                    fontSize: '14px',
                                    pointerEvents: 'none'
                                }}>
                                    ✓
                                </div>
                            )}
                            
                            {showCandidateDropdown && candidateSearch && filteredCandidates.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 1000,
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {filteredCandidates.map(candidate => (
                                        <div
                                            key={candidate.id}
                                            onClick={() => handleCandidateSelect(candidate)}
                                            style={{
                                                padding: '12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--border-color)',
                                                transition: 'background 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'transparent';
                                            }}
                                        >
                                            <div style={{
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--text-primary)',
                                                marginBottom: '2px'
                                            }}>
                                                {candidate.name}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'var(--text-tertiary)'
                                            }}>
                                                {candidate.job_title} at {candidate.company}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* ✅ FIXED: Searchable Project Input */}
                        <div style={{ position: 'relative' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)'
                            }}>
                                Link to Project
                                <span style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--text-tertiary)',
                                    fontWeight: 'normal',
                                    marginLeft: '8px'
                                }}>
                                    ({projects.length} available)
                                </span>
                            </label>
                            
                            <input
                                type="text"
                                value={projectSearch}
                                onChange={(e) => handleProjectSearchChange(e.target.value)}
                                onFocus={() => setShowProjectDropdown(true)}
                                placeholder={projects.length > 0 ? "Search projects..." : "No projects available"}
                                disabled={projects.length === 0}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            
                            {selectedProject && (
                                <div style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '42px',
                                    color: '#48bb78',
                                    fontSize: '14px',
                                    pointerEvents: 'none'
                                }}>
                                    ✓
                                </div>
                            )}
                            
                            {showProjectDropdown && projectSearch && filteredProjects.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 1000,
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {filteredProjects.map(project => (
                                        <div
                                            key={project.id}
                                            onClick={() => handleProjectSelect(project)}
                                            style={{
                                                padding: '12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--border-color)',
                                                transition: 'background 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(72, 187, 120, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'transparent';
                                            }}
                                        >
                                            <div style={{
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--text-primary)',
                                                marginBottom: '2px'
                                            }}>
                                                📁 {project.name}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'var(--text-tertiary)'
                                            }}>
                                                {project.description?.substring(0, 60) || 'No description'}
                                                {project.description?.length > 60 ? '...' : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Show current selections */}
                    {(selectedCandidate || selectedProject) && (
                        <div style={{
                            background: 'rgba(102, 126, 234, 0.05)',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid rgba(102, 126, 234, 0.1)'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)',
                                marginBottom: '8px'
                            }}>
                                Task will be linked to:
                            </div>
                            {selectedCandidate && (
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text-primary)',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    👤 <strong>{selectedCandidate.name}</strong> 
                                    <span style={{ color: 'var(--text-tertiary)' }}>
                                        ({selectedCandidate.job_title})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCandidate(null);
                                            setCandidateSearch('');
                                            setFormData({...formData, candidate_id: null});
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#e53e3e',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            {selectedProject && (
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    📁 <strong>{selectedProject.name}</strong>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedProject(null);
                                            setProjectSearch('');
                                            setFormData({...formData, project_id: null});
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#e53e3e',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'var(--secondary-bg)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '12px 20px',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Click outside to close dropdowns */}
            {(showCandidateDropdown || showProjectDropdown) && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => {
                        setShowCandidateDropdown(false);
                        setShowProjectDropdown(false);
                    }}
                />
            )}
        </div>
    );
};

// ✅ NEW: Task Detail Modal Component
const TaskDetailModal = ({ task, onClose, onUpdate, onComplete, onReopen, onDelete }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editData, setEditData] = React.useState({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date
    });

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === 'pending';
    
    const priorityColors = {
        high: '#e53e3e',
        medium: '#ed8936',
        low: '#48bb78'
    };

    const handleSave = () => {
        onUpdate(task.id, editData);
        setIsEditing(false);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002
        }}>
            <div style={{
                background: 'var(--card-bg)',
                padding: '30px',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '700px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                maxHeight: '85vh',
                overflowY: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '25px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid var(--border-color)'
                }}>
                    <div>
                        <h2 style={{
                            color: 'var(--text-primary)',
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '8px'
                        }}>
                            📋 Task Details
                        </h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{
                                background: task.status === 'completed' ? '#48bb78' : priorityColors[task.priority],
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '700',
                                textTransform: 'uppercase'
                            }}>
                                {task.status === 'completed' ? '✅ COMPLETED' : `${task.priority} PRIORITY`}
                            </span>
                            {isOverdue && (
                                <span style={{
                                    background: '#e53e3e',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    animation: 'pulse 2s infinite'
                                }}>
                                    ⚠️ OVERDUE
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--secondary-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        ✕ Close
                    </button>
                </div>

                {/* Task Information */}
                <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '25px',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)'
                        }}>
                            Task Title
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.title}
                                onChange={(e) => setEditData({...editData, title: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        ) : (
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                margin: 0,
                                textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                            }}>
                                {task.title}
                            </h3>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)'
                        }}>
                            Description
                        </label>
                        {isEditing ? (
                            <textarea
                                value={editData.description}
                                onChange={(e) => setEditData({...editData, description: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    minHeight: '120px',
                                    resize: 'vertical',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit'
                                }}
                            />
                        ) : (
                            <div style={{
                                fontSize: '16px',
                                color: 'var(--text-primary)',
                                lineHeight: '1.6',
                                padding: '12px',
                                background: 'var(--card-bg)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                minHeight: '60px'
                            }}>
                                {task.description || (
                                    <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                        No description provided
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)'
                            }}>
                                Priority
                            </label>
                            {isEditing ? (
                                <select
                                    value={editData.priority}
                                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                            ) : (
                                <div style={{
                                    display: 'inline-block',
                                    background: priorityColors[task.priority],
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                }}>
                                    {task.priority} Priority
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)'
                            }}>
                                Due Date
                            </label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={editData.due_date}
                                    onChange={(e) => setEditData({...editData, due_date: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    fontSize: '16px',
                                    color: isOverdue ? '#e53e3e' : 'var(--text-primary)',
                                    fontWeight: isOverdue ? '700' : '500'
                                }}>
                                    {task.due_date ? (
                                        <>
                                            📅 {new Date(task.due_date).toLocaleDateString()}
                                            {isOverdue && (
                                                <span style={{ marginLeft: '8px', color: '#e53e3e' }}>
                                                    (OVERDUE)
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                            No due date set
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Linked Entities */}
                {(task.linked_candidate_name || task.linked_project_name) && (
                    <div style={{
                        background: 'rgba(72, 187, 120, 0.05)',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '25px',
                        border: '1px solid rgba(72, 187, 120, 0.1)'
                    }}>
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            marginBottom: '15px'
                        }}>
                            🔗 Linked Entities
                        </h4>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {task.linked_candidate_name && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(102, 126, 234, 0.2)'
                                }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}>
                                        👤 CANDIDATE
                                    </span>
                                    <div>
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {task.linked_candidate_name}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-tertiary)'
                                        }}>
                                            This task is related to candidate activities
                                        </div>
                                    </div>
                                </div>
                            )}
                            {task.linked_project_name && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: 'rgba(72, 187, 120, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(72, 187, 120, 0.2)'
                                }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}>
                                        📁 PROJECT
                                    </span>
                                    <div>
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {task.linked_project_name}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-tertiary)'
                                        }}>
                                            This task is part of project activities
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Task Metadata */}
                <div style={{
                    background: 'rgba(159, 122, 234, 0.05)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '25px',
                    border: '1px solid rgba(159, 122, 234, 0.1)'
                }}>
                    <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '15px'
                    }}>
                        📊 Task Information
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-tertiary)',
                                textTransform: 'uppercase',
                                fontWeight: '600',
                                marginBottom: '5px'
                            }}>
                                Status
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: task.status === 'completed' ? '#48bb78' : 'var(--text-primary)'
                            }}>
                                {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-tertiary)',
                                textTransform: 'uppercase',
                                fontWeight: '600',
                                marginBottom: '5px'
                            }}>
                                Created By
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-primary)'
                            }}>
                                {task.created_by}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-tertiary)',
                                textTransform: 'uppercase',
                                fontWeight: '600',
                                marginBottom: '5px'
                            }}>
                                Created Date
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-primary)'
                            }}>
                                {new Date(task.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        {task.completed_at && (
                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                    fontWeight: '600',
                                    marginBottom: '5px'
                                }}>
                                    Completed Date
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#48bb78'
                                }}>
                                    {new Date(task.completed_at).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap'
                }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                style={{
                                    background: 'var(--secondary-bg)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '12px 20px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                ✓ Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                ✏️ Edit Task
                            </button>
                            
                            {task.status === 'pending' ? (
                                <button
                                    onClick={() => {
                                        onComplete(task.id);
                                        onClose();
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✓ Mark Complete
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        onReopen(task.id);
                                        onClose();
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ↺ Reopen Task
                                </button>
                            )}
                            
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this task?')) {
                                        onDelete(task.id);
                                        onClose();
                                    }
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                🗑️ Delete Task
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Add pulse animation for overdue indicator */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.05);
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    );
};

// ✅ NOTES COMPONENTS - ADD ALL OF THESE

// Main Categorized Notes Modal Component
const CategorizedNotesModal = ({ 
    currentUser, 
    categories, 
    notes,
    onClose, 
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateNote, 
    onUpdateNote, 
    onDeleteNote 
}) => {
    const [activeView, setActiveView] = React.useState('categories');
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    const categoryNotes = React.useMemo(() => {
        if (!selectedCategory) return [];
        return notes.filter(note => note.category_id === selectedCategory.id);
    }, [notes, selectedCategory]);

    const filteredNotes = React.useMemo(() => {
        if (!searchQuery.trim()) return categoryNotes;
        
        const query = searchQuery.toLowerCase();
        return categoryNotes.filter(note => 
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    }, [categoryNotes, searchQuery]);

    const totalNotes = notes.length;

    return (
        <div className="modal">
            <div className="modal-content" style={{ 
                maxWidth: '1400px', 
                height: '85vh', 
                display: 'flex', 
                flexDirection: 'column',
                padding: '30px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid var(--border-color)'
                }}>
                    <div>
                        <h2 style={{ 
                            color: 'var(--text-primary)', 
                            marginBottom: '10px',
                            fontSize: '24px',
                            fontWeight: '700'
                        }}>
                            📝 Categorized Notes Journal
                        </h2>
                        <div style={{ 
                            color: 'var(--text-tertiary)',
                            fontSize: '14px',
                            display: 'flex',
                            gap: '20px'
                        }}>
                            <span>📁 {categories.length} categories</span>
                            <span>📄 {totalNotes} total notes</span>
                            {selectedCategory && <span>📋 {categoryNotes.length} notes in "{selectedCategory.name}"</span>}
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {activeView === 'categories' && (
                            <button
                                onClick={() => setActiveView('create-category')}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                ➕ New Category
                            </button>
                        )}
                        
                        {activeView === 'category-notes' && selectedCategory && (
                            <>
                                <button
                                    onClick={() => setActiveView('create-note')}
                                    style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ➕ New Note
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveView('categories');
                                        setSelectedCategory(null);
                                        setSearchQuery('');
                                    }}
                                    style={{
                                        background: 'var(--secondary-bg)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        padding: '12px 20px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ← Back to Categories
                                </button>
                            </>
                        )}
                        
                        {(activeView === 'create-category' || activeView === 'create-note') && (
                            <button
                                onClick={() => {
                                    if (activeView === 'create-category') {
                                        setActiveView('categories');
                                    } else {
                                        setActiveView('category-notes');
                                    }
                                }}
                                style={{
                                    background: 'var(--secondary-bg)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '12px 20px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        )}
                        
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--secondary-bg)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '12px 18px',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {activeView === 'categories' && (
                        <CategoriesView 
                            categories={categories}
                            notes={notes}
                            onSelectCategory={(category) => {
                                setSelectedCategory(category);
                                setActiveView('category-notes');
                            }}
                            onEditCategory={onUpdateCategory}
                            onDeleteCategory={onDeleteCategory}
                        />
                    )}
                    
                    {activeView === 'category-notes' && selectedCategory && (
                        <CategoryNotesView 
                            category={selectedCategory}
                            notes={filteredNotes}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onEditNote={onUpdateNote}
                            onDeleteNote={onDeleteNote}
                        />
                    )}
                    
                    {activeView === 'create-category' && (
                        <CreateCategoryForm 
                            currentUser={currentUser}
                            onSave={(data) => {
                                onCreateCategory(data).then(result => {
                                    if (result.success) {
                                        setActiveView('categories');
                                    }
                                });
                            }}
                            onCancel={() => setActiveView('categories')}
                        />
                    )}
                    
                    {activeView === 'create-note' && selectedCategory && (
                        <CreateNoteForm 
                            currentUser={currentUser}
                            category={selectedCategory}
                            onSave={(data) => {
                                onCreateNote({ ...data, category_id: selectedCategory.id }).then(result => {
                                    if (result.success) {
                                        setActiveView('category-notes');
                                    }
                                });
                            }}
                            onCancel={() => setActiveView('category-notes')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Categories Overview Component
const CategoriesView = ({ categories, notes, onSelectCategory, onEditCategory, onDeleteCategory }) => {
    return (
        <div>
            <h3 style={{ 
                marginBottom: '20px',
                color: 'var(--text-primary)',
                fontSize: '18px'
            }}>
                📁 Note Categories
            </h3>
            
            {categories.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--text-tertiary)',
                    background: 'var(--card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
                    <h4>No categories yet</h4>
                    <p>Create your first category to organize your notes!</p>
                    <p style={{ fontSize: '12px', marginTop: '10px' }}>
                        Examples: "1:1 with Manager", "Project Alpha", "Meeting Notes"
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {categories.map(category => {
                        const categoryNotes = notes.filter(note => note.category_id === category.id);
                        const latestNote = categoryNotes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
                        
                        return (
                            <div
                                key={category.id}
                                style={{
                                    background: 'var(--card-bg)',
                                    border: `2px solid ${category.color}20`,
                                    borderLeft: `6px solid ${category.color}`,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                                onClick={() => onSelectCategory(category)}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '12px'
                                }}>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        flex: 1
                                    }}>
                                        {category.name}
                                    </h4>
                                    
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newName = prompt('Edit category name:', category.name);
                                                if (newName && newName.trim()) {
                                                    onEditCategory(category.id, { name: newName.trim() });
                                                }
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                color: 'var(--text-muted)'
                                            }}
                                            title="Edit category"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Delete category "${category.name}" and all its notes?`)) {
                                                    onDeleteCategory(category.id);
                                                }
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                color: '#e53e3e'
                                            }}
                                            title="Delete category"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                {category.description && (
                                    <p style={{
                                        margin: '0 0 12px 0',
                                        fontSize: '13px',
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.4'
                                    }}>
                                        {category.description}
                                    </p>
                                )}
                                
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '12px',
                                    color: 'var(--text-tertiary)'
                                }}>
                                    <span style={{
                                        background: `${category.color}20`,
                                        color: category.color,
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontWeight: '600'
                                    }}>
                                        📄 {categoryNotes.length} notes
                                    </span>
                                    
                                    {latestNote && (
                                        <span>
                                            Updated {helpers.formatTimeAgo(latestNote.updated_at)}
                                        </span>
                                    )}
                                </div>
                                
                                {latestNote && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '8px',
                                        background: 'var(--input-bg)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        Latest: {latestNote.title}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Category Notes View Component
const CategoryNotesView = ({ category, notes, searchQuery, onSearchChange, onEditNote, onDeleteNote }) => {
    const [selectedNote, setSelectedNote] = React.useState(null);
    const [isEditing, setIsEditing] = React.useState(false);

    return (
        <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
            {/* Notes List */}
            <div style={{ 
                flex: selectedNote ? '0 0 350px' : '1',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <h3 style={{ 
                        margin: 0,
                        color: 'var(--text-primary)',
                        fontSize: '18px'
                    }}>
                        📋 {category.name} ({notes.length})
                    </h3>
                    <div style={{
                        padding: '6px 12px',
                        background: `${category.color}20`,
                        color: category.color,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}>
                        {category.name}
                    </div>
                </div>
                
                {/* Search Bar */}
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search notes in this category..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>
                
                {/* Notes List */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    background: 'var(--card-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    padding: '10px'
                }}>
                    {notes.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-tertiary)'
                        }}>
                            {searchQuery ? 
                                `No notes found for "${searchQuery}"` : 
                                `No notes in "${category.name}" yet. Create your first note!`
                            }
                        </div>
                    ) : (
                        notes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => {
                                    setSelectedNote(note);
                                    setIsEditing(false);
                                }}
                                style={{
                                    padding: '15px',
                                    marginBottom: '10px',
                                    background: selectedNote?.id === note.id ? 
                                        `${category.color}15` : 'var(--input-bg)',
                                    border: selectedNote?.id === note.id ?
                                        `2px solid ${category.color}40` : '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    {note.title}
                                </h4>
                                <p style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '12px',
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.4',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {note.content.replace(/<[^>]*>/g, '')}
                                </p>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>{helpers.formatTimeAgo(note.updated_at)}</span>
                                    <span>by {note.created_by}</span>
                                </div>
                                
                                {note.tags && note.tags.length > 0 && (
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {note.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                style={{
                                                    background: `${category.color}20`,
                                                    color: category.color,
                                                    padding: '2px 6px',
                                                    borderRadius: '8px',
                                                    fontSize: '10px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {note.tags.length > 3 && (
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                +{note.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Note Detail View */}
{selectedNote && (
    <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'auto',
        minHeight: 0
    }}>
                    <NoteDetailView 
                        note={selectedNote}
                        category={category}
                        isEditing={isEditing}
                        onEdit={() => setIsEditing(true)}
                        onSave={onEditNote}
                        onCancel={() => setIsEditing(false)}
                        onDelete={onDeleteNote}
                        onClose={() => setSelectedNote(null)}
                    />
                </div>
            )}
        </div>
    );
};

// Create Category Form Component
const CreateCategoryForm = ({ currentUser, onSave, onCancel }) => {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [color, setColor] = React.useState('#667eea');

    const predefinedColors = [
        '#667eea', '#48bb78', '#ed8936', '#e53e3e', '#38b2ac', '#9f7aea', '#ec4899', '#06b6d4'
    ];

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Please enter a category name');
            return;
        }

        onSave({
            name: name.trim(),
            description: description.trim(),
            color
        });
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ 
                marginBottom: '30px',
                color: 'var(--text-primary)',
                fontSize: '20px',
                textAlign: 'center'
            }}>
                📁 Create New Category
            </h3>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    Category Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., 1:1 with John Smith, Project Alpha, Meeting Notes..."
                    style={{
                        width: '100%',
                        padding: '15px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)'
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    Description (optional)
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what notes go in this category..."
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '15px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                    }}
                />
            </div>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    Category Color
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {predefinedColors.map(colorOption => (
                        <button
                            key={colorOption}
                            onClick={() => setColor(colorOption)}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                border: color === colorOption ? '3px solid var(--text-primary)' : '2px solid var(--border-color)',
                                background: colorOption,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            title={colorOption}
                        />
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '15px 30px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    style={{
                        padding: '15px 30px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}
                >
                    📁 Create Category
                </button>
            </div>
        </div>
    );
};

// FIXED Create Note Form Component
const CreateNoteForm = ({ currentUser, category, onSave, onCancel }) => {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [tags, setTags] = React.useState('');

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please enter a title for your note');
            return;
        }

        const result = await onSave({
            title: title.trim(),
            content: content.trim(),
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            category_id: category.id,
            created_by: currentUser.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        if (result.success) {
            // Reset form
            setTitle('');
            setContent('');
            setTags('');
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(90vh - 160px)', // Ensure form fits in modal
            gap: '15px'
        }}>
            {/* Header */}
            <div style={{
                background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}DD 100%)`,
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '10px'
            }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    📝 New Note in "{category.name}"
                </h3>
            </div>

            {/* Scrollable Content Area */}
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                paddingRight: '5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                {/* Title */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                    }}>
                        Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter note title..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Tags */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                    }}>
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="action-items, feedback, decisions..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Content - Rich Text Editor */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: '200px'
                }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '5px',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                    }}>
                        Content
                    </label>
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Start typing your note..."
                    />
                </div>
            </div>

            {/* Fixed Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                padding: '20px',
                borderTop: '2px solid var(--border-color)',
                background: 'var(--card-bg)',
                marginTop: '20px',
                position: 'sticky',
                bottom: 0,
                zIndex: 100
            }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        padding: '15px 25px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'var(--secondary-bg)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        minWidth: '120px'
                    }}
                >
                    ❌ Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    style={{
                        padding: '15px 25px',
                        background: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        minWidth: '120px',
                        boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
                    }}
                >
                    💾 Save Note
                </button>
            </div>
        </div>
    );
};

// Note Detail View Component
const NoteDetailView = ({ note, category, isEditing, onEdit, onSave, onCancel, onDelete, onClose }) => {
    const [editTitle, setEditTitle] = React.useState(note.title);
    const [editContent, setEditContent] = React.useState(note.content);
    const [editTags, setEditTags] = React.useState((note.tags || []).join(', '));

    const handleSave = async () => {
        const result = await onSave(note.id, {
            title: editTitle.trim(),
            content: editContent.trim(),
            tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag)
        });

        if (result.success) {
            onCancel();
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this note?')) {
            const result = await onDelete(note.id);
            if (result.success) {
                onClose();
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                padding: '15px',
                background: `${category.color}15`,
                borderRadius: '8px',
                border: `1px solid ${category.color}40`
            }}>
                <h3 style={{ 
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    margin: 0
                }}>
                    📖 Note Details
                </h3>
                <div style={{
                    padding: '6px 12px',
                    background: `${category.color}30`,
                    color: category.color,
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                }}>
                    {category.name}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'flex-end' }}>
                {!isEditing ? (
                    <>
                        <button
                            onClick={onEdit}
                            style={{
                                padding: '8px 12px',
                                background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}DD 100%)`,
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            style={{
                                padding: '8px 12px',
                                background: 'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            🗑️ Delete
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '8px 12px',
                                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            💾 Save
                        </button>
                        <button
                            onClick={onCancel}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>

            {/* Title */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    Title
                </label>
                {isEditing ? (
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)'
                        }}
                    />
                ) : (
                    <h4 style={{
                        margin: 0,
                        fontSize: '16px',
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                    }}>
                        {note.title}
                    </h4>
                )}
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    Tags
                </label>
                {isEditing ? (
                    <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="action-items, feedback, decisions..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)'
                        }}
                    />
                ) : (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {(note.tags || []).map(tag => (
                            <span
                                key={tag}
                                style={{
                                    background: `${category.color}20`,
                                    color: category.color,
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    Content
                </label>
                {isEditing ? (
                    <RichTextEditor
                        content={editContent}
                        onChange={setEditContent}
                        placeholder="Edit your note content..."
                    />
                ) : (
                    <div
    style={{
        flex: 1,
        padding: '15px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'var(--text-primary)',
        overflowY: 'auto',
        minHeight: 0,
        maxHeight: '400px'
    }}
    dangerouslySetInnerHTML={{ __html: note.content }}
/>
                )}
            </div>

            {/* Metadata */}
            <div style={{
                marginTop: '15px',
                padding: '10px',
                background: 'var(--input-bg)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text-tertiary)'
            }}>
                <div>Created: {helpers.formatTimestamp(note.created_at)} by {note.created_by}</div>
                <div>Last updated: {helpers.formatTimeAgo(note.updated_at)}</div>
            </div>
        </div>
    );
};

// FIXED Rich Text Editor Component
const RichTextEditor = ({ content, onChange, placeholder }) => {
    const editorRef = React.useRef(null);
    const [internalContent, setInternalContent] = React.useState(content || '');
    const [isFocused, setIsFocused] = React.useState(false);
    const isUpdatingRef = React.useRef(false);

    // Update internal content when external content changes (but not during typing)
    React.useEffect(() => {
        if (!isFocused && content !== internalContent) {
            setInternalContent(content || '');
            if (editorRef.current && !isUpdatingRef.current) {
                editorRef.current.innerHTML = content || '';
            }
        }
    }, [content, isFocused, internalContent]);

    // Set initial content
    React.useEffect(() => {
        if (editorRef.current && !isFocused) {
            editorRef.current.innerHTML = internalContent;
        }
    }, []);

    const handleCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setInternalContent(newContent);
            onChange(newContent);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            isUpdatingRef.current = true;
            const newContent = editorRef.current.innerHTML;
            setInternalContent(newContent);
            onChange(newContent);
            // Reset the flag after a brief delay
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 10);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        // Ensure content is preserved on blur
        if (editorRef.current) {
            const currentContent = editorRef.current.innerHTML;
            setInternalContent(currentContent);
            onChange(currentContent);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px',
            flex: 1,
            maxHeight: '300px' // Limit height to prevent modal overflow
        }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                gap: '5px',
                padding: '8px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                borderRadius: '8px 8px 0 0',
                flexWrap: 'wrap'
            }}>
                <button
                    type="button"
                    onClick={() => handleCommand('bold')}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => handleCommand('italic')}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontStyle: 'italic'
                    }}
                >
                    I
                </button>
                <button
                    type="button"
                    onClick={() => handleCommand('underline')}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textDecoration: 'underline'
                    }}
                >
                    U
                </button>
                <button
                    type="button"
                    onClick={() => handleCommand('insertUnorderedList')}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    • List
                </button>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                suppressContentEditableWarning={true}
                style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    minHeight: '150px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    outline: 'none',
                    borderRadius: '0 0 8px 8px'
                }}
                data-placeholder={placeholder}
            />
        </div>
    );
};

// ✅ END OF COMPONENTS TO ADD

// Export to global scope
window.DashboardComponent = DashboardComponent;
