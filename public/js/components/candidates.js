// Enhanced Candidates Component with Kanban Board and Archive - COMPLETE VERSION
const CandidatesComponent = ({ 
    currentUser, 
    candidates, 
    setCandidates,
    projects,
    onScheduleInterview,
    onKeepWarm 
}) => {
    console.log('DEBUG: onKeepWarm function received:', typeof onKeepWarm, onKeepWarm); // ADD THIS LINE

    const [selectedCandidate, setSelectedCandidate] = React.useState(null);
    const [showCandidatePanel, setShowCandidatePanel] = React.useState(false);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [tagFilter, setTagFilter] = React.useState('all');
    const [loading, setLoading] = React.useState(false);
    const [displayLimit, setDisplayLimit] = React.useState(20);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    
    // NEW: View mode state for switching between list and kanban
    const [viewMode, setViewMode] = React.useState('list'); // 'list' or 'kanban'
    
    // NEW: Archive state for switching between active and archived candidates
    const [showArchived, setShowArchived] = React.useState(false);

    // Enhanced auto-refresh
    React.useEffect(() => {
        if (!currentUser) return;

        const refreshData = async () => {
            try {
                const result = await api.getCandidates();
                if (result && result.data) {
                    setCandidates(result.data);
                }
            } catch (error) {
                console.error('Error refreshing candidates:', error);
            }
        };

        const interval = setInterval(refreshData, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // Reset display limit when filters change
React.useEffect(() => {
    setDisplayLimit(20);
}, [searchTerm, statusFilter, tagFilter, showArchived]);

    // Update selected candidate when candidates change
    React.useEffect(() => {
        if (selectedCandidate && candidates.length > 0) {
            const updatedCandidate = candidates.find(c => c.id === selectedCandidate.id);
            if (updatedCandidate) {
                setSelectedCandidate(updatedCandidate);
            }
        }
    }, [candidates]);

    // Filter candidates based on archive status and other filters
    const filteredCandidates = React.useMemo(() => {
        return candidates.filter(candidate => {
            // Archive filter - show archived or active based on toggle
            const isArchived = candidate.archived === true;
            if (showArchived !== isArchived) return false;

            const matchesSearch = !searchTerm || 
                (candidate.name && candidate.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (candidate.email && candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (candidate.job_title && candidate.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (candidate.company && candidate.company.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = statusFilter === 'all' || candidate.readiness === statusFilter;
            const matchesTags = tagFilter === 'all' || 
                (candidate.tags && candidate.tags.includes(tagFilter));

            return matchesSearch && matchesStatus && matchesTags;
        });
    }, [candidates, searchTerm, statusFilter, tagFilter, showArchived]);

// Get candidates to display (limited by displayLimit)
const displayedCandidates = React.useMemo(() => {
    return filteredCandidates.slice(0, displayLimit);
}, [filteredCandidates, displayLimit]);

// Check if there are more candidates to load
const hasMoreCandidates = displayLimit < filteredCandidates.length;

    // Calculate dual statistics system
    const stats = React.useMemo(() => {
        const operational = helpers.statsCalculator.calculateOperationalStats(candidates);
        const historical = helpers.statsCalculator.calculateHistoricalStats(candidates);
        
        return {
            // Operational stats (for UI display)
            total: operational.totalActive,
            ready: operational.readyToHire,
            interviewing: operational.interviewing,
            hired: operational.currentlyHired,
            archived: operational.totalArchived,
            inPipeline: operational.inPipeline,
            
            // Historical stats (for analytics)
            totalEverProcessed: historical.totalEverProcessed,
            totalEverHired: historical.totalEverHired,
            overallSuccessRate: historical.overallSuccessRate,
            
            // Keep both for flexibility
            operational,
            historical
        };
    }, [candidates]);

    // Get all unique tags for filtering (only from active/archived based on current view)
    const allTags = React.useMemo(() => {
        const tagSet = new Set();
        const relevantCandidates = candidates.filter(c => showArchived ? c.archived : !c.archived);
        relevantCandidates.forEach(candidate => {
            if (candidate.tags && Array.isArray(candidate.tags)) {
                candidate.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }, [candidates, showArchived]);

    // Handle candidate click
    const handleCandidateClick = (candidate) => {
        setSelectedCandidate(candidate);
        setShowCandidatePanel(true);
    };

    // Close candidate panel
    const closeCandidatePanel = () => {
        setShowCandidatePanel(false);
        setSelectedCandidate(null);
    };

    // Update candidate
    const updateCandidate = async (candidateId, updates) => {
        try {
            setLoading(true);
            const result = await api.updateCandidate(candidateId, updates);
            
            if (result.success) {
                // Update local state
                const updatedCandidates = candidates.map(c => 
                    c.id === candidateId ? { ...c, ...updates } : c
                );
                setCandidates(updatedCandidates);
                
                // Update selected candidate if it's the one being updated
                if (selectedCandidate && selectedCandidate.id === candidateId) {
                    setSelectedCandidate({ ...selectedCandidate, ...updates });
                }
            }
        } catch (error) {
            console.error('Failed to update candidate:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load more function
const loadMoreCandidates = async () => {
    setIsLoadingMore(true);
    // Simulate loading delay (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 300));
    setDisplayLimit(prev => prev + 20); // Load 20 more
    setIsLoadingMore(false);
};

    // NEW: Archive candidate
    const archiveCandidate = async (candidateId) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (!candidate) return;
        
        const action = candidate.archived ? 'Unarchive' : 'Archive';
        if (!confirm(`Are you sure you want to ${action.toLowerCase()} this candidate?`)) return;
        
        try {
            setLoading(true);
            
            // Create timeline entry for archive action
            const timestamp = new Date().toISOString();
            const timelineEntry = {
                id: Date.now() + Math.random(),
                action: `${action} Candidate`,
                description: `Candidate ${action.toLowerCase()}d by ${currentUser.name}`,
                user: currentUser.name,
                timestamp,
                type: 'archive'
            };
            
            const updates = {
                archived: !candidate.archived,
                timeline: [timelineEntry, ...(candidate.timeline || [])],
                last_updated: timestamp,
                _forceUpdate: Date.now()
            };
            
            await updateCandidate(candidateId, updates);
            
            // Close panel if candidate was archived and we're viewing active candidates
            if (selectedCandidate && selectedCandidate.id === candidateId && !showArchived && !candidate.archived) {
                closeCandidatePanel();
            }
            
        } catch (error) {
            console.error('Failed to archive/unarchive candidate:', error);
        } finally {
            setLoading(false);
        }
    };

    // Delete candidate
    const deleteCandidate = async (candidateId) => {
        if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) return;
        
        try {
            setLoading(true);
            const result = await api.deleteCandidate(candidateId);
            
            if (result.success) {
                const updatedCandidates = candidates.filter(c => c.id !== candidateId);
                setCandidates(updatedCandidates);
                
                if (selectedCandidate && selectedCandidate.id === candidateId) {
                    closeCandidatePanel();
                }
            }
        } catch (error) {
            console.error('Failed to delete candidate:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add timeline entry
    const addTimelineEntry = async (candidateId, action, description, type = 'note') => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        const timelineEntry = {
            id: Date.now() + Math.random(),
            action,
            description,
            user: currentUser.name,
            timestamp: new Date().toISOString(),
            type
        };

        const updates = {
            timeline: [timelineEntry, ...(candidate.timeline || [])],
            last_updated: new Date().toISOString(),
            _forceUpdate: Date.now()
        };

        await updateCandidate(candidateId, updates);
    };

    // Delete timeline entry
    const deleteTimelineEntry = async (candidateId, timelineEntryId) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        const updates = {
            timeline: (candidate.timeline || []).filter(entry => entry.id !== timelineEntryId),
            last_updated: new Date().toISOString(),
            _forceUpdate: Date.now()
        };

        await updateCandidate(candidateId, updates);
    };

    return (
        <div style={{ padding: '30px', maxWidth: '100%', margin: '0 auto' }}>
            {/* Enhanced Header with Statistics */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '30px',
                marginBottom: '30px',
                color: 'white'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                }}>
                    <div>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>
                            {showArchived ? '📦 Archived Candidates' : '👥 Active Candidates'}
                        </h1>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
                            {showArchived 
                                ? 'Manage your archived talent records' 
                                : 'Manage your active talent pipeline with ease'
                            }
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Archive Toggle Button */}
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            padding: '4px',
                            display: 'flex'
                        }}>
                            <button
                                onClick={() => setShowArchived(false)}
                                style={{
                                    background: !showArchived ? 'rgba(255,255,255,0.3)' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                👥 Active {stats.total > 0 && `(${stats.total})`}
                            </button>
                            <button
                                onClick={() => setShowArchived(true)}
                                style={{
                                    background: showArchived ? 'rgba(255,255,255,0.3)' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                📦 Archived {stats.archived > 0 && `(${stats.archived})`}
                            </button>
                        </div>

                        {/* View Mode Toggle - Only show for active candidates */}
                        {!showArchived && (
                            <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: '4px',
                                display: 'flex'
                            }}>
                                <button
                                    onClick={() => setViewMode('list')}
                                    style={{
                                        background: viewMode === 'list' ? 'rgba(255,255,255,0.3)' : 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    📋 List
                                </button>
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    style={{
                                        background: viewMode === 'kanban' ? 'rgba(255,255,255,0.3)' : 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    📊 Kanban
                                </button>
                            </div>
                        )}
                        
                        {/* Add Candidate Button - Only show for active candidates */}
                        {!showArchived && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                ➕ Add Candidate
                            </button>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: showArchived 
                        ? 'repeat(auto-fit, minmax(200px, 1fr))' 
                        : 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '20px'
                }}>
                    {showArchived ? (
                        // Archived view statistics
                        <>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.archived}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Archived Candidates</div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {filteredCandidates.length}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Filtered Results</div>
                            </div>
                        </>
                    ) : (
                        // Active view statistics - Operational metrics
                        <>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.total}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Active Pipeline</div>
                            </div>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.inPipeline}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>In Process</div>
                            </div>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.ready}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Ready to Hire</div>
                            </div>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.hired}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Recently Hired</div>
                            </div>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.totalEverHired}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>All-Time Hired</div>
                            </div>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.overallSuccessRate}%
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Success Rate</div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.ready}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Ready to Interview</div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.interviewing}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>In Interview Process</div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.hired}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Successfully Hired</div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                                    {stats.archived}
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9 }}>Archived</div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '25px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <input
                    type="text"
                    placeholder={showArchived ? "🔍 Search archived candidates..." : "🔍 Search candidates..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: '250px',
                        padding: '12px 15px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)'
                    }}
                />
                
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '12px 15px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)'
                    }}
                >
                    <option value="all">All Readiness</option>
                    <option value="ready">✅ Ready</option>
                    <option value="almost_ready">⚠️ Almost Ready</option>
                    <option value="not_ready">❌ Not Ready</option>
                </select>

                <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    style={{
                        padding: '12px 15px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)'
                    }}
                >
                    <option value="all">All Tags</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            {/* Conditional Rendering: List vs Kanban View (Kanban only for active candidates) */}
            {showArchived || viewMode === 'list' ? (
                /* List View for both active and archived */
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        overflow: 'visible',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border-color)',
                        minWidth: '1000px' // Ensure minimum width for proper layout
                    }}>
                    {filteredCandidates.length === 0 ? (
                        <div style={{
                            padding: '60px 20px',
                            textAlign: 'center',
                            color: 'var(--text-muted)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                                {showArchived ? '📦' : '👥'}
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                                {showArchived ? 'No archived candidates found' : 'No candidates found'}
                            </h3>
                            <p style={{ margin: 0 }}>
                                {showArchived 
                                    ? (candidates.filter(c => c.archived).length === 0 
                                        ? 'No candidates have been archived yet.' 
                                        : 'Try adjusting your search or filters.')
                                    : (candidates.length === 0 
                                        ? 'Start by adding your first candidate!' 
                                        : 'Try adjusting your search or filters.')
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Column Headers */}
<div style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px 20px',
    display: 'grid',
    gridTemplateColumns: '2.2fr 1.8fr 1.8fr 1fr 1fr 1fr 100px',
    gap: '15px',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    borderBottom: '2px solid rgba(255,255,255,0.1)'
}}>
    <div>👤 Candidate Information</div>
    <div>💼 Position & Company</div>
    <div>📁 Project</div>
    <div>📊 Status</div>
    <div>✅ Readiness</div>
    <div>💬 Feedback</div>
    <div style={{ textAlign: 'center' }}>⋮ Actions</div>
</div>
                            
                            {/* Candidate Rows */}
{displayedCandidates.map((candidate, index) => (
    <CandidateListItem
        key={`candidate-${candidate.id}-${candidate.last_updated || candidate._forceUpdate || Date.now()}`}
        candidate={candidate}
        projects={projects}
        currentUser={currentUser}
        isLast={index === displayedCandidates.length - 1}
        showArchived={showArchived}
        onClick={() => handleCandidateClick(candidate)}
        onScheduleInterview={() => onScheduleInterview(candidate)}
        onUpdate={updateCandidate}
        onDelete={deleteCandidate}
        onArchive={archiveCandidate}
        onKeepWarm={onKeepWarm}  // ← ADD THIS LINE

    />
))}

{/* Load More Button */}
{hasMoreCandidates && (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        borderTop: '1px solid var(--border-color)'
    }}>
        <button
            onClick={loadMoreCandidates}
            disabled={isLoadingMore}
            style={{
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                opacity: isLoadingMore ? 0.7 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
        >
            {isLoadingMore ? (
                <>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    Loading...
                </>
            ) : (
                <>
                    📄 Load More ({filteredCandidates.length - displayLimit} remaining)
                </>
            )}
        </button>
    </div>
)}

{/* Results Summary */}
<div style={{
    padding: '16px 20px',
    background: 'var(--input-bg)',
    borderTop: '1px solid var(--border-color)',
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    textAlign: 'center'
}}>
    Showing {displayedCandidates.length} of {filteredCandidates.length} candidates
    {filteredCandidates.length !== candidates.filter(c => c.archived === showArchived).length && (
        <span> (filtered from {candidates.filter(c => c.archived === showArchived).length} total)</span>
    )}
</div>
                        </>
                    )}
                </div>
            </div>
            ) : (
                /* Kanban View - only for active candidates */
                <CandidateKanbanBoard
                    candidates={filteredCandidates}
                    projects={projects}
                    currentUser={currentUser}
                    onCandidateClick={handleCandidateClick}
                    onScheduleInterview={onScheduleInterview}
                    onUpdateCandidate={updateCandidate}
                    onDeleteCandidate={deleteCandidate}
                    onArchiveCandidate={archiveCandidate}
                    onKeepWarm={onKeepWarm}  // Add this line to pass onKeepWarm properly
                />
            )}

            {/* Slide-in Candidate Detail Panel */}
{showCandidatePanel && selectedCandidate && (
    <>
        {/* Click-outside overlay for split panel */}
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                background: 'transparent'
            }}
            onClick={closeCandidatePanel}
        />
        <div 
            style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                width: '47%',
                height: 'calc(100vh - 160px)',
                background: 'var(--card-bg)',
                boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
                borderRadius: '16px',
                zIndex: 1000,
                animation: 'slideInFromRight 0.3s ease',
                overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
        >
                    {/* Enhanced Header */}
                    <div style={{
                        background: selectedCandidate.archived 
                            ? 'linear-gradient(135deg, #718096 0%, #4a5568 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '25px',
                        borderRadius: '16px 16px 0 0',
                        position: 'relative'
                    }}>
                        <button
                            onClick={closeCandidatePanel}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                            {selectedCandidate.archived && '📦 '}{selectedCandidate.name}
                        </h2>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                            {selectedCandidate.job_title} • {selectedCandidate.email}
                        </p>
                        {selectedCandidate.archived && (
                            <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginTop: '10px',
                                display: 'inline-block'
                            }}>
                                📦 Archived Candidate
                            </div>
                        )}
                    </div>
                    
                    {/* Candidate Detail Content */}
                    <div style={{ padding: '0' }}>
                        <CandidateDetailPanel
                            candidate={selectedCandidate}
                            currentUser={currentUser}
                            projects={projects}
                            onClose={closeCandidatePanel}
                            onUpdate={(updates) => updateCandidate(selectedCandidate.id, updates)}
                            onAddTimeline={(action, description, type) => 
                                addTimelineEntry(selectedCandidate.id, action, description, type)
                            }
                            onDeleteTimelineEntry={(timelineEntryId) =>
                                deleteTimelineEntry(selectedCandidate.id, timelineEntryId)
                            }
                            onArchive={() => archiveCandidate(selectedCandidate.id)}
                            hideHeader={true}
                        />
                    </div>
                    
                    <style jsx>{`
                        @keyframes slideInFromRight {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                    `}</style>
                </div>
            </>
        )}

            {showAddModal && (
                <AddCandidateModal
                    currentUser={currentUser}
                    projects={projects}
                    onClose={() => setShowAddModal(false)}
                    onAdd={(candidateData) => {
    const candidateWithAttribution = window.addUserAttribution(candidateData);
    const newCandidates = [candidateWithAttribution, ...candidates];
    setCandidates(newCandidates);
    helpers.storage.save('recruitpro_candidates', newCandidates);
    setShowAddModal(false);
}}
                />
            )}
        </div>
    );
};

