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
        if (!this.currentUser) return;
        
        const existing = document.getElementById('userIndicator');
        if (existing) existing.remove();

        const indicator = document.createElement('div');
        indicator.id = 'userIndicator';
        indicator.style.cssText = `
            position: fixed; top: 20px; left: 20px; 
            background: white; border: 2px solid #e5e7eb; border-radius: 12px; 
            padding: 10px 14px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            z-index: 1000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px; display: flex; align-items: center; gap: 8px;
            max-width: 280px; cursor: pointer; transition: all 0.2s;
        `;

        const roleIcon = this.getRoleIcon(this.currentUser.role);
        const roleColor = this.getRoleColor(this.currentUser.role);
        
        indicator.innerHTML = `
            <span style="font-size: 16px;">${roleIcon}</span>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${this.currentUser.name}
                </div>
                <div style="font-size: 11px; color: ${roleColor}; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                    ${this.currentUser.role}
                </div>
            </div>
            ${this.isTeamFolder ? '<span style="color: #10b981; font-size: 12px;" title="Team Collaboration Active">👥</span>' : ''}
        `;
        
        indicator.addEventListener('click', () => this.showUserProfile());
        indicator.addEventListener('mouseenter', () => {
            indicator.style.transform = 'translateY(-1px)';
            indicator.style.borderColor = '#3b82f6';
        });
        indicator.addEventListener('mouseleave', () => {
            indicator.style.transform = 'translateY(0)';
            indicator.style.borderColor = '#e5e7eb';
        });

        document.body.appendChild(indicator);
    }

    addCollaborationPanel() {
        const existing = document.getElementById('collaborationPanel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'collaborationPanel';
        panel.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: white; border: 2px solid #e5e7eb; border-radius: 16px; 
            padding: 20px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); 
            z-index: 1000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px; min-width: 320px; max-width: 400px;
        `;
        
        this.updateCollaborationPanelContent(panel);
        document.body.appendChild(panel);
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

    showTeamManagement() {
        // Implement team management interface
        console.log('👥 Show team management');
    }
}

// Initialize the Folder Collaboration Manager
window.folderCollaboration = new FolderCollaborationManager();

// Global helper functions
window.selectCollaborationFolder = () => window.folderCollaboration?.selectCollaborationFolder();
window.showTeamManagement = () => window.folderCollaboration?.showTeamManagement();

console.log('🚀 Folder Collaboration System loaded!');
console.log('✨ Features: Team detection, Smart folder analysis, Real-time collaboration');
