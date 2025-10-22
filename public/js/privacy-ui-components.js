// 🔐 PRIVACY UI COMPONENTS FOR CANDIDATES
// React components for privacy indicators, sharing modal, and controls

// ==========================================
// PRIVACY INDICATOR COMPONENT
// ==========================================

const PrivacyIndicator = ({ candidate, size = 'small', showTooltip = true }) => {
    if (!window.candidatePrivacySystem) {
        return null;
    }

    const privacy = window.candidatePrivacySystem.getPrivacyStatus(candidate);
    const confidential = window.candidatePrivacySystem.getConfidentialStatus(candidate);
    
    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        indicator: {
            fontSize: size === 'large' ? '16px' : '12px',
            cursor: showTooltip ? 'help' : 'default',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
        },
        confidentialBadge: {
            fontSize: '8px',
            padding: '2px 4px',
            background: confidential.color,
            color: 'white',
            borderRadius: '3px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
        }
    };

    return React.createElement('div', {
        style: styles.container,
        title: showTooltip ? `${privacy.tooltip}${confidential.isConfidential ? ' • CONFIDENTIAL' : ''}` : ''
    }, [
        React.createElement('span', {
            key: 'privacy-icon',
            style: { ...styles.indicator, color: privacy.color }
        }, privacy.icon),
        
        confidential.isConfidential && React.createElement('span', {
            key: 'confidential-badge',
            style: styles.confidentialBadge
        }, confidential.badge)
    ]);
};

// ==========================================
// PRIVACY CONTROLS COMPONENT
// ==========================================

const PrivacyControls = ({ candidate, currentUser, onPrivacyUpdate, compact = false }) => {
    const [showShareModal, setShowShareModal] = React.useState(false);
    
    if (!window.candidatePrivacySystem || !candidate) {
        return null;
    }

    const privacy = window.candidatePrivacySystem.getPrivacyStatus(candidate);
    const canModify = window.candidatePrivacySystem.canModifyPrivacy(candidate, currentUser);
    
    if (!canModify) {
        return React.createElement(PrivacyIndicator, { candidate, showTooltip: true });
    }

    const handleVisibilityChange = (newVisibility) => {
        const result = window.candidatePrivacySystem.updateCandidatePrivacy(
            candidate.id,
            { visibility: newVisibility },
            currentUser
        );
        
        if (result.success && onPrivacyUpdate) {
            onPrivacyUpdate(result.candidate);
        }
    };

    const handleConfidentialToggle = () => {
        const result = window.candidatePrivacySystem.updateCandidatePrivacy(
            candidate.id,
            { isConfidential: !candidate.isConfidential },
            currentUser
        );
        
        if (result.success && onPrivacyUpdate) {
            onPrivacyUpdate(result.candidate);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            gap: compact ? '4px' : '8px',
            padding: compact ? '4px' : '8px',
            background: '#F9FAFB',
            borderRadius: '6px',
            border: '1px solid #E5E7EB'
        },
        button: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '3px',
            fontSize: '12px',
            transition: 'all 0.2s ease'
        },
        activeButton: {
            background: privacy.color + '20',
            color: privacy.color,
            fontWeight: '600'
        }
    };

    if (compact) {
        return React.createElement('div', {
            style: styles.container
        }, [
            React.createElement(PrivacyIndicator, { 
                key: 'indicator',
                candidate, 
                showTooltip: true 
            }),
            
            React.createElement('button', {
                key: 'share-btn',
                style: { ...styles.button, color: '#3B82F6' },
                onClick: () => setShowShareModal(true),
                title: 'Share or modify privacy'
            }, '⚙️'),
            
            showShareModal && React.createElement(SharingModal, {
                key: 'share-modal',
                candidate,
                currentUser,
                onClose: () => setShowShareModal(false),
                onUpdate: onPrivacyUpdate
            })
        ]);
    }

    return React.createElement('div', {
        style: styles.container
    }, [
        React.createElement(PrivacyIndicator, { 
            key: 'indicator',
            candidate, 
            showTooltip: false 
        }),
        
        // Visibility buttons
        ['public', 'shared', 'private'].map(level => 
            React.createElement('button', {
                key: level,
                style: {
                    ...styles.button,
                    ...(candidate.visibility === level ? styles.activeButton : {})
                },
                onClick: () => handleVisibilityChange(level),
                title: `Make ${level}`
            }, level === 'public' ? '🌍' : level === 'shared' ? '👥' : '🔒')
        ),
        
        // Confidential toggle
        React.createElement('button', {
            key: 'confidential',
            style: {
                ...styles.button,
                color: candidate.isConfidential ? '#DC2626' : '#6B7280'
            },
            onClick: handleConfidentialToggle,
            title: candidate.isConfidential ? 'Remove confidential marking' : 'Mark as confidential'
        }, '🔴'),
        
        // Share button
        React.createElement('button', {
            key: 'share',
            style: { ...styles.button, color: '#3B82F6' },
            onClick: () => setShowShareModal(true),
            title: 'Share with specific users'
        }, '📤'),
        
        showShareModal && React.createElement(SharingModal, {
            key: 'modal',
            candidate,
            currentUser,
            onClose: () => setShowShareModal(false),
            onUpdate: onPrivacyUpdate
        })
    ]);
};

