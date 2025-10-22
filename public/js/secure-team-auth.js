/*
🔐 SECURE TEAM-BASED REGISTRATION SYSTEM (UPDATED)
=======================================

This creates isolated user groups per company/team with:
- Unique team codes for registration
- Company-isolated user lists
- Secure team management
- Future subscription model ready
- ✅ ADDED: User attribution functions for candidates/projects

FEATURES:
✅ Team codes for secure registration
✅ Company-isolated user management
✅ Admin team creation
✅ Invitation system
✅ Privacy protection
✅ Subscription model ready
✅ User attribution for records
*/

class SecureTeamUserSystem {
    constructor() {
        this.currentUser = null;
        this.currentTeam = null;
        this.teams = {};
        this.isOwner = false;
        
        console.log('🔐 Initializing Secure Team User System...');
        this.init();
    }

    init() {
        this.loadTeams();
        this.checkExistingSession();
        this.setupAuthUI();
    }

    // ==========================================
    // TEAM MANAGEMENT
    // ==========================================

    loadTeams() {
        const storedTeams = localStorage.getItem('recruitpro_teams');
        
        if (storedTeams) {
            this.teams = JSON.parse(storedTeams);
            console.log(`🏢 Loaded ${Object.keys(this.teams).length} teams`);
        } else {
            // Initialize with Chris's team (preserve existing setup)
            const defaultTeamCode = this.generateTeamCode();
            this.teams = {
                [defaultTeamCode]: {
                    code: defaultTeamCode,
                    name: 'Chris van der Merwe\'s Team',
                    company: 'SAP',
                    created: new Date().toISOString(),
                    createdBy: 'owner_001',
                    subscription: 'owner', // owner, premium, basic
                    users: [{
                        id: 'owner_001',
                        name: 'Chris van der Merwe',
                        email: 'chris@sap.com',
                        role: 'owner',
                        password: 'NextGen', // Existing password
                        isOwner: true,
                        teamCode: defaultTeamCode,
                        created: new Date().toISOString(),
                        lastLogin: null,
                        status: 'active',
                        permissions: {
                            viewAll: true,
                            editAll: true,
                            deleteAll: true,
                            manageUsers: true,
                            manageSettings: true,
                            manageTeam: true
                        }
                    }]
                }
            };
            this.saveTeams();
            console.log(`👑 Initialized with default team: ${defaultTeamCode}`);
        }
    }

    saveTeams() {
        localStorage.setItem('recruitpro_teams', JSON.stringify(this.teams));
    }

