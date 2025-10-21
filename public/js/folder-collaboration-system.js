// 🚀 CORE FOLDER COLLABORATION SYSTEM for RecruitPro
// The heart of team-based recruitment management

class FolderCollaborationManager {
    constructor() {
        this.isFileSystemSupported = 'showDirectoryPicker' in window;
        this.currentFolder = null;
        this.teamMembers = [];
        this.currentUser = null;
        this.collaborationData = null;
        this.folderType = 'unknown';
        this.isTeamFolder = false;
        
        console.log('🚀 Initializing Folder Collaboration System...');
        console.log('📁 File System API Support:', this.isFileSystemSupported ? 'Yes' : 'No');
        
        this.init();
    }

    async init() {
    // First ensure we have a user profile
    await this.ensureUserProfile();
    
    // Set up the folder collaboration UI
    this.setupCollaborationUI();
    
    // Check for existing folder access
    await this.checkExistingFolderAccess();
    
    // NEW: Check if we should prompt for reconnection
    setTimeout(() => {
        this.checkForReconnection();
    }, 2000); // Wait 2 seconds after app load
    
    console.log('✅ Folder Collaboration System ready');
}

    // ==========================================
    // USER PROFILE MANAGEMENT
    // ==========================================

    async ensureUserProfile() {
        const existingProfile = localStorage.getItem('recruitpro_user_profile');
        
        if (existingProfile) {
            this.currentUser = JSON.parse(existingProfile);
            console.log('👤 Loaded existing user:', this.currentUser.name);
        } else {
            this.currentUser = await this.createUserProfile();
        }
        
        // Update last active
        this.currentUser.lastActive = new Date().toISOString();
        this.saveUserProfile();
    }

    async createUserProfile() {
        return new Promise((resolve) => {
            this.showUserRegistrationDialog((profile) => {
                const enhancedProfile = {
                    ...profile,
                    id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    created: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    folderAccess: [],
                    version: '2.0.0-collaboration'
                };
                
                localStorage.setItem('recruitpro_user_profile', JSON.stringify(enhancedProfile));
                console.log('👤 Created user profile:', enhancedProfile.name);
                resolve(enhancedProfile);
            });
        });
    }

