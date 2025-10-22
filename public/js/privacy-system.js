// 🔐 PRIVACY & SHARING SYSTEM FOR RECRUITPRO CRM
// Step-by-step implementation starting with candidates only

class CandidatePrivacySystem {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔐 Initializing Candidate Privacy System...');
        
        // Extend existing candidates with privacy fields if they don't exist
        this.migrateExistingCandidates();
        
        // Set up global privacy utilities
        this.setupGlobalUtils();
    }

    // ==========================================
    // CANDIDATE PRIVACY SCHEMA
    // ==========================================
    
    getDefaultPrivacySettings() {
        return {
            // Privacy Control
            visibility: 'public', // 'private' | 'shared' | 'public' - PUBLIC by default for candidates
            isConfidential: false, // Mark as confidential
            
            // Sharing Control
            sharedWith: [], // Array of { userId, userName, permission, sharedAt, sharedBy }
            
            // Access tracking (optional - for future features)
            lastAccessedBy: [],
            
            // Privacy metadata
            privacyUpdatedAt: new Date().toISOString(),
            privacyUpdatedBy: null
        };
    }

    // ==========================================
    // DATA MIGRATION - EXTEND EXISTING CANDIDATES
    // ==========================================
    
    migrateExistingCandidates() {
        const candidates = helpers.storage.load('recruitpro_candidates') || [];
        let migrationCount = 0;
        
        const updatedCandidates = candidates.map(candidate => {
            // Only add privacy fields if they don't exist
            if (!candidate.hasOwnProperty('visibility')) {
                migrationCount++;
                return {
                    ...candidate,
                    ...this.getDefaultPrivacySettings()
                };
            }
            return candidate;
        });
        
        if (migrationCount > 0) {
            helpers.storage.save('recruitpro_candidates', updatedCandidates);
            console.log(`🔄 Migrated ${migrationCount} candidates with privacy settings`);
        } else {
            console.log('✅ All candidates already have privacy settings');
        }
    }

    // ==========================================
    // PRIVACY FILTERING LOGIC
    // ==========================================
    
    filterCandidatesByPrivacy(candidates, currentUser) {
        if (!currentUser) {
            console.warn('⚠️ No current user - showing no candidates');
            return [];
        }

        return candidates.filter(candidate => {
            // Handle candidates without privacy settings (backward compatibility)
            if (!candidate.hasOwnProperty('visibility')) {
                return true; // Show legacy candidates until migration
            }

            // Creator always sees their own candidates
            if (candidate.createdBy === currentUser.id) {
                return true;
            }

            // Public candidates visible to all team members
            if (candidate.visibility === 'public') {
                return true;
            }

            // Check if shared with current user
            if (candidate.visibility === 'shared') {
                return this.isSharedWithUser(candidate, currentUser.id);
            }

            // Private candidates only visible to creator
            if (candidate.visibility === 'private') {
                return false;
            }

            // Default: show the candidate (for safety)
            return true;
        });
    }

    isSharedWithUser(candidate, userId) {
        if (!candidate.sharedWith || !Array.isArray(candidate.sharedWith)) {
            return false;
        }
        
        return candidate.sharedWith.some(share => share.userId === userId);
    }

    // ==========================================
    // PRIVACY ACTIONS
    // ==========================================
    
    updateCandidatePrivacy(candidateId, privacyUpdates, currentUser) {
        const candidates = helpers.storage.load('recruitpro_candidates') || [];
        const candidateIndex = candidates.findIndex(c => c.id == candidateId);
        
        if (candidateIndex === -1) {
            console.error('❌ Candidate not found for privacy update:', candidateId);
            return { success: false, error: 'Candidate not found' };
        }

        const candidate = candidates[candidateIndex];
        
        // Check if user has permission to modify privacy
        if (!this.canModifyPrivacy(candidate, currentUser)) {
            console.error('❌ User does not have permission to modify privacy for candidate:', candidateId);
            return { success: false, error: 'Permission denied' };
        }

        // Update privacy settings
        candidates[candidateIndex] = {
            ...candidate,
            ...privacyUpdates,
            privacyUpdatedAt: new Date().toISOString(),
            privacyUpdatedBy: currentUser.id
        };

        // Save to storage
        helpers.storage.save('recruitpro_candidates', candidates);
        
        console.log(`🔐 Updated privacy for candidate ${candidateId}:`, privacyUpdates);
        return { success: true, candidate: candidates[candidateIndex] };
    }

    canModifyPrivacy(candidate, currentUser) {
        if (!currentUser) return false;
        
        // Creator can always modify
        if (candidate.createdBy === currentUser.id) return true;
        
        // Admin/Owner can modify any candidate
        if (currentUser.role === 'owner' || currentUser.role === 'admin') return true;
        
        // Check if user has edit permission via sharing
        if (candidate.sharedWith) {
            const shareRecord = candidate.sharedWith.find(s => s.userId === currentUser.id);
            return shareRecord && shareRecord.permission === 'edit';
        }
        
        return false;
    }

    // ==========================================
    // SHARING FUNCTIONS
    // ==========================================
    
    shareCandidate(candidateId, shareWithUsers, permission, currentUser) {
        const candidates = helpers.storage.load('recruitpro_candidates') || [];
        const candidateIndex = candidates.findIndex(c => c.id == candidateId);
        
        if (candidateIndex === -1) {
            return { success: false, error: 'Candidate not found' };
        }

        const candidate = candidates[candidateIndex];
        
        // Check permission
        if (!this.canModifyPrivacy(candidate, currentUser)) {
            return { success: false, error: 'Permission denied' };
        }

        // Prepare share records
        const shareRecords = shareWithUsers.map(user => ({
            userId: user.id,
            userName: user.name,
            permission: permission || 'view',
            sharedAt: new Date().toISOString(),
            sharedBy: currentUser.id
        }));

        // Update candidate
        const existingShares = candidate.sharedWith || [];
        const updatedShares = [...existingShares];

        shareRecords.forEach(newShare => {
            // Remove existing share with same user
            const existingIndex = updatedShares.findIndex(s => s.userId === newShare.userId);
            if (existingIndex >= 0) {
                updatedShares[existingIndex] = newShare; // Update existing
            } else {
                updatedShares.push(newShare); // Add new
            }
        });

        candidates[candidateIndex] = {
            ...candidate,
            visibility: 'shared',
            sharedWith: updatedShares,
            privacyUpdatedAt: new Date().toISOString(),
            privacyUpdatedBy: currentUser.id
        };

        helpers.storage.save('recruitpro_candidates', candidates);
        
        console.log(`📤 Shared candidate ${candidateId} with ${shareWithUsers.length} users`);
        return { success: true, candidate: candidates[candidateIndex] };
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    getPrivacyStatus(candidate) {
        if (!candidate.hasOwnProperty('visibility')) {
            return { 
                level: 'legacy', 
                icon: '🔄', 
                color: '#6B7280',
                tooltip: 'Legacy candidate - no privacy settings' 
            };
        }

        switch (candidate.visibility) {
            case 'private':
                return { 
                    level: 'private', 
                    icon: '🔒', 
                    color: '#EF4444',
                    tooltip: 'Private - Only visible to you' 
                };
            case 'shared':
                const shareCount = candidate.sharedWith?.length || 0;
                return { 
                    level: 'shared', 
                    icon: '👥', 
                    color: '#F59E0B',
                    tooltip: `Shared with ${shareCount} user${shareCount !== 1 ? 's' : ''}` 
                };
            case 'public':
                return { 
                    level: 'public', 
                    icon: '🌍', 
                    color: '#10B981',
                    tooltip: 'Public - Visible to all team members' 
                };
            default:
                return { 
                    level: 'unknown', 
                    icon: '❓', 
                    color: '#6B7280',
                    tooltip: 'Unknown privacy level' 
                };
        }
    }

    getConfidentialStatus(candidate) {
        if (candidate.isConfidential) {
            return {
                isConfidential: true,
                icon: '🔴',
                badge: 'CONFIDENTIAL',
                color: '#DC2626'
            };
        }
        return { isConfidential: false };
    }

    // ==========================================
    // GLOBAL SETUP
    // ==========================================
    
    setupGlobalUtils() {
        // Make privacy system available globally
        window.candidatePrivacy = this;
        
        // Add to existing helpers object
        if (window.helpers) {
            window.helpers.candidatePrivacy = this;
        }
        
        console.log('🌍 Candidate Privacy System available globally');
    }
}

