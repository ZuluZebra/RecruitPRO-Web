// Multi-User Login Component - Enhanced version of existing LoginComponent
const LoginComponent = ({ onLogin }) => {
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState(null);
    const [showRegister, setShowRegister] = React.useState(false);
    const [users, setUsers] = React.useState([]);
    
    // Registration form state
    const [regData, setRegData] = React.useState({
        name: '',
        email: '',
        role: 'recruiter',
        department: '',
        password: '',
        confirmPassword: ''
    });

    // Load users on component mount
    React.useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const storedUsers = localStorage.getItem('recruitpro_registered_users');
        
        if (storedUsers) {
            const parsedUsers = JSON.parse(storedUsers);
            setUsers(parsedUsers);
            
            // Auto-select Chris if he exists
            const chrisUser = parsedUsers.find(u => u.name === 'Chris van der Merwe');
            if (chrisUser) {
                setSelectedUserId(chrisUser.id);
            }
        } else {
            // Initialize with Chris as the owner (preserve your existing setup)
            const initialUsers = [{
                id: 'owner_001',
                name: 'Chris van der Merwe',
                email: 'chris@company.com',
                role: 'owner',
                avatar: 'CM',
                password: 'NextGen', // Your existing password
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
            
            setUsers(initialUsers);
            setSelectedUserId('owner_001');
            localStorage.setItem('recruitpro_registered_users', JSON.stringify(initialUsers));
        }
    };

    const handleLogin = async () => {
        if (!selectedUserId) {
            alert('Please select a user account');
            return;
        }

        if (!password) {
            alert('Please enter your password');
            return;
        }

        setIsLoading(true);
        
        // Simulate login delay (keep your existing behavior)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = users.find(u => u.id === selectedUserId);
        
        if (user && password === user.password) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            const updatedUsers = users.map(u => u.id === selectedUserId ? user : u);
            setUsers(updatedUsers);
            localStorage.setItem('recruitpro_registered_users', JSON.stringify(updatedUsers));
            
            // Record login session (keep your existing logic)
            const sessions = helpers.storage.load('recruitpro_login_sessions') || [];
            const newSession = {
                id: Date.now(),
                user: user.name,
                role: user.role,
                loginTime: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            const updatedSessions = [newSession, ...sessions.slice(0, 49)];
            helpers.storage.save('recruitpro_login_sessions', updatedSessions);
            
            // Create session for multi-user auth with Remember Me support
const rememberMe = document.getElementById('rememberMe')?.checked || false;
const duration = rememberMe ? (30 * 24 * 60 * 60 * 1000) : (8 * 60 * 60 * 1000); // 30 days or 8 hours

const session = {
    userId: user.id,
    loginTime: new Date().toISOString(),
    expires: Date.now() + duration,
    rememberMe: rememberMe
};
localStorage.setItem('recruitpro_current_session', JSON.stringify(session));

console.log(`✅ Session created for ${rememberMe ? '30 days' : '8 hours'}`);
            
            onLogin(user);
        } else {
            alert('Incorrect password. Please try again.');
            setPassword('');
        }
        
        setIsLoading(false);
    };

    const handleRegister = async () => {
        // Validation
        if (!regData.name || !regData.email || !regData.password) {
            alert('Please fill in all required fields');
            return;
        }

        if (regData.password !== regData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (regData.password.length < 4) {
            alert('Password must be at least 4 characters long');
            return;
        }

        // Check if email already exists
        if (users.find(u => u.email.toLowerCase() === regData.email.toLowerCase())) {
            alert('An account with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            name: regData.name,
            email: regData.email,
            role: regData.role,
            department: regData.department,
            avatar: getInitials(regData.name),
            password: regData.password,
            isOwner: false,
            created: new Date().toISOString(),
            lastLogin: null,
            status: 'active',
            permissions: getDefaultPermissions(regData.role)
        };

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('recruitpro_registered_users', JSON.stringify(updatedUsers));

        alert(`Account created successfully for ${regData.name}! You can now sign in.`);
        
        // Switch to login and select the new user
        setShowRegister(false);
        setSelectedUserId(newUser.id);
        setRegData({ name: '', email: '', role: 'recruiter', department: '', password: '', confirmPassword: '' });
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getDefaultPermissions = (role) => {
        const permissions = {
            admin: { viewAll: true, editAll: true, deleteAll: true, manageUsers: true, manageSettings: true },
            manager: { viewAll: true, editAll: true, deleteAll: false, manageUsers: false, manageSettings: false },
            recruiter: { viewAll: true, editAll: true, deleteAll: false, manageUsers: false, manageSettings: false },
            viewer: { viewAll: true, editAll: false, deleteAll: false, manageUsers: false, manageSettings: false }
        };
        return permissions[role] || permissions.viewer;
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            if (showRegister) {
                handleRegister();
            } else {
                handleLogin();
            }
        }
    };

    const selectedUser = users.find(u => u.id === selectedUserId);

    if (showRegister) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <h1 className="login-title">RecruitPro</h1>
                    <p className="login-subtitle">Create New Account</p>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            className="password-input"
                            placeholder="e.g., Sarah Johnson"
                            value={regData.name}
                            onChange={(e) => setRegData({...regData, name: e.target.value})}
                            style={{ marginBottom: '15px' }}
                        />

                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Email Address *
                        </label>
                        <input
                            type="email"
                            className="password-input"
                            placeholder="sarah@company.com"
                            value={regData.email}
                            onChange={(e) => setRegData({...regData, email: e.target.value})}
                            style={{ marginBottom: '15px' }}
                        />

                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Role *
                        </label>
                        <select
                            className="password-input"
                            value={regData.role}
                            onChange={(e) => setRegData({...regData, role: e.target.value})}
                            style={{ marginBottom: '15px' }}
                        >
                            <option value="recruiter">🎯 Recruiter</option>
                            <option value="manager">👔 Hiring Manager</option>
                            <option value="admin">👑 HR Admin</option>
                            <option value="viewer">👁️ Team Member</option>
                        </select>

                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Department/Company
                        </label>
                        <input
                            type="text"
                            className="password-input"
                            placeholder="e.g., HR Department"
                            value={regData.department}
                            onChange={(e) => setRegData({...regData, department: e.target.value})}
                            style={{ marginBottom: '15px' }}
                        />

                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Password *
                        </label>
                        <input
                            type="password"
                            className="password-input"
                            placeholder="Create a secure password"
                            value={regData.password}
                            onChange={(e) => setRegData({...regData, password: e.target.value})}
                            style={{ marginBottom: '15px' }}
                        />

                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            className="password-input"
                            placeholder="Confirm your password"
                            value={regData.confirmPassword}
                            onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                    
                    <button 
                        className="login-button"
                        onClick={handleRegister}
                        style={{ marginBottom: '10px' }}
                    >
                        Create Account
                    </button>

                    <button 
                        className="login-button"
                        onClick={() => setShowRegister(false)}
                        style={{ background: '#6b7280' }}
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">RecruitPro</h1>
                <p className="login-subtitle">Professional Recruitment CRM</p>
                
                {/* User Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '10px', 
                        fontWeight: '600', 
                        color: 'var(--text-primary)',
                        textAlign: 'center'
                    }}>
                        Select Your Account
                    </label>
                    
                    <div style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        maxHeight: '150px', 
                        overflowY: 'auto' 
                    }}>
                        {users.filter(u => u.status === 'active').map(user => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    background: selectedUserId === user.id ? 'var(--accent-color)' : 'transparent',
                                    color: selectedUserId === user.id ? 'white' : 'var(--text-primary)',
                                    borderBottom: '1px solid var(--border-color)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedUserId !== user.id) {
                                        e.target.style.background = 'var(--input-bg)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedUserId !== user.id) {
                                        e.target.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: selectedUserId === user.id ? 'rgba(255,255,255,0.2)' : 'var(--accent-color)',
                                    color: selectedUserId === user.id ? 'white' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}>
                                    {user.avatar}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        opacity: 0.8,
                                        textTransform: 'capitalize'
                                    }}>
                                        {user.role}
                                        {user.isOwner && ' • Owner'}
                                    </div>
                                </div>
                                {user.isOwner && (
                                    <span style={{
                                        background: selectedUserId === user.id ? 'rgba(255,255,255,0.2)' : '#fecaca',
                                        color: selectedUserId === user.id ? 'white' : '#dc2626',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: '600'
                                    }}>
                                        OWNER
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected User Display */}
                {selectedUser && (
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        <div className="user-avatar" style={{ margin: '0 auto 10px' }}>
                            {selectedUser.avatar}
                        </div>
                        <h3 style={{
                            textAlign: 'center', 
                            marginBottom: '5px', 
                            color: 'var(--text-primary)'
                        }}>
                            {selectedUser.name}
                        </h3>
                        <p style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            textTransform: 'capitalize'
                        }}>
                            {selectedUser.role}{selectedUser.isOwner && ' • System Owner'}
                        </p>
                    </div>
                )}
                
                <input
                    type="password"
                    className="password-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                />

                        {/* Remember Me Checkbox */}
<div style={{
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
}}>
    <input 
        type="checkbox" 
        id="rememberMe" 
        defaultChecked={true}
        style={{
            margin: '0',
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            accentColor: 'var(--accent-color)'
        }}
    />
    <label 
        htmlFor="rememberMe" 
        style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        }}
    >
        <span>Remember me for 30 days</span>
        <span style={{
            fontSize: '12px',
            color: 'var(--text-muted)'
        }}>
            (recommended)
        </span>
    </label>