// ==========================================
// SHARING MODAL COMPONENT
// ==========================================

const SharingModal = ({ candidate, currentUser, onClose, onUpdate }) => {
    const [selectedUsers, setSelectedUsers] = React.useState([]);
    const [permission, setPermission] = React.useState('view');
    const [availableUsers, setAvailableUsers] = React.useState([]);
    
    React.useEffect(() => {
        if (window.TeamMemberUtils) {
            const members = window.TeamMemberUtils.getAvailableMembers(currentUser);
            setAvailableUsers(members);
        }
    }, [currentUser]);

    const handleShare = () => {
        if (selectedUsers.length === 0) {
            alert('Please select at least one user to share with');
            return;
        }

        const result = window.candidatePrivacySystem.shareCandidate(
            candidate.id,
            selectedUsers,
            permission,
            currentUser
        );

        if (result.success) {
            if (onUpdate) onUpdate(result.candidate);
            onClose();
            alert(`✅ Candidate shared with ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`);
        } else {
            alert(`❌ Failed to share: ${result.error}`);
        }
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => {
            const isSelected = prev.some(u => u.id === user.id);
            if (isSelected) {
                return prev.filter(u => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
        },
        modal: {
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        },
        header: {
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#1F2937'
        },
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#374151'
        },
        userList: {
            maxHeight: '200px',
            overflow: 'auto',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '8px'
        },
        userItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
        },
        checkbox: {
            marginRight: '8px'
        },
        permissionSelect: {
            width: '100%',
            padding: '8px',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            fontSize: '14px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            marginTop: '20px'
        },
        button: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        primaryButton: {
            background: '#3B82F6',
            color: 'white'
        },
        secondaryButton: {
            background: '#E5E7EB',
            color: '#374151'
        }
    };

    return React.createElement('div', {
        style: styles.overlay,
        onClick: (e) => e.target === e.currentTarget && onClose()
    }, 
        React.createElement('div', {
            style: styles.modal
        }, [
            React.createElement('div', {
                key: 'header',
                style: styles.header
            }, `📤 Share "${candidate.name}"`),

            React.createElement('div', {
                key: 'current-sharing',
                style: styles.section
            }, [
                React.createElement('div', {
                    key: 'title',
                    style: styles.sectionTitle
                }, 'Current Sharing'),
                React.createElement('div', {
                    key: 'info',
                    style: { fontSize: '14px', color: '#6B7280' }
                }, 
                    candidate.sharedWith && candidate.sharedWith.length > 0 
                        ? `Shared with: ${candidate.sharedWith.map(s => s.userName).join(', ')}`
                        : 'Not currently shared'
                )
            ]),

            React.createElement('div', {
                key: 'user-selection',
                style: styles.section
            }, [
                React.createElement('div', {
                    key: 'title',
                    style: styles.sectionTitle
                }, `Select Team Members (${availableUsers.length} available)`),
                
                React.createElement('div', {
                    key: 'user-list',
                    style: styles.userList
                }, 
                    availableUsers.length === 0 
                        ? React.createElement('div', {
                            style: { textAlign: 'center', color: '#6B7280', padding: '16px' }
                        }, 'No team members available')
                        : availableUsers.map(user =>
                            React.createElement('div', {
                                key: user.id,
                                style: {
                                    ...styles.userItem,
                                    background: selectedUsers.some(u => u.id === user.id) ? '#EBF4FF' : 'transparent'
                                },
                                onClick: () => toggleUserSelection(user)
                            }, [
                                React.createElement('input', {
                                    key: 'checkbox',
                                    type: 'checkbox',
                                    checked: selectedUsers.some(u => u.id === user.id),
                                    onChange: () => toggleUserSelection(user),
                                    style: styles.checkbox
                                }),
                                React.createElement('div', {
                                    key: 'info'
                                }, [
                                    React.createElement('div', {
                                        key: 'name',
                                        style: { fontWeight: '500' }
                                    }, user.name),
                                    React.createElement('div', {
                                        key: 'role',
                                        style: { fontSize: '12px', color: '#6B7280' }
                                    }, user.role)
                                ])
                            ])
                        )
                )
            ]),

            React.createElement('div', {
                key: 'permission-section',
                style: styles.section
            }, [
                React.createElement('div', {
                    key: 'title',
                    style: styles.sectionTitle
                }, 'Permission Level'),
                React.createElement('select', {
                    key: 'select',
                    style: styles.permissionSelect,
                    value: permission,
                    onChange: (e) => setPermission(e.target.value)
                }, [
                    React.createElement('option', { key: 'view', value: 'view' }, '👁️ View Only'),
                    React.createElement('option', { key: 'edit', value: 'edit' }, '✏️ View & Edit')
                ])
            ]),

            React.createElement('div', {
                key: 'buttons',
                style: styles.buttonGroup
            }, [
                React.createElement('button', {
                    key: 'cancel',
                    style: { ...styles.button, ...styles.secondaryButton },
                    onClick: onClose
                }, 'Cancel'),
                React.createElement('button', {
                    key: 'share',
                    style: { ...styles.button, ...styles.primaryButton },
                    onClick: handleShare
                }, `Share with ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`)
            ])
        ])
    );
};