// ==========================================
// TEAM MEMBER UTILITIES (for sharing UI)
// ==========================================

class TeamMemberUtils {
    static getAvailableMembers(currentUser) {
        // Get team members from current auth system
        if (window.secureTeamAuth) {
            const members = window.secureTeamAuth.getTeamMembers() || [];
            return members.filter(member => 
                member.id !== currentUser.id && 
                member.status === 'active'
            );
        }
        
        // Fallback to multi-user auth
        if (window.multiUserAuth) {
            const users = window.multiUserAuth.users || [];
            return users.filter(user => 
                user.id !== currentUser.id && 
                user.status === 'active'
            );
        }
        
        return [];
    }
}

// ==========================================
// INITIALIZE SYSTEM
// ==========================================

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.candidatePrivacySystem = new CandidatePrivacySystem();
    window.TeamMemberUtils = TeamMemberUtils;
    
    console.log('🔐 Candidate Privacy & Sharing System Ready!');
    console.log('✨ Features:');
    console.log('   • Public by default for candidates');
    console.log('   • Individual sharing controls');
    console.log('   • Confidential marking');
    console.log('   • Backward compatibility');
});

// Make available for manual initialization if needed
window.CandidatePrivacySystem = CandidatePrivacySystem;
window.TeamMemberUtils = TeamMemberUtils;
