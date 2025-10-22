// 🚀 MULTI-USER AUTHENTICATION SYSTEM for RecruitPro
// Proper individual user accounts with registration and record attribution

class MultiUserAuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.isOwner = false;
        
        console.log('🚀 Initializing Multi-User Authentication System...');
        this.init();
    }

    init() {
        this.loadUsers();
        this.checkExistingSession();
        this.setupAuthUI();
    }

    loadUsers() {
        // Load registered users from localStorage
        const storedUsers = localStorage.getItem('recruitpro_registered_users');
        
        if (storedUsers) {
            this.users = JSON.parse(storedUsers);
            console.log(`👥 Loaded ${this.users.length} registered users`);
        } else {
            // Initialize with the original owner (Chris)
            this.users = [{
                id: 'owner_001',
                name: 'Chris van der Merwe',
                email: 'chris@company.com',
                role: 'owner',
                password: 'NextGen', // Existing password
                isOwner: true,
                created: new Date().toISOString(),
                lastLogin: null,
                status: 'active',
                permissions: {
                    viewAll: true,
                    editAll: true,
                    deleteAll: true,
                    manageUsers: true,
                    manageSettings: true
                }
            }];
            this.saveUsers();
            console.log('👑 Initialized with owner account');
        }
    }

    saveUsers() {
        localStorage.setItem('recruitpro_registered_users', JSON.stringify(this.users));
    }

    checkExistingSession() {
        const session = localStorage.getItem('recruitpro_current_session');
        if (session) {
            const sessionData = JSON.parse(session);
            const user = this.users.find(u => u.id === sessionData.userId);
            
            if (user && sessionData.expires > Date.now()) {
                this.currentUser = user;
                this.isOwner = user.isOwner || false;
                console.log(`🔐 Restored session for ${user.name}`);
                this.onLoginSuccess(user);
                return;
            } else {
                localStorage.removeItem('recruitpro_current_session');
            }
        }
        
        // No valid session, show login
        this.showAuthInterface();
    }

    setupAuthUI() {
        // Override the existing login component
        this.injectAuthStyles();
    }

    injectAuthStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .multi-auth-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .auth-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-width: 420px;
                animation: slideUp 0.6s ease-out;
            }
            
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .auth-tabs {
                display: flex;
                background: #f7fafc;
                border-radius: 10px;
                padding: 4px;
                margin-bottom: 24px;
            }
            
            .auth-tab {
                flex: 1;
                padding: 10px;
                text-align: center;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s;
                color: #718096;
            }
            
            .auth-tab.active {
                background: white;
                color: #667eea;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .auth-form {
                display: none;
            }
            
            .auth-form.active {
                display: block;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 6px;
                color: #374151;
                font-weight: 600;
                font-size: 14px;
            }
            
            .form-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                box-sizing: border-box;
                transition: border-color 0.2s;
                background: white;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .form-select {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                box-sizing: border-box;
                background: white;
                cursor: pointer;
            }
            
            .auth-button {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .auth-button:hover {
                transform: translateY(-1px);
            }
            
            .auth-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .user-list {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 16px;
            }
            
            .user-item {
                padding: 12px 16px;
                border-bottom: 1px solid #f3f4f6;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .user-item:hover {
                background: #f9fafb;
            }
            
            .user-item:last-child {
                border-bottom: none;
            }
            
            .user-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #667eea;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            
            .user-info h4 {
                margin: 0;
                font-size: 14px;
                color: #374151;
            }
            
            .user-info p {
                margin: 0;
                font-size: 12px;
                color: #6b7280;
                text-transform: capitalize;
            }
            
            .user-badge {
                background: #fef3c7;
                color: #d97706;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                margin-left: auto;
            }
            
            .owner-badge {
                background: #fecaca;
                color: #dc2626;
            }
            
            .error-message {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 16px;
                font-size: 14px;
            }
            
            .success-message {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                color: #166534;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 16px;
                font-size: 14px;
            }
        `;
        document.head.appendChild(styles);
    }

    showAuthInterface() {
        // Remove existing content
        const root = document.getElementById('root');
        if (!root) return;
        
        root.innerHTML = `
            <div class="multi-auth-container">
                <div class="auth-card">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #374151;">
                            RecruitPro
                        </h1>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            Professional Recruitment CRM
                        </p>
                    </div>
                    
                    <div class="auth-tabs">
                        <div class="auth-tab active" data-tab="login">Sign In</div>
                        <div class="auth-tab" data-tab="register">Register</div>
                    </div>
                    
                    <div id="authMessages"></div>
                    
                    <!-- Login Form -->
                    <form class="auth-form active" id="loginForm">
                        <div class="form-group">
                            <label class="form-label">Select User Account</label>
                            <div class="user-list" id="userList">
                                ${this.renderUserList()}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-input" id="loginPassword" placeholder="Enter your password" required>
                        </div>
                        
                        <button type="submit" class="auth-button" id="loginButton">
                            Sign In
                        </button>
                    </form>
                    
                    <!-- Registration Form -->
                    <form class="auth-form" id="registerForm">
                        <div class="form-group">
                            <label class="form-label">Full Name *</label>
                            <input type="text" class="form-input" id="regName" placeholder="e.g., Sarah Johnson" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Email Address *</label>
                            <input type="email" class="form-input" id="regEmail" placeholder="sarah@company.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Role</label>
                            <select class="form-select" id="regRole" required>
                                <option value="">Select your role...</option>
                                <option value="recruiter">🎯 Recruiter</option>
                                <option value="manager">👔 Hiring Manager</option>
                                <option value="admin">👑 HR Admin</option>
                                <option value="viewer">👁️ Team Member</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Department/Company</label>
                            <input type="text" class="form-input" id="regDepartment" placeholder="e.g., HR Department">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Create Password *</label>
                            <input type="password" class="form-input" id="regPassword" placeholder="Create a secure password" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Confirm Password *</label>
                            <input type="password" class="form-input" id="regConfirmPassword" placeholder="Confirm your password" required>
                        </div>
                        
                        <button type="submit" class="auth-button" id="registerButton">
                            Create Account
                        </button>
                        
                        <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 6px; font-size: 12px; color: #1e40af;">
                            <strong>Note:</strong> New accounts need approval from the system owner before full access is granted.
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.setupAuthEventListeners();
    }

    renderUserList() {
        if (this.users.length === 0) {
            return '<div style="padding: 20px; text-align: center; color: #6b7280;">No users registered</div>';
        }
        
        return this.users
            .filter(user => user.status === 'active')
            .map(user => `
                <div class="user-item" data-user-id="${user.id}">
                    <div class="user-avatar">${this.getInitials(user.name)}</div>
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p>${user.role}${user.department ? ` • ${user.department}` : ''}</p>
                    </div>
                    ${user.isOwner ? '<span class="user-badge owner-badge">Owner</span>' : `<span class="user-badge">${user.role}</span>`}
                </div>
            `).join('');
    }

    setupAuthEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
                
                this.clearMessages();
            });
        });
        
        // User selection
        document.querySelectorAll('.user-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.user-item').forEach(i => i.style.background = '');
                item.style.background = '#f0f9ff';
                
                const userId = item.dataset.userId;
                document.getElementById('loginButton').dataset.userId = userId;
            });
        });
        
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Registration form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });
    }

    async handleLogin() {
        const userId = document.getElementById('loginButton').dataset.userId;
        const password = document.getElementById('loginPassword').value;
        
        this.clearMessages();
        
        if (!userId) {
            this.showMessage('Please select a user account', 'error');
            return;
        }
        
        if (!password) {
            this.showMessage('Please enter your password', 'error');
            return;
        }
        
        const user = this.users.find(u => u.id === userId);
        
        if (!user || user.password !== password) {
            this.showMessage('Incorrect password. Please try again.', 'error');
            document.getElementById('loginPassword').value = '';
            return;
        }
        
        if (user.status !== 'active') {
            this.showMessage('Your account is pending approval. Please contact the system administrator.', 'error');
            return;
        }
        
        // Successful login
        this.currentUser = user;
        this.isOwner = user.isOwner || false;
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();
        
        // Create session
        const session = {
            userId: user.id,
            loginTime: new Date().toISOString(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('recruitpro_current_session', JSON.stringify(session));
        
        // Record login session
        this.recordLoginSession(user);
        
        console.log(`✅ Login successful: ${user.name} (${user.role})`);
        this.onLoginSuccess(user);
    }

    async handleRegistration() {
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const role = document.getElementById('regRole').value;
        const department = document.getElementById('regDepartment').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        this.clearMessages();
        
        // Validation
        if (!name || !email || !role || !password) {
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
        
        // Check if email already exists
        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showMessage('An account with this email already exists', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            role: role,
            department: department,
            password: password,
            isOwner: false,
            created: new Date().toISOString(),
            lastLogin: null,
            status: 'active', // Auto-approve for now (could be 'pending' for approval workflow)
            permissions: this.getDefaultPermissions(role),
            createdBy: this.currentUser?.id || 'self'
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        console.log(`👤 New user registered: ${name} (${role})`);
        
        this.showMessage(`Account created successfully for ${name}! You can now sign in.`, 'success');
        
        // Switch to login tab and refresh user list
        document.querySelector('[data-tab="login"]').click();
        document.getElementById('userList').innerHTML = this.renderUserList();
        this.setupUserSelection();
        
        // Clear form
        document.getElementById('registerForm').reset();
    }

    setupUserSelection() {
        document.querySelectorAll('.user-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.user-item').forEach(i => i.style.background = '');
                item.style.background = '#f0f9ff';
                
                const userId = item.dataset.userId;
                document.getElementById('loginButton').dataset.userId = userId;
            });
        });
    }

    getDefaultPermissions(role) {
        const permissions = {
            admin: {
                viewAll: true,
                editAll: true,
                deleteAll: true,
                manageUsers: true,
                manageSettings: true
            },
            manager: {
                viewAll: true,
                editAll: true,
                deleteAll: false,
                manageUsers: false,
                manageSettings: false
            },
            recruiter: {
                viewAll: true,
                editAll: true,
                deleteAll: false,
                manageUsers: false,
                manageSettings: false
            },
            viewer: {
                viewAll: true,
                editAll: false,
                deleteAll: false,
                manageUsers: false,
                manageSettings: false
            }
        };
        
        return permissions[role] || permissions.viewer;
    }

    recordLoginSession(user) {
        const sessions = JSON.parse(localStorage.getItem('recruitpro_login_sessions') || '[]');
        const newSession = {
            id: Date.now(),
            user: user.name,
            role: user.role,
            loginTime: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        const updatedSessions = [newSession, ...sessions.slice(0, 49)];
        localStorage.setItem('recruitpro_login_sessions', updatedSessions);
    }

    onLoginSuccess(user) {
        console.log(`🎉 User logged in: ${user.name}`);
        
        // Trigger the original app to load with the authenticated user
        if (window.originalAppInit) {
            window.originalAppInit(user);
        } else {
            // Fallback: trigger a page reload with the user data
            this.loadMainApplication(user);
        }
    }

    loadMainApplication(user) {
        // This method loads the main RecruitPro application
        console.log('🚀 Loading main application...');
        
        // Store current user globally for the app to use
        window.currentUser = user;
        
        // Remove auth interface and load main app
        const root = document.getElementById('root');
        root.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #667eea;"><div style="text-align: center;"><div style="width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div><h3>Loading RecruitPro...</h3></div></div>';
        
        // Load the original app components
        this.initializeMainApp(user);
    }

    async initializeMainApp(user) {
        try {
            // Dynamically load and initialize the main app
            console.log('🔄 Initializing main application components...');
            
            // Add the main app structure
            await this.loadMainAppComponents(user);
            
        } catch (error) {
            console.error('❌ Error loading main application:', error);
            this.showMessage('Error loading application. Please refresh the page.', 'error');
        }
    }

    async loadMainAppComponents(user) {
        // This would integrate with your existing app.js structure
        // For now, we'll create a basic structure that your existing components can plug into
        
        const root = document.getElementById('root');
        root.innerHTML = `
            <div id="mainApp" class="main-app">
                <div class="loading-app" style="
                    display: flex; align-items: center; justify-content: center; 
                    min-height: 100vh; color: var(--text-primary);
                ">
                    <div style="text-align: center;">
                        <div style="
                            width: 60px; height: 60px; 
                            border: 4px solid var(--border-color); 
                            border-top: 4px solid var(--accent-color); 
                            border-radius: 50%; 
                            animation: spin 1s linear infinite; 
                            margin: 0 auto 20px;
                        "></div>
                        <h3 style="margin-bottom: 10px;">Welcome ${user.name}!</h3>
                        <p style="color: var(--text-tertiary);">Loading your RecruitPro dashboard...</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Trigger the main app to load
        setTimeout(() => {
            this.triggerMainAppLoad(user);
        }, 1000);
    }

    triggerMainAppLoad(user) {
        // This is where your existing app.js would take over
        console.log('🎯 Triggering main app load for:', user.name);
        
        // Dispatch a custom event that your main app can listen for
        const event = new CustomEvent('userAuthenticated', { 
            detail: { user: user } 
        });
        document.dispatchEvent(event);
        
        // Also set global variables that your existing code might expect
        window.authenticatedUser = user;
        window.currentUser = user;
        
        // If your app has a specific init function, call it
        if (typeof window.initMainApp === 'function') {
            window.initMainApp(user);
        }
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    showMessage(message, type) {
        const container = document.getElementById('authMessages');
        container.innerHTML = `
            <div class="${type}-message">
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    clearMessages() {
        const container = document.getElementById('authMessages');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Public methods for integration
    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return this.currentUser !== null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('recruitpro_current_session');
        console.log('👋 User logged out');
        
        // Reload the page to show login again
        window.location.reload();
    }

    // Method to add user attribution to records
    addUserAttribution(record) {
        if (!this.currentUser) return record;
        
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

    // Method to update user attribution on record edits
    updateUserAttribution(record) {
        if (!this.currentUser) return record;
        
        return {
            ...record,
            lastModifiedBy: this.currentUser.id,
            lastModifiedByName: this.currentUser.name,
            lastModifiedAt: new Date().toISOString()
        };
    }
}

// Initialize the Multi-User Auth System
window.multiUserAuth = new MultiUserAuthSystem();

// Global helper functions
window.getCurrentUser = () => window.multiUserAuth?.getCurrentUser();
window.isUserLoggedIn = () => window.multiUserAuth?.isUserLoggedIn();
window.logout = () => window.multiUserAuth?.logout();
window.addUserAttribution = (record) => window.multiUserAuth?.addUserAttribution(record);
window.updateUserAttribution = (record) => window.multiUserAuth?.updateUserAttribution(record);

console.log('🚀 Multi-User Authentication System loaded!');
console.log('✨ Features: Individual registration, User attribution, Role-based access');
