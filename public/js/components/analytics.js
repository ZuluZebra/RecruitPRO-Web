// Enhanced Analytics Component
const AnalyticsComponent = ({ 
    candidates, 
    interviews, 
    projects, 
    loginSessions,
    onViewCandidate 
}) => {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);
    const [selectedMetric, setSelectedMetric] = React.useState('status');

    // Helper function to convert country codes to full names
    const getFullCountryName = (location) => {
        if (!location) return 'Not specified';
        
        const countryMap = {
            'US': 'United States',
            'USA': 'United States',
            'GB': 'United Kingdom',
            'UK': 'United Kingdom',
            'DE': 'Germany',
            'FR': 'France',
            'IT': 'Italy',
            'ES': 'Spain',
            'PT': 'Portugal',
            'NL': 'Netherlands',
            'BE': 'Belgium',
            'SE': 'Sweden',
            'NO': 'Norway',
            'DK': 'Denmark',
            'FI': 'Finland',
            'PL': 'Poland',
            'CH': 'Switzerland',
            'AT': 'Austria',
            'IE': 'Ireland',
            'ZA': 'South Africa',
            'CZ': 'Czech Republic',
            'CA': 'Canada',
            'MX': 'Mexico',
            'BR': 'Brazil',
            'AR': 'Argentina',
            'AU': 'Australia',
            'NZ': 'New Zealand',
            'CN': 'China',
            'JP': 'Japan',
            'KR': 'South Korea',
            'IN': 'India',
            'SG': 'Singapore',
            'MY': 'Malaysia',
            'TH': 'Thailand',
            'AE': 'United Arab Emirates',
            'SA': 'Saudi Arabia',
            'IL': 'Israel',
            'TR': 'Turkey',
            'RU': 'Russia',
            'UA': 'Ukraine'
        };
        
        const locationUpper = location.toUpperCase().trim();
        
        if (countryMap[locationUpper]) {
            return countryMap[locationUpper];
        }
        
        if (location.includes(' ') || location.length > 3) {
            return location;
        }
        
        return location;
    };

    // Calculate dual analytics system
    const stats = React.useMemo(() => {
        const operational = helpers.statsCalculator.calculateOperationalStats(candidates);
        const historical = helpers.statsCalculator.calculateHistoricalStats(candidates);
        
        return {
            // Keep existing properties for backwards compatibility
            total: operational.totalActive,
            diversity: historical.diversityStats,
            ...operational.statusBreakdown,
            ...operational.readinessBreakdown,
            newThisWeek: historical.newThisWeek,
            completedInterviews: interviews.filter(i => i.status === 'completed').length,
            activeProjects: projects.filter(p => p.status !== 'archived').length,
            loginSessions: loginSessions.length,
            
            // Add operational and historical stats
            operational,
            historical,
            
            // Key metrics for display
            hired: operational.currentlyHired,
            totalEverHired: historical.totalEverHired,
            successRate: historical.overallSuccessRate,
            inPipeline: operational.inPipeline,
            ready: operational.readyToHire,
            interviewing: operational.interviewing
        };
    }, [candidates, interviews, projects, loginSessions]);

    // Chart data based on selected metric
    const chartData = React.useMemo(() => {
        switch (selectedMetric) {
            case 'status':
                return helpers.statusConfig.statuses.map(status => ({
                    label: status.label,
                    count: candidates.filter(c => c.status === status.value).length,
                    color: status.color
                }));
            case 'readiness':
                return helpers.statusConfig.readiness.map(readiness => ({
                    label: readiness.label,
                    count: candidates.filter(c => c.readiness === readiness.value).length,
                    color: readiness.color
                }));
            case 'source':
                const sources = {};
                candidates.forEach(c => {
                    const source = c.source || 'Unknown';
                    sources[source] = (sources[source] || 0) + 1;
                });
                return Object.entries(sources).map(([source, count]) => ({
                    label: source,
                    count,
                    color: `hsl(${Math.abs(source.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 70%, 60%)`
                }));
            case 'gender':
                return [
                    { label: 'Male', count: stats.diversity.male || 0, color: '#4299e1' },
                    { label: 'Female', count: stats.diversity.female || 0, color: '#ed8936' },
                    { label: 'Non-binary', count: stats.diversity.non_binary || 0, color: '#9f7aea' },
                    { label: 'Other', count: stats.diversity.other || 0, color: '#48bb78' },
                    { label: 'Not Specified', count: stats.diversity.not_specified || 0, color: '#a0aec0' }
                ].filter(item => item.count > 0);
            default:
                return [];
        }
    }, [selectedMetric, candidates, stats]);

    // Initialize chart
    React.useEffect(() => {
        if (chartRef.current && chartData.length > 0) {
            // Destroy existing chart
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            
            chartInstance.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartData.map(d => d.label),
                    datasets: [{
                        data: chartData.map(d => d.count),
                        backgroundColor: chartData.map(d => d.color),
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);

    // Top performers (ready candidates)
    const topPerformers = React.useMemo(() => {
        return [...candidates]
            .filter(c => c.readiness === 'ready')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);
    }, [candidates]);

    // Recent activity
    const recentActivity = React.useMemo(() => {
        return candidates
            .flatMap(c => (c.timeline || []).map(t => ({...t, candidateName: c.name, candidateId: c.id})))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 15);
    }, [candidates]);

    // Location and Company data
    const locationData = React.useMemo(() => {
        const locations = {};
        candidates.forEach(c => {
            const fullLocationName = getFullCountryName(c.location || 'Not specified');
            locations[fullLocationName] = (locations[fullLocationName] || 0) + 1;
        });
        return Object.entries(locations)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
    }, [candidates]);

    const companyData = React.useMemo(() => {
        const companies = {};
        candidates.forEach(c => {
            const company = c.company || 'Not specified';
            companies[company] = (companies[company] || 0) + 1;
        });
        return Object.entries(companies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
    }, [candidates]);

    // Hiring funnel data
    const funnelData = React.useMemo(() => {
        const funnel = [
            { stage: 'New', count: stats.new, color: '#4299e1' },
            { stage: 'Screening', count: stats.screening, color: '#ed8936' },
            { stage: 'Interviewing', count: stats.interviewing, color: '#9f7aea' },
            { stage: 'Offer', count: stats.offer, color: '#48bb78' },
            { stage: 'Hired', count: stats.hired, color: '#38b2ac' }
        ];
        const maxCount = Math.max(...funnel.map(f => f.count));
        return funnel.map(f => ({...f, percentage: maxCount > 0 ? (f.count / maxCount) * 100 : 0}));
    }, [stats]);

    // Interview completion rate
    const interviewStats = React.useMemo(() => {
        const total = interviews.length;
        const completed = interviews.filter(i => i.status === 'completed').length;
        const scheduled = interviews.filter(i => i.status === 'scheduled').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { total, completed, scheduled, completionRate };
    }, [interviews]);

    return (
        <div>
            {/* Enhanced Statistics Grid - Dual System */}
            <div className="stats-grid">
                {/* Operational Metrics Row */}
                <div style={{ 
                    gridColumn: '1 / -1',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    📊 Current Pipeline (Active Candidates)
                </div>
                
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Active Pipeline</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.inPipeline}</div>
                    <div className="stat-label">In Process</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.ready}</div>
                    <div className="stat-label">Ready to Hire</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.hired}</div>
                    <div className="stat-label">Recently Hired</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.interviewing}</div>
                    <div className="stat-label">Interviewing</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.activeProjects}</div>
                    <div className="stat-label">Active Projects</div>
                </div>
                
                {/* Historical Metrics Row */}
                <div style={{ 
                    gridColumn: '1 / -1',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginTop: '20px',
                    marginBottom: '10px',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    📈 Historical Performance (All Time)
                </div>
                
                <div className="stat-card">
                    <div className="stat-number">{stats.historical.totalEverProcessed}</div>
                    <div className="stat-label">Total Ever Processed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalEverHired}</div>
                    <div className="stat-label">Total Ever Hired</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.successRate}%</div>
                    <div className="stat-label">Overall Success Rate</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.newThisWeek}</div>
                    <div className="stat-label">New This Week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{interviewStats.completionRate}%</div>
                    <div className="stat-label">Interview Completion</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.operational.totalArchived}</div>
                    <div className="stat-label">Archived</div>
                </div>
            </div>

            {/* Main Analytics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '30px',
                marginBottom: '40px'
            }}>
                {/* Interactive Chart */}
                <div className="modern-card">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{
                            color: 'var(--text-primary)',
                            fontSize: '18px',
                            fontWeight: '700'
                        }}>
                            📊 Distribution Analysis
                        </h3>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '14px'
                            }}
                        >
                            <option value="status">By Status</option>
                            <option value="readiness">By Readiness</option>
                            <option value="source">By Source</option>
                            <option value="gender">By Gender</option>
                        </select>
                    </div>
                    
                    <div style={{ height: '350px', position: 'relative' }}>
                        {chartData.length > 0 ? (
                            <canvas ref={chartRef}></canvas>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: 'var(--text-muted)',
                                fontSize: '16px'
                            }}>
                                No data available for selected metric
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Ready Candidates */}
                <div className="modern-card">
                    <h3 style={{
                        color: 'var(--text-primary)',
                        fontSize: '18px',
                        fontWeight: '700',
                        marginBottom: '20px'
                    }}>
                        🌟 Ready Candidates
                    </h3>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {topPerformers.length > 0 ? (
                            topPerformers.map((candidate, index) => (
                                <div key={candidate.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: index < topPerformers.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => onViewCandidate(candidate)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                                    e.currentTarget.style.borderRadius = '8px';
                                    e.currentTarget.style.padding = '12px';
                                    e.currentTarget.style.margin = '0 -12px';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderRadius = '0';
                                    e.currentTarget.style.padding = '12px 0';
                                    e.currentTarget.style.margin = '0';
                                }}>
                                    <div>
                                        <div style={{
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}>
                                            #{index + 1} {candidate.name}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-tertiary)'
                                        }}>
                                            {candidate.job_title} at {candidate.company}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--text-muted)',
                                            marginTop: '2px'
                                        }}>
                                            Added {helpers.formatTimeAgo(candidate.created_at)}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '10px',
                                        textTransform: 'uppercase'
                                    }}>
                                        READY
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic',
                                padding: '40px 20px'
                            }}>
                                No candidates marked as ready yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hiring Funnel Visualization */}
            <div className="modern-card" style={{ marginBottom: '30px' }}>
                <h3 style={{
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '20px'
                }}>
                    🔄 Hiring Funnel
                </h3>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '20px',
                    alignItems: 'end'
                }}>
                    {funnelData.map((stage, index) => (
                        <div key={stage.stage} style={{
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                height: `${Math.max(stage.percentage, 10)}px`,
                                background: stage.color,
                                borderRadius: '8px 8px 0 0',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '16px',
                                minHeight: '40px',
                                transition: 'all 0.3s ease'
                            }}>
                                {stage.count}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                marginBottom: '5px'
                            }}>
                                {stage.stage}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: 'var(--text-tertiary)'
                            }}>
                                {stage.percentage.toFixed(0)}% of max
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Location and Company Analytics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginBottom: '30px'
            }}>
                <div className="modern-card">
                    <h3 style={{
                        color: 'var(--text-primary)',
                        fontSize: '18px',
                        fontWeight: '700',
                        marginBottom: '20px'
                    }}>
                        📍 Candidates by Location
                    </h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {locationData.map(([location, count], index) => (
                            <div key={location} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 0',
                                borderBottom: index < locationData.length - 1 ? '1px solid var(--border-color)' : 'none'
                            }}>
                                <div style={{
                                    fontWeight: '500',
                                    color: 'var(--text-primary)',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '16px' }}>📍</span>
                                    {location}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <div style={{
                                        background: 'var(--border-color)',
                                        borderRadius: '10px',
                                        height: '8px',
                                        width: '100px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            height: '100%',
                                            width: `${(count / Math.max(...locationData.map(([,c]) => c))) * 100}%`,
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        minWidth: '30px',
                                        textAlign: 'center'
                                    }}>
                                        {count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="modern-card">
                    <h3 style={{
                        color: 'var(--text-primary)',
                        fontSize: '18px',
                        fontWeight: '700',
                        marginBottom: '20px'
                    }}>
                        🏢 Candidates by Company
                    </h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {companyData.map(([company, count], index) => (
                            <div key={company} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 0',
                                borderBottom: index < companyData.length - 1 ? '1px solid var(--border-color)' : 'none'
                            }}>
                                <div style={{
                                    fontWeight: '500',
                                    color: 'var(--text-primary)',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '16px' }}>🏢</span>
                                    {company}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <div style={{
                                        background: 'var(--border-color)',
                                        borderRadius: '10px',
                                        height: '8px',
                                        width: '100px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                            height: '100%',
                                            width: `${(count / Math.max(...companyData.map(([,c]) => c))) * 100}%`,
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        minWidth: '30px',
                                        textAlign: 'center'
                                    }}>
                                        {count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interview Analytics */}
            <div className="modern-card" style={{ marginBottom: '30px' }}>
                <h3 style={{
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '20px'
                }}>
                    🎤 Interview Analytics
                </h3>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.05)',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: 'var(--accent-color)',
                            marginBottom: '5px'
                        }}>
                            {interviewStats.total}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                        }}>
                            Total Interviews
                        </div>
                    </div>
                    
                    <div style={{
                        background: 'rgba(72, 187, 120, 0.05)',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(72, 187, 120, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#48bb78',
                            marginBottom: '5px'
                        }}>
                            {interviewStats.completed}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                        }}>
                            Completed
                        </div>
                    </div>
                    
                    <div style={{
                        background: 'rgba(237, 137, 54, 0.05)',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(237, 137, 54, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#ed8936',
                            marginBottom: '5px'
                        }}>
                            {interviewStats.scheduled}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                        }}>
                            Scheduled
                        </div>
                    </div>
                    
                    <div style={{
                        background: 'rgba(159, 122, 234, 0.05)',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(159, 122, 234, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#9f7aea',
                            marginBottom: '5px'
                        }}>
                            {interviewStats.completionRate}%
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                        }}>
                            Completion Rate
                        </div>
                    </div>
                </div>

                {/* Completion Rate Progress Bar */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)'
                        }}>
                            Interview Completion Progress
                        </span>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: 'var(--text-primary)'
                        }}>
                            {interviewStats.completed}/{interviewStats.total}
                        </span>
                    </div>
                    <div style={{
                        background: 'var(--border-color)',
                        borderRadius: '10px',
                        height: '12px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
                            height: '100%',
                            width: `${interviewStats.completionRate}%`,
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="modern-card">
                <h3 style={{
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '20px'
                }}>
                    📈 Recent Activity Timeline
                </h3>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                            <div key={`${activity.candidateId}-${activity.id}-${index}`} 
                                 className="timeline-item" 
                                 style={{
                                     marginBottom: '15px',
                                     padding: '15px',
                                     background: 'var(--card-bg)',
                                     borderRadius: '8px',
                                     borderLeft: '4px solid var(--accent-color)',
                                     cursor: 'pointer',
                                     transition: 'all 0.3s ease'
                                 }}
                                 onClick={() => {
                                     const candidate = candidates.find(c => c.id === activity.candidateId);
                                     if (candidate) onViewCandidate(candidate);
                                 }}
                                 onMouseEnter={(e) => {
                                     e.currentTarget.style.transform = 'translateX(4px)';
                                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                 }}
                                 onMouseLeave={(e) => {
                                     e.currentTarget.style.transform = 'translateX(0)';
                                     e.currentTarget.style.boxShadow = 'none';
                                 }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '12px',
                                        flexShrink: 0
                                    }}>
                                        {activity.type === 'created' ? '✨' : 
                                         activity.type === 'comment' ? '💬' :
                                         activity.type === 'status' ? '🔄' :
                                         activity.type === 'readiness' ? '📊' :
                                         activity.type === 'interview' ? '🎤' : '📝'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '5px'
                                        }}>
                                            <div style={{
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {activity.action} - {activity.candidateName}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                color: 'var(--accent-color)',
                                                fontWeight: '500'
                                            }}>
                                                {helpers.formatTimeAgo(activity.timestamp)}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '3px',
                                            lineHeight: '1.4'
                                        }}>
                                            {activity.description}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--text-tertiary)'
                                        }}>
                                            by {activity.user}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            padding: '40px'
                        }}>
                            No recent activity
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Export to global scope
window.AnalyticsComponent = AnalyticsComponent;