// ==========================================
// ENHANCED CANDIDATE ROW WITH PRIVACY
// ==========================================

const CandidateRowWithPrivacy = ({ candidate, currentUser, onCandidateClick, onPrivacyUpdate, ...otherProps }) => {
    const privacy = window.candidatePrivacySystem?.getPrivacyStatus(candidate);
    
    return React.createElement('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            border: `1px solid ${privacy?.color || '#E5E7EB'}20`,
            borderRadius: '8px',
            marginBottom: '8px',
            background: candidate.isConfidential ? '#FEF2F2' : 'white',
            borderLeft: candidate.isConfidential ? '4px solid #DC2626' : 'none'
        }
    }, [
        // Privacy indicator
        React.createElement('div', {
            key: 'privacy',
            style: { marginRight: '12px' }
        }, React.createElement(PrivacyControls, {
            candidate,
            currentUser,
            onPrivacyUpdate,
            compact: true
        })),
        
        // Original candidate content
        React.createElement('div', {
            key: 'content',
            style: { flex: 1, cursor: 'pointer' },
            onClick: () => onCandidateClick && onCandidateClick(candidate)
        }, [
            React.createElement('div', {
                key: 'name',
                style: { 
                    fontWeight: '600',
                    color: candidate.isConfidential ? '#7F1D1D' : '#1F2937'
                }
            }, candidate.name),
            React.createElement('div', {
                key: 'title',
                style: { 
                    fontSize: '14px', 
                    color: '#6B7280' 
                }
            }, `${candidate.job_title || 'No title'} ${candidate.company ? `at ${candidate.company}` : ''}`)
        ])
    ]);
};

// ==========================================
// MAKE COMPONENTS GLOBALLY AVAILABLE
// ==========================================

window.PrivacyIndicator = PrivacyIndicator;
window.PrivacyControls = PrivacyControls;
window.SharingModal = SharingModal;
window.CandidateRowWithPrivacy = CandidateRowWithPrivacy;

console.log('🎨 Privacy UI Components loaded!');
console.log('✨ Available components:');
console.log('   • PrivacyIndicator - Shows privacy status');
console.log('   • PrivacyControls - Full privacy controls');
console.log('   • SharingModal - Share with team members');
console.log('   • CandidateRowWithPrivacy - Enhanced candidate row');