</div>
                
                <button 
                    className="login-button"
                    onClick={handleLogin}
                    disabled={isLoading || !selectedUserId}
                    style={{ marginBottom: '10px' }}
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>

                <button 
                    className="login-button"
                    onClick={() => setShowRegister(true)}
                    style={{ 
                        background: 'transparent',
                        color: 'var(--accent-color)',
                        border: '2px solid var(--accent-color)'
                    }}
                >
                    Create New Account
                </button>
                
                <div style={{
                    textAlign: 'center',
                    marginTop: '15px',
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                }}>
                    {users.length} registered user{users.length !== 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
};

// Export to global scope
window.LoginComponent = LoginComponent;

// Global helper functions for user attribution
window.getCurrentUser = () => {
    const session = localStorage.getItem('recruitpro_current_session');
    if (session) {
        const sessionData = JSON.parse(session);
        const users = JSON.parse(localStorage.getItem('recruitpro_registered_users') || '[]');
        return users.find(u => u.id === sessionData.userId);
    }
    return null;
};

window.addUserAttribution = (record) => {
    const currentUser = window.getCurrentUser();
    if (!currentUser) return record;
    
    return {
        ...record,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        createdByRole: currentUser.role,
        createdAt: new Date().toISOString()
    };
};

window.updateUserAttribution = (record) => {
    const currentUser = window.getCurrentUser();
    if (!currentUser) return record;
    
    return {
        ...record,
        lastModifiedBy: currentUser.id,
        lastModifiedByName: currentUser.name,
        lastModifiedAt: new Date().toISOString()
    };
};