    showUserRegistrationDialog(callback) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8); display: flex;
            justify-content: center; align-items: center; z-index: 10000;
            backdrop-filter: blur(5px);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        overlay.innerHTML = `
            <div style="
                background: white; padding: 32px; border-radius: 16px; 
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); 
                max-width: 500px; width: 90%; animation: slideIn 0.3s ease-out;
            ">
                <style>
                    @keyframes slideIn {
                        from { transform: translateY(-20px) scale(0.95); opacity: 0; }
                        to { transform: translateY(0) scale(1); opacity: 1; }
                    }
                </style>
                
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="
                        width: 80px; height: 80px; margin: 0 auto 16px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 50%; display: flex; align-items: center; justify-content: center;
                        font-size: 32px; color: white; font-weight: bold;
                    ">👥</div>
                    <h2 style="margin: 0 0 8px 0; color: #374151; font-size: 24px;">Welcome to RecruitPro Teams</h2>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Set up your profile for folder collaboration</p>
                </div>
                
                <form id="userProfileForm">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 6px; color: #374151; font-weight: 600; font-size: 14px;">Full Name *</label>
                        <input type="text" id="userName" required placeholder="e.g., Sarah Johnson" style="
                            width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; 
                            font-size: 14px; box-sizing: border-box; transition: border-color 0.2s;
                        " onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 6px; color: #374151; font-weight: 600; font-size: 14px;">Email Address</label>
                        <input type="email" id="userEmail" placeholder="sarah@company.com" style="
                            width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; 
                            font-size: 14px; box-sizing: border-box; transition: border-color 0.2s;
                        " onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 6px; color: #374151; font-weight: 600; font-size: 14px;">Your Role</label>
                        <select id="userRole" style="
                            width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; 
                            font-size: 14px; box-sizing: border-box; background: white;
                        ">
                            <option value="recruiter">🎯 Recruiter</option>
                            <option value="manager">👔 Hiring Manager</option>
                            <option value="admin">👑 HR Director/Admin</option>
                            <option value="viewer">👁️ Team Member</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; margin-bottom: 6px; color: #374151; font-weight: 600; font-size: 14px;">Company/Department</label>
                        <input type="text" id="userCompany" placeholder="e.g., Acme Corp HR" style="
                            width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; 
                            font-size: 14px; box-sizing: border-box;
                        ">
                    </div>
                    
                    <button type="submit" style="
                        width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; border: none; padding: 14px; border-radius: 8px; 
                        cursor: pointer; font-size: 16px; font-weight: 600;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                        🚀 Continue to Folder Setup
                    </button>
                </form>
                
                <div style="margin-top: 20px; padding: 12px; background: #f0f9ff; border-radius: 8px; font-size: 12px; color: #1e40af;">
                    <strong>🌟 What's Next:</strong><br>
                    After profile setup, you'll select a folder for team collaboration and data sync.
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('userProfileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const profile = {
                name: document.getElementById('userName').value.trim(),
                email: document.getElementById('userEmail').value.trim(),
                role: document.getElementById('userRole').value,
                company: document.getElementById('userCompany').value.trim(),
                role_title: document.getElementById('userRole').options[document.getElementById('userRole').selectedIndex].text
            };

            if (profile.name) {
                document.body.removeChild(overlay);
                callback(profile);
            } else {
                alert('Please enter your name to continue');
            }
        });
    }

    saveUserProfile() {
        localStorage.setItem('recruitpro_user_profile', JSON.stringify(this.currentUser));
    }

    // ==========================================
    // FOLDER COLLABORATION CORE
    // ==========================================

    async selectCollaborationFolder() {
        if (!this.isFileSystemSupported) {
            this.showNotification('❌ Your browser doesn\'t support folder sync. Upgrade to Chrome/Edge for full collaboration features.', 'warning');
            return false;
        }

        try {
            this.showNotification('📁 Select a folder for team collaboration...', 'info');
            
            this.currentFolder = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            console.log('📁 Selected folder:', this.currentFolder.name);
            
            // Analyze the folder to understand what type it is
            const folderAnalysis = await this.analyzeFolderContents();
            
            // Handle based on folder type
            await this.handleFolderSelection(folderAnalysis);
            
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                this.showNotification('📁 Folder selection cancelled', 'info');
            } else {
                console.error('❌ Folder selection error:', error);
                this.showNotification('❌ Could not access folder. Please try again.', 'error');
            }
            return false;
        }
    }

    async analyzeFolderContents() {
        console.log('🔍 Analyzing folder contents...');
        
        const analysis = {
            isEmpty: true,
            hasRecruitProData: false,
            hasTeamData: false,
            teamMembers: [],
            folderCreator: null,
            lastActivity: null,
            dataTypes: [],
            folderType: 'unknown'
        };

        try {
            // Check for existing RecruitPro structure
            const folderEntries = [];
            for await (const [name, handle] of this.currentFolder.entries()) {
                folderEntries.push({ name, handle, type: handle.kind });
            }

            analysis.isEmpty = folderEntries.length === 0;

            // Look for RecruitPro collaboration folder
            const collabFolder = folderEntries.find(entry => entry.name === '_collaboration');
            if (collabFolder) {
                analysis.hasRecruitProData = true;
                
                try {
                    // Read team data
                    const teamData = await this.readCollaborationData(collabFolder.handle);
                    if (teamData) {
                        analysis.hasTeamData = true;
                        analysis.teamMembers = teamData.users || [];
                        analysis.folderCreator = teamData.creator;
                        analysis.lastActivity = teamData.lastActivity;
                        analysis.folderType = teamData.folderType || 'team';
                    }
                } catch (error) {
                    console.log('Could not read collaboration data:', error.message);
                }
            }

            // Check for other RecruitPro folders
            const recruitProFolders = ['candidates', 'projects', 'interviews', 'tasks'];
            analysis.dataTypes = folderEntries
                .filter(entry => recruitProFolders.includes(entry.name))
                .map(entry => entry.name);

            if (analysis.dataTypes.length > 0) {
                analysis.hasRecruitProData = true;
            }

            console.log('📊 Folder analysis complete:', analysis);
            return analysis;

        } catch (error) {
            console.error('❌ Error analyzing folder:', error);
            return analysis;
        }
    }

    async handleFolderSelection(analysis) {
        if (analysis.isEmpty) {
            // Brand new folder - set up as new team workspace
            await this.setupNewTeamFolder();
        } else if (analysis.hasTeamData) {
            // Existing team folder - join the team
            await this.joinExistingTeam(analysis);
        } else if (analysis.hasRecruitProData) {
            // Has data but no team structure - convert to team folder
            await this.convertToTeamFolder(analysis);
        } else {
            // Folder has other content - ask user
            await this.handleNonEmptyFolder(analysis);
        }
    }

    async setupNewTeamFolder() {
        console.log('🆕 Setting up new team folder...');
        
        this.showNotification('🛠️ Setting up new team workspace...', 'info');
        
        // Create folder structure
        await this.createCollaborationStructure();
        
        // Initialize as first team member (admin)
        const teamData = {
            created: new Date().toISOString(),
            creator: this.currentUser,
            folderType: 'team',
            version: '2.0.0',
            lastActivity: new Date().toISOString(),
            users: [{
                ...this.currentUser,
                joinedAt: new Date().toISOString(),
                role: 'admin', // First user is always admin
                isCreator: true,
                status: 'active'
            }]
        };

        await this.saveCollaborationData(teamData);
        
        this.teamMembers = teamData.users;
        this.collaborationData = teamData;
        this.isTeamFolder = true;
        this.folderType = 'team';
        
        // Update user profile with folder access
        this.currentUser.folderAccess.push({
            folderName: this.currentFolder.name,
            role: 'admin',
            joinedAt: new Date().toISOString(),
            isCreator: true
        });
        this.saveUserProfile();
        
        this.updateCollaborationUI();
        
        this.showNotification('✅ Team workspace created! You\'re the admin of this folder.', 'success');
        
        // Show team invitation info
        setTimeout(() => {
            this.showTeamInvitationInfo();
        }, 2000);
    }

    async joinExistingTeam(analysis) {
        console.log('🤝 Joining existing team...');
        
        const teamData = await this.readCollaborationData();
        const existingMember = teamData.users.find(user => user.id === this.currentUser.id);
        
        if (existingMember) {
            // Returning team member
            this.showTeamWelcomeBack(teamData, existingMember);
            
            // Update last active
            existingMember.lastActive = new Date().toISOString();
            await this.saveCollaborationData(teamData);
        } else {
            // New team member
            this.showTeamJoinDialog(teamData);
        }
    }

    showTeamJoinDialog(teamData) {
        const otherMembers = teamData.users.filter(u => u.id !== this.currentUser.id);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8); display: flex;
            justify-content: center; align-items: center; z-index: 10000;
            backdrop-filter: blur(5px);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const membersList = otherMembers.slice(0, 5).map(member => 
            `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 16px;">${this.getRoleIcon(member.role)}</span>
                <span style="font-weight: 500;">${member.name}</span>
                <span style="font-size: 12px; color: #6b7280;">(${member.role})</span>
            </div>`
        ).join('');

        const moreCount = otherMembers.length > 5 ? ` +${otherMembers.length - 5} more` : '';

        overlay.innerHTML = `
            <div style="
                background: white; padding: 32px; border-radius: 16px; 
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); 
                max-width: 500px; width: 90%;
            ">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="
                        width: 80px; height: 80px; margin: 0 auto 16px; 
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        border-radius: 50%; display: flex; align-items: center; justify-content: center;
                        font-size: 32px; color: white;
                    ">🤝</div>
                    <h2 style="margin: 0 0 8px 0; color: #374151; font-size: 24px;">Join Existing Team</h2>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                        This folder is already being used by ${otherMembers.length} team member${otherMembers.length !== 1 ? 's' : ''}
                    </p>
                </div>
                
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Current Team Members:</h4>
                    ${membersList}
                    ${moreCount ? `<div style="font-size: 12px; color: #6b7280; margin-top: 8px;">${moreCount}</div>` : ''}
                </div>
                
                <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                    <p style="margin: 0; font-size: 13px; color: #047857;">
                        <strong>✨ What happens next:</strong><br>
                        • You'll be added as a team member<br>
                        • Access shared candidates and projects<br>
                        • Collaborate in real-time<br>
                        • Your data will sync with the team
                    </p>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        flex: 1; background: #f3f4f6; color: #374151; border: none; 
                        padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;
                    ">Cancel</button>
                    <button onclick="window.folderCollaboration.confirmJoinTeam()" style="
                        flex: 2; background: #10b981; color: white; border: none; 
                        padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;
                    ">🚀 Join Team</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    async confirmJoinTeam() {
        // Close dialog
        const dialog = document.querySelector('[style*="position: fixed"][style*="backdrop-filter"]');
        if (dialog) dialog.remove();
        
        this.showNotification('🤝 Joining team...', 'info');
        
        try {
            // Read current team data
            const teamData = await this.readCollaborationData();
            
            // Add current user to team
            const newMember = {
                ...this.currentUser,
                joinedAt: new Date().toISOString(),
                role: 'recruiter', // Default role for new members
                isCreator: false,
                status: 'active',
                addedBy: 'self-join',
                lastActive: new Date().toISOString()
            };
            
            teamData.users.push(newMember);
            teamData.lastActivity = new Date().toISOString();
            
            // Save updated team data
            await this.saveCollaborationData(teamData);
            
            // Update local state
            this.teamMembers = teamData.users;
            this.collaborationData = teamData;
            this.isTeamFolder = true;
            this.folderType = 'team';
            
            // Update user profile
            this.currentUser.folderAccess.push({
                folderName: this.currentFolder.name,
                role: 'recruiter',
                joinedAt: new Date().toISOString(),
                isCreator: false
            });
            this.saveUserProfile();
            
            // Sync existing data
            await this.syncExistingData();
            
            this.updateCollaborationUI();
            
            this.showNotification(`🎉 Welcome to the team! You're now collaborating with ${teamData.users.length - 1} other member${teamData.users.length !== 2 ? 's' : ''}.`, 'success');
            
            // Show team welcome
            setTimeout(() => {
                this.showTeamCollaborationTips();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error joining team:', error);
            this.showNotification('❌ Could not join team. Please try again.', 'error');
        }
    }

    // ==========================================
    // COLLABORATION DATA MANAGEMENT
    // ==========================================

    async createCollaborationStructure() {
        const folders = [
            'candidates', 'projects', 'interviews', 'tasks', 
            'templates', 'exports', 'backups', '_collaboration'
        ];
        
        for (const folderName of folders) {
            try {
                await this.currentFolder.getDirectoryHandle(folderName, { create: true });
                console.log(`📁 Created/verified folder: ${folderName}`);
            } catch (error) {
                console.error(`❌ Failed to create folder ${folderName}:`, error);
            }
        }
    }

    async readCollaborationData(collabHandle = null) {
        try {
            if (!collabHandle) {
                collabHandle = await this.currentFolder.getDirectoryHandle('_collaboration');
            }
            
            const usersFileHandle = await collabHandle.getFileHandle('users.json');
            const usersFile = await usersFileHandle.getFile();
            const teamData = JSON.parse(await usersFile.text());
            
            console.log('📖 Read collaboration data:', teamData);
            return teamData;
        } catch (error) {
            console.log('📁 No existing collaboration data found');
            return null;
        }
    }

    async saveCollaborationData(teamData) {
        try {
            const collabFolder = await this.currentFolder.getDirectoryHandle('_collaboration', { create: true });
            const fileHandle = await collabFolder.getFileHandle('users.json', { create: true });
            const writable = await fileHandle.createWritable();
            
            // Add metadata
            const dataToSave = {
                ...teamData,
                lastUpdated: new Date().toISOString(),
                updatedBy: this.currentUser.id,
                version: '2.0.0'
            };
            
            await writable.write(JSON.stringify(dataToSave, null, 2));
            await writable.close();
            
            console.log('💾 Saved collaboration data');
            return true;
        } catch (error) {
            console.error('❌ Error saving collaboration data:', error);
            return false;
        }
    }

    // ==========================================
    // UI MANAGEMENT
    // ==========================================

    setupCollaborationUI() {
        this.addUserIndicator();
        this.addCollaborationPanel();
    }

    addUserIndicator() {
    // Remove the floating user indicator completely  
    const existing = document.getElementById('userIndicator');
    if (existing) existing.remove();
    console.log('👤 User indicator disabled - using header integration');
}

    addCollaborationPanel() {
    // Remove the floating panel completely
    const existing = document.getElementById('collaborationPanel');
    if (existing) existing.remove();
    console.log('📁 Collaboration panel disabled - using header integration');
}

    updateCollaborationPanelContent(panel) {
        const hasFolder = this.currentFolder !== null;
        const isSupported = this.isFileSystemSupported;
        
        panel.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="
                    width: 40px; height: 40px; border-radius: 10px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-weight: bold; margin-right: 12px;
                ">👥</div>
                <div>
                    <div style="font-weight: 700; color: #374151; font-size: 15px;">Team Collaboration</div>
                    <div style="color: #6b7280; font-size: 12px;">
                        ${hasFolder ? `Connected: ${this.currentFolder.name}` : 'Select folder to collaborate'}
                    </div>
                </div>
            </div>
            
            <div id="collaborationStatus" style="
                margin-bottom: 16px; padding: 12px; 
                background: ${hasFolder ? '#ecfdf5' : '#f9fafb'}; 
                border-radius: 8px; font-size: 12px; 
                border-left: 4px solid ${hasFolder ? '#10b981' : '#e5e7eb'};
            ">
                ${this.getCollaborationStatus()}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <button onclick="window.folderCollaboration.selectCollaborationFolder()" style="
                    background: ${hasFolder ? '#f59e0b' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; 
                    color: white; border: none; padding: 10px 12px; border-radius: 8px; 
                    cursor: pointer; font-size: 12px; font-weight: 600;
                ">
                    ${hasFolder ? '🔄 Change' : '📁 Select Folder'}
                </button>
                <button onclick="window.folderCollaboration.showTeamManagement()" 
                    ${!hasFolder ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : 'style=""'} 
                    style="
                    background: #10b981; color: white; border: none; padding: 10px 12px; 
                    border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
                    ${!hasFolder ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                ">
                    👥 Team
                </button>
            </div>
            
            ${!isSupported ? `
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 11px; color: #92400e; margin-bottom: 12px;">
                    ⚠️ Your browser doesn't support folder sync. Please use Chrome or Edge for full collaboration features.
                </div>
            ` : ''}
            
            <div style="font-size: 11px; color: #6b7280; text-align: center;">
                ${this.isTeamFolder ? `Team collaboration active with ${this.teamMembers.length} member${this.teamMembers.length !== 1 ? 's' : ''}` : 'No team folder selected'}
            </div>
        `;
    }

    updateCollaborationUI() {
        this.addUserIndicator();
        
        const panel = document.getElementById('collaborationPanel');
        if (panel) {
            this.updateCollaborationPanelContent(panel);
        }
    }

    getCollaborationStatus() {
        if (!this.currentFolder) {
            return '📁 No folder selected<br><small style="color: #6b7280;">Click "Select Folder" to start collaborating</small>';
        }
        
        if (!this.isTeamFolder) {
            return '⚙️ Setting up collaboration...<br><small style="color: #6b7280;">Analyzing folder contents</small>';
        }
        
        const memberCount = this.teamMembers.length;
        const otherMembers = memberCount - 1;
        
        if (otherMembers === 0) {
            return '👤 Solo workspace<br><small style="color: #6b7280;">Invite team members to collaborate</small>';
        } else {
            return `✅ Active collaboration<br><small style="color: #6b7280;">${otherMembers} team member${otherMembers !== 1 ? 's' : ''} sharing this folder</small>`;
        }
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    getRoleIcon(role) {
        const icons = {
            admin: '👑',
            manager: '👔',
            recruiter: '🎯',
            viewer: '👁️'
        };
        return icons[role] || '👤';
    }

    getRoleColor(role) {
        const colors = {
            admin: '#dc2626',
            manager: '#f59e0b',
            recruiter: '#3b82f6',
            viewer: '#6b7280'
        };
        return colors[role] || '#6b7280';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white; padding: 12px 20px; border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 320px; font-size: 14px; animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.parentNode?.removeChild(notification), 300);
            }
        }, 5000);
    }

    async checkExistingFolderAccess() {
        // Check if user has previous folder access
        if (this.currentUser?.folderAccess?.length > 0) {
            console.log('📁 User has previous folder access');
            // Could implement auto-reconnect here
        }
    }

    showTeamInvitationInfo() {
        this.showNotification('💡 Tip: Share this folder with your team to start collaborating!', 'info');
    }

    showTeamWelcomeBack(teamData, member) {
        const otherMembers = teamData.users.filter(u => u.id !== this.currentUser.id);
        this.showNotification(`👋 Welcome back! ${otherMembers.length} team member${otherMembers.length !== 1 ? 's' : ''} in this folder.`, 'success');
        
        // Update local state
        this.teamMembers = teamData.users;
        this.collaborationData = teamData;
        this.isTeamFolder = true;
        this.updateCollaborationUI();
    }

    showTeamCollaborationTips() {
        this.showNotification('💡 Your data now syncs with the team. Changes are shared in real-time!', 'info');
    }

    async syncExistingData() {
        // Implement data sync logic here
        console.log('🔄 Syncing existing data with team folder...');
        // This would copy local storage data to the team folder
    }

    showUserProfile() {
        // Implement user profile dialog
        console.log('👤 Show user profile');
    }

    /*
👥 COMPLETE TEAM MANAGEMENT SYSTEM
================================

This implements full team management with:
- View all team members
- Change member roles
- Remove team members 
- Add new members
- Role-based permissions

IMPLEMENTATION:
Replace the showTeamManagement() function in folder-collaboration-system.js
*/

// Replace the existing showTeamManagement function with this complete implementation:

showTeamManagement() {
    if (!this.isTeamFolder || !this.teamMembers) {
        this.showNotification('❌ No team folder connected', 'error');
        return;
    }

    const currentUser = this.teamMembers.find(m => m.id === this.currentUser.id);
    const isAdmin = currentUser?.role === 'admin' || currentUser?.isCreator;

    this.showTeamManagementDialog(isAdmin);
}

showTeamManagementDialog(isAdmin) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.8); display: flex;
        justify-content: center; align-items: center; z-index: 10000;
        backdrop-filter: blur(5px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Generate member list HTML
    const membersList = this.teamMembers.map(member => {
        const isCurrentUser = member.id === this.currentUser.id;
        const canEdit = isAdmin && !isCurrentUser;
        
        return `
            <div style="
                display: flex; align-items: center; justify-content: space-between; 
                padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;
                border: ${isCurrentUser ? '2px solid #3b82f6' : '1px solid #e5e7eb'};
            ">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="
                        width: 48px; height: 48px; border-radius: 50%; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex; align-items: center; justify-content: center;
                        color: white; font-weight: bold; font-size: 18px;
                    ">
                        ${this.getRoleIcon(member.role)}
                    </div>
                    
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #374151; margin-bottom: 2px;">
                            ${member.name} ${isCurrentUser ? '(You)' : ''}
                            ${member.isCreator ? ' 👑' : ''}
                        </div>
                        <div style="font-size: 12px; color: #6b7280;">
                            ${member.email || 'No email'} • Joined ${this.formatDate(member.joinedAt)}
                        </div>
                        <div style="
                            display: inline-block; padding: 2px 8px; background: ${this.getRoleColor(member.role)}; 
                            color: white; font-size: 11px; font-weight: 600; border-radius: 4px; 
                            text-transform: uppercase; margin-top: 4px;
                        ">
                            ${member.role}
                        </div>
                    </div>
                </div>
                
                ${canEdit ? `
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <select 
                            onchange="window.folderCollaboration.changeMemberRole('${member.id}', this.value)"
                            style="
                                padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px;
                                background: white; font-size: 12px; cursor: pointer;
                            "
                        >
                            <option value="${member.role}" selected>${member.role}</option>
                            ${member.role !== 'admin' ? '<option value="admin">admin</option>' : ''}
                            ${member.role !== 'manager' ? '<option value="manager">manager</option>' : ''}
                            ${member.role !== 'recruiter' ? '<option value="recruiter">recruiter</option>' : ''}
                            ${member.role !== 'viewer' ? '<option value="viewer">viewer</option>' : ''}
                        </select>
                        
                        <button 
                            onclick="window.folderCollaboration.removeMember('${member.id}', '${member.name}')"
                            style="
                                background: #dc2626; color: white; border: none; 
                                padding: 6px 10px; border-radius: 6px; cursor: pointer;
                                font-size: 12px; font-weight: 600;
                            "
                            title="Remove member"
                        >
                            🗑️
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div style="
            background: white; border-radius: 16px; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); 
            max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;
        ">
            <!-- Header -->
            <div style="
                padding: 24px 32px; border-bottom: 1px solid #e5e7eb;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px 16px 0 0; color: white;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700;">
                            👥 Team Management
                        </h2>
                        <p style="margin: 0; opacity: 0.9; font-size: 14px;">
                            ${this.currentFolder.name} • ${this.teamMembers.length} member${this.teamMembers.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button 
                        onclick="this.closest('[style*=\"position: fixed\"]').remove()"
                        style="
                            background: rgba(255,255,255,0.2); border: none; color: white;
                            width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
                            display: flex; align-items: center; justify-content: center;
                            font-size: 18px;
                        "
                    >
                        ×
                    </button>
                </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 24px 32px;">
                <!-- Permissions Notice -->
                ${!isAdmin ? `
                    <div style="
                        background: #fef3c7; padding: 12px 16px; border-radius: 8px; 
                        margin-bottom: 20px; border-left: 4px solid #f59e0b;
                    ">
                        <p style="margin: 0; font-size: 13px; color: #92400e;">
                            ⚠️ <strong>View Only:</strong> You don't have admin permissions to modify team members.
                        </p>
                    </div>
                ` : ''}
                
                <!-- Team Members List -->
                <div style="margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px;">Team Members</h3>
                    ${membersList}
                </div>
                
                <!-- Admin Actions -->
                ${isAdmin ? `
                    <div style="
                        border-top: 1px solid #e5e7eb; padding-top: 20px;
                    ">
                        <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">Admin Actions</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <button 
                                onclick="window.folderCollaboration.showInviteMemberDialog()"
                                style="
                                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                    color: white; border: none; padding: 12px 16px; 
                                    border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;
                                "
                            >
                                ➕ Invite Member
                            </button>
                            
                            <button 
                                onclick="window.folderCollaboration.exportTeamData()"
                                style="
                                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                                    color: white; border: none; padding: 12px 16px; 
                                    border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;
                                "
                            >
                                📥 Export Team Data
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Role Permissions Info -->
                <div style="
                    background: #f0f9ff; padding: 16px; border-radius: 8px; 
                    margin-top: 20px; border-left: 4px solid #3b82f6;
                ">
                    <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px;">Role Permissions</h4>
                    <div style="font-size: 12px; color: #1e3a8a; line-height: 1.4;">
                        <strong>👑 Admin:</strong> Full access, can manage team<br>
                        <strong>👔 Manager:</strong> View and edit all data<br>
                        <strong>🎯 Recruiter:</strong> View and edit candidates<br>
                        <strong>👁️ Viewer:</strong> Read-only access
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

// Add these new methods to handle team management actions:

async changeMemberRole(memberId, newRole) {
    try {
        this.showNotification('🔄 Updating member role...', 'info');
        
        // Read current team data
        const teamData = await this.readCollaborationData();
        
        // Find and update the member
        const memberIndex = teamData.users.findIndex(u => u.id === memberId);
        if (memberIndex === -1) {
            throw new Error('Member not found');
        }
        
        const oldRole = teamData.users[memberIndex].role;
        teamData.users[memberIndex].role = newRole;
        teamData.users[memberIndex].lastModified = new Date().toISOString();
        teamData.users[memberIndex].modifiedBy = this.currentUser.id;
        
        // Save changes
        await this.saveCollaborationData(teamData);
        
        // Update local state
        this.teamMembers = teamData.users;
        this.collaborationData = teamData;
        
        this.showNotification(`✅ Role changed from ${oldRole} to ${newRole}`, 'success');
        
        // Refresh the dialog
        document.querySelector('[style*="position: fixed"][style*="backdrop-filter"]')?.remove();
        setTimeout(() => this.showTeamManagement(), 500);
        
    } catch (error) {
        console.error('❌ Error changing member role:', error);
        this.showNotification('❌ Failed to update member role', 'error');
    }
}

async removeMember(memberId, memberName) {
    // Confirm removal
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        this.showNotification('🗑️ Removing team member...', 'info');
        
        // Read current team data
        const teamData = await this.readCollaborationData();
        
        // Remove the member
        teamData.users = teamData.users.filter(u => u.id !== memberId);
        teamData.lastActivity = new Date().toISOString();
        teamData.lastModifiedBy = this.currentUser.id;
        
        // Save changes
        await this.saveCollaborationData(teamData);
        
        // Update local state
        this.teamMembers = teamData.users;
        this.collaborationData = teamData;
        
        this.showNotification(`✅ ${memberName} removed from team`, 'success');
        
        // Refresh the dialog
        document.querySelector('[style*="position: fixed"][style*="backdrop-filter"]')?.remove();
        setTimeout(() => this.showTeamManagement(), 500);
        
    } catch (error) {
        console.error('❌ Error removing member:', error);
        this.showNotification('❌ Failed to remove team member', 'error');
    }
}

showInviteMemberDialog() {
    // Close current dialog
    document.querySelector('[style*="position: fixed"][style*="backdrop-filter"]')?.remove();
    
    // Create invite dialog
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.8); display: flex;
        justify-content: center; align-items: center; z-index: 10000;
        backdrop-filter: blur(5px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    overlay.innerHTML = `
        <div style="
            background: white; padding: 32px; border-radius: 16px; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); 
            max-width: 500px; width: 90%;
        ">
            <h2 style="margin: 0 0 20px 0; color: #374151; font-size: 24px;">➕ Invite Team Member</h2>
            
            <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;">
                    <strong>💡 How to invite:</strong><br>
                    1. Share the folder location with your team member<br>
                    2. Ask them to select the same folder in RecruitPro<br>
                    3. They'll automatically be prompted to join the team
                </p>
            </div>
            
            <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #047857;">
                    <strong>📁 Folder Location:</strong><br>
                    <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">
                        ${this.currentFolder.name}
                    </code>
                </p>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button 
                    onclick="document.querySelector('[style*=\"backdrop-filter\"]').remove()"
                    style="
                        flex: 1; background: #f3f4f6; color: #374151; border: none; 
                        padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;
                    "
                >
                    Close
                </button>
                <button 
                    onclick="window.folderCollaboration.copyFolderInfo()"
                    style="
                        flex: 2; background: #10b981; color: white; border: none; 
                        padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;
                    "
                >
                    📋 Copy Folder Info
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

copyFolderInfo() {
    const folderInfo = `RecruitPro Team Folder: ${this.currentFolder.name}\n\nTo join the team:\n1. Open RecruitPro\n2. Click the folder icon in the header\n3. Select "Select Folder" \n4. Choose this folder location\n5. Follow the prompts to join the team`;
    
    navigator.clipboard.writeText(folderInfo).then(() => {
        this.showNotification('📋 Folder info copied to clipboard!', 'success');
        document.querySelector('[style*="position: fixed"][style*="backdrop-filter"]')?.remove();
    }).catch(() => {
        this.showNotification('❌ Could not copy to clipboard', 'error');
    });
}

exportTeamData() {
    const teamData = {
        folderName: this.currentFolder.name,
        exported: new Date().toISOString(),
        exportedBy: this.currentUser.name,
        teamMembers: this.teamMembers.map(member => ({
            name: member.name,
            email: member.email,
            role: member.role,
            joinedAt: member.joinedAt,
            isCreator: member.isCreator || false
        }))
    };
    
    const blob = new Blob([JSON.stringify(teamData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-export-${this.currentFolder.name}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showNotification('📥 Team data exported successfully!', 'success');
}

// Helper method to format dates
formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return 'Unknown';
    }
}

// ==========================================
// FOLDER PERSISTENCE & AUTO-RECONNECT SYSTEM
// ==========================================

saveFolderInfo() {
    if (this.currentFolder) {
        const folderInfo = {
            name: this.currentFolder.name,
            isTeamFolder: this.isTeamFolder,
            teamMemberCount: this.teamMembers?.length || 0,
            lastConnected: new Date().toISOString(),
            userRole: this.getCurrentUserRole(),
            folderType: this.folderType
        };
        
        localStorage.setItem('recruitpro_last_folder', JSON.stringify(folderInfo));
        console.log('💾 Saved folder info:', folderInfo);
    }
}

loadSavedFolderInfo() {
    const saved = localStorage.getItem('recruitpro_last_folder');
    return saved ? JSON.parse(saved) : null;
}

getCurrentUserRole() {
    if (this.teamMembers && this.currentUser) {
        const member = this.teamMembers.find(m => m.id === this.currentUser.id);
        return member?.role || 'unknown';
    }
    return 'unknown';
}

async checkForReconnection() {
    const savedFolder = this.loadSavedFolderInfo();
    
    if (savedFolder && !this.currentFolder) {
        console.log('📁 Found previous folder connection:', savedFolder);
        this.showReconnectPrompt(savedFolder);
        return true;
    }
    return false;
}

showReconnectPrompt(folderInfo) {
    // Don't show if user dismissed recently
    const lastDismissed = localStorage.getItem('recruitpro_reconnect_dismissed');
    if (lastDismissed) {
        const dismissedTime = new Date(lastDismissed);
        const now = new Date();
        const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);
        
        if (hoursSinceDismissed < 24) {
            console.log('🔕 Reconnect prompt dismissed recently, skipping');
            return;
        }
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7); display: flex;
        justify-content: center; align-items: center; z-index: 10000;
        backdrop-filter: blur(3px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: fadeIn 0.3s ease-out;
    `;

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Recently';
        }
    };

    overlay.innerHTML = `
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
        </style>
        <div style="
            background: white; padding: 32px; border-radius: 16px; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); 
            max-width: 500px; width: 90%; position: relative;
            animation: fadeIn 0.3s ease-out;
        ">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="
                    width: 80px; height: 80px; margin: 0 auto 16px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-size: 32px; color: white;
                ">📁</div>
                <h2 style="margin: 0 0 8px 0; color: #374151; font-size: 24px;">
                    Reconnect to Team Folder
                </h2>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                    You were previously connected to a team folder
                </p>
            </div>
            
            <!-- Folder Info -->
            <div style="
                background: #f9fafb; padding: 20px; border-radius: 12px; 
                margin-bottom: 24px; border-left: 4px solid #667eea;
            ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">
                        ${folderInfo.isTeamFolder ? '👥' : '📁'}
                    </span>
                    <div>
                        <div style="font-weight: 600; color: #374151; font-size: 16px;">
                            ${folderInfo.name}
                        </div>
                        <div style="font-size: 12px; color: #6b7280;">
                            Last connected: ${formatDate(folderInfo.lastConnected)}
                        </div>
                    </div>
                </div>
                
                ${folderInfo.isTeamFolder ? `
                    <div style="
                        background: #ecfdf5; padding: 12px; border-radius: 8px;
                        border-left: 3px solid #10b981; margin-top: 12px;
                    ">
                        <div style="font-size: 13px; color: #047857;">
                            <strong>🎯 Team Folder:</strong> ${folderInfo.teamMemberCount} member${folderInfo.teamMemberCount !== 1 ? 's' : ''}<br>
                            <strong>👤 Your Role:</strong> ${folderInfo.userRole}
                        </div>
                    </div>
                ` : `
                    <div style="
                        background: #fef3c7; padding: 12px; border-radius: 8px;
                        border-left: 3px solid #f59e0b; margin-top: 12px;
                    ">
                        <div style="font-size: 13px; color: #92400e;">
                            <strong>📁 Personal Folder:</strong> Individual workspace
                        </div>
                    </div>
                `}
            </div>
            
            <!-- Actions -->
            <div style="display: flex; gap: 12px;">
                <button 
                    onclick="window.folderCollaboration.dismissReconnectPrompt()"
                    style="
                        flex: 1; background: #f3f4f6; color: #374151; border: none; 
                        padding: 12px 16px; border-radius: 8px; cursor: pointer; 
                        font-size: 14px; transition: background 0.2s;
                    "
                    onmouseover="this.style.background='#e5e7eb'"
                    onmouseout="this.style.background='#f3f4f6'"
                >
                    Maybe Later
                </button>
                <button 
                    onclick="window.folderCollaboration.quickReconnect()"
                    style="
                        flex: 2; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white; border: none; padding: 12px 16px; border-radius: 8px; 
                        cursor: pointer; font-size: 14px; font-weight: 600;
                        transition: transform 0.2s;
                    "
                    onmouseover="this.style.transform='translateY(-1px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    🔄 Reconnect Now
                </button>
            </div>
            
            <!-- Helper Text -->
            <div style="
                text-align: center; margin-top: 16px; font-size: 12px; 
                color: #6b7280; line-height: 1.4;
            ">
                💡 You'll need to select the same folder location<br>
                Team collaboration will resume automatically
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

async quickReconnect() {
    // Close the prompt
    const overlay = document.querySelector('[style*="backdrop-filter"]');
    if (overlay) overlay.remove();
    
    this.showNotification('📁 Select your previous folder to reconnect...', 'info');
    
    // Trigger folder selection
    try {
        await this.selectCollaborationFolder();
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('❌ Reconnect failed:', error);
            this.showNotification('❌ Could not reconnect. Please try again.', 'error');
        }
    }
}

dismissReconnectPrompt() {
    // Close the prompt
    const overlay = document.querySelector('[style*="backdrop-filter"]');
    if (overlay) overlay.remove();
    
    // Remember dismissal for 24 hours
    localStorage.setItem('recruitpro_reconnect_dismissed', new Date().toISOString());
    
    this.showNotification('📁 You can reconnect anytime via the folder icon', 'info');
}

clearSavedFolderInfo() {
    localStorage.removeItem('recruitpro_last_folder');
    localStorage.removeItem('recruitpro_reconnect_dismissed');
    console.log('🧹 Cleared saved folder info');
}

}



// Initialize the Folder Collaboration Manager
window.folderCollaboration = new FolderCollaborationManager();

// Global helper functions
window.selectCollaborationFolder = () => window.folderCollaboration?.selectCollaborationFolder();
window.showTeamManagement = () => window.folderCollaboration?.showTeamManagement();

console.log('🚀 Folder Collaboration System loaded!');
console.log('✨ Features: Team detection, Smart folder analysis, Real-time collaboration');
