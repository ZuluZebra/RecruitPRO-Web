// COMPLETE Updated Companies Component with ALL Features
// Replace the existing CompaniesComponent in js/components/companies.js

const CompaniesComponent = ({ 
    currentUser,
    candidates,
    setCandidates,
    companies = [],
    setCompanies
}) => {
    const [selectedCompany, setSelectedCompany] = React.useState(null);
    const [showCompanyModal, setShowCompanyModal] = React.useState(false);
    const [viewMode, setViewMode] = React.useState('grid');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterIndustry, setFilterIndustry] = React.useState('all');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('name');

    const getUniqueCompaniesFromCandidates = () => {
        const companyNames = new Set();
        candidates.forEach(candidate => {
            if (candidate.company && candidate.company.trim()) {
                companyNames.add(candidate.company.trim());
            }
        });
        return Array.from(companyNames).sort();
    };

    const getCandidatesForCompany = (companyName) => {
        return candidates.filter(c => 
            c.company && c.company.trim().toLowerCase() === companyName.toLowerCase()
        );
    };

    const createCompany = async (companyData) => {
        const newCompany = {
            id: Date.now() + Math.random(),
            name: companyData.name,
            logo: companyData.logo || null,
            industry: companyData.industry || '',
            website: companyData.website || '',
            status: companyData.status || 'prospect',
            location: companyData.location || '',
            size: companyData.size || '',
            revenue: companyData.revenue || '',
            notes: companyData.notes || '',
            tags: companyData.tags || [],
            documents: companyData.documents || [],
            contacts: companyData.contacts || [],
            timeline: [{
                date: new Date().toISOString(),
                action: 'Company Created',
                description: `Created by ${currentUser.name}`,
                user: currentUser.name
            }],
            created_at: new Date().toISOString(),
            created_by: currentUser.name,
            updated_at: new Date().toISOString()
        };

        try {
            const result = await api.createCompany(newCompany);
            if (result.data) {
                const updatedCompanies = [...companies, result.data];
                setCompanies(updatedCompanies);
                console.log('✅ Company created successfully');
                return result.data;
            }
        } catch (error) {
            console.error('Error creating company:', error);
            alert('Error creating company. Please try again.');
        }
    };

    const updateCompany = async (companyId, updates) => {
        try {
            const result = await api.updateCompany(companyId, updates);
            if (result.data) {
                const updatedCompanies = companies.map(c => 
                    c.id === companyId ? result.data : c
                );
                setCompanies(updatedCompanies);
                console.log('✅ Company updated successfully');
            }
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Error updating company. Please try again.');
        }
    };

    const deleteCompany = async (companyId) => {
        if (!confirm('Are you sure you want to delete this company?')) return;

        try {
            await api.deleteCompany(companyId);
            const updatedCompanies = companies.filter(c => c.id !== companyId);
            setCompanies(updatedCompanies);
            console.log('✅ Company deleted successfully');
        } catch (error) {
            console.error('Error deleting company:', error);
            alert('Error deleting company. Please try again.');
        }
    };

    const getIndustries = () => {
        const industries = new Set();
        companies.forEach(company => {
            if (company.industry) industries.add(company.industry);
        });
        return Array.from(industries).sort();
    };

    const filteredCompanies = React.useMemo(() => {
        let filtered = companies.filter(company => {
            const matchesSearch = !searchTerm || 
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesIndustry = filterIndustry === 'all' || company.industry === filterIndustry;
            const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
            return matchesSearch && matchesIndustry && matchesStatus;
        });

        if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'candidates') {
            filtered.sort((a, b) => {
                const aCandidates = getCandidatesForCompany(a.name).length;
                const bCandidates = getCandidatesForCompany(b.name).length;
                return bCandidates - aCandidates;
            });
        } else if (sortBy === 'recent') {
            filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }

        return filtered;
    }, [companies, searchTerm, filterIndustry, filterStatus, sortBy]);

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        🏢 Companies
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Manage your company relationships and pipeline
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedCompany(null);
                        setShowCompanyModal(true);
                    }}
                    style={{
                        background: 'var(--accent-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    + New Company
                </button>
            </div>

            {/* Filters and Controls */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 0.7fr 1fr 1fr auto', // 🎯 CHANGED: Made industry dropdown smaller (0.7fr instead of 1fr)
                    gap: '12px',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                        }}
                    />
                    <select
                        value={filterIndustry}
                        onChange={(e) => setFilterIndustry(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                        }}
                    >
                        <option value="all">All Industries</option>
                        {getIndustries().map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active_client">Active Client</option>
                        <option value="prospect">Prospect</option>
                        <option value="past_client">Past Client</option>
                        <option value="competitor">Competitor</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                        }}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="candidates">Sort by Candidates</option>
                        <option value="recent">Sort by Recent</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: viewMode === 'grid' ? 'var(--accent-color)' : 'var(--input-bg)',
                                color: viewMode === 'grid' ? 'white' : 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            title="Grid View"
                        >
                            ⊞
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: viewMode === 'list' ? 'var(--accent-color)' : 'var(--input-bg)',
                                color: viewMode === 'list' ? 'white' : 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            title="List View"
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {/* Companies Display */}
            {filteredCompanies.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'var(--card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                    <h3 style={{ 
                        color: 'var(--text-primary)', 
                        marginBottom: '8px',
                        fontSize: '18px'
                    }}>
                        No companies found
                    </h3>
                    <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '14px',
                        marginBottom: '20px'
                    }}>
                        Create your first company or adjust your filters
                    </p>
                    <button
                        onClick={() => {
                            setSelectedCompany(null);
                            setShowCompanyModal(true);
                        }}
                        style={{
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        + Create Company
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                // 🎯 IMPROVED GRID VIEW
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    {filteredCompanies.map(company => {
                        const companyCandidates = getCandidatesForCompany(company.name);
                        return (
                            <div
                                key={company.id}
                                onClick={() => {
                                    setSelectedCompany(company);
                                    setShowCompanyModal(true);
                                }}
                                style={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {company.logo ? (
                                    <div style={{ width: '100%', marginBottom: '12px' }}>
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            style={{
                                                width: '100%',
                                                maxWidth: '180px',
                                                height: 'auto',
                                                maxHeight: '100px',
                                                objectFit: 'contain',
                                                marginBottom: '8px'
                                            }}
                                        />
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {company.name}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            lineHeight: '1.3'
                                        }}>
                                            {company.name}
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    width: '100%',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    {company.industry && (
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '8px'
                                        }}>
                                            {company.industry}
                                        </div>
                                    )}
                                    
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        <span>👥 {companyCandidates.length} candidates</span>
                                        {company.status && (
                                            <div style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                background: company.status === 'active_client' ? 'rgba(34, 197, 94, 0.1)' :
                                                           company.status === 'prospect' ? 'rgba(59, 130, 246, 0.1)' :
                                                           company.status === 'past_client' ? 'rgba(156, 163, 175, 0.1)' :
                                                           'rgba(239, 68, 68, 0.1)',
                                                color: company.status === 'active_client' ? '#22c55e' :
                                                       company.status === 'prospect' ? '#3b82f6' :
                                                       company.status === 'past_client' ? '#9ca3af' :
                                                       '#ef4444'
                                            }}>
                                                {company.status.replace('_', ' ').toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // 🎯 IMPROVED LIST VIEW
                <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{
                                background: 'var(--input-bg)',
                                borderBottom: '1px solid var(--border-color)'
                            }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', width: '40%' }}>Company</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Industry</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Candidates</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map(company => {
                                const companyCandidates = getCandidatesForCompany(company.name);
                                return (
                                    <tr
                                        key={company.id}
                                        onClick={() => {
                                            setSelectedCompany(company);
                                            setShowCompanyModal(true);
                                        }}
                                        style={{
                                            borderBottom: '1px solid var(--border-color)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {company.logo ? (
                                                    <img
                                                        src={company.logo}
                                                        alt={company.name}
                                                        style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            objectFit: 'contain',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--border-color)',
                                                            background: 'white',
                                                            padding: '4px'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '8px',
                                                        background: 'var(--accent-color)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px',
                                                        fontWeight: '700',
                                                        color: 'white'
                                                    }}>
                                                        {company.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '14px',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {company.name}
                                                    </div>
                                                    {company.location && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: 'var(--text-tertiary)'
                                                        }}>
                                                            📍 {company.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            {company.industry || '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {company.status && (
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    background: company.status === 'active_client' ? 'rgba(34, 197, 94, 0.1)' :
                                                               company.status === 'prospect' ? 'rgba(59, 130, 246, 0.1)' :
                                                               company.status === 'past_client' ? 'rgba(156, 163, 175, 0.1)' :
                                                               'rgba(239, 68, 68, 0.1)',
                                                    color: company.status === 'active_client' ? '#22c55e' :
                                                           company.status === 'prospect' ? '#3b82f6' :
                                                           company.status === 'past_client' ? '#9ca3af' :
                                                           '#ef4444'
                                                }}>
                                                    {company.status.replace('_', ' ').toUpperCase()}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                            {companyCandidates.length}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            {new Date(company.updated_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showCompanyModal && (
                <CompanyModal
                    company={selectedCompany}
                    candidates={candidates}
                    currentUser={currentUser}
                    onClose={() => {
                        setShowCompanyModal(false);
                        setSelectedCompany(null);
                    }}
                    onCreate={createCompany}
                    onUpdate={updateCompany}
                    onDelete={deleteCompany}
                />
            )}
        </div>
    );
};

// 🎯 COMPLETE COMPANY MODAL with ALL Features
const CompanyModal = ({ company, candidates, currentUser, onClose, onCreate, onUpdate, onDelete }) => {
    const isEditMode = !!company;
    const [formData, setFormData] = React.useState({
        name: company?.name || '',
        logo: company?.logo || '',
        industry: company?.industry || '',
        website: company?.website || '',
        status: company?.status || 'prospect',
        location: company?.location || '',
        size: company?.size || '',
        revenue: company?.revenue || '',
        notes: company?.notes || '',
        tags: company?.tags || [],
        documents: company?.documents || [],
        contacts: company?.contacts || [],
        timeline: company?.timeline || []
    });

    const [showDocUpload, setShowDocUpload] = React.useState(false);
    const [currentViewingDoc, setCurrentViewingDoc] = React.useState(null);
    const [newTag, setNewTag] = React.useState('');
    const [newComment, setNewComment] = React.useState('');
    const [newContact, setNewContact] = React.useState({
        name: '',
        title: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [showContactForm, setShowContactForm] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('details');
    const [logoDragActive, setLogoDragActive] = React.useState(false);
    const [dragActive, setDragActive] = React.useState(false); // For documents

    const companyCandidates = isEditMode 
        ? candidates.filter(c => c.company && c.company.trim().toLowerCase() === company.name.toLowerCase())
        : [];

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            alert('Company name is required');
            return;
        }

        if (isEditMode) {
            onUpdate(company.id, formData);
            onClose();
        } else {
            onCreate(formData);
            onClose();
        }
    };

    // 🎯 Logo upload handler
    const handleLogoUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({ ...formData, logo: event.target.result });
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload an image file');
        }
    };

    // 🎯 Logo drag and drop handlers
    const handleLogoDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLogoDragActive(true);
    };

    const handleLogoDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLogoDragActive(false);
    };

    const handleLogoDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleLogoDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLogoDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleLogoUpload(files[0]);
        }
    };

    // Document handling
    const handleDocUpload = async (e) => {
        const files = Array.from(e.target.files);
        await processDocumentFiles(files);
    };

    const processDocumentFiles = async (files) => {
        const newDocs = [];

        for (const file of files) {
            const reader = new FileReader();
            const docData = await new Promise((resolve) => {
                reader.onload = (event) => {
                    resolve({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        uploadDate: new Date().toISOString(),
                        uploadedBy: currentUser.name,
                        data: event.target.result
                    });
                };
                reader.readAsDataURL(file);
            });
            newDocs.push(docData);
        }

        setFormData({ ...formData, documents: [...formData.documents, ...newDocs] });
        setShowDocUpload(false);
    };

    // Document drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await processDocumentFiles(files);
        }
    };

    const removeDocument = (docId) => {
        if (confirm('Remove this document?')) {
            setFormData({
                ...formData,
                documents: formData.documents.filter(d => d.id !== docId)
            });
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const addComment = () => {
        if (newComment.trim()) {
            const timelineEntry = {
                date: new Date().toISOString(),
                action: 'Note Added',
                description: newComment,
                user: currentUser.name
            };
            setFormData({ ...formData, timeline: [timelineEntry, ...formData.timeline] });
            setNewComment('');
        }
    };

    const addContact = () => {
        if (newContact.name.trim()) {
            setFormData({
                ...formData,
                contacts: [...formData.contacts, { ...newContact, id: Date.now() }]
            });
            setNewContact({ name: '', title: '', email: '', phone: '', notes: '' });
            setShowContactForm(false);
        }
    };

    const removeContact = (contactId) => {
        if (confirm('Remove this contact?')) {
            setFormData({
                ...formData,
                contacts: formData.contacts.filter(c => c.id !== contactId)
            });
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            paddingTop: '100px'
        }}>
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                width: '900px',
                maxWidth: '95vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {isEditMode ? '🏢 Company Details' : '🏢 New Company'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            padding: '4px 8px'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '0 24px',
                    gap: '4px'
                }}>
                    {[
                        { id: 'details', label: '📋 Details', count: null },
                        { id: 'timeline', label: '📝 Timeline', count: formData.timeline.length },
                        { id: 'contacts', label: '👥 Contacts', count: formData.contacts.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                            {tab.count !== null && tab.count > 0 && (
                                <span style={{
                                    marginLeft: '6px',
                                    background: activeTab === tab.id ? 'var(--accent-color)' : 'var(--input-bg)',
                                    color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px'
                }}>
                    {/* DETAILS TAB */}
                    {activeTab === 'details' && (
                        <div>
                            {/* 🎯 Logo Section with Drag & Drop */}
                            <div style={{
                                marginBottom: '24px',
                                textAlign: 'center'
                            }}>
                                <label
                                    onDragEnter={handleLogoDragEnter}
                                    onDragLeave={handleLogoDragLeave}
                                    onDragOver={handleLogoDragOver}
                                    onDrop={handleLogoDrop}
                                    style={{
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {formData.logo ? (
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <img
                                                src={formData.logo}
                                                alt="Company Logo"
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    borderRadius: '12px',
                                                    objectFit: 'contain',
                                                    border: logoDragActive 
                                                        ? '3px dashed var(--accent-color)' 
                                                        : '2px solid var(--border-color)',
                                                    background: 'white',
                                                    padding: '12px',
                                                    transition: 'all 0.2s'
                                                }}
                                            />
                                            {logoDragActive && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: 'var(--accent-color)'
                                                }}>
                                                    Drop logo here
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: '150px',
                                            height: '150px',
                                            margin: '0 auto',
                                            borderRadius: '12px',
                                            background: logoDragActive ? 'rgba(102, 126, 234, 0.1)' : 'var(--input-bg)',
                                            border: logoDragActive 
                                                ? '3px dashed var(--accent-color)' 
                                                : '2px dashed var(--border-color)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{
                                                fontSize: '40px',
                                                color: 'var(--text-tertiary)'
                                            }}>
                                                🏢
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: logoDragActive ? 'var(--accent-color)' : 'var(--text-secondary)'
                                            }}>
                                                {logoDragActive ? 'Drop logo here' : 'Click or drag logo'}
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files[0] && handleLogoUpload(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                {formData.logo && (
                                    <div style={{ marginTop: '12px' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData({ ...formData, logo: '' });
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                color: 'var(--text-secondary)'
                                            }}
                                        >
                                            Remove Logo
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                marginBottom: '24px'
                            }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px'
                                    }}>
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter company name"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px'
                                    }}>
                                        Industry
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        placeholder="e.g., Technology, Finance"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px'
                                    }}>
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="prospect">Prospect</option>
                                        <option value="active_client">Active Client</option>
                                        <option value="past_client">Past Client</option>
                                        <option value="competitor">Competitor</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px'
                                    }}>
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://company.com"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px'
                                    }}>
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="City, Country"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px'
                                    }}>
                                        Company Size
                                    </label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">Select size</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-500">201-500 employees</option>
                                        <option value="501-1000">501-1000 employees</option>
                                        <option value="1000+">1000+ employees</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px'
                                    }}>
                                        Annual Revenue
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.revenue}
                                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                        placeholder="e.g., $10M - $50M"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px'
                                    }}>
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add notes about this company..."
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 🎯 DOCUMENTS SECTION */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <label style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)'
                                    }}>
                                        Documents ({formData.documents.length})
                                    </label>
                                    <label
                                        style={{
                                            background: 'var(--accent-color)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📤 Upload Documents
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleDocUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>

                                {/* Drag and Drop Zone */}
                                <div
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    style={{
                                        border: dragActive ? '2px dashed var(--accent-color)' : '2px dashed var(--border-color)',
                                        borderRadius: '8px',
                                        padding: '24px',
                                        textAlign: 'center',
                                        background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'var(--input-bg)',
                                        marginBottom: '16px',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '32px',
                                        marginBottom: '8px',
                                        opacity: dragActive ? 1 : 0.5
                                    }}>
                                        📁
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: 'var(--text-primary)',
                                        marginBottom: '4px',
                                        fontWeight: '600'
                                    }}>
                                        {dragActive ? '📥 Drop files here!' : 'Drag & drop documents here'}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--text-tertiary)'
                                    }}>
                                        or use the "Upload Documents" button above
                                    </div>
                                </div>

                                {/* Documents List */}
                                {formData.documents.length > 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}>
                                        {formData.documents.map(doc => (
                                            <div
                                                key={doc.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '12px',
                                                    background: 'var(--input-bg)',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        color: 'var(--text-primary)',
                                                        marginBottom: '2px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <span style={{ fontSize: '16px' }}>
                                                            {doc.name.toLowerCase().endsWith('.pdf') ? '📄' : 
                                                             doc.name.match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' : 
                                                             doc.name.match(/\.(doc|docx)$/i) ? '📝' : '📎'}
                                                        </span>
                                                        {doc.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: 'var(--text-tertiary)'
                                                    }}>
                                                        {new Date(doc.uploadDate).toLocaleString()} • by {doc.uploadedBy} • {(doc.size / 1024).toFixed(1)} KB
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => setCurrentViewingDoc(doc)}
                                                        style={{
                                                            background: 'var(--accent-color)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '6px 12px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        👁️ View
                                                    </button>
                                                    <button
                                                        onClick={() => removeDocument(doc.id)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#ef4444',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '6px 12px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        color: 'var(--text-tertiary)',
                                        fontSize: '13px'
                                    }}>
                                        No documents uploaded yet
                                    </div>
                                )}
                            </div>

                            {/* Tags Section */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '8px'
                                }}>
                                    Tags
                                </label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                    {formData.tags.map(tag => (
                                        <div
                                            key={tag}
                                            style={{
                                                background: 'var(--accent-color)',
                                                color: 'white',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    padding: '0',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                        placeholder="Add a tag..."
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '13px'
                                        }}
                                    />
                                    <button
                                        onClick={addTag}
                                        style={{
                                            background: 'var(--accent-color)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Associated Candidates */}
                            {isEditMode && companyCandidates.length > 0 && (
                                <div>
                                    <h4 style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        marginBottom: '12px'
                                    }}>
                                        Associated Candidates ({companyCandidates.length})
                                    </h4>
                                    <div style={{
                                        background: 'var(--input-bg)',
                                        borderRadius: '8px',
                                        padding: '12px'
                                    }}>
                                        {companyCandidates.map(candidate => (
                                            <div
                                                key={candidate.id}
                                                style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid var(--border-color)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                    <div style={{
                                                        fontWeight: '500',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '13px'
                                                    }}>
                                                        {candidate.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-tertiary)'
                                                    }}>
                                                        {candidate.job_title}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                    color: 'var(--accent-color)'
                                                }}>
                                                    {candidate.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TIMELINE TAB */}
                    {activeTab === 'timeline' && (
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a note or comment..."
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        marginBottom: '8px'
                                    }}
                                />
                                <button
                                    onClick={addComment}
                                    disabled={!newComment.trim()}
                                    style={{
                                        background: newComment.trim() ? 'var(--accent-color)' : 'var(--input-bg)',
                                        color: newComment.trim() ? 'white' : 'var(--text-secondary)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: newComment.trim() ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Add Note
                                </button>
                            </div>

                            <div>
                                {formData.timeline.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '14px'
                                    }}>
                                        No timeline entries yet
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {formData.timeline.map((entry, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    background: 'var(--input-bg)',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    borderLeft: '3px solid var(--accent-color)'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '6px'
                                                }}>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        fontSize: '13px',
                                                        color: 'var(--text-primary)'
                                                    }}>
                                                        {entry.action}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-tertiary)'
                                                    }}>
                                                        {new Date(entry.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '4px'
                                                }}>
                                                    {entry.description}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'var(--text-tertiary)'
                                                }}>
                                                    by {entry.user}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CONTACTS TAB */}
                    {activeTab === 'contacts' && (
                        <div>
                            {!showContactForm && (
                                <button
                                    onClick={() => setShowContactForm(true)}
                                    style={{
                                        background: 'var(--accent-color)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        marginBottom: '20px'
                                    }}
                                >
                                    + Add Contact
                                </button>
                            )}

                            {showContactForm && (
                                <div style={{
                                    background: 'var(--input-bg)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '20px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 16px 0',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)'
                                    }}>
                                        New Contact
                                    </h4>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '12px',
                                        marginBottom: '12px'
                                    }}>
                                        <input
                                            type="text"
                                            value={newContact.name}
                                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                            placeholder="Name *"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--card-bg)',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={newContact.title}
                                            onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                                            placeholder="Job Title"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--card-bg)',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px'
                                            }}
                                        />
                                        <input
                                            type="email"
                                            value={newContact.email}
                                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                            placeholder="Email"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--card-bg)',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px'
                                            }}
                                        />
                                        <input
                                            type="tel"
                                            value={newContact.phone}
                                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                            placeholder="Phone"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--card-bg)',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px'
                                            }}
                                        />
                                        <textarea
                                            value={newContact.notes}
                                            onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                                            placeholder="Notes"
                                            rows="2"
                                            style={{
                                                gridColumn: '1 / -1',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--card-bg)',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px',
                                                resize: 'vertical',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={addContact}
                                            disabled={!newContact.name.trim()}
                                            style={{
                                                background: newContact.name.trim() ? 'var(--accent-color)' : 'var(--input-bg)',
                                                color: newContact.name.trim() ? 'white' : 'var(--text-secondary)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '8px 16px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: newContact.name.trim() ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            Add Contact
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowContactForm(false);
                                                setNewContact({ name: '', title: '', email: '', phone: '', notes: '' });
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                padding: '8px 16px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                color: 'var(--text-secondary)'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {formData.contacts.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '14px'
                                }}>
                                    No contacts yet
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {formData.contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            style={{
                                                background: 'var(--input-bg)',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                border: '1px solid var(--border-color)'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'start',
                                                marginBottom: '8px'
                                            }}>
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        color: 'var(--text-primary)',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {contact.name}
                                                    </div>
                                                    {contact.title && (
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: 'var(--text-secondary)'
                                                        }}>
                                                            {contact.title}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeContact(contact.id)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        fontSize: '18px'
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            {contact.email && (
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '4px'
                                                }}>
                                                    📧 {contact.email}
                                                </div>
                                            )}
                                            {contact.phone && (
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '4px'
                                                }}>
                                                    📞 {contact.phone}
                                                </div>
                                            )}
                                            {contact.notes && (
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: 'var(--text-tertiary)',
                                                    marginTop: '8px',
                                                    fontStyle: 'italic'
                                                }}>
                                                    {contact.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        {isEditMode && (
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this company?')) {
                                        onDelete(company.id);
                                        onClose();
                                    }
                                }}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #ef4444',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    color: '#ef4444'
                                }}
                            >
                                Delete Company
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                color: 'var(--text-primary)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            style={{
                                background: 'var(--accent-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 24px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {isEditMode ? 'Save Changes' : 'Create Company'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 🎯 DOCUMENT VIEWER MODAL */}
            {currentViewingDoc && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '20px',
                        paddingTop: '100px'
                    }}
                    onClick={() => setCurrentViewingDoc(null)}
                >
                    <div
                        style={{
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            width: '90%',
                            height: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'var(--text-primary)'
                            }}>
                                {currentViewingDoc.name}
                            </div>
                            <button
                                onClick={() => setCurrentViewingDoc(null)}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.8)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            overflow: 'hidden'
                        }}>
                            {currentViewingDoc.name.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={currentViewingDoc.data}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: 'white'
                                    }}
                                    title={currentViewingDoc.name}
                                />
                            ) : currentViewingDoc.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                                <img
                                    src={currentViewingDoc.data}
                                    alt={currentViewingDoc.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                                    <div>Preview not available for this file type</div>
                                    <div style={{ fontSize: '12px', marginTop: '8px' }}>
                                        File: {currentViewingDoc.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};