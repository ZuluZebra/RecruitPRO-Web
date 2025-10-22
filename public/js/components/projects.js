// Enhanced Projects Component - COMPREHENSIVE VERSION WITH ALL REQUESTED FEATURES
// projects.js

const ProjectsComponent = ({ 
    currentUser, 
    projects = [], 
    candidates = [], 
    onViewCandidate,
    setProjects
}) => {
    // Core state
    const [showProjectModal, setShowProjectModal] = React.useState(false);
    const [showProjectDetails, setShowProjectDetails] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filteredProjects, setFilteredProjects] = React.useState(projects);
    const [successMessage, setSuccessMessage] = React.useState('');
    
    // Archive functionality
    const [showArchivedProjects, setShowArchivedProjects] = React.useState(false);
    
    // Modal states
    const [showCandidateModal, setShowCandidateModal] = React.useState(false);
    const [selectedCandidate, setSelectedCandidate] = React.useState(null);
    
    // NEW: View mode state
    const [viewMode, setViewMode] = React.useState('grid'); // 'grid' or 'kanban'
    
    // NEW: Advanced filtering state
    const [filters, setFilters] = React.useState({
        status: 'all',
        hiringManager: 'all',
        deadline: 'all',
        progress: 'all',
        candidateCount: 'all'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    
    // NEW: Bulk operations state
    const [selectedProjectIds, setSelectedProjectIds] = React.useState(new Set());
    const [bulkMode, setBulkMode] = React.useState(false);
    
    // NEW: Notifications state
    const [notifications, setNotifications] = React.useState([]);

    // Function to refresh projects list from API
    const refreshProjects = async () => {
        try {
            const result = await api.getProjects();
            if (result.data && setProjects) {
                setProjects(result.data);
                console.log('✅ Projects refreshed:', result.data.length);
            }
        } catch (error) {
            console.error('Error refreshing projects:', error);
        }
    };

    // NEW: Generate smart notifications
    const generateNotifications = React.useCallback(() => {
        const newNotifications = [];
        const today = new Date();
        
        projects.forEach(project => {
            if (project.status === 'archived') return;
            
            // Overdue projects
            if (project.deadline && new Date(project.deadline) < today) {
                newNotifications.push({
                    id: `overdue-${project.id}`,
                    type: 'overdue',
                    project: project,
                    message: `Project "${project.name}" is overdue`,
                    severity: 'high'
                });
            }
            
            // Due soon (within 7 days)
            else if (project.deadline) {
                const daysUntilDeadline = Math.ceil((new Date(project.deadline) - today) / (1000 * 60 * 60 * 24));
                if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
                    newNotifications.push({
                        id: `due-soon-${project.id}`,
                        type: 'due-soon',
                        project: project,
                        message: `Project "${project.name}" is due in ${daysUntilDeadline} day(s)`,
                        severity: 'medium'
                    });
                }
            }
            
            // Progress milestones - use historical data for notifications
            const allProjectCandidates = candidates.filter(c => c.project_id === project.id);
            const totalHiredCount = allProjectCandidates.filter(c => c.status === 'hired').length;
            const progress = project.target_hires > 0 ? Math.round((totalHiredCount / project.target_hires) * 100) : 0;
            
            if (progress >= 100) {
                newNotifications.push({
                    id: `completed-${project.id}`,
                    type: 'completed',
                    project: project,
                    message: `Project "${project.name}" has reached its hiring target!`,
                    severity: 'success'
                });
            }
        });
        
        setNotifications(newNotifications);
    }, [projects, candidates]);

    // NEW: Advanced filtering logic
    const applyFilters = React.useCallback(() => {
        let filtered = projects;
        
        // Archive filter
        if (showArchivedProjects) {
            filtered = filtered.filter(project => project.status === 'archived');
        } else {
            filtered = filtered.filter(project => project.status !== 'archived');
        }
        
        // Search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(project => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    project.name.toLowerCase().includes(searchLower) ||
                    project.description?.toLowerCase().includes(searchLower) ||
                    project.hiring_manager?.toLowerCase().includes(searchLower) ||
                    project.created_by?.toLowerCase().includes(searchLower)
                );
            });
        }
        
        // Advanced filters
        if (filters.status !== 'all') {
            filtered = filtered.filter(project => project.status === filters.status);
        }
        
        if (filters.hiringManager !== 'all') {
            filtered = filtered.filter(project => project.hiring_manager === filters.hiringManager);
        }
        
        if (filters.deadline !== 'all') {
            const today = new Date();
            filtered = filtered.filter(project => {
                if (!project.deadline) return filters.deadline === 'no-deadline';
                
                const deadline = new Date(project.deadline);
                const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                
                switch (filters.deadline) {
                    case 'overdue': return daysUntilDeadline < 0;
                    case 'due-week': return daysUntilDeadline >= 0 && daysUntilDeadline <= 7;
                    case 'due-month': return daysUntilDeadline > 7 && daysUntilDeadline <= 30;
                    case 'future': return daysUntilDeadline > 30;
                    case 'no-deadline': return false;
                    default: return true;
                }
            });
        }
        
        if (filters.progress !== 'all') {
            filtered = filtered.filter(project => {
                // Use historical data for progress calculation
                const allProjectCandidates = candidates.filter(c => c.project_id === project.id);
                const totalHiredCount = allProjectCandidates.filter(c => c.status === 'hired').length;
                const progress = project.target_hires > 0 ? 
                    Math.round((totalHiredCount / project.target_hires) * 100) : 0;
                
                switch (filters.progress) {
                    case 'not-started': return progress === 0;
                    case 'in-progress': return progress > 0 && progress < 100;
                    case 'completed': return progress >= 100;
                    default: return true;
                }
            });
        }
        
        if (filters.candidateCount !== 'all') {
            filtered = filtered.filter(project => {
                // Use active candidates for current workload assessment
                const activeCandidateCount = candidates.filter(c => c.project_id === project.id && !c.archived).length;
                
                switch (filters.candidateCount) {
                    case 'none': return candidateCount === 0;
                    case 'few': return candidateCount > 0 && candidateCount <= 5;
                    case 'many': return candidateCount > 5;
                    default: return true;
                }
            });
        }
        
        setFilteredProjects(filtered);
    }, [searchTerm, projects, showArchivedProjects, filters, candidates]);

    // Apply filters when dependencies change
    React.useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Generate notifications when projects or candidates change
    React.useEffect(() => {
        generateNotifications();
    }, [generateNotifications]);

    // NEW: Get unique hiring managers for filter dropdown
    const uniqueHiringManagers = React.useMemo(() => {
        const managers = [...new Set(projects.map(p => p.hiring_manager).filter(Boolean))];
        return managers.sort();
    }, [projects]);

    // NEW: Bulk operations handlers
    const handleSelectProject = (projectId, checked) => {
        const newSelected = new Set(selectedProjectIds);
        if (checked) {
            newSelected.add(projectId);
        } else {
            newSelected.delete(projectId);
        }
        setSelectedProjectIds(newSelected);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedProjectIds(new Set(filteredProjects.map(p => p.id)));
        } else {
            setSelectedProjectIds(new Set());
        }
    };

    const handleBulkArchive = async () => {
        if (selectedProjectIds.size === 0) return;
        
        if (!confirm(`Archive ${selectedProjectIds.size} selected project(s)?`)) return;
        
        try {
            const promises = Array.from(selectedProjectIds).map(id => 
                api.updateProject(id, { status: 'archived', updated_by: currentUser.name })
            );
            
            await Promise.all(promises);
            setSelectedProjectIds(new Set());
            setBulkMode(false);
            setSuccessMessage(`${selectedProjectIds.size} project(s) archived successfully! 📦`);
            setTimeout(() => setSuccessMessage(''), 3000);
            await refreshProjects();
        } catch (error) {
            console.error('Bulk archive error:', error);
            alert('Error archiving projects. Please try again.');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProjectIds.size === 0) return;
        
        if (!confirm(`DELETE ${selectedProjectIds.size} selected project(s)? This cannot be undone!`)) return;
        
        try {
            const promises = Array.from(selectedProjectIds).map(id => api.deleteProject(id));
            await Promise.all(promises);
            setSelectedProjectIds(new Set());
            setBulkMode(false);
            setSuccessMessage(`${selectedProjectIds.size} project(s) deleted successfully! 🗑️`);
            setTimeout(() => setSuccessMessage(''), 3000);
            await refreshProjects();
        } catch (error) {
            console.error('Bulk delete error:', error);
            alert('Error deleting projects. Please try again.');
        }
    };

    // Standard CRUD operations
    const openProjectDetails = (project) => {
        setSelectedProject(project);
        setShowProjectDetails(true);
    };

    const closeProjectDetails = () => {
        setShowProjectDetails(false);
        setSelectedProject(null);
    };

    const openCandidateModal = (candidate) => {
        setSelectedCandidate(candidate);
        setShowCandidateModal(true);
    };

    const closeCandidateModal = () => {
        setShowCandidateModal(false);
        setSelectedCandidate(null);
    };

    const createProject = async (projectData) => {
        try {
            const response = await api.createProject({
                ...projectData,
                created_by: currentUser.name,
                created_at: new Date().toISOString(),
                status: 'active',
                comments: [],
                timeline: [{
                    id: 1,
                    type: 'created',
                    message: `Project created by ${currentUser.name}`,
                    user: currentUser.name,
                    timestamp: new Date().toISOString()
                }]
            });
            
            if (response.data) {
                setShowProjectModal(false);
                setSuccessMessage('Project created successfully! 🎉');
                setTimeout(() => setSuccessMessage(''), 3000);
                await refreshProjects();
            } else {
                throw new Error('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project. Please try again.');
        }
    };

    const removeCandidateFromProject = async (candidateId) => {
        if (confirm('Remove this candidate from the project?')) {
            try {
                await api.removeCandidateFromProject(selectedProject.id, candidateId);
            } catch (error) {
                console.error('Error removing candidate:', error);
            }
        }
    };

    const toggleArchiveProject = async (projectId, currentStatus) => {
        const isArchiving = currentStatus !== 'archived';
        const action = isArchiving ? 'archive' : 'unarchive';
        
        if (!confirm(`Are you sure you want to ${action} this project?`)) {
            return;
        }

        try {
            const newStatus = isArchiving ? 'archived' : 'active';
            const response = await api.updateProject(projectId, { 
                status: newStatus,
                updated_by: currentUser.name 
            });
            
            if (response.data) {
                setSelectedProject(response.data);
                setSuccessMessage(`Project ${action}d successfully! ${isArchiving ? '📦' : '📂'}`);
                setTimeout(() => setSuccessMessage(''), 3000);
                await refreshProjects();
            }
        } catch (error) {
            console.error(`Error ${action}ing project:`, error);
            alert(`Error ${action}ing project. Please try again.`);
        }
    };

    const deleteProject = async (projectId) => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        try {
            const result = await api.deleteProject(projectId);
            
            if (result.error) {
                throw new Error(result.error);
            }

            closeProjectDetails();
            setSuccessMessage('Project deleted successfully! 🗑️');
            setTimeout(() => setSuccessMessage(''), 3000);
            await refreshProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project. Please try again.');
        }
    };

    const updateProject = async (projectId, updateData) => {
        try {
            const response = await api.updateProject(projectId, updateData);
            if (response.data) {
                setSelectedProject(response.data);
                await refreshProjects();
            }
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    // Calculate analytics
    const activeProjects = projects.filter(p => p.status !== 'archived');
    const archivedProjects = projects.filter(p => p.status === 'archived');
    const currentViewProjects = showArchivedProjects ? archivedProjects : activeProjects;
    

     // Calculate project-based success rate (not candidate-based)
     const calculateProjectSuccessRate = (projects, candidates) => {
        const archivedProjects = projects.filter(p => p.status === 'archived');
        
        if (archivedProjects.length === 0) return 0;
        
        const successfulProjects = archivedProjects.filter(project => {
            const projectCandidates = candidates.filter(c => c.project_id === project.id);
            const hiredCount = projectCandidates.filter(c => c.status === 'hired').length;
            return project.target_hires > 0 && hiredCount >= project.target_hires;
        }).length;
        
        return Math.round((successfulProjects / archivedProjects.length) * 100);
    };
    
    const analytics = React.useMemo(() => {
        const totalProjects = projects.length;
        
        // Historical completion calculation (uses all candidates including archived)
        const completed = projects.filter(p => {
            const allProjectCandidates = candidates.filter(c => c.project_id === p.id);
            const totalHiredCount = allProjectCandidates.filter(c => c.status === 'hired').length;
            return p.target_hires > 0 && totalHiredCount >= p.target_hires;
        }).length;
        
        const overdue = projects.filter(p => {
            if (!p.deadline || p.status === 'archived') return false;
            return new Date(p.deadline) < new Date();
        }).length;
        
        // Historical metrics - count ALL candidates and hired from ALL projects
        const allProjectCandidates = candidates.filter(c => 
            projects.some(p => p.id === c.project_id)
        );
        
        const totalHiredEver = candidates.filter(c => 
            c.status === 'hired' && projects.some(p => p.id === c.project_id)
        ).length;
        
        // Operational metrics - only active projects
        const activeCandidates = candidates.filter(c => 
            projects.some(p => p.id === c.project_id && p.status !== 'archived') && !c.archived
        );
        
        const activeHired = candidates.filter(c => 
            c.status === 'hired' && 
            projects.some(p => p.id === c.project_id && p.status !== 'archived') &&
            !c.archived
        ).length;
        
        return {
            totalProjects,
            activeProjects: activeProjects.length,
            completedProjects: completed,
            overdueProjects: overdue,
            completionRate: totalProjects > 0 ? Math.round((completed / totalProjects) * 100) : 0,
            
            // Historical metrics
            totalCandidates: allProjectCandidates.length,
            totalHired: totalHiredEver, // This is the key fix!
            hiringRate: calculateProjectSuccessRate(projects, candidates),
            
            // Operational metrics
            activeCandidates: activeCandidates.length,
            activeHired: activeHired
        };
    }, [projects, candidates, activeProjects]);

    

    return (
        <div className="split-view-container">
            <div className="main-content">
                {/* Header with notifications */}
                <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '30px'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                            <h2 style={{
                                margin: 0,
                                color: 'var(--text-primary)',
                                fontSize: '28px',
                                fontWeight: '700'
                            }}>
                                📁 Project Management
                            </h2>
                            
                            {/* NEW: Notifications badge */}
                            {notifications.length > 0 && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                                    color: 'white',
                                    borderRadius: '20px',
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                title={`${notifications.length} notification(s)`}
                                >
                                    🔔 {notifications.length}
                                </div>
                            )}
                        </div>
                        <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>
                            Organize candidates by hiring projects and initiatives
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* NEW: View mode toggle */}
                        <div style={{
                            display: 'flex',
                            background: 'var(--card-bg)',
                            borderRadius: '8px',
                            padding: '4px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    background: viewMode === 'grid' ? 'var(--accent-color)' : 'transparent',
                                    color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                🔲 Grid
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                style={{
                                    background: viewMode === 'kanban' ? 'var(--accent-color)' : 'transparent',
                                    color: viewMode === 'kanban' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                📋 Kanban
                            </button>
                        </div>

                        {/* NEW: Bulk operations toggle */}
                        <button
                            onClick={() => {
                                setBulkMode(!bulkMode);
                                setSelectedProjectIds(new Set());
                            }}
                            style={{
                                background: bulkMode ? 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' : 'var(--border-color)',
                                color: bulkMode ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            ☑️ {bulkMode ? 'Exit Bulk' : 'Bulk Select'}
                        </button>

                        {/* Archive toggle */}
                        <button 
                            className={`archive-toggle ${showArchivedProjects ? 'active' : ''}`}
                            onClick={() => setShowArchivedProjects(!showArchivedProjects)}
                            style={{
                                background: showArchivedProjects 
                                    ? 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' 
                                    : 'linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {showArchivedProjects ? '📦 Archived Projects' : '📂 Active Projects'}
                            <span style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '12px'
                            }}>
                                {showArchivedProjects ? archivedProjects.length : activeProjects.length}
                            </span>
                        </button>
                        
                        <button 
                            className="add-button"
                            onClick={() => setShowProjectModal(true)}
                        >
                            ➕ Create Project
                        </button>
                    </div>
                </div>

                {/* NEW: Smart Notifications Panel */}
                {notifications.length > 0 && (
                    <div style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600' }}>
                            🔔 Smart Notifications
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {notifications.slice(0, 3).map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => openProjectDetails(notification.project)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        background: notification.severity === 'high' ? 'rgba(229, 62, 62, 0.1)' :
                                                   notification.severity === 'medium' ? 'rgba(237, 137, 54, 0.1)' :
                                                   'rgba(72, 187, 120, 0.1)',
                                        border: `1px solid ${notification.severity === 'high' ? '#e53e3e' :
                                                                notification.severity === 'medium' ? '#ed8936' :
                                                                '#48bb78'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <span style={{ fontSize: '16px' }}>
                                        {notification.type === 'overdue' ? '⚠️' :
                                         notification.type === 'due-soon' ? '📅' :
                                         notification.type === 'completed' ? '🎉' : '📌'}
                                    </span>
                                    <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                        {notification.message}
                                    </span>
                                </div>
                            ))}
                            {notifications.length > 3 && (
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    ... and {notifications.length - 3} more notification(s)
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div style={{
                        background: 'linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textAlign: 'center',
                        animation: 'slideIn 0.3s ease'
                    }}>
                        {successMessage}
                    </div>
                )}

                {/* NEW: Basic Analytics Dashboard */}
                <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '16px',
                    padding: '25px',
                    marginBottom: '30px',
                    border: '1px solid var(--border-color)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <h4 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600' }}>
                        📈 Project Analytics
                    </h4>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        <div className="analytics-card">
                            <div className="analytics-number">{analytics.totalProjects}</div>
                            <div className="analytics-label">Total Projects</div>
                        </div>
                        
                        <div className="analytics-card">
                            <div className="analytics-number">{analytics.activeProjects}</div>
                            <div className="analytics-label">Active Projects</div>
                        </div>
                        
                        <div className="analytics-card">
                            <div className="analytics-number">{analytics.completionRate}%</div>
                            <div className="analytics-label">Completion Rate</div>
                        </div>
                        
                        <div className="analytics-card">
                            <div className="analytics-number">{analytics.hiringRate}%</div>
                            <div className="analytics-label">Hiring Success Rate</div>
                        </div>
                        
                        <div className="analytics-card">
                            <div className="analytics-number" style={{ color: analytics.overdueProjects > 0 ? '#e53e3e' : 'var(--accent-color)' }}>
                                {analytics.overdueProjects}
                            </div>
                            <div className="analytics-label">Overdue Projects</div>
                        </div>
                        
                        <div className="analytics-card">
                            <div className="analytics-number">{analytics.totalHired}</div>
                            <div className="analytics-label">Total Hired</div>
                        </div>
                    </div>
                </div>

                {/* NEW: Enhanced Search and Filtering */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '25px',
                    borderRadius: '16px',
                    marginBottom: '30px',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 8px 25px var(--shadow-light)'
                }}>
                    {/* Search Bar */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                placeholder={`Search ${showArchivedProjects ? 'archived' : 'active'} projects...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px 12px 45px',
                                    border: '2px solid var(--border-color)',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    background: 'var(--input-bg)',
                                    color: 'var(--text-primary)',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                            <span style={{
                                position: 'absolute',
                                left: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '16px',
                                color: 'var(--text-muted)'
                            }}>
                                🔍
                            </span>
                        </div>
                        
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            style={{
                                background: showAdvancedFilters ? 'var(--accent-color)' : 'var(--border-color)',
                                color: showAdvancedFilters ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🔧 Filters
                        </button>
                    </div>

                    {/* NEW: Advanced Filters */}
                    {showAdvancedFilters && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px',
                            padding: '20px',
                            background: 'var(--input-bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                                    STATUS
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="planning">Planning</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                                    HIRING MANAGER
                                </label>
                                <select
                                    value={filters.hiringManager}
                                    onChange={(e) => setFilters({...filters, hiringManager: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="all">All Managers</option>
                                    {uniqueHiringManagers.map(manager => (
                                        <option key={manager} value={manager}>{manager}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                                    DEADLINE
                                </label>
                                <select
                                    value={filters.deadline}
                                    onChange={(e) => setFilters({...filters, deadline: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="all">All Deadlines</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="due-week">Due This Week</option>
                                    <option value="due-month">Due This Month</option>
                                    <option value="future">Future</option>
                                    <option value="no-deadline">No Deadline</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                                    PROGRESS
                                </label>
                                <select
                                    value={filters.progress}
                                    onChange={(e) => setFilters({...filters, progress: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="all">All Progress</option>
                                    <option value="not-started">Not Started (0%)</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed (100%)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                                    CANDIDATES
                                </label>
                                <select
                                    value={filters.candidateCount}
                                    onChange={(e) => setFilters({...filters, candidateCount: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="all">All Counts</option>
                                    <option value="none">No Candidates</option>
                                    <option value="few">1-5 Candidates</option>
                                    <option value="many">5+ Candidates</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'end' }}>
                                <button
                                    onClick={() => setFilters({
                                        status: 'all',
                                        hiringManager: 'all',
                                        deadline: 'all',
                                        progress: 'all',
                                        candidateCount: 'all'
                                    })}
                                    style={{
                                        background: 'var(--border-color)',
                                        color: 'var(--text-secondary)',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    }}
                                >
                                    🔄 Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* NEW: Bulk Operations Bar */}
                {bulkMode && (
                    <div style={{
                        background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                        color: 'white',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedProjectIds.size === filteredProjects.length && filteredProjects.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                                <span style={{ fontWeight: '600' }}>Select All</span>
                            </label>
                            <span style={{ fontSize: '14px' }}>
                                {selectedProjectIds.size} of {filteredProjects.length} selected
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleBulkArchive}
                                disabled={selectedProjectIds.size === 0}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: selectedProjectIds.size > 0 ? 'pointer' : 'not-allowed',
                                    opacity: selectedProjectIds.size > 0 ? 1 : 0.5
                                }}
                            >
                                📦 Archive Selected
                            </button>
                            
                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedProjectIds.size === 0}
                                style={{
                                    background: 'rgba(229, 62, 62, 0.8)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: selectedProjectIds.size > 0 ? 'pointer' : 'not-allowed',
                                    opacity: selectedProjectIds.size > 0 ? 1 : 0.5
                                }}
                            >
                                🗑️ Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Search Results Info */}
                {(searchTerm || Object.values(filters).some(f => f !== 'all')) && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '10px 15px',
                        background: 'var(--accent-color-light)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: 'var(--accent-color)'
                    }}>
                        Found {filteredProjects.length} {showArchivedProjects ? 'archived' : 'active'} project(s) 
                        {searchTerm && ` matching "${searchTerm}"`}
                        {Object.values(filters).some(f => f !== 'all') && ' with applied filters'}
                    </div>
                )}

                {/* Projects Display - Grid or Kanban */}
                {viewMode === 'grid' ? (
                    <ProjectGridView 
                        projects={filteredProjects}
                        candidates={candidates}
                        onProjectClick={openProjectDetails}
                        bulkMode={bulkMode}
                        selectedProjectIds={selectedProjectIds}
                        onSelectProject={handleSelectProject}
                    />
                ) : (
                    <ProjectKanbanView 
                        projects={filteredProjects}
                        candidates={candidates}
                        onProjectClick={openProjectDetails}
                        onUpdateProject={updateProject}
                    />
                )}

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--text-muted)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                            {showArchivedProjects ? '📦' : '📁'}
                        </div>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>
                            No {showArchivedProjects ? 'archived' : 'active'} projects found
                        </h3>
                        <p style={{ marginBottom: '20px' }}>
                            {searchTerm || Object.values(filters).some(f => f !== 'all')
                                ? "Try adjusting your search or filters"
                                : showArchivedProjects 
                                    ? "You haven't archived any projects yet"
                                    : "Get started by creating your first project"
                            }
                        </p>
                        {!showArchivedProjects && !searchTerm && !Object.values(filters).some(f => f !== 'all') && (
                            <button 
                                className="btn-primary"
                                onClick={() => setShowProjectModal(true)}
                                style={{ marginTop: '20px' }}
                            >
                                Create Project
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Enhanced Project Details Modal */}
{showProjectDetails && selectedProject && (
    <div className="modal-overlay project-modal" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '120px 20px 20px 20px',
        overflow: 'auto'
    }}>
        <div style={{
            background: 'var(--card-bg)',
            borderRadius: '20px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: 'calc(100vh - 80px)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <EnhancedProjectDetailPanel
                project={selectedProject}
                candidates={candidates.filter(c => c.project_id === selectedProject.id)}
                currentUser={currentUser}
                onClose={closeProjectDetails}
                onViewCandidate={openCandidateModal}
                onRemoveCandidate={removeCandidateFromProject}
                onUpdateProject={updateProject}
                onDeleteProject={deleteProject}
                onToggleArchive={toggleArchiveProject}
                onProjectUpdated={(updatedProject) => {
                    setSelectedProject(updatedProject);
                }}
            />
        </div>
    </div>
)}

            {/* Create Project Modal */}
            {showProjectModal && (
                <EnhancedCreateProjectModal
                    currentUser={currentUser}
                    onClose={() => setShowProjectModal(false)}
                    onCreate={createProject}
                />
            )}

            {/* Candidate Detail Modal */}
{showCandidateModal && selectedCandidate && (
    <div 
        className="modal-overlay candidate-modal" 
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '140px 20px 20px 20px',
            overflow: 'auto'
        }}
        onClick={closeCandidateModal}
    >
                    <div 
    style={{
        background: 'var(--card-bg)',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: 'calc(100vh - 180px)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        marginTop: '0'
    }}
    onClick={(e) => e.stopPropagation()}
>
                        {/* Enhanced Candidate Header Banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '25px 30px',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0,
                            zIndex: 10
                        }}>
                            {/* Background pattern */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                pointerEvents: 'none'
                            }} />
                            
                            <div style={{ 
                                position: 'relative', 
                                zIndex: 11, 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                gap: '20px'
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h2 style={{ 
                                        margin: '0 0 12px 0', 
                                        fontSize: '28px', 
                                        fontWeight: '800',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        wordBreak: 'break-word',
                                        lineHeight: '1.2',
                                        color: 'white'
                                    }}>
                                        {selectedCandidate.name}
                                    </h2>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap', 
                                        gap: '10px', 
                                        alignItems: 'center' 
                                    }}>
                                        <span style={{
                                            background: 'rgba(255,255,255,0.25)',
                                            padding: '6px 14px',
                                            borderRadius: '15px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            💼 {selectedCandidate.job_title}
                                        </span>
                                        <span style={{
                                            background: 'rgba(255,255,255,0.25)',
                                            padding: '6px 14px',
                                            borderRadius: '15px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            🏢 {selectedCandidate.company}
                                        </span>
                                        <span style={{
                                            background: selectedCandidate.status === 'hired' ? 'rgba(72, 187, 120, 0.9)' :
                                                       selectedCandidate.status === 'interviewing' ? 'rgba(237, 137, 54, 0.9)' :
                                                       'rgba(255,255,255,0.25)',
                                            padding: '6px 14px',
                                            borderRadius: '15px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {selectedCandidate.status || 'New'}
                                        </span>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={closeCandidateModal}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        color: 'white',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        {/* Scrollable Candidate Detail Content */}
                        <div style={{ 
                            flex: 1, 
                            overflow: 'auto',
                            background: 'var(--card-bg)',
                            position: 'relative'
                        }}>
                            <div style={{ padding: '0' }}>
                                <CandidateDetailPanel
                                    candidate={selectedCandidate}
                                    currentUser={currentUser}
                                    projects={projects}
                                    onClose={closeCandidateModal}
                                    onUpdate={async (candidateId, updateData) => {
                                        try {
                                            const response = await api.updateCandidate(candidateId, updateData);
                                            if (response.data) {
                                                setSelectedCandidate(response.data);
                                            }
                                        } catch (error) {
                                            console.error('Error updating candidate:', error);
                                        }
                                    }}
                                    onAddTimeline={async (candidateId, timelineEntry) => {
                                        try {
                                            const response = await api.addCandidateTimeline(candidateId, timelineEntry);
                                            if (response.data) {
                                                setSelectedCandidate(response.data);
                                            }
                                        } catch (error) {
                                            console.error('Error adding timeline entry:', error);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// NEW: Project Grid View Component
const ProjectGridView = ({ projects, candidates, onProjectClick, bulkMode, selectedProjectIds, onSelectProject }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '25px',
            marginBottom: '30px'
        }}>
            {projects.map(project => {
                // Pass ALL candidates to ProjectCard - let it handle the dual filtering
                const allProjectCandidates = candidates.filter(c => c.project_id === project.id);
                const totalHiredCandidates = allProjectCandidates.filter(c => c.status === 'hired');
                
                return (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        candidates={allProjectCandidates}
                        hiredCandidates={totalHiredCandidates}
                        onClick={onProjectClick}
                        isArchived={project.status === 'archived'}
                        bulkMode={bulkMode}
                        isSelected={selectedProjectIds.has(project.id)}
                        onSelect={onSelectProject}
                    />
                );
            })}
        </div>
    );
};

// NEW: Project Kanban View Component
const ProjectKanbanView = ({ projects, candidates, onProjectClick, onUpdateProject }) => {
    const kanbanColumns = [
        { id: 'planning', title: 'Planning', status: 'planning', color: '#ed8936' },
        { id: 'active', title: 'Active', status: 'active', color: '#48bb78' },
        { id: 'on-hold', title: 'On Hold', status: 'on-hold', color: '#ed8936' },
        { id: 'completed', title: 'Completed', status: 'completed', color: '#38b2ac' }
    ];

    const getProjectsByStatus = (status) => {
        return projects.filter(p => (p.status || 'active') === status);
    };

    const handleDragStart = (e, project) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(project));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const project = JSON.parse(e.dataTransfer.getData('text/plain'));
        
        if (project.status !== newStatus) {
            await onUpdateProject(project.id, { status: newStatus });
        }
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        }}>
            {kanbanColumns.map(column => {
                const columnProjects = getProjectsByStatus(column.status);
                
                return (
                    <div
                        key={column.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.status)}
                        style={{
                            background: 'var(--card-bg)',
                            borderRadius: '16px',
                            padding: '20px',
                            border: '1px solid var(--border-color)',
                            minHeight: '400px'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            paddingBottom: '15px',
                            borderBottom: `2px solid ${column.color}`
                        }}>
                            <h4 style={{
                                margin: 0,
                                color: 'var(--text-primary)',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>
                                {column.title}
                            </h4>
                            <span style={{
                                background: column.color,
                                color: 'white',
                                borderRadius: '12px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {columnProjects.length}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {columnProjects.map(project => {
                                const projectCandidates = candidates.filter(c => c.project_id === project.id);
                                const hiredCount = projectCandidates.filter(c => c.status === 'hired').length;
                                const progress = project.target_hires > 0 ? Math.round((hiredCount / project.target_hires) * 100) : 0;
                                
                                return (
                                    <div
                                        key={project.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, project)}
                                        onClick={() => onProjectClick(project)}
                                        style={{
                                            background: 'var(--input-bg)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            border: '1px solid var(--border-color)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 25px var(--shadow-light)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <h5 style={{
                                            margin: '0 0 8px 0',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            lineHeight: '1.3'
                                        }}>
                                            {project.name}
                                        </h5>
                                        
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-muted)',
                                            marginBottom: '10px',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span>👥 {projectCandidates.length}</span>
                                            <span>✅ {hiredCount}/{project.target_hires}</span>
                                        </div>
                                        
                                        <div style={{
                                            background: 'var(--border-color)',
                                            borderRadius: '6px',
                                            height: '4px',
                                            overflow: 'hidden',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                background: column.color,
                                                height: '100%',
                                                width: `${Math.min(progress, 100)}%`,
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {project.hiring_manager}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Enhanced Project Card Component with Bulk Selection
const ProjectCard = ({ project, candidates, hiredCandidates, onClick, isArchived, bulkMode, isSelected, onSelect }) => {
    // Dual metrics: operational (active) vs historical (all-time)
    const activeCandidates = candidates.filter(c => !c.archived);
    const totalHired = hiredCandidates.length; // Already includes all hired (archived + active)
    const activeHired = hiredCandidates.filter(c => !c.archived).length;
    
    // Use historical data for progress calculation (main display)
    const progress = project.target_hires > 0 ? 
        Math.round((totalHired / project.target_hires) * 100) : 0;

    const isOverdue = project.deadline && new Date(project.deadline) < new Date();
    
    const handleCardClick = (e) => {
        if (bulkMode && e.target.type !== 'checkbox') {
            e.preventDefault();
            onSelect(project.id, !isSelected);
        } else if (!bulkMode) {
            onClick(project);
        }
    };
    
    return (
        <div 
            className="modern-card project-card" 
            onClick={handleCardClick}
            style={{
                opacity: isArchived ? 0.8 : 1,
                border: isSelected ? '2px solid var(--accent-color)' : 
                        isArchived ? '2px dashed var(--border-color)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                position: 'relative'
            }}
        >
            {/* Bulk selection checkbox */}
            {bulkMode && (
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    zIndex: 2
                }}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(project.id, e.target.checked)}
                        style={{
                            transform: 'scale(1.3)',
                            cursor: 'pointer'
                        }}
                    />
                </div>
            )}

            {/* Archive Badge */}
            {isArchived && (
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    zIndex: 2
                }}>
                    📦 ARCHIVED
                </div>
            )}
            
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '15px',
                marginTop: bulkMode ? '35px' : '0'
            }}>
                <h3 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    flex: 1,
                    marginRight: '10px',
                    lineHeight: '1.3'
                }}>
                    {project.name}
                </h3>
                <span className={`status-badge status-${project.status || 'active'}`}>
                    {project.status || 'active'}
                </span>
            </div>

            <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                marginBottom: '20px',
                height: '42px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
            }}>
                {project.description || 'No description provided'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    👥 {candidates.length} candidates
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    ✅ {hiredCandidates.length}/{project.target_hires} hired
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                background: 'var(--border-color)',
                borderRadius: '10px',
                height: '8px',
                marginBottom: '15px',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: progress >= 100 ? 
                        'linear-gradient(90deg, #48bb78 0%, #38b2ac 100%)' :
                        'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    height: '100%',
                    borderRadius: '10px',
                    width: `${Math.min(progress, 100)}%`,
                    transition: 'width 0.3s ease'
                }} />
            </div>

            {/* Project Details Footer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                        👤 Created by {project.created_by}
                    </span>
                    {project.deadline && (
                        <span style={{
                            color: isOverdue ? '#e53e3e' : 'var(--text-muted)',
                            fontWeight: isOverdue ? '600' : '400'
                        }}>
                            📅 {new Date(project.deadline).toLocaleDateString()}
                        </span>
                    )}
                </div>
                
                {/* Hiring Manager Info */}
                {project.hiring_manager && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                            🎯 Hiring Manager: <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{project.hiring_manager}</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Enhanced Project Detail Panel (keeping existing functionality)
const EnhancedProjectDetailPanel = ({ 
    project, 
    candidates, 
    currentUser,
    onClose, 
    onViewCandidate, 
    onRemoveCandidate,
    onUpdateProject,
    onDeleteProject,
    onToggleArchive,
    onProjectUpdated
}) => {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [comments, setComments] = React.useState(project.comments || []);
    const [timeline, setTimeline] = React.useState(project.timeline || []);
    const [newComment, setNewComment] = React.useState('');
    const [newTimelineEntry, setNewTimelineEntry] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    
    const [editingComment, setEditingComment] = React.useState(null);
    const [editingTimeline, setEditingTimeline] = React.useState(null);
    const [editCommentText, setEditCommentText] = React.useState('');
    const [editTimelineText, setEditTimelineText] = React.useState('');

    React.useEffect(() => {
        loadProjectData();
    }, [project.id]);

    const loadProjectData = async () => {
        try {
            setIsLoading(true);
            const response = await api.getProject(project.id);
            if (response.data) {
                setComments(response.data.comments || []);
                setTimeline(response.data.timeline || []);
                onProjectUpdated(response.data);
            }
        } catch (error) {
            console.error('Error loading project data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await api.addProjectComment(project.id, {
                text: newComment.trim(),
                user: currentUser.name
            });

            if (response.data) {
                setComments([response.data, ...comments]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const addTimelineEntry = async () => {
        if (!newTimelineEntry.trim()) return;

        try {
            const response = await api.addProjectTimelineEntry(project.id, {
                message: newTimelineEntry.trim(),
                user: currentUser.name,
                type: 'note'
            });

            if (response.data) {
                setTimeline([response.data, ...timeline]);
                setNewTimelineEntry('');
            }
        } catch (error) {
            console.error('Error adding timeline entry:', error);
        }
    };

    const hiredCount = candidates.filter(c => c.status === 'hired').length;
    const progress = project.target_hires > 0 ? 
        Math.round((hiredCount / project.target_hires) * 100) : 0;

    const isOverdue = project.deadline && new Date(project.deadline) < new Date();
    const isArchived = project.status === 'archived';
    
    const bannerGradient = isArchived ? 
        'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' :
        progress >= 100 ? 'linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)' :
        isOverdue ? 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' :
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    const tabs = [
        { id: 'overview', label: 'Overview', count: 1 },
        { id: 'comments', label: 'Comments', count: comments.length },
        { id: 'timeline', label: 'Timeline', count: timeline.length }
    ];

    return (
        <div className="panel-content" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Enhanced Banner Header */}
            <div style={{
                background: bannerGradient,
                padding: '20px 25px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: '20px', 
                                fontWeight: '800',
                                marginBottom: '6px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                wordBreak: 'break-word',
                                lineHeight: '1.2'
                            }}>
                                {project.name}
                            </h2>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                {isArchived && (
                                    <span style={{
                                        background: 'rgba(255,255,255,0.25)',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        📦 ARCHIVED
                                    </span>
                                )}
                                
                                <span style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                }}>
                                    👥 {candidates.length} candidates
                                </span>
                                
                                <span style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                }}>
                                    ✅ {hiredCount}/{project.target_hires} hired ({progress}%)
                                </span>
                            </div>
                        </div>
                        
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                color: 'white',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                marginLeft: '15px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        height: '6px',
                        marginBottom: '10px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.8)',
                            height: '100%',
                            borderRadius: '8px',
                            width: `${Math.min(progress, 100)}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => onToggleArchive(project.id, project.status)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            {isArchived ? '📂 Unarchive' : '📦 Archive'}
                        </button>
                        
                        <button
                            onClick={() => onDeleteProject(project.id)}
                            style={{
                                background: 'rgba(229,62,62,0.8)',
                                border: 'none',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(197,48,48,0.9)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(229,62,62,0.8)'}
                        >
                            🗑️ Delete
                        </button>
                    </div>
                    
                    {project.deadline && (
                        <div style={{
                            marginTop: '10px',
                            padding: '6px 10px',
                            background: isOverdue ? 'rgba(229, 62, 62, 0.2)' : 'rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'inline-block'
                        }}>
                            📅 Deadline: {new Date(project.deadline).toLocaleDateString()}
                            {(() => {
                                const today = new Date();
                                const deadline = new Date(project.deadline);
                                const diffTime = deadline - today;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                
                                if (diffDays < 0) {
                                    return <span style={{ marginLeft: '8px', fontWeight: '600' }}>(Overdue)</span>;
                                } else if (diffDays === 0) {
                                    return <span style={{ marginLeft: '8px', fontWeight: '600' }}>(Due today)</span>;
                                } else {
                                    return <span style={{ marginLeft: '8px' }}>({diffDays} days left)</span>;
                                }
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* Tab navigation and content */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="tab-navigation" style={{ 
                    display: 'flex', 
                    borderBottom: '2px solid var(--border-color)', 
                    background: 'var(--card-bg)',
                    flexShrink: 0
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                background: 'none',
                                color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-tertiary)',
                                fontWeight: activeTab === tab.id ? '600' : '400',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : 'none',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                <div className="tab-content" style={{ flex: 1, overflowY: 'auto', padding: '25px' }}>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div>
                            <div className="detail-section">
                                <h4>Project Details</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Description</label>
                                        <p>{project.description || 'No description provided'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Target Hires</label>
                                        <p>{project.target_hires}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Deadline</label>
                                        <p>{project.deadline ? 
                                            new Date(project.deadline).toLocaleDateString() : 
                                            'No deadline set'
                                        }</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Created By</label>
                                        <p>{project.created_by}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Candidates ({candidates.length})</h4>
                                {candidates.length > 0 ? (
                                    <div className="candidates-list">
                                        {candidates.map(candidate => (
                                            <div key={candidate.id} className="candidate-item">
                                                <div>
                                                    <h5 style={{ margin: '0 0 5px 0', fontWeight: '600' }}>
                                                        {candidate.name}
                                                    </h5>
                                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        {candidate.job_title} • {candidate.status}
                                                    </p>
                                                </div>
                                                <div className="candidate-actions">
                                                    <button
                                                        onClick={() => onViewCandidate(candidate)}
                                                        className="btn-primary"
                                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => onRemoveCandidate(candidate.id)}
                                                        className="btn-danger"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        No candidates assigned to this project yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <div className="comments-section">
                            <div style={{ marginBottom: '20px' }}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        marginBottom: '10px',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <button
                                    onClick={addComment}
                                    disabled={!newComment.trim()}
                                    style={{
                                        background: newComment.trim() ? 'var(--accent-color)' : 'var(--border-color)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: newComment.trim() ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Add Comment
                                </button>
                            </div>

                            <div className="comments-list">
                                {comments.map(comment => (
                                    <div key={comment.id} className="comment-item" style={{
                                        background: 'var(--input-bg)',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        marginBottom: '10px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                                                {comment.user}
                                            </strong>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                                            {comment.text}
                                        </p>
                                    </div>
                                ))}
                                
                                {comments.length === 0 && (
                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '40px 20px' }}>
                                        No comments yet. Be the first to add one!
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                        <div className="timeline-section">
                            <div style={{ marginBottom: '20px' }}>
                                <textarea
                                    value={newTimelineEntry}
                                    onChange={(e) => setNewTimelineEntry(e.target.value)}
                                    placeholder="Add a timeline entry..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        marginBottom: '10px',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <button
                                    onClick={addTimelineEntry}
                                    disabled={!newTimelineEntry.trim()}
                                    style={{
                                        background: newTimelineEntry.trim() ? 'var(--accent-color)' : 'var(--border-color)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: newTimelineEntry.trim() ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Add Entry
                                </button>
                            </div>

                            <div className="timeline-list">
                                {timeline.map(entry => (
                                    <div key={entry.id} className="timeline-item" style={{
                                        background: 'var(--input-bg)',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        marginBottom: '10px',
                                        border: '1px solid var(--border-color)',
                                        borderLeft: '4px solid var(--accent-color)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-color)' }}>
                                                    {entry.type?.toUpperCase() || 'NOTE'}
                                                </span>
                                                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                                                    {entry.user}
                                                </strong>
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                                            {entry.message}
                                        </p>
                                    </div>
                                ))}
                                
                                {timeline.length === 0 && (
                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '40px 20px' }}>
                                        No timeline entries yet. Add one to track project progress!
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Enhanced Create Project Modal
const EnhancedCreateProjectModal = ({ currentUser, onClose, onCreate }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        target_hires: 1,
        deadline: '',
        hiring_manager: currentUser.name,
        status: 'active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Project name is required');
            return;
        }
        onCreate(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                background: 'var(--card-bg)',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 40px var(--shadow-medium)'
            }}>
                <div className="modal-header">
                    <h3>Create New Project</h3>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '0',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Enter project name..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe the project..."
                            rows="4"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label>Target Hires</label>
                            <input
                                type="number"
                                value={formData.target_hires}
                                onChange={(e) => handleChange('target_hires', parseInt(e.target.value) || 1)}
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => handleChange('deadline', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Hiring Manager</label>
                        <input
                            type="text"
                            value={formData.hiring_manager}
                            onChange={(e) => handleChange('hiring_manager', e.target.value)}
                            placeholder="Enter hiring manager name..."
                        />
                    </div>
                    
                    <div className="form-buttons">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Export to global scope
window.ProjectsComponent = ProjectsComponent;
window.ProjectCard = ProjectCard;
window.ProjectGridView = ProjectGridView;
window.ProjectKanbanView = ProjectKanbanView;
window.EnhancedProjectDetailPanel = EnhancedProjectDetailPanel;
window.EnhancedCreateProjectModal = EnhancedCreateProjectModal;

/* 
✅ ALL REQUESTED FEATURES IMPLEMENTED:

📊 Advanced Filtering:
- Filter by status, hiring manager, deadline, progress, and candidate count
- Multiple filters can be active simultaneously
- Clear filters option

🔄 Bulk Operations:
- Checkbox selection for multiple projects
- Bulk archive and delete functionality
- Select all/none options

📋 Kanban Board View:
- Visual board with columns for different project statuses
- Drag and drop between columns to update status
- Grid/Kanban view toggle

🔔 Smart Notifications:
- Overdue project alerts
- Due soon warnings (within 7 days)
- Completion milestone notifications
- Notification counter badge

📈 Basic Analytics:
- Project completion rates
- Hiring success metrics
- Overdue project tracking
- Visual analytics dashboard

All features work seamlessly together and maintain immediate state updates!
*/

// Enhanced CSS styles for all new features
if (!document.querySelector('#comprehensive-project-styles')) {
    const style = document.createElement('style');
    style.id = 'comprehensive-project-styles';
    style.textContent = `
        /* Analytics card styles */
        .analytics-card {
            background: var(--input-bg);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            text-align: center;
            transition: all 0.3s ease;
        }

        .analytics-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px var(--shadow-light);
        }

        .analytics-number {
            font-size: 28px;
            font-weight: 800;
            color: var(--accent-color);
            margin-bottom: 8px;
            background: linear-gradient(135deg, var(--accent-color), #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .analytics-label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Archive toggle button styles */
        .archive-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .archive-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        /* Status Badge Styles */
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-active {
            background: rgba(72, 187, 120, 0.1);
            color: #48bb78;
        }
        
        .status-planning {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
        }
        
        .status-completed {
            background: rgba(56, 178, 172, 0.1);
            color: #38b2ac;
        }
        
        .status-on-hold {
            background: rgba(237, 137, 54, 0.1);
            color: #ed8936;
        }
        
        .status-cancelled {
            background: rgba(229, 62, 62, 0.1);
            color: #e53e3e;
        }
        
        .status-archived {
            background: rgba(237, 137, 54, 0.1);
            color: #ed8936;
        }

        /* Modern card styles */
        .modern-card {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 8px 25px var(--shadow-light);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 1px solid var(--border-color);
        }

        .modern-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px var(--shadow-medium);
        }

        /* Enhanced project card for bulk selection */
        .project-card {
            transition: all 0.3s ease;
        }

        .project-card:hover {
            transform: translateY(-4px);
        }

        /* Add button styling */
        .add-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .add-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        /* Enhanced form styles */
        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 14px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 14px;
            background: var(--input-bg);
            color: var(--text-primary);
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        .form-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 30px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: var(--border-color);
            color: var(--text-secondary);
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: var(--text-muted);
            color: var(--text-primary);
        }

        .btn-danger {
            background: #e53e3e;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            font-size: 12px;
        }

        .btn-danger:hover {
            background: #c53030;
            transform: translateY(-1px);
        }

        /* Enhanced modal styles */
        .modal-overlay {
            backdrop-filter: blur(8px);
        }

        .modal-content {
            animation: modalSlideIn 0.3s ease;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--border-color);
        }

        .modal-header h3 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
        }

        /* Enhanced split view */
        .split-view-container {
            display: flex;
            height: calc(100vh - 200px);
            gap: 30px;
            transition: all 0.3s ease;
        }

        .main-content {
            flex: 1;
            transition: all 0.3s ease;
            min-width: 0;
            overflow-y: auto;
            padding-right: 10px;
        }

        .split-panel {
            flex: 0 0 500px;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            max-height: calc(100vh - 200px);
            overflow: hidden;
            position: sticky;
            top: 20px;
            box-shadow: 0 20px 40px var(--shadow-light);
            border: 1px solid var(--border-color);
        }

        /* Enhanced project detail styles */
        .detail-section {
            margin-bottom: 30px;
        }

        .detail-section h4 {
            margin-bottom: 15px;
            color: var(--text-primary);
            font-weight: 600;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .detail-item {
            background: var(--input-bg);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .detail-item label {
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            display: block;
        }

        .detail-item p {
            margin: 0;
            color: var(--text-primary);
            font-weight: 500;
        }

        .candidates-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .candidate-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            background: var(--input-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .candidate-actions {
            display: flex;
            gap: 10px;
        }

        /* Tab navigation styles */
        .tab-navigation {
            display: flex;
            border-bottom: 2px solid var(--border-color);
            background: var(--card-bg);
        }

        .tab-navigation button {
            padding: 12px 20px;
            border: none;
            background: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .tab-navigation button:hover {
            background: var(--border-color);
        }

        /* Enhanced filtering styles */
        .advanced-filters {
            background: var(--input-bg);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid var(--border-color);
            margin-top: 15px;
        }

        .filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .filter-item label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 8px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .filter-item select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 13px;
            background: var(--card-bg);
            color: var(--text-primary);
            cursor: pointer;
        }

        /* Bulk operations styles */
        .bulk-operations-bar {
            background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideIn 0.3s ease;
        }

        .bulk-select-all {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .bulk-actions {
            display: flex;
            gap: 10px;
        }

        .bulk-action-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .bulk-action-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-1px);
        }

        .bulk-action-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Notification styles */
        .notification-badge {
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
            color: white;
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            animation: pulse 2s infinite;
        }

        .notification-panel {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(20px);
        }

        .notification-item {
            padding: 12px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }

        .notification-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .notification-high {
            background: rgba(229, 62, 62, 0.1);
            border: 1px solid #e53e3e;
        }

        .notification-medium {
            background: rgba(237, 137, 54, 0.1);
            border: 1px solid #ed8936;
        }

        .notification-success {
            background: rgba(72, 187, 120, 0.1);
            border: 1px solid #48bb78;
        }

        /* Kanban board styles */
        .kanban-column {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid var(--border-color);
            min-height: 400px;
            transition: all 0.3s ease;
        }

        .kanban-column:hover {
            box-shadow: 0 8px 25px var(--shadow-light);
        }

        .kanban-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
        }

        .kanban-title {
            margin: 0;
            color: var(--text-primary);
            font-size: 16px;
            font-weight: 600;
        }

        .kanban-count {
            color: white;
            border-radius: 12px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 600;
        }

        .kanban-card {
            background: var(--input-bg);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid var(--border-color);
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 15px;
        }

        .kanban-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px var(--shadow-light);
        }

        .kanban-card[draggable="true"] {
            cursor: grab;
        }

        .kanban-card[draggable="true"]:active {
            cursor: grabbing;
        }

        /* View mode toggle styles */
        .view-mode-toggle {
            display: flex;
            background: var(--card-bg);
            border-radius: 8px;
            padding: 4px;
            border: 1px solid var(--border-color);
        }

        .view-mode-btn {
            background: transparent;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .view-mode-btn.active {
            background: var(--accent-color);
            color: white;
        }

        .view-mode-btn:not(.active) {
            color: var(--text-secondary);
        }

        .view-mode-btn:hover:not(.active) {
            background: var(--border-color);
            color: var(--text-primary);
        }

        /* Animation keyframes */
        @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .split-view-container {
                flex-direction: column;
                height: auto;
            }
            
            .split-panel {
                flex: none;
                position: relative;
                top: 0;
                max-height: none;
            }
            
            .detail-grid {
                grid-template-columns: 1fr;
            }
            
            .filter-grid {
                grid-template-columns: 1fr;
            }
            
            .bulk-operations-bar {
                flex-direction: column;
                gap: 15px;
                align-items: stretch;
                text-align: center;
            }
            
            .analytics-card {
                min-width: 150px;
            }
        }

        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
            .analytics-number {
                filter: brightness(1.2);
            }
            
            .notification-badge {
                box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
            }
            
            .kanban-card {
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .modern-card {
                border-width: 2px;
            }
            
            .status-badge {
                border: 1px solid currentColor;
            }
            
            .notification-item {
                border-width: 2px;
            }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            .modern-card:hover,
            .project-card:hover,
            .kanban-card:hover {
                transform: none;
            }
        }
    `;
    document.head.appendChild(style);
}