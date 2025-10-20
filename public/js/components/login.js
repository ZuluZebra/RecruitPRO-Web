// Login Component
const LoginComponent = ({ onLogin }) => {
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const user = {
        id: 1,
        name: 'Chris van der Merwe',
        email: 'chris@company.com',
        role: 'admin',
        avatar: 'CM',
        password: 'NextGen'
    };

    const handleLogin = async () => {
        setIsLoading(true);
        
        // Simulate login delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (password === user.password) {
            // Record login session
            const sessions = helpers.storage.load('recruitpro_login_sessions') || [];
            const newSession = {
                id: Date.now(),
                user: user.name,
                loginTime: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            const updatedSessions = [newSession, ...sessions.slice(0, 49)];
            helpers.storage.save('recruitpro_login_sessions', updatedSessions);
            
            onLogin(user);
        } else {
            alert('Incorrect password. Please try again.');
            setPassword('');
        }
        
        setIsLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">RecruitPro</h1>
                <p className="login-subtitle">Professional Recruitment CRM</p>
                
                <div className="user-avatar">CM</div>
                <h3 style={{
                    textAlign: 'center', 
                    marginBottom: '20px', 
                    color: 'var(--text-primary)'
                }}>
                    {user.name}
                </h3>
                
                <input
                    type="password"
                    className="password-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                />
                
                <button 
                    className="login-button"
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
                
                <div style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                }}>
                    
                </div>
            </div>
        </div>
    );
};

// Export to global scope
window.LoginComponent = LoginComponent;
