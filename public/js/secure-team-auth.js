/*
🔐 SECURE TEAM-BASED REGISTRATION SYSTEM
=======================================

This creates isolated user groups per company/team with:
- Unique team codes for registration
- Company-isolated user lists
- Secure team management
- Future subscription model ready

FEATURES:
✅ Team codes for secure registration
✅ Company-isolated user management
✅ Admin team creation
✅ Invitation system
✅ Privacy protection
✅ Subscription model ready

IMPLEMENTATION:
Replace your existing user registration system
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
                        password: 'NextGen',
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
            console.log(`👑 Initialized default team with code: ${defaultTeamCode}`);
        }
    }

    saveTeams() {
        localStorage.setItem('recruitpro_teams', JSON.stringify(this.teams));
    }

    generateTeamCode() {
        // Generate secure 8-character team code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    createNewTeam(teamData) {
        const teamCode = this.generateTeamCode();
        const ownerId = 'owner_' + Date.now();
        
        const newTeam = {
            code: teamCode,
            name: teamData.teamName,
            company: teamData.company,
            created: new Date().toISOString(),
            createdBy: ownerId,
            subscription: 'basic',
            users: [{
                id: ownerId,
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
// Create session with dynamic duration based on "Remember Me"
const rememberMe = document.getElementById('rememberMe')?.checked;
const duration = rememberMe ? (30 * 24 * 60 * 60 * 1000) : (8 * 60 * 60 * 1000); // 30 days or 8 hours

const session = {
    userId: user.id,
    teamCode: teamCode,
    loginTime: new Date().toISOString(),
    expires: Date.now() + duration,
    rememberMe: rememberMe
};
localStorage.setItem('recruitpro_current_session', JSON.stringify(session));

console.log(`✅ Session created for ${rememberMe ? '30 days' : '8 hours'}`);
        
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
            status: 'active', // Could be 'pending' for approval workflow
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
                        <div class="auth-tab active" data-tab="login" style="
                            flex: 1; text-align: center; padding: 12px; border-radius: 8px;
                            cursor: pointer; font-weight: 600; transition: all 0.2s;
                            background: white; color: #374151; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">Sign In</div>
                        <div class="auth-tab" data-tab="register" style="
                            flex: 1; text-align: center; padding: 12px; border-radius: 8px;
                            cursor: pointer; font-weight: 600; transition: all 0.2s;
                            color: #64748b;
                        ">Join Team</div>
                        <div class="auth-tab" data-tab="create" style="
                            flex: 1; text-align: center; padding: 12px; border-radius: 8px;
                            cursor: pointer; font-weight: 600; transition: all 0.2s;
                            color: #64748b;
                        ">Create Team</div>
                    </div>
                    
                    <div id="authMessages" style="margin-bottom: 16px;"></div>
                    
                    <!-- Login Form -->
                    <form class="auth-form active" id="loginForm" style="display: block;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Team Code *
                            </label>
                            <input type="text" id="loginTeamCode" placeholder="e.g., ABC12345" 
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; text-transform: uppercase;"
                                maxlength="8" required>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Email Address *
                            </label>
                            <input type="email" id="loginEmail" placeholder="your.email@company.com"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 24px;">
    <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
        Password *
    </label>
    <input type="password" id="loginPassword" placeholder="Enter your password"
        style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
        required>
</div>

<!-- ADD THIS REMEMBER ME SECTION -->
<div style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
    <input type="checkbox" id="rememberMe" checked style="
        margin: 0; width: 16px; height: 16px; cursor: pointer;
        accent-color: #667eea;
    ">
    <label for="rememberMe" style="
        font-size: 14px; color: #374151; cursor: pointer; 
        user-select: none; display: flex; align-items: center; gap: 4px;
    ">
        <span>Remember me for 30 days</span>
        <span style="font-size: 12px; color: #6b7280;">(recommended)</span>
    </label>
</div>

<button type="submit" style="...">
    🔐 Sign In
</button>
                    </form>
                    
                    <!-- Registration Form -->
                    <form class="auth-form" id="registerForm" style="display: none;">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Team Code *
                            </label>
                            <input type="text" id="regTeamCode" placeholder="Get this from your team admin"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; text-transform: uppercase;"
                                maxlength="8" required>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Full Name *
                            </label>
                            <input type="text" id="regName" placeholder="John Smith"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Email Address *
                            </label>
                            <input type="email" id="regEmail" placeholder="john@company.com"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Role
                            </label>
                            <select id="regRole" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                                <option value="recruiter">🎯 Recruiter</option>
                                <option value="manager">👔 Hiring Manager</option>
                                <option value="admin">👑 HR Admin</option>
                                <option value="viewer">👁️ Team Member</option>
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Department
                            </label>
                            <input type="text" id="regDepartment" placeholder="HR, Engineering, Sales..."
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Create Password *
                            </label>
                            <input type="password" id="regPassword" placeholder="Create a secure password"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Confirm Password *
                            </label>
                            <input type="password" id="regConfirmPassword" placeholder="Confirm your password"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <button type="submit" style="
                            width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white; border: none; padding: 14px; border-radius: 8px;
                            cursor: pointer; font-size: 16px; font-weight: 600; transition: transform 0.2s;
                        ">
                            🎯 Join Team
                        </button>
                    </form>
                    
                    <!-- Create Team Form -->
                    <form class="auth-form" id="createForm" style="display: none;">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Team/Company Name *
                            </label>
                            <input type="text" id="createTeamName" placeholder="Acme Corp HR Team"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Company Name *
                            </label>
                            <input type="text" id="createCompany" placeholder="Acme Corporation"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Your Name *
                            </label>
                            <input type="text" id="createOwnerName" placeholder="Jane Smith"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Your Email *
                            </label>
                            <input type="email" id="createOwnerEmail" placeholder="jane@acme.com"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Create Password *
                            </label>
                            <input type="password" id="createPassword" placeholder="Create a secure password"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151;">
                                Confirm Password *
                            </label>
                            <input type="password" id="createConfirmPassword" placeholder="Confirm your password"
                                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;"
                                required>
                        </div>
                        
                        <button type="submit" style="
                            width: 100%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                            color: white; border: none; padding: 14px; border-radius: 8px;
                            cursor: pointer; font-size: 16px; font-weight: 600; transition: transform 0.2s;
                        ">
                            🏢 Create Team
                        </button>
                        
                        <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 6px; font-size: 12px; color: #1e40af;">
                            A unique team code will be generated for your team members to join.
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    setupAuthEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update tabs
                document.querySelectorAll('.auth-tab').forEach(t => {
                    t.classList.remove('active');
                    t.style.background = 'transparent';
                    t.style.color = '#64748b';
                    t.style.boxShadow = 'none';
                });
                
                tab.classList.add('active');
                tab.style.background = 'white';
                tab.style.color = '#374151';
                tab.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                
                // Update forms
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.style.display = 'none';
                });
                document.getElementById(tab.dataset.tab + 'Form').style.display = 'block';
                
                this.clearMessages();
            });
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const teamCode = document.getElementById('loginTeamCode').value;
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            this.handleLogin(teamCode, email, password);
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                teamCode: document.getElementById('regTeamCode').value,
                name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value,
                role: document.getElementById('regRole').value,
                department: document.getElementById('regDepartment').value,
                password: document.getElementById('regPassword').value,
                confirmPassword: document.getElementById('regConfirmPassword').value
            };
            this.handleRegistration(formData);
        });

        document.getElementById('createForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateTeam();
        });
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

// Global helpers for integration
window.getCurrentTeamUser = () => window.secureTeamAuth?.getCurrentUser();
window.getCurrentTeam = () => window.secureTeamAuth?.getCurrentTeam();
window.getTeamMembers = () => window.secureTeamAuth?.getTeamMembers();

/*
==============================================
IMPLEMENTATION INSTRUCTIONS:
==============================================

1. Replace your existing authentication system with this secure team-based version
2. Features:
   ✅ Unique team codes (8-character alphanumeric)
   ✅ Company-isolated user lists
   ✅ Three registration modes: Sign In, Join Team, Create Team
   ✅ Secure team management
   ✅ Ready for subscription model

3. How it works:
   - Each company/team gets a unique code (e.g., "ABC12345")
   - Users can only see members of their own team
   - Team codes are shared by admins to invite new members
   - Complete privacy between different companies

4. Future subscription model ready:
   - Teams have subscription levels (owner, premium, basic)
   - Can limit features based on subscription
   - Easy to migrate to server-based system
*/