// Updated Kanban Board Component for Candidates (with archive support)
const CandidateKanbanBoard = ({
    candidates,
    projects,
    currentUser,
    onCandidateClick,
    onScheduleInterview,
    onUpdateCandidate,
    onDeleteCandidate,
    onArchiveCandidate,
    onKeepWarm  // ADD THIS LINE

}) => {
    // Kanban columns based on the requested pipeline
    const kanbanStages = [
        { 
            id: 'exploratory', 
            title: 'Exploratory', 
            status: 'exploratory', 
            color: '#06b6d4',
            emoji: '🔎',
            description: 'Headhunted, exploring interest'
        },
        { 
            id: 'applied', 
            title: 'Applied', 
            status: 'applied', 
            color: '#4299e1',
            emoji: '📋',
            description: 'New applications'
        },
        { 
            id: 'screening', 
            title: 'Screening', 
            status: 'screening', 
            color: '#ed8936',
            emoji: '🔍',
            description: 'Initial review'
        },
        { 
            id: 'interview', 
            title: 'Interview', 
            status: 'interview', 
            color: '#9f7aea',
            emoji: '💬',
            description: 'Interview process'
        },
        { 
            id: 'hold', 
            title: 'Hold', 
            status: 'hold', 
            color: '#718096',
            emoji: '⏸️',
            description: 'On hold'
        },
        { 
            id: 'offer', 
            title: 'Offer', 
            status: 'offer', 
            color: '#48bb78',
            emoji: '💰',
            description: 'Offer extended'
        },
        { 
            id: 'hired', 
            title: 'Hired', 
            status: 'hired', 
            color: '#38b2ac',
            emoji: '🎉',
            description: 'Successfully hired'
        },
        { 
            id: 'rejected', 
            title: 'Rejected', 
            status: 'rejected', 
            color: '#e53e3e',
            emoji: '❌',
            description: 'Not selected for role'
        }
    ];
    

    // Get candidates by status
    const getCandidatesByStatus = (status) => {
        return candidates.filter(c => (c.status || 'applied') === status);
    };

    // Handle drag start
    const handleDragStart = (e, candidate) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(candidate));
        e.dataTransfer.effectAllowed = 'move';
        
        // Add visual feedback
        e.target.style.opacity = '0.5';
    };

    // Handle drag end
    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
    };

    // Handle drag over
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // Handle drop
    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        
        try {
            const candidateData = JSON.parse(e.dataTransfer.getData('text/plain'));
            
            if (candidateData.status !== newStatus) {
                // Create timeline entry for status change
                const oldConfig = kanbanStages.find(stage => stage.status === candidateData.status);
                const newConfig = kanbanStages.find(stage => stage.status === newStatus);
                
                const timestamp = new Date().toISOString();
                const timelineEntry = {
                    id: Date.now() + Math.random(),
                    action: 'Status Changed',
                    description: `Status changed from ${oldConfig?.title || 'Unknown'} to ${newConfig?.title || 'Unknown'}`,
                    user: currentUser.name,
                    timestamp,
                    type: 'status'
                };
                
                const updates = {
                    status: newStatus,
                    timeline: [timelineEntry, ...(candidateData.timeline || [])],
                    last_updated: timestamp,
                    _forceUpdate: Date.now()
                };
                
                await onUpdateCandidate(candidateData.id, updates);
            }
        } catch (error) {
            console.error('Failed to update candidate status:', error);
        }
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        }}>
            {kanbanStages.map(stage => {
                const stageCandidates = getCandidatesByStatus(stage.status);
                
                return (
                    <div
                        key={stage.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.status)}
                        style={{
                            background: 'var(--card-bg)',
                            borderRadius: '16px',
                            padding: '20px',
                            minHeight: '500px',
                            border: '2px dashed transparent',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}
                        onDragEnter={(e) => {
                            e.currentTarget.style.borderColor = stage.color;
                            e.currentTarget.style.background = `${stage.color}10`;
                        }}
                        onDragLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.background = 'var(--card-bg)';
                        }}
                    >
                        {/* Stage Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '20px',
                            paddingBottom: '15px',
                            borderBottom: `2px solid ${stage.color}20`
                        }}>
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '5px'
                                }}>
                                    <span style={{ fontSize: '20px' }}>{stage.emoji}</span>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {stage.title}
                                    </h3>
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: '12px',
                                    color: 'var(--text-muted)',
                                    fontStyle: 'italic'
                                }}>
                                    {stage.description}
                                </p>
                            </div>
                            
                            {/* Stage Counter */}
                            <div style={{
                                background: stage.color,
                                color: 'white',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '700',
                                boxShadow: `0 2px 8px ${stage.color}40`
                            }}>
                                {stageCandidates.length}
                            </div>
                        </div>

                        {/* Candidate Cards */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {stageCandidates.map(candidate => (
                                <CandidateKanbanCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    projects={projects}
                                    currentUser={currentUser}
                                    stageColor={stage.color}
                                    onClick={() => onCandidateClick(candidate)}
                                    onScheduleInterview={() => onScheduleInterview(candidate)}
                                    onDelete={() => onDeleteCandidate(candidate.id)}
                                    onArchive={() => onArchiveCandidate(candidate.id)}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onKeepWarm={onKeepWarm}  // ← ADD THIS LINE

                                />
                            ))}
                            
                            {stageCandidates.length === 0 && (
                                <div style={{
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '14px',
                                    fontStyle: 'italic',
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: '12px',
                                    background: 'var(--bg-secondary)'
                                }}>
                                    Drop candidates here
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Updated Individual Kanban Card Component (with archive support)
const CandidateKanbanCard = ({
    candidate,
    projects,
    currentUser,
    stageColor,
    onClick,
    onScheduleInterview,
    onDelete,
    onArchive,
    onDragStart,
    onDragEnd,
    onKeepWarm  
}) => {
    const project = projects.find(p => p.id == candidate.project_id);
    const getReadinessAccent = (readiness) => {
        const config = helpers.statusConfig.getReadinessConfig(readiness);
        return config.color;
    };

    const handleScheduleClick = (e) => {
        e.stopPropagation();
        onScheduleInterview();
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this candidate?')) {
            onDelete();
        }
    };

    const handleArchiveClick = (e) => {
        e.stopPropagation();
        onArchive();
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, candidate)}
            onDragEnd={onDragEnd}
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'grab',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `1px solid ${stageColor}20`,
                boxShadow: `0 2px 8px ${stageColor}15`,
                borderLeft: `4px solid ${getReadinessAccent(candidate.readiness)}`,
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${stageColor}25`;
                e.currentTarget.style.cursor = 'grab';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 2px 8px ${stageColor}15`;
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.cursor = 'grabbing';
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.cursor = 'grab';
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
            }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        lineHeight: '1.3'
                    }}>
                        {candidate.name}
                    </h4>
                    {candidate.job_title && (
                        <p style={{
                            margin: '0 0 4px 0',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            fontWeight: '500'
                        }}>
                            {candidate.job_title}
                        </p>
                    )}
                    {candidate.company && (
                        <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: 'var(--text-muted)'
                        }}>
                            {candidate.company}
                        </p>
                    )}
                </div>
                
                {/* Readiness Indicator */}
                <div style={{
                    background: getReadinessAccent(candidate.readiness),
                    color: 'white',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '60px'
                }}>
                    {helpers.statusConfig.getReadinessConfig(candidate.readiness).emoji}
                </div>
            </div>

            {/* Project Info */}
            {project && (
                <div style={{
                    background: `${stageColor}10`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    border: `1px solid ${stageColor}20`
                }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: stageColor,
                        marginBottom: '2px'
                    }}>
                        📁 {project.name}
                    </div>
                    {project.hiring_manager && (
                        <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)'
                        }}>
                            HM: {project.hiring_manager}
                        </div>
                    )}
                </div>
            )}

            {/* Skills/Tags */}
            {candidate.tags && candidate.tags.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    marginBottom: '12px'
                }}>
                    {candidate.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            style={{
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-secondary)',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '500'
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                    {candidate.tags.length > 3 && (
                        <span style={{
                            color: 'var(--text-muted)',
                            fontSize: '10px',
                            padding: '2px 4px'
                        }}>
                            +{candidate.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer Actions */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto'
            }}>
                {/* Interview Feedback Count */}
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {candidate.interview_feedback && candidate.interview_feedback.length > 0 ? (
                        <span style={{
                            background: '#48bb78',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: '600'
                        }}>
                            {candidate.interview_feedback.length} feedback
                        </span>
                    ) : (
                        <span>No feedback</span>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={handleScheduleClick}
                        style={{
                            background: stageColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        title="Schedule Interview"
                    >
                        📅
                    </button>
                    <button
                        onClick={handleArchiveClick}
                        style={{
                            background: '#718096',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        title="Archive Candidate"
                    >
                        📦
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        style={{
                            background: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        title="Delete Candidate"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* Drag Handle Indicator */}
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '16px',
                height: '16px',
                background: `${stageColor}20`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: stageColor,
                pointerEvents: 'none'
            }}>
                ⋮⋮
            </div>
        </div>
    );
};

// Updated Candidate List Item Component (with archive support)
const CandidateListItem = ({ 
    candidate, 
    projects, 
    currentUser, 
    isLast, 
    showArchived, 
    onClick, 
    onScheduleInterview, 
    onUpdate, 
    onDelete, 
    onArchive,
    onKeepWarm

}) => {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [showActionsMenu, setShowActionsMenu] = React.useState(false);

    // Close dropdown when clicking outside
React.useEffect(() => {
    if (!showActionsMenu) return;
    
    const handleClickOutside = (event) => {
        // Check if click is outside the actions menu
        const isActionsButton = event.target.closest('button[title="Actions"]');
        const isDropdownMenu = event.target.closest('[data-actions-dropdown]');
        
        if (!isActionsButton && !isDropdownMenu) {
            setShowActionsMenu(false);
        }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
}, [showActionsMenu]);
    
    // Get readiness config
    const getReadinessConfig = (readiness) => {
        switch(readiness) {
            case 'ready':
                return { label: 'Ready', emoji: '✅', color: '#48bb78' };
            case 'almost_ready':
                return { label: 'Almost Ready', emoji: '⚠️', color: '#ed8936' };
            case 'not_ready':
                return { label: 'Not Ready', emoji: '❌', color: '#fc8181' };
                case 'keep_warm':
                    return { label: 'Keep Warm', emoji: '🔥', color: '#4299e1' };
            default:
                return { label: 'Not Ready', emoji: '❌', color: '#fc8181' };
        }
    };

    // Get status config
    const getStatusConfig = (status) => {
        return helpers.statusConfig.statuses.find(s => s.value === status) || 
               { label: 'Applied', color: '#4299e1' };
    };

    const getReadinessAccent = (readiness) => {
        const config = getReadinessConfig(readiness);
        return config.color;
    };

    const project = projects.find(p => p.id == candidate.project_id);

    // Handle readiness change with timeline entry
    const handleReadinessChange = async (e) => {
        e.stopPropagation();
        const newReadiness = e.target.value;

 // Handle "Keep Warm" selection
 if (newReadiness === 'keep_warm') {
    console.log('DEBUG: About to call onKeepWarm with:', candidate.id);
    console.log('DEBUG: onKeepWarm is:', typeof onKeepWarm, onKeepWarm);
    if (typeof onKeepWarm === 'function') {
      onKeepWarm(candidate.id);
    } else {
      console.warn('onKeepWarm is not defined or not a function');
    }
    return; // Exit early, don't update readiness
  }

        const oldReadiness = candidate.readiness;
        setIsUpdating(true);
        
        try {
            // Create timeline entry for readiness change
            const oldConfig = getReadinessConfig(oldReadiness);
            const newConfig = getReadinessConfig(newReadiness);
            
            const timestamp = new Date().toISOString();
            const timelineEntry = {
                id: Date.now() + Math.random(),
                action: 'Readiness Updated',
                description: `Readiness changed from ${oldConfig.label} to ${newConfig.label}`,
                user: currentUser.name,
                timestamp,
                type: 'readiness'
            };
            
            const updates = {
                readiness: newReadiness,
                timeline: [timelineEntry, ...(candidate.timeline || [])],
                last_updated: timestamp,
                _forceUpdate: Date.now()
            };
            
            await onUpdate(candidate.id, updates);
        } catch (error) {
            console.error('Failed to update readiness:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle status change with timeline entry
    const handleStatusChange = async (e) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        const oldStatus = candidate.status;
        setIsUpdating(true);
        
        try {
            // Create timeline entry for status change
            const oldConfig = getStatusConfig(oldStatus);
            const newConfig = getStatusConfig(newStatus);
            
            const timestamp = new Date().toISOString();
            const timelineEntry = {
                id: Date.now() + Math.random(),
                action: 'Status Changed',
                description: `Status changed from ${oldConfig.label} to ${newConfig.label}`,
                user: currentUser.name,
                timestamp,
                type: 'status'
            };
            
            const updates = {
                status: newStatus,
                timeline: [timelineEntry, ...(candidate.timeline || [])],
                last_updated: timestamp,
                _forceUpdate: Date.now()
            };
            
            await onUpdate(candidate.id, updates);
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleScheduleClick = (e) => {
        e.stopPropagation();
        onScheduleInterview();
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(candidate.id);
    };

    const handleArchiveClick = (e) => {
        e.stopPropagation();
        onArchive(candidate.id);
    };

    const handleRowClick = (e) => {
        if (!['SELECT', 'BUTTON'].includes(e.target.tagName)) {
            onClick();
        }
    };

    // Get full country name from country code
    const getCountryName = (countryCode) => {
        if (!countryCode) return null;
        const country = helpers.predefinedOptions.countries.find(c => c.value === countryCode);
        if (!country) return countryCode;
        
        // Remove flag emoji (first 3 characters) and extract country name
        return country.label.substring(3).trim();
    };

    return (
        <div
        onClick={handleRowClick}
        style={{
            padding: '16px 20px',
            borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
            borderLeft: `4px solid ${showArchived ? '#718096' : getReadinessAccent(candidate.readiness)}`,
            background: showArchived ? 'var(--bg-secondary)' : 'var(--card-bg)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isUpdating ? 0.7 : (showArchived ? 0.8 : 1),
            minWidth: 0,
            overflow: 'visible',
            position: 'relative',
            zIndex: showActionsMenu ? 10001 : 1
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = showArchived ? '#f7fafc' : 'var(--bg-secondary)';
                e.currentTarget.style.transform = 'translateX(2px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = showArchived ? 'var(--bg-secondary)' : 'var(--card-bg)';
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
    display: 'grid',
    gridTemplateColumns: '2.2fr 1.8fr 1.8fr 1fr 1fr 1fr 100px',
    gap: '15px',
    alignItems: 'center',
    fontSize: '14px',
    minHeight: '60px'
}}>
                {/* Candidate Information */}
                <div style={{
                    borderRight: '1px solid var(--border-color)',
                    paddingRight: '15px',
                    minWidth: 0 // Ensures the container can shrink
                }}>
                    <div style={{
    fontWeight: '700',
    fontSize: '16px',
    color: showArchived ? 'var(--text-secondary)' : 'var(--text-primary)',
    marginBottom: '4px',
    lineHeight: '1.3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
}}>
    {window.PrivacyIndicator && React.createElement(window.PrivacyIndicator, {
        candidate: candidate,
        size: 'small',
        showTooltip: true
    })}
    {showArchived && '📦'} {candidate.name}
</div>
                    <div style={{
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        📧 {candidate.email}
                    </div>
                    {candidate.phone && (
                        <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            📞 {candidate.phone}
                        </div>
                    )}
                    {getCountryName(candidate.location) && (
                        <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            📍 {getCountryName(candidate.location)}
                        </div>
                    )}
                </div>

                {/* Position & Company */}
                <div style={{
                    borderRight: '1px solid var(--border-color)',
                    paddingRight: '15px'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: showArchived ? 'var(--text-secondary)' : 'var(--text-primary)',
                        marginBottom: '4px',
                        fontSize: '14px',
                        lineHeight: '1.2',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        maxHeight: '2.4em'
                    }}>
                        {candidate.job_title || 'Position not specified'}
                    </div>
                    {candidate.company && (
                        <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            lineHeight: '1.2',
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            🏢 {candidate.company}
                        </div>
                    )}
                </div>

                {/* Project */}
                <div style={{
                    textAlign: 'center',
                    borderRight: '1px solid var(--border-color)',
                    paddingRight: '15px',
                    minWidth: 0
                }}>
                    {project ? (
                        <div style={{
                            background: showArchived 
                                ? 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)'
                                : 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                            color: 'white',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            boxShadow: showArchived 
                                ? '0 2px 8px rgba(160, 174, 192, 0.25)'
                                : '0 2px 8px rgba(56, 178, 172, 0.25)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            display: 'block'
                        }}
                        title={project.name} // Show full name on hover
                        >
                            {project.name}
                        </div>
                    ) : (
                        <div style={{
                            fontSize: '11px',
                            color: 'var(--text-tertiary)',
                            fontStyle: 'italic'
                        }}>
                            No project
                        </div>
                    )}
                </div>

                {/* Status */}
                <div style={{
                    textAlign: 'center',
                    borderRight: '1px solid var(--border-color)',
                    paddingRight: '15px'
                }}>
                    <select
    value={candidate.status || 'applied'}
    onChange={handleStatusChange}
    disabled={isUpdating || showArchived}
    style={{
        padding: '6px 8px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '11px',
        fontWeight: '600',
        background: showArchived ? '#a0aec0' : getStatusConfig(candidate.status).color,
        color: 'white',
        cursor: showArchived ? 'not-allowed' : 'pointer',
        width: '100%',
        maxWidth: '110px',
        opacity: showArchived ? 0.7 : 1
    }}
    onClick={(e) => e.stopPropagation()}
>
    <option value="exploratory">🔎 Exploratory</option>
    <option value="applied">📋 Applied</option>
    <option value="screening">🔍 Screening</option>
    <option value="interview">💬 Interview</option>
    <option value="hold">⏸️ Hold</option>
    <option value="offer">💰 Offer</option>
    <option value="hired">🎉 Hired</option>
    <option value="rejected">❌ Rejected</option>
</select>
                </div>

                {/* Readiness */}
                <div style={{
                    textAlign: 'center',
                    borderRight: '1px solid var(--border-color)',
                    paddingRight: '15px'
                }}>
                    <select
  value={candidate.readiness || 'not_ready'}
  onChange={handleReadinessChange}
  disabled={isUpdating || showArchived}
  style={{
    padding: '6px 8px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '11px',
    fontWeight: '600',
    background: showArchived ? '#a0aec0' : getReadinessAccent(candidate.readiness),
    color: 'white',
    cursor: showArchived ? 'not-allowed' : 'pointer',
    width: '100%',
    maxWidth: '90px',
    opacity: showArchived ? 0.7 : 1
  }}
  onClick={(e) => e.stopPropagation()}
>
  <option value="ready">✅ Ready</option>
  <option value="almost_ready">⚠️ Almost</option>
  <option value="not_ready">❌ Not Ready</option>
  <option value="keep_warm">🔥 Keep Warm</option> {/* This must match your check */}
</select>

                </div>

                

                {/* Interview Feedback */}
                <div style={{
                    textAlign: 'center',
                    borderRight: '1px solid var(--border-color)',
                    paddingRight: '15px'
                }}>
                    {candidate.interview_feedback && candidate.interview_feedback.length > 0 ? (
                        <div style={{
                            background: showArchived 
                                ? 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)'
                                : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            boxShadow: showArchived 
                                ? '0 2px 8px rgba(160, 174, 192, 0.25)'
                                : '0 2px 8px rgba(72, 187, 120, 0.25)',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'inline-block'
                        }}>
                            {candidate.interview_feedback.length}
                        </div>
                    ) : (
                        <div style={{
                            fontSize: '11px',
                            color: 'var(--text-tertiary)',
                            fontStyle: 'italic'
                        }}>
                            None
                        </div>
                    )}
                </div>

                {/* Actions Dropdown Menu */}
<div style={{ textAlign: 'center', position: 'relative', zIndex: showActionsMenu ? 10001 : 1 }}>
    <button
        onClick={(e) => {
            e.stopPropagation();
            setShowActionsMenu(!showActionsMenu);
        }}
        style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)'
        }}
        onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
        }}
        onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.2)';
        }}
        title="Actions"
    >
        ⋮
    </button>

    {/* Dropdown Menu */}
    {showActionsMenu && (
    <div 
        data-actions-dropdown="true"
        style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 10000,
            minWidth: '160px',
            overflow: 'hidden'
        }}
            onClick={(e) => e.stopPropagation()}
        >
            {!showArchived && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowActionsMenu(false);
                        handleScheduleClick(e);
                    }}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        transition: 'background 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                    📅 Schedule
                </button>
            )}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(false);
                    handleArchiveClick(e);
                }}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderTop: !showArchived ? '1px solid var(--border-color)' : 'none'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
                {showArchived ? '↩️ Restore' : '📦 Archive'}
            </button>
            {!showArchived && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowActionsMenu(false);
                        handleDeleteClick(e);
                    }}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#e53e3e',
                        transition: 'background 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderTop: '1px solid var(--border-color)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(229, 62, 62, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                    }}
                >
                    🗑️ Delete
                </button>
            )}
        </div>
    )}
</div>
            </div>
        </div>
    );
};

// Export to global scope
window.CandidatesComponent = CandidatesComponent;
window.CandidateListItem = CandidateListItem;
window.CandidateKanbanBoard = CandidateKanbanBoard;
window.CandidateKanbanCard = CandidateKanbanCard;
