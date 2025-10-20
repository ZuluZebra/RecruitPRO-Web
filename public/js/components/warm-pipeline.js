// Enterprise-Level Warm Pipeline Component - Professional CRM System
const WarmPipelineComponent = ({ 
    currentUser,
    warmCandidates,
    setWarmCandidates,
    candidates,
    setCandidates 
}) => {
    const [selectedCandidate, setSelectedCandidate] = React.useState(null);
    const [showContactModal, setShowContactModal] = React.useState(false);
    const [showEmailTemplates, setShowEmailTemplates] = React.useState(false);
    const [emailTemplates, setEmailTemplates] = React.useState([]);
    const [viewMode, setViewMode] = React.useState('cards'); // 'cards', 'table', 'timeline'
    const [sortBy, setSortBy] = React.useState('urgency'); // 'urgency', 'lastContact', 'name', 'added'
    const [filterBy, setFilterBy] = React.useState('all'); // 'all', 'urgent', 'overdue', 'recent'
    const [searchTerm, setSearchTerm] = React.useState('');

    // Load warm candidates from localStorage on component mount
React.useEffect(() => {
    const savedWarmCandidates = helpers.storage.load('recruitpro_warm_candidates') || [];
    // Always set state from localStorage, even if empty
    setWarmCandidates(savedWarmCandidates);
    console.log(`✅ Loaded ${savedWarmCandidates.length} warm candidates from localStorage`);
    
    // Load email templates
    const savedTemplates = helpers.storage.load('recruitpro_email_templates') || [];
    setEmailTemplates(savedTemplates);
    console.log(`📧 Loaded ${savedTemplates.length} email templates from localStorage`);
}, []);

    // Save warm candidates to localStorage
const saveWarmCandidates = (candidates) => {
    const success = helpers.storage.save('recruitpro_warm_candidates', candidates);
    if (success) {
        console.log(`💾 Saved ${candidates.length} warm candidates to localStorage`);
    } else {
        console.error(`❌ Failed to save ${candidates.length} warm candidates to localStorage`);
    }
};

    // Save email templates to localStorage
    const saveEmailTemplates = (templates) => {
        helpers.storage.save('recruitpro_email_templates', templates);
        console.log(`📧 Saved ${templates.length} email templates to localStorage`);
    };

    // Enhanced candidate urgency calculation
    const calculateUrgency = (candidate) => {
        const now = new Date();
        const lastContact = new Date(candidate.lastContact || candidate.movedToWarmDate);
        const daysSinceContact = Math.floor((now - lastContact) / (1000 * 60 * 60 * 24));
        const targetContactFrequency = candidate.contactFrequency || 14; // days
        
        if (daysSinceContact > targetContactFrequency + 7) return 'critical';
        if (daysSinceContact > targetContactFrequency) return 'urgent';
        if (daysSinceContact > targetContactFrequency - 3) return 'attention';
        return 'good';
    };

    // Enhanced filtering and sorting
    const processedCandidates = React.useMemo(() => {
        let filtered = warmCandidates.filter(candidate => {
            // Search filter
            const matchesSearch = !searchTerm || 
                candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.company?.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // Status filter
            const urgency = calculateUrgency(candidate);
            switch (filterBy) {
                case 'urgent': return urgency === 'urgent' || urgency === 'critical';
                case 'overdue': return urgency === 'critical';
                case 'recent': return urgency === 'good';
                default: return true;
            }
        });

        // Add urgency to each candidate for sorting
        filtered = filtered.map(candidate => ({
            ...candidate,
            urgencyLevel: calculateUrgency(candidate),
            daysSinceContact: Math.floor((new Date() - new Date(candidate.lastContact || candidate.movedToWarmDate)) / (1000 * 60 * 60 * 24))
        }));

        // Sort candidates
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'urgency':
                    const urgencyOrder = { 'critical': 4, 'urgent': 3, 'attention': 2, 'good': 1 };
                    return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
                case 'lastContact':
                    return new Date(b.lastContact || b.movedToWarmDate) - new Date(a.lastContact || a.movedToWarmDate);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'added':
                    return new Date(b.movedToWarmDate) - new Date(a.movedToWarmDate);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [warmCandidates, searchTerm, filterBy, sortBy]);

    // Statistics calculation
    const stats = React.useMemo(() => {
        const urgencyStats = { critical: 0, urgent: 0, attention: 0, good: 0 };
        warmCandidates.forEach(candidate => {
            urgencyStats[calculateUrgency(candidate)]++;
        });
        
        return {
            total: warmCandidates.length,
            ...urgencyStats,
            avgDaysSinceContact: warmCandidates.length > 0 
                ? Math.round(warmCandidates.reduce((sum, c) => sum + Math.floor((new Date() - new Date(c.lastContact || c.movedToWarmDate)) / (1000 * 60 * 60 * 24)), 0) / warmCandidates.length)
                : 0
        };
    }, [warmCandidates]);

    // Log communication function with localStorage persistence
    const logCommunication = async (candidateId, communicationType, notes, updateLastContact = true) => {
        const timestamp = new Date().toISOString();
        const communication = {
            id: Date.now() + Math.random(),
            type: communicationType, // 'email', 'phone', 'linkedin', 'meeting', 'text'
            notes: notes || '',
            user: currentUser.name,
            timestamp,
            date: timestamp.split('T')[0]
        };

        const updatedWarmCandidates = warmCandidates.map(candidate => {
            if (candidate.id === candidateId) {
                return {
                    ...candidate,
                    communications: [communication, ...(candidate.communications || [])],
                    lastContact: updateLastContact ? timestamp : candidate.lastContact,
                    lastCommunicationType: communicationType,
                    totalCommunications: (candidate.totalCommunications || 0) + 1
                };
            }
            return candidate;
        });

        setWarmCandidates(updatedWarmCandidates);
        saveWarmCandidates(updatedWarmCandidates); // Save to localStorage
        console.log(`📝 Logged ${communicationType} communication for candidate ${candidateId}`);
    };

    // Move back to active candidates with localStorage persistence
    const moveBackToActive = (warmCandidateId) => {
        const warmCandidate = warmCandidates.find(c => c.id === warmCandidateId);
        if (warmCandidate) {
            // Clean up warm-specific properties
            const { movedToWarmDate, lastContact, warmStatus, communications, totalCommunications, lastCommunicationType, ...activeCandidate } = warmCandidate;
            
            // Add back to active candidates
            const updatedActiveCandidates = [{ ...activeCandidate, readiness: 'ready' }, ...candidates];
            setCandidates(updatedActiveCandidates);
            helpers.storage.save('recruitpro_candidates', updatedActiveCandidates); // Save active candidates
            
            // Remove from warm pipeline
            const updatedWarmCandidates = warmCandidates.filter(c => c.id !== warmCandidateId);
            setWarmCandidates(updatedWarmCandidates);
            saveWarmCandidates(updatedWarmCandidates); // Save warm candidates
            
            console.log(`🔥 Moved ${warmCandidate.name} back to active pipeline`);
        }
    };

    const getCountryName = (countryCode) => {
        if (!countryCode) return null;
        const country = helpers?.predefinedOptions?.countries?.find(c => c.value === countryCode);
        return country ? country.label.substring(3).trim() : countryCode;
    };

    return (
        <div style={{ padding: '32px', maxWidth: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Enterprise Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%)',
                borderRadius: '24px',
                padding: '40px',
                marginBottom: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    transform: 'translate(100px, -100px)'
                }} />
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '32px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div>
                        <h1 style={{ 
                            margin: '0 0 12px 0', 
                            fontSize: '40px', 
                            fontWeight: '800',
                            letterSpacing: '-0.5px'
                        }}>
                            🔥 Enterprise Talent Pipeline
                        </h1>
                        <p style={{ 
                            margin: 0, 
                            fontSize: '18px', 
                            opacity: 0.9,
                            lineHeight: '1.5'
                        }}>
                            Advanced relationship management for {stats.total} warm candidates
                            <br />
                            Never lose a valuable connection again
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowEmailTemplates(true)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                padding: '12px 24px',
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
                            📧 Email Templates
                        </button>
                        
                        <button
                            onClick={() => setShowContactModal(true)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                padding: '12px 24px',
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
                            📱 Quick Contact
                        </button>
                    </div>
                </div>

                {/* Enterprise Statistics Dashboard */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(15px)',
                        padding: '24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
                            {stats.total}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Total Pipeline</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Active relationships</div>
                    </div>
                    
                    <div style={{
                        background: stats.critical > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(15px)',
                        padding: '24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: stats.critical > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.2)',
                        animation: stats.critical > 0 ? 'pulse 2s infinite' : 'none'
                    }}>
                        <div style={{ 
                            fontSize: '32px', 
                            fontWeight: '800', 
                            marginBottom: '8px',
                            color: stats.critical > 0 ? '#fee' : 'white'
                        }}>
                            {stats.critical}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Critical</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Overdue contacts</div>
                    </div>

                    <div style={{
                        background: stats.urgent > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(15px)',
                        padding: '24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: stats.urgent > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
                            {stats.urgent}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Urgent</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Need attention</div>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(15px)',
                        padding: '24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
                            {stats.avgDaysSinceContact}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Avg Days</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Since contact</div>
                    </div>
                </div>
            </div>

            {/* Advanced Controls */}
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '32px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ 
                        margin: 0, 
                        fontSize: '24px', 
                        fontWeight: '700',
                        color: 'var(--text-primary)'
                    }}>
                        Pipeline Management
                    </h3>
                </div>

                {/* Advanced Filters */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 2fr) repeat(3, minmax(150px, 1fr))',
                    gap: '20px',
                    alignItems: 'end'
                }}>
                    {/* Search */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)'
                        }}>
                            Search Candidates
                        </label>
                        <input
                            type="text"
                            placeholder="Name, email, company, or title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid var(--border-color)',
                                borderRadius: '12px',
                                fontSize: '14px',
                                background: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                transition: 'border-color 0.2s ease'
                            }}
                        />
                    </div>

                    {/* Priority Filter */}
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
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid var(--border-color)',
                                borderRadius: '12px',
                                fontSize: '14px',
                                background: 'var(--input-bg)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="all">All Contacts</option>
                            <option value="urgent">Urgent Only</option>
                            <option value="overdue">Overdue Only</option>
                            <option value="recent">Recent Only</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)'
                        }}>
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid var(--border-color)',
                                borderRadius: '12px',
                                fontSize: '14px',
                                background: 'var(--input-bg)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="urgency">Urgency Level</option>
                            <option value="lastContact">Last Contact</option>
                            <option value="name">Name</option>
                            <option value="added">Date Added</option>
                        </select>
                    </div>

                    {/* Results Count */}
                    <div style={{
                        background: 'var(--accent-color)',
                        color: 'white',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '16px'
                    }}>
                        {processedCandidates.length} Results
                    </div>
                </div>
            </div>

            {/* Candidates Display */}
            {processedCandidates.length === 0 ? (
                <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '20px',
                    padding: '80px 40px',
                    textAlign: 'center',
                    border: '2px dashed var(--border-color)'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔥</div>
                    <h3 style={{ 
                        color: 'var(--text-primary)', 
                        marginBottom: '16px',
                        fontSize: '28px',
                        fontWeight: '700'
                    }}>
                        {warmCandidates.length === 0 ? 'No Warm Candidates Yet' : 'No Matches Found'}
                    </h3>
                    <p style={{ 
                        color: 'var(--text-secondary)',
                        fontSize: '18px',
                        maxWidth: '500px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        {warmCandidates.length === 0 
                            ? 'Start building your talent pipeline by using "Keep Warm" in the candidates tab'
                            : 'Try adjusting your search terms or filters to find the candidates you\'re looking for'
                        }
                    </p>
                </div>
            ) : (
                <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    border: '1px solid var(--border-color)'
                }}>
                    {/* List Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%)',
                        color: 'white',
                        padding: '20px 32px',
                        display: 'grid',
                        gridTemplateColumns: '60px 2fr 1.5fr 1fr 1fr 1fr 200px',
                        gap: '20px',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: '700',
                        letterSpacing: '0.5px'
                    }}>
                        <div>STATUS</div>
                        <div>CANDIDATE</div>
                        <div>CONTACT INFO</div>
                        <div>COMPANY</div>
                        <div>LAST CONTACT</div>
                        <div>COMMUNICATIONS</div>
                        <div style={{ textAlign: 'center' }}>ACTIONS</div>
                    </div>

                    {/* Candidate Rows */}
                    {processedCandidates.map((candidate, index) => (
                        <EnterpriseWarmCandidateRow
                            key={candidate.id}
                            candidate={candidate}
                            isLast={index === processedCandidates.length - 1}
                            onSelect={setSelectedCandidate}
                            onLogCommunication={logCommunication}
                            onMoveToActive={() => moveBackToActive(candidate.id)}
                            getCountryName={getCountryName}
                        />
                    ))}
                </div>
            )}

            {/* Candidate Detail Modal */}
            {selectedCandidate && (
                <WarmCandidateDetailModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    onLogCommunication={logCommunication}
                    onMoveToActive={() => {
                        moveBackToActive(selectedCandidate.id);
                        setSelectedCandidate(null);
                    }}
                    getCountryName={getCountryName}
                />
            )}

            {/* Email Templates Modal */}
            {showEmailTemplates && (
                <EmailTemplatesModal
                    emailTemplates={emailTemplates}
                    onClose={() => setShowEmailTemplates(false)}
                    onSaveTemplate={(template) => {
                        const updatedTemplates = template.id 
                            ? emailTemplates.map(t => t.id === template.id ? template : t)
                            : [...emailTemplates, { ...template, id: Date.now(), createdBy: currentUser.name, createdAt: new Date().toISOString() }];
                        setEmailTemplates(updatedTemplates);
                        saveEmailTemplates(updatedTemplates);
                    }}
                    onDeleteTemplate={(templateId) => {
                        const updatedTemplates = emailTemplates.filter(t => t.id !== templateId);
                        setEmailTemplates(updatedTemplates);
                        saveEmailTemplates(updatedTemplates);
                    }}
                />
            )}

            {/* Animations */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

// Email Templates Management Modal
const EmailTemplatesModal = ({ emailTemplates, onClose, onSaveTemplate, onDeleteTemplate }) => {
    const [showCreateForm, setShowCreateForm] = React.useState(false);
    const [editingTemplate, setEditingTemplate] = React.useState(null);
    const [formData, setFormData] = React.useState({ name: '', subject: '', content: '' });
    const [copiedId, setCopiedId] = React.useState(null);

    const handleSave = () => {
        if (formData.name.trim() && formData.content.trim()) {
            onSaveTemplate(editingTemplate ? { ...editingTemplate, ...formData } : formData);
            resetForm();
        }
    };

    const resetForm = () => {
        setFormData({ name: '', subject: '', content: '' });
        setEditingTemplate(null);
        setShowCreateForm(false);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({ name: template.name, subject: template.subject || '', content: template.content });
        setShowCreateForm(true);
    };

    const handleCopy = async (template) => {
        const textToCopy = template.subject ? `Subject: ${template.subject}\n\n${template.content}` : template.content;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedId(template.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedId(template.id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    return (
        <>
            {/* Modal Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: 'var(--card-bg)',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '1000px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                        border: '1px solid var(--border-color)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%)',
                        color: 'white',
                        padding: '32px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>
                                    📧 Email Templates
                                </h2>
                                <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                                    Manage your reusable email templates for warm outreach
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCreateForm(true)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                ➕ New Template
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '32px', maxHeight: '600px', overflowY: 'auto' }}>
                        {/* Create/Edit Form */}
                        {showCreateForm && (
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '32px',
                                border: '2px solid var(--accent-color)'
                            }}>
                                <h3 style={{ 
                                    margin: '0 0 20px 0',
                                    color: 'var(--text-primary)',
                                    fontSize: '20px',
                                    fontWeight: '700'
                                }}>
                                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Template Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g., Follow-up after call, Initial outreach, etc."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
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
                                        Email Subject (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        placeholder="Subject line for the email"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
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
                                        Email Content *
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                        placeholder="Write your email template here. You can use placeholders like [NAME], [COMPANY], etc."
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            padding: '12px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={resetForm}
                                        style={{
                                            padding: '10px 16px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    
                                    <button
                                        onClick={handleSave}
                                        disabled={!formData.name.trim() || !formData.content.trim()}
                                        style={{
                                            padding: '10px 16px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            background: (formData.name.trim() && formData.content.trim()) ? '#059669' : '#9ca3af',
                                            color: 'white',
                                            cursor: (formData.name.trim() && formData.content.trim()) ? 'pointer' : 'not-allowed',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {editingTemplate ? 'Update Template' : 'Save Template'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Templates List */}
                        {emailTemplates.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '16px'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    No Email Templates Yet
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Create your first template to streamline your warm outreach
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {emailTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        style={{
                                            background: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'flex-start',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{
                                                    margin: '0 0 8px 0',
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {template.name}
                                                </h4>
                                                
                                                {template.subject && (
                                                    <div style={{
                                                        background: 'var(--bg-secondary)',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        color: 'var(--text-secondary)',
                                                        marginBottom: '8px',
                                                        display: 'inline-block'
                                                    }}>
                                                        Subject: {template.subject}
                                                    </div>
                                                )}
                                                
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    Created by {template.createdBy} • {new Date(template.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleCopy(template)}
                                                    style={{
                                                        background: copiedId === template.id ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px 16px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    {copiedId === template.id ? '✅ Copied!' : '📋 Copy'}
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleEdit(template)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this template?')) {
                                                            onDeleteTemplate(template.id);
                                                        }
                                                    }}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            maxHeight: '150px',
                                            overflowY: 'auto'
                                        }}>
                                            <pre style={{
                                                margin: 0,
                                                fontSize: '13px',
                                                color: 'var(--text-secondary)',
                                                whiteSpace: 'pre-wrap',
                                                fontFamily: 'inherit',
                                                lineHeight: '1.4'
                                            }}>
                                                {template.content}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// Enterprise Warm Candidate Row Component
const EnterpriseWarmCandidateRow = ({ 
    candidate, 
    isLast,
    onSelect, 
    onLogCommunication,
    onMoveToActive,
    getCountryName 
}) => {
    const urgencyConfig = {
        critical: { color: '#dc2626', bg: '#fef2f2', text: 'CRITICAL', icon: '🚨' },
        urgent: { color: '#ea580c', bg: '#fff7ed', text: 'URGENT', icon: '⚠️' },
        attention: { color: '#d97706', bg: '#fffbeb', text: 'ATTENTION', icon: '📢' },
        good: { color: '#16a34a', bg: '#f0fdf4', text: 'ON TRACK', icon: '✅' }
    };

    const urgency = urgencyConfig[candidate.urgencyLevel];
    const communicationCount = candidate.communications?.length || 0;
    const lastComm = candidate.communications?.[0];

    return (
        <div
            style={{
                padding: '24px 32px',
                borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                borderLeft: `6px solid ${urgency.color}`,
                background: candidate.urgencyLevel === 'critical' ? 'rgba(220, 38, 38, 0.02)' : 'var(--card-bg)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: '60px 2fr 1.5fr 1fr 1fr 1fr 200px',
                gap: '20px',
                alignItems: 'center',
                animation: candidate.urgencyLevel === 'critical' ? 'pulse 3s infinite' : 'none'
            }}
            onClick={() => onSelect(candidate)}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = candidate.urgencyLevel === 'critical' 
                    ? 'rgba(220, 38, 38, 0.05)' 
                    : 'var(--bg-secondary)';
                e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = candidate.urgencyLevel === 'critical' 
                    ? 'rgba(220, 38, 38, 0.02)' 
                    : 'var(--card-bg)';
                e.currentTarget.style.transform = 'translateX(0)';
            }}
        >
            {/* Status Badge */}
            <div style={{
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: urgency.bg,
                    color: urgency.color,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '800',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    border: `1px solid ${urgency.color}33`,
                    minWidth: '45px'
                }}>
                    {urgency.icon}
                </div>
            </div>

            {/* Candidate Info */}
            <div>
                <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                    cursor: 'pointer'
                }}>
                    {candidate.name}
                </div>
                
                {candidate.job_title && (
                    <div style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        marginBottom: '4px'
                    }}>
                        {candidate.job_title}
                    </div>
                )}

                {getCountryName(candidate.location) && (
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        🌍 {getCountryName(candidate.location)}
                    </div>
                )}
            </div>

            {/* Contact Info */}
            <div>
                <div style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    fontFamily: 'monospace'
                }}>
                    📧 {candidate.email}
                </div>
                
                {candidate.phone && (
                    <div style={{
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                        fontFamily: 'monospace'
                    }}>
                        📱 {candidate.phone}
                    </div>
                )}
                
                {candidate.linkedin_url && (
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                    }}>
                        💼 LinkedIn
                    </div>
                )}
            </div>

            {/* Company */}
            <div>
                {candidate.company ? (
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        🏢 {candidate.company}
                    </div>
                ) : (
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic'
                    }}>
                        No company
                    </div>
                )}
            </div>

            {/* Last Contact */}
            <div>
                <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: candidate.urgencyLevel === 'critical' ? '#dc2626' : 'var(--text-primary)',
                    marginBottom: '4px'
                }}>
                    {candidate.daysSinceContact} days
                </div>
                <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                }}>
                    {lastComm?.type || 'None'} contact
                </div>
            </div>

            {/* Communications */}
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                }}>
                    {communicationCount}
                </div>
                <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                }}>
                    Total touches
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onLogCommunication(candidate.id, 'email', 'Quick email contact');
                    }}
                    style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                    }}
                    title="Log email contact"
                >
                    📧
                </button>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onLogCommunication(candidate.id, 'phone', 'Quick phone contact');
                    }}
                    style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                    title="Log phone contact"
                >
                    📱
                </button>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMoveToActive();
                    }}
                    style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                    title="Move to active pipeline"
                >
                    🔥
                </button>
            </div>
        </div>
    );
};