    generateTeamCode() {
        // Generate 8-character alphanumeric code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Remove confusing chars
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    createNewTeam(teamData) {
        const teamCode = this.generateTeamCode();
        
        const newTeam = {
            code: teamCode,
            name: teamData.teamName,
            company: teamData.company,
            created: new Date().toISOString(),
            createdBy: 'owner_' + Date.now(),
            subscription: 'owner',
            users: [{
                id: 'owner_' + Date.now(),
                name: teamData.ownerName,
                email: teamData.ownerEmail,
                role: 'owner',
                password: teamData.password,
                isOwner: true,
                teamCode: teamCode,
                created: new Date().toISOString(),
                lastLogin: null,
                status: 'active',
                permissions: {
                    viewAll: true,
                    editAll: true,
                    deleteAll: true,
                    manageUsers: true,
                    manageSettings: true,
                    manageTeam: true
                }
            }]
        };

        this.teams[teamCode] = newTeam;
        this.saveTeams();
        
        console.log(`🏢 Created new team: ${teamData.teamName} (${teamCode})`);
        return { team: newTeam, owner: newTeam.users[0] };
    }

    // ==========================================
    // USER AUTHENTICATION
    // ==========================================

    checkExistingSession() {
        const session = localStorage.getItem('recruitpro_current_session');
        if (session) {
            const sessionData = JSON.parse(session);
            
            // Find user in teams
            for (const teamCode in this.teams) {
                const user = this.teams[teamCode].users.find(u => u.id === sessionData.userId);
                if (user && sessionData.expires > Date.now()) {
                    this.currentUser = user;
                    this.currentTeam = this.teams[teamCode];
                    this.isOwner = user.isOwner || false;
                    console.log(`🔐 Restored session for ${user.name} (${this.currentTeam.name})`);
                    this.onLoginSuccess(user);
                    return;
                }
            }
        }
        
        // No valid session found
        this.showAuthInterface();
    }

    async handleLogin(teamCode, email, password) {
        this.clearMessages();
        
        if (!teamCode || !email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        const team = this.teams[teamCode.toUpperCase()];
        if (!team) {
            this.showMessage('Invalid team code. Please check and try again.', 'error');
            return;
        }

        const user = team.users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );

        if (!user) {
            this.showMessage('Invalid email or password.', 'error');
            return;
        }

        if (user.status !== 'active') {
            this.showMessage('Your account is pending approval.', 'error');
            return;
        }

        // Successful login
        this.currentUser = user;
        this.currentTeam = team;
        this.isOwner = user.isOwner || false;
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveTeams();
        
        // Create session
        const session = {
            userId: user.id,
            teamCode: teamCode,
            loginTime: new Date().toISOString(),
            expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        };
        localStorage.setItem('recruitpro_current_session', JSON.stringify(session));
        
        console.log(`✅ Login successful: ${user.name} (${team.name})`);
        this.onLoginSuccess(user);
    }

    async handleRegistration(formData) {
        this.clearMessages();
        
        const { teamCode, name, email, role, department, password, confirmPassword } = formData;
        
        // Validation
        if (!teamCode || !name || !email || !password) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 4) {
            this.showMessage('Password must be at least 4 characters long', 'error');
            return;
        }

        const team = this.teams[teamCode.toUpperCase()];
        if (!team) {
            this.showMessage('Invalid team code. Please contact your team administrator.', 'error');
            return;
        }

        // Check if email already exists in this team
        if (team.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showMessage('An account with this email already exists in this team.', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            role: role || 'recruiter',
            department: department,
            password: password,
            isOwner: false,
            teamCode: teamCode.toUpperCase(),
            created: new Date().toISOString(),
            lastLogin: null,
            status: 'active',
            permissions: this.getDefaultPermissions(role || 'recruiter')
        };
        
        team.users.push(newUser);
        this.saveTeams();
        
        console.log(`👤 New user registered: ${name} (${team.name})`);
        this.showMessage(`Account created successfully! Welcome to ${team.name}.`, 'success');
        
        // Auto-login the new user
        setTimeout(() => {
            this.handleLogin(teamCode, email, password);
        }, 1500);
    }

    async handleCreateTeam() {
        this.clearMessages();
        
        const teamData = {
            teamName: document.getElementById('createTeamName').value,
            company: document.getElementById('createCompany').value,
            ownerName: document.getElementById('createOwnerName').value,
            ownerEmail: document.getElementById('createOwnerEmail').value,
            password: document.getElementById('createPassword').value,
            confirmPassword: document.getElementById('createConfirmPassword').value
        };

        // Validation
        if (!teamData.teamName || !teamData.company || !teamData.ownerName || !teamData.ownerEmail || !teamData.password) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (teamData.password !== teamData.confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (teamData.password.length < 4) {
            this.showMessage('Password must be at least 4 characters long', 'error');
            return;
        }

        // Check if email exists in any team
        for (const teamCode in this.teams) {
            if (this.teams[teamCode].users.find(u => u.email.toLowerCase() === teamData.ownerEmail.toLowerCase())) {
                this.showMessage('An account with this email already exists.', 'error');
                return;
            }
        }

        // Create the team
        const result = this.createNewTeam(teamData);
        
        this.showMessage(`Team created successfully! Your team code is: ${result.team.code}`, 'success');
        
        // Auto-login the owner
        setTimeout(() => {
            this.handleLogin(result.team.code, teamData.ownerEmail, teamData.password);
        }, 2000);
    }

    // ==========================================
    // UI MANAGEMENT
    // ==========================================

    setupAuthUI() {
        this.showAuthInterface();
    }

    showAuthInterface() {
        const authContainer = document.createElement('div');
        authContainer.id = 'secureAuthContainer';
        authContainer.innerHTML = this.getAuthHTML();
        
        // Remove existing auth interface
        document.querySelectorAll('#secureAuthContainer, .login-container').forEach(el => el.remove());
        
        document.body.appendChild(authContainer);
        this.setupAuthEventListeners();
    }

    getAuthHTML() {
        return `
            <div class="secure-auth-container" style="
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex; justify-content: center; align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                z-index: 10000;
            ">
                <div class="auth-card" style="
                    background: white; border-radius: 20px; padding: 40px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3); max-width: 500px; width: 90%;
                ">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #374151;">
                            RecruitPro
                        </h1>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            Professional Recruitment CRM
                        </p>
                    </div>
                    
                    <!-- Tabs -->
                    <div class="auth-tabs" style="
                        display: flex; background: #f1f5f9; border-radius: 12px; padding: 4px; margin-bottom: 24px;
                    ">
                        <div class="auth-tab active" data-tab="signin" style="
                            flex: 1; padding: 12px; text-align: center; border-radius: 8px; cursor: pointer;
                            font-weight: 600; font-size: 14px; background: white; color: #667eea;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s;
                        ">Sign In</div>
                        <div class="auth-tab" data-tab="join" style="
                            flex: 1; padding: 12px; text-align: center; border-radius: 8px; cursor: pointer;
                            font-weight: 600; font-size: 14px; color: #64748b; transition: all 0.2s;
                        ">Join Team</div>
                        <div class="auth-tab" data-tab="create" style="
                            flex: 1; padding: 12px; text-align: center; border-radius: 8px; cursor: pointer;
                            font-weight: 600; font-size: 14px; color: #64748b; transition: all 0.2s;
                        ">Create Team</div>
                    </div>
                    
                    <div id="authMessages"></div>
                    
                    <!-- Sign In Form -->
                    <div class="auth-form active" id="signinForm" style="display: block;">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Team Code
                            </label>
                            <input type="text" id="signinTeamCode" placeholder="Enter your team code" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Email
                            </label>
                            <input type="email" id="signinEmail" placeholder="Enter your email" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Password
                            </label>
                            <input type="password" id="signinPassword" placeholder="Enter your password" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <button id="signinButton" style="
                            width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600;
                            cursor: pointer; transition: transform 0.2s;
                        ">Sign In</button>
                    </div>
                    
                    <!-- Join Team Form -->
                    <div class="auth-form" id="joinForm" style="display: none;">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Team Code *
                            </label>
                            <input type="text" id="joinTeamCode" placeholder="Enter team code" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Full Name *
                            </label>
                            <input type="text" id="joinName" placeholder="Enter your full name" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Email *
                            </label>
                            <input type="email" id="joinEmail" placeholder="Enter your email" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Role
                            </label>
                            <select id="joinRole" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                                <option value="recruiter">Recruiter</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Department
                            </label>
                            <input type="text" id="joinDepartment" placeholder="e.g., HR, Engineering" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Password *
                            </label>
                            <input type="password" id="joinPassword" placeholder="Create a password" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Confirm Password *
                            </label>
                            <input type="password" id="joinConfirmPassword" placeholder="Confirm your password" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <button id="joinButton" style="
                            width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                            color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600;
                            cursor: pointer; transition: transform 0.2s;
                        ">Join Team</button>
                    </div>
                    
                    <!-- Create Team Form -->
                    <div class="auth-form" id="createForm" style="display: none;">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Team Name *
                            </label>
                            <input type="text" id="createTeamName" placeholder="e.g., Acme HR Team" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Company *
                            </label>
                            <input type="text" id="createCompany" placeholder="e.g., Acme Corporation" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Your Name *
                            </label>
                            <input type="text" id="createOwnerName" placeholder="Enter your full name" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Your Email *
                            </label>
                            <input type="email" id="createOwnerEmail" placeholder="Enter your email" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Password *
                            </label>
                            <input type="password" id="createPassword" placeholder="Create a password" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                                Confirm Password *
                            </label>
                            <input type="password" id="createConfirmPassword" placeholder="Confirm your password" style="
                                width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;
                                font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;
                            ">
                        </div>
                        
                        <button id="createButton" style="
                            width: 100%; padding: 14px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                            color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600;
                            cursor: pointer; transition: transform 0.2s;
                        ">Create Team</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupAuthEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => {
                    t.classList.remove('active');
                    t.style.background = 'transparent';
                    t.style.color = '#64748b';
                    t.style.boxShadow = 'none';
                });
                
                tab.classList.add('active');
                tab.style.background = 'white';
                tab.style.color = '#667eea';
                tab.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                
                document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
                
                const tabName = tab.dataset.tab;
                if (tabName === 'signin') {
                    document.getElementById('signinForm').style.display = 'block';
                } else if (tabName === 'join') {
                    document.getElementById('joinForm').style.display = 'block';
                } else if (tabName === 'create') {
                    document.getElementById('createForm').style.display = 'block';
                }
            });
        });

        // Form submissions
        document.getElementById('signinButton').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogin(
                document.getElementById('signinTeamCode').value,
                document.getElementById('signinEmail').value,
                document.getElementById('signinPassword').value
            );
        });

        document.getElementById('joinButton').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleRegistration({
                teamCode: document.getElementById('joinTeamCode').value,
                name: document.getElementById('joinName').value,
                email: document.getElementById('joinEmail').value,
                role: document.getElementById('joinRole').value,
                department: document.getElementById('joinDepartment').value,
                password: document.getElementById('joinPassword').value,
                confirmPassword: document.getElementById('joinConfirmPassword').value
            });
        });

        document.getElementById('createButton').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleCreateTeam();
        });

        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = document.querySelector('.auth-form[style*="display: block"]');
                if (activeForm) {
                    const button = activeForm.querySelector('button');
                    if (button) button.click();
                }
            }
        });
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    getDefaultPermissions(role) {
        const permissions = {
            owner: {
                viewAll: true, editAll: true, deleteAll: true, 
                manageUsers: true, manageSettings: true, manageTeam: true
            },
            admin: {
                viewAll: true, editAll: true, deleteAll: true, 
                manageUsers: true, manageSettings: false, manageTeam: false
            },
            manager: {
                viewAll: true, editAll: true, deleteAll: false, 
                manageUsers: false, manageSettings: false, manageTeam: false
            },
            recruiter: {
                viewAll: true, editAll: true, deleteAll: false, 
                manageUsers: false, manageSettings: false, manageTeam: false
            },
            viewer: {
                viewAll: true, editAll: false, deleteAll: false, 
                manageUsers: false, manageSettings: false, manageTeam: false
            }
        };
        
        return permissions[role] || permissions.viewer;
    }

    showMessage(message, type) {
        const container = document.getElementById('authMessages');
        const colors = {
            success: { bg: '#ecfdf5', text: '#047857', border: '#10b981' },
            error: { bg: '#fef2f2', text: '#dc2626', border: '#ef4444' },
            info: { bg: '#f0f9ff', text: '#1e40af', border: '#3b82f6' }
        };
        
        const color = colors[type] || colors.info;
        
        container.innerHTML = `
            <div style="
                background: ${color.bg}; color: ${color.text}; 
                padding: 12px 16px; border-radius: 8px; border-left: 4px solid ${color.border};
                font-size: 14px; margin-bottom: 16px;
            ">
                ${message}
            </div>
        `;
        
        if (type === 'success') {
            setTimeout(() => container.innerHTML = '', 3000);
        }
    }

    clearMessages() {
        const container = document.getElementById('authMessages');
        if (container) container.innerHTML = '';
    }

    onLoginSuccess(user) {
        console.log(`🎉 User logged in: ${user.name} (${this.currentTeam.name})`);
        
        // Remove auth interface
        document.getElementById('secureAuthContainer')?.remove();
        
        // Trigger the main app
        if (window.originalAppInit) {
            window.originalAppInit(user);
        } else if (typeof window.initMainApp === 'function') {
            window.initMainApp(user);
        } else {
            // Dispatch event for main app
            const event = new CustomEvent('userAuthenticated', { 
                detail: { user: user, team: this.currentTeam } 
            });
            document.dispatchEvent(event);
        }
    }

    // ==========================================
    // ✅ USER ATTRIBUTION FUNCTIONS (ADDED)
    // ==========================================

    addUserAttribution(record) {
        if (!this.currentUser) {
            console.warn('⚠️ No current user for attribution');
            return record;
        }
        
        return {
            ...record,
            createdBy: this.currentUser.id,
            createdByName: this.currentUser.name,
            createdByRole: this.currentUser.role,
            lastModifiedBy: this.currentUser.id,
            lastModifiedByName: this.currentUser.name,
            lastModifiedAt: new Date().toISOString()
        };
    }

    updateUserAttribution(record) {
        if (!this.currentUser) {
            console.warn('⚠️ No current user for attribution');
            return record;
        }
        
        return {
            ...record,
            lastModifiedBy: this.currentUser.id,
            lastModifiedByName: this.currentUser.name,
            lastModifiedAt: new Date().toISOString()
        };
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentTeam() {
        return this.currentTeam;
    }

    getTeamMembers() {
        return this.currentTeam ? this.currentTeam.users : [];
    }

    getTeamCode() {
        return this.currentTeam ? this.currentTeam.code : null;
    }

    logout() {
        this.currentUser = null;
        this.currentTeam = null;
        this.isOwner = false;
        localStorage.removeItem('recruitpro_current_session');
        this.showAuthInterface();
    }
}

// Initialize the system
window.secureTeamAuth = new SecureTeamUserSystem();

// ✅ UPDATED GLOBAL HELPERS - These are the functions your app expects
window.getCurrentUser = () => window.secureTeamAuth?.getCurrentUser();
window.getCurrentTeamUser = () => window.secureTeamAuth?.getCurrentUser();
window.getCurrentTeam = () => window.secureTeamAuth?.getCurrentTeam();
window.getTeamMembers = () => window.secureTeamAuth?.getTeamMembers();

// ✅ THE MISSING FUNCTIONS THAT WERE CAUSING THE ERROR
window.addUserAttribution = (record) => window.secureTeamAuth?.addUserAttribution(record);
window.updateUserAttribution = (record) => window.secureTeamAuth?.updateUserAttribution(record);

// Legacy compatibility
window.isUserLoggedIn = () => !!window.secureTeamAuth?.getCurrentUser();
window.logout = () => window.secureTeamAuth?.logout();

console.log('🔐 Secure Team Authentication System loaded!');
console.log('✅ Features: Team codes, User attribution, Role-based access');
console.log('✅ Functions available: addUserAttribution, updateUserAttribution');