// Candidate Detail Modal with Timeline and Comments
const WarmCandidateDetailModal = ({ 
    candidate, 
    onClose, 
    onLogCommunication, 
    onMoveToActive,
    getCountryName 
}) => {
    const [showAddComment, setShowAddComment] = React.useState(false);
    const [newComment, setNewComment] = React.useState({ type: 'email', notes: '' });

    const urgencyConfig = {
        critical: { color: '#dc2626', bg: '#fef2f2', text: 'CRITICAL', icon: '🚨' },
        urgent: { color: '#ea580c', bg: '#fff7ed', text: 'URGENT', icon: '⚠️' },
        attention: { color: '#d97706', bg: '#fffbeb', text: 'ATTENTION', icon: '📢' },
        good: { color: '#16a34a', bg: '#f0fdf4', text: 'ON TRACK', icon: '✅' }
    };

    const urgency = urgencyConfig[candidate.urgencyLevel];
    
    const handleAddComment = async () => {
        if (newComment.notes.trim()) {
            await onLogCommunication(candidate.id, newComment.type, newComment.notes, true);
            setNewComment({ type: 'email', notes: '' });
            setShowAddComment(false);
        }
    };

    const getCommIcon = (type) => {
        const icons = {
            email: '📧',
            phone: '📱', 
            linkedin: '💼',
            meeting: '🤝',
            text: '💬'
        };
        return icons[type] || '📝';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            {/* Modal Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: 'var(--card-bg)',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                        border: '1px solid var(--border-color)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        background: `linear-gradient(135deg, ${urgency.color}, ${urgency.color}cc)`,
                        color: 'white',
                        padding: '32px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                            {/* Avatar */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                                fontWeight: '700',
                                border: '2px solid rgba(255,255,255,0.3)'
                            }}>
                                {candidate.name?.[0]?.toUpperCase()}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>
                                        {candidate.name}
                                    </h2>
                                    
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '6px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        letterSpacing: '0.5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {urgency.icon} {urgency.text}
                                    </div>
                                </div>

                                <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '8px' }}>
                                    {candidate.job_title} {candidate.company && `at ${candidate.company}`}
                                </div>

                                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8 }}>
                                    <div>📧 {candidate.email}</div>
                                    {candidate.phone && <div>📱 {candidate.phone}</div>}
                                    {getCountryName(candidate.location) && <div>🌍 {getCountryName(candidate.location)}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '20px',
                            marginTop: '24px'
                        }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '16px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>
                                    {candidate.daysSinceContact}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Days Since Contact</div>
                            </div>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '16px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>
                                    {candidate.communications?.length || 0}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Communications</div>
                            </div>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '16px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>
                                    {formatDate(candidate.movedToWarmDate).split(',')[0]}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Added to Pipeline</div>
                            </div>
                            
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '16px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>
                                    {candidate.contactFrequency || 14}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Target Days</div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={{ 
                        padding: '32px', 
                        maxHeight: '400px', 
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ 
                                margin: 0, 
                                fontSize: '20px', 
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                            }}>
                                Communication Timeline
                            </h3>
                            
                            <button
                                onClick={() => setShowAddComment(!showAddComment)}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                ➕ Add Communication
                            </button>
                        </div>

                        {/* Add Comment Form */}
                        {showAddComment && (
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px',
                                border: '2px solid var(--accent-color)'
                            }}>
                                <h4 style={{ 
                                    margin: '0 0 16px 0',
                                    color: 'var(--text-primary)',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Log New Communication
                                </h4>
                                
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <select
                                        value={newComment.type}
                                        onChange={(e) => setNewComment({...newComment, type: e.target.value})}
                                        style={{
                                            padding: '12px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="email">📧 Email</option>
                                        <option value="phone">📱 Phone Call</option>
                                        <option value="linkedin">💼 LinkedIn</option>
                                        <option value="meeting">🤝 Meeting</option>
                                        <option value="text">💬 Text Message</option>
                                    </select>
                                </div>
                                
                                <textarea
                                    value={newComment.notes}
                                    onChange={(e) => setNewComment({...newComment, notes: e.target.value})}
                                    placeholder="What did you discuss? Add details about the conversation..."
                                    style={{
                                        width: '100%',
                                        height: '100px',
                                        padding: '12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        marginBottom: '16px'
                                    }}
                                />
                                
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowAddComment(false)}
                                        style={{
                                            padding: '10px 16px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.notes.trim()}
                                        style={{
                                            padding: '10px 16px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            background: newComment.notes.trim() ? '#059669' : '#9ca3af',
                                            color: 'white',
                                            cursor: newComment.notes.trim() ? 'pointer' : 'not-allowed',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Save Communication
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div style={{ position: 'relative' }}>
                            {/* Timeline Line */}
                            <div style={{
                                position: 'absolute',
                                left: '20px',
                                top: '20px',
                                bottom: '20px',
                                width: '2px',
                                background: 'var(--border-color)'
                            }} />

                            {candidate.communications && candidate.communications.length > 0 ? (
                                candidate.communications.map((comm, index) => (
                                    <div
                                        key={comm.id}
                                        style={{
                                            position: 'relative',
                                            paddingLeft: '60px',
                                            paddingBottom: '24px'
                                        }}
                                    >
                                        {/* Timeline Dot */}
                                        <div style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '8px',
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            background: index === 0 ? urgency.color : 'var(--text-muted)',
                                            border: '2px solid var(--card-bg)'
                                        }} />

                                        <div style={{
                                            background: index === 0 ? `${urgency.color}08` : 'var(--bg-secondary)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            border: index === 0 ? `1px solid ${urgency.color}20` : '1px solid var(--border-color)'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {getCommIcon(comm.type)} {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} Contact
                                                    {index === 0 && (
                                                        <span style={{
                                                            background: urgency.color,
                                                            color: 'white',
                                                            padding: '2px 8px',
                                                            borderRadius: '8px',
                                                            fontSize: '10px',
                                                            fontWeight: '800'
                                                        }}>
                                                            LATEST
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    color: 'var(--text-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {formatDate(comm.timestamp)}
                                                    <span style={{
                                                        background: 'var(--accent-color)',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '6px',
                                                        fontSize: '10px'
                                                    }}>
                                                        {comm.user}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {comm.notes && (
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '14px',
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {comm.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: 'var(--text-muted)'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                                    <p>No communications logged yet</p>
                                    <p style={{ fontSize: '12px' }}>Click "Add Communication" to start tracking interactions</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '24px 32px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Added to warm pipeline {Math.floor((new Date() - new Date(candidate.movedToWarmDate)) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                        
                        <button
                            onClick={onMoveToActive}
                            style={{
                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                color: 'white',
                                border: 'none',
                                padding: '14px 24px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🔥 Move to Active Pipeline
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// Export to global scope
window.WarmPipelineComponent = WarmPipelineComponent;