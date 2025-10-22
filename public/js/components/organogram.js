// REPLACE THESE TWO IMPORT LINES:
// import React, { useState, useRef, useCallback } from 'react';
// import { Users, Download, Plus, Edit3, AlertTriangle, Target, Filter, Search, Trash2, Upload, Save, Eye, Camera, BarChart3, Layout, PieChart } from 'lucide-react';

// WITH THIS:
const { useState, useRef, useCallback } = React;

// Simple icon components using emojis
const Users = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '👥');
const Download = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '📥');
const Plus = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '➕');
const Edit3 = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '✏️');
const AlertTriangle = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '⚠️');
const Target = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '🎯');
const Filter = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '🔍');
const Search = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '🔍');
const Trash2 = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '🗑️');
const Upload = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '📤');
const Save = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '💾');
const Eye = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '👁️');
const Camera = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '📷');
const BarChart3 = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '📊');
const Layout = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '📐');
const PieChart = ({ size = 24, ...props }) => React.createElement('span', { ...props, style: { fontSize: `${size}px`, ...props.style } }, '🥧');



const InteractiveOrganogram = () => {
    // Corporate hierarchy levels - only the 4 specified levels
    const corporateLevels = {
        'T5': { label: 'T5 - Senior Leader', numericValue: 4, color: '#9ca3af' },
        'EL': { label: 'EL - Executive Leader', numericValue: 3, color: '#6b7280' },
        'SEL': { label: 'SEL - Senior Executive Leader', numericValue: 2, color: '#374151' },
        'GEL': { label: 'GEL - Global Executive Leader', numericValue: 1, color: '#1f2937' }
    };
    const boardAreas = [
        'CEO / Strategy & Transformation',
        'Product & Technology', 
        'Customer Success / Sales & Services',
        'Finance & Administration (CFO)',
        'Human Resources / People & Culture (CHRO)',
        'Cloud Delivery & Operations',
        'Industries & Customer Advisory',
        'Regional / Market Units'
    ];

    // Regional structure
    const regions = {
        'EMEA': {
            name: 'Europe, Middle East & Africa',
            countries: [
                'UK & Ireland', 'France', 'Belgium, Netherlands, Luxembourg', 'Nordics',
                'Spain & Portugal', 'Italy', 'Turkey', 'Middle East', 'Africa',
                'Germany, Austria, Switzerland', 'Poland, Czech Republic, Slovakia, Hungary',
                'Southeastern Europe', 'CIS countries', 'Israel'
            ]
        },
        'APJ': {
            name: 'Asia Pacific & Japan',
            countries: [
                'Japan', 'Mainland China', 'Hong Kong', 'Taiwan', 'India', 'Sri Lanka',
                'Bangladesh', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia',
                'Philippines', 'Vietnam', 'Australia', 'New Zealand', 'South Korea'
            ]
        },
        'Americas': {
            name: 'North & South America',
            countries: [
                'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile',
                'Colombia', 'Peru', 'Costa Rica', 'Other Latin America'
            ]
        }
    };

// Analytics Dashboard Component
const AnalyticsDashboard = ({ data, boardArea, onClose }) => {
    const analytics = React.useMemo(() => {
        const totalPeople = data.length;
        const successorCoverage = data.filter(p => p.successors.length > 0).length / totalPeople * 100;
        const averageReadiness = data.reduce((sum, person) => {
            const readinessScores = person.successors.map(s => {
                switch(s.readiness) {
                    case '0-3 months': return 100;
                    case '3-6 months': return 85;
                    case '6-12 months': return 70;
                    case '12-24 months': return 50;
                    case '24+ months': return 25;
                    default: return 50;
                }
            });
            return sum + (readinessScores.length > 0 ? Math.max(...readinessScores) : 0);
        }, 0) / totalPeople;

        const riskDistribution = {
            critical: data.filter(p => p.riskLevel === 'critical').length,
            high: data.filter(p => p.riskLevel === 'high').length,
            medium: data.filter(p => p.riskLevel === 'medium').length,
            low: data.filter(p => p.riskLevel === 'low').length
        };

        const regionBreakdown = {};
        data.forEach(person => {
            regionBreakdown[person.region] = (regionBreakdown[person.region] || 0) + 1;
        });

        const successorTypes = {
            internal: data.reduce((sum, p) => sum + p.successors.filter(s => s.type === 'internal').length, 0),
            external: data.reduce((sum, p) => sum + p.successors.filter(s => s.type === 'external').length, 0)
        };

        return {
            totalPeople,
            successorCoverage,
            averageReadiness,
            riskDistribution,
            regionBreakdown,
            successorTypes,
            healthScore: Math.round((successorCoverage + averageReadiness) / 2),
            criticalGaps: data.filter(p => p.successors.length === 0 && ['critical', 'high'].includes(p.riskLevel))
        };
    }, [data]);

    const getHealthColor = (score) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '90vw',
            maxWidth: '1200px',
            height: '85vh',
            overflow: 'auto'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BarChart3 size={32} />
                    Analytics Dashboard - {boardArea}
                </h2>
                <button onClick={onClose} style={{
                    background: '#e5e7eb',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer'
                }}>
                    ✕
                </button>
            </div>

            {/* Key Metrics Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '16px',
                    padding: '24px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {analytics.totalPeople}
                    </div>
                    <div>Total People</div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    borderRadius: '16px',
                    padding: '24px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {analytics.successorCoverage.toFixed(0)}%
                    </div>
                    <div>Succession Coverage</div>
                </div>

                <div style={{
                    background: `linear-gradient(135deg, ${getHealthColor(analytics.healthScore)}, ${getHealthColor(analytics.healthScore)}dd)`,
                    borderRadius: '16px',
                    padding: '24px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {analytics.healthScore}
                    </div>
                    <div>Health Score</div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #ec4899, #f97316)',
                    borderRadius: '16px',
                    padding: '24px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {analytics.criticalGaps.length}
                    </div>
                    <div>Critical Gaps</div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                {/* Risk Distribution */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '24px'
                }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '600' }}>Risk Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(analytics.riskDistribution).map(([level, count]) => {
                            const colors = { critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
                            const percentage = (count / analytics.totalPeople * 100).toFixed(1);
                            return (
                                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ minWidth: '80px', fontWeight: '600', textTransform: 'capitalize' }}>
                                        {level}:
                                    </div>
                                    <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', height: '20px', position: 'relative' }}>
                                        <div style={{
                                            background: colors[level],
                                            height: '100%',
                                            borderRadius: '8px',
                                            width: `${percentage}%`
                                        }} />
                                    </div>
                                    <div style={{ minWidth: '60px', fontSize: '14px', fontWeight: '600' }}>
                                        {count} ({percentage}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Region Breakdown */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '24px'
                }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '600' }}>Regional Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(analytics.regionBreakdown).map(([region, count]) => {
                            const percentage = (count / analytics.totalPeople * 100).toFixed(1);
                            return (
                                <div key={region} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ minWidth: '80px', fontWeight: '600' }}>
                                        {region}:
                                    </div>
                                    <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', height: '20px', position: 'relative' }}>
                                        <div style={{
                                            background: '#667eea',
                                            height: '100%',
                                            borderRadius: '8px',
                                            width: `${percentage}%`
                                        }} />
                                    </div>
                                    <div style={{ minWidth: '60px', fontSize: '14px', fontWeight: '600' }}>
                                        {count} ({percentage}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Succession Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Successor Types */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '24px'
                }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '600' }}>Successor Types</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                👥 Internal Candidates
                            </span>
                            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                                {analytics.successorTypes.internal}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🌟 External Hires
                            </span>
                            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                                {analytics.successorTypes.external}
                            </span>
                        </div>
                        <div style={{ marginTop: '16px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Internal/External Ratio: {
                                    analytics.successorTypes.internal && analytics.successorTypes.external
                                        ? `${(analytics.successorTypes.internal / (analytics.successorTypes.internal + analytics.successorTypes.external) * 100).toFixed(0)}% / ${(analytics.successorTypes.external / (analytics.successorTypes.internal + analytics.successorTypes.external) * 100).toFixed(0)}%`
                                        : 'No data'
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Critical Gaps */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '24px'
                }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '600' }}>
                        Critical Succession Gaps ({analytics.criticalGaps.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflow: 'auto' }}>
                        {analytics.criticalGaps.length > 0 ? analytics.criticalGaps.map(person => (
                            <div key={person.id} style={{
                                padding: '12px',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                background: '#fef2f2'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                    {person.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    {person.title} • {person.region}
                                </div>
                                <div style={{
                                    marginTop: '6px',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: '#dc2626',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    display: 'inline-block'
                                }}>
                                    {person.riskLevel.toUpperCase()} RISK
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                                No critical succession gaps identified
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Template Modal Component
const TemplateModal = ({ templates, onApply, onClose }) => {
    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '800px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Layout size={28} />
                    Company Structure Templates
                </h3>
                <button onClick={onClose} style={{
                    background: '#e5e7eb',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer'
                }}>
                    ✕
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {Object.entries(templates).map(([key, template]) => (
                    <div key={key} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '16px',
                        padding: '24px',
                        background: 'rgba(255,255,255,0.9)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'}
                    onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <h4 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600' }}>
                            {template.name}
                        </h4>
                        <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '14px' }}>
                            {template.description}
                        </p>
                        <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                            <div style={{ marginBottom: '8px' }}>
                                📊 <strong>{template.structure.length}</strong> positions
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                🏢 <strong>{[...new Set(template.structure.map(p => p.level))].join(', ')}</strong> levels (GEL to T5)
                            </div>
                            <div>
                                👥 <strong>{template.structure.reduce((sum, p) => sum + p.teamSize, 0)}</strong> total team members
                            </div>
                        </div>
                        <button
                            onClick={() => onApply(key)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Apply Template
                        </button>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#6b7280'
            }}>
                💡 <strong>Note:</strong> Applying a template will replace the current organizational structure for this board area. 
                You can then customize names, roles, and add your own succession planning data.
            </div>
        </div>
    );
};

    // Company Templates
    const orgTemplates = {
        'startup': {
            name: '🚀 Startup (Flat)',
            description: 'Small company with flat structure',
            structure: [
                { name: 'CEO', title: 'Chief Executive Officer', level: 'GEL', teamSize: 15, region: 'Global', country: 'Global', riskLevel: 'medium', reportsTo: null, position: { x: 400, y: 50 } },
                { name: 'CTO', title: 'Chief Technology Officer', level: 'SEL', teamSize: 8, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: 'CEO', position: { x: 200, y: 200 } },
                { name: 'VP Sales', title: 'VP Sales & Marketing', level: 'SEL', teamSize: 5, region: 'Global', country: 'Global', riskLevel: 'high', reportsTo: 'CEO', position: { x: 600, y: 200 } },
                { name: 'VP Operations', title: 'VP Operations', level: 'SEL', teamSize: 4, region: 'Global', country: 'Global', riskLevel: 'medium', reportsTo: 'CEO', position: { x: 400, y: 200 } }
            ]
        },
        'medium': {
            name: '🏢 Medium Company',
            description: 'Functional departments with clear hierarchy',
            structure: [
                { name: 'CEO', title: 'Chief Executive Officer', level: 'GEL', teamSize: 120, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: null, position: { x: 400, y: 50 } },
                { name: 'CTO', title: 'Chief Technology Officer', level: 'GEL', teamSize: 45, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: 'CEO', position: { x: 150, y: 200 } },
                { name: 'VP Sales', title: 'VP Sales', level: 'SEL', teamSize: 25, region: 'Global', country: 'Global', riskLevel: 'medium', reportsTo: 'CEO', position: { x: 350, y: 200 } },
                { name: 'VP Marketing', title: 'VP Marketing', level: 'SEL', teamSize: 15, region: 'Global', country: 'Global', riskLevel: 'high', reportsTo: 'CEO', position: { x: 550, y: 200 } },
                { name: 'CFO', title: 'Chief Financial Officer', level: 'GEL', teamSize: 12, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: 'CEO', position: { x: 750, y: 200 } },
                { name: 'Engineering Manager', title: 'Engineering Manager', level: 'EL', teamSize: 20, region: 'Global', country: 'Global', riskLevel: 'medium', reportsTo: 'CTO', position: { x: 100, y: 350 } },
                { name: 'Product Manager', title: 'Product Manager', level: 'EL', teamSize: 8, region: 'Global', country: 'Global', riskLevel: 'high', reportsTo: 'CTO', position: { x: 200, y: 350 } },
                { name: 'Senior Engineer', title: 'Senior Software Engineer', level: 'T5', teamSize: 0, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: 'Engineering Manager', position: { x: 50, y: 500 } },
                { name: 'Lead Designer', title: 'Lead Product Designer', level: 'T5', teamSize: 3, region: 'Global', country: 'Global', riskLevel: 'medium', reportsTo: 'Product Manager', position: { x: 250, y: 500 } }
            ]
        },
        'enterprise': {
            name: '🏛️ Enterprise',
            description: 'Large organization with matrix structure',
            structure: [
                { name: 'CEO', title: 'Chief Executive Officer', level: 'GEL', teamSize: 500, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: null, position: { x: 500, y: 50 } },
                { name: 'CTO', title: 'Chief Technology Officer', level: 'GEL', teamSize: 150, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: 'CEO', position: { x: 200, y: 200 } },
                { name: 'CCO', title: 'Chief Customer Officer', level: 'GEL', teamSize: 180, region: 'Global', country: 'Global', riskLevel: 'medium', reportsTo: 'CEO', position: { x: 500, y: 200 } },
                { name: 'CFO', title: 'Chief Financial Officer', level: 'GEL', teamSize: 80, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: 'CEO', position: { x: 800, y: 200 } },
                { name: 'CHRO', title: 'Chief HR Officer', level: 'GEL', teamSize: 45, region: 'Global', country: 'Global', riskLevel: 'high', reportsTo: 'CEO', position: { x: 350, y: 200 } },
                { name: 'VP Engineering EMEA', title: 'VP Engineering EMEA', level: 'SEL', teamSize: 60, region: 'EMEA', country: 'United Kingdom', riskLevel: 'medium', reportsTo: 'CTO', position: { x: 100, y: 350 } },
                { name: 'VP Engineering APJ', title: 'VP Engineering APJ', level: 'SEL', teamSize: 45, region: 'APJ', country: 'Japan', riskLevel: 'high', reportsTo: 'CTO', position: { x: 300, y: 350 } },
                { name: 'VP Sales EMEA', title: 'VP Sales EMEA', level: 'SEL', teamSize: 80, region: 'EMEA', country: 'Germany', riskLevel: 'low', reportsTo: 'CCO', position: { x: 450, y: 350 } },
                { name: 'VP Sales APJ', title: 'VP Sales APJ', level: 'SEL', teamSize: 65, region: 'APJ', country: 'Singapore', riskLevel: 'medium', reportsTo: 'CCO', position: { x: 650, y: 350 } },
                { name: 'Engineering Director EMEA', title: 'Engineering Director EMEA', level: 'EL', teamSize: 25, region: 'EMEA', country: 'United Kingdom', riskLevel: 'low', reportsTo: 'VP Engineering EMEA', position: { x: 50, y: 500 } },
                { name: 'Sales Director EMEA', title: 'Sales Director EMEA', level: 'EL', teamSize: 30, region: 'EMEA', country: 'Germany', riskLevel: 'medium', reportsTo: 'VP Sales EMEA', position: { x: 400, y: 500 } },
                { name: 'Senior Solution Architect', title: 'Senior Solution Architect', level: 'T5', teamSize: 5, region: 'EMEA', country: 'United Kingdom', riskLevel: 'high', reportsTo: 'Engineering Director EMEA', position: { x: 25, y: 650 } },
                { name: 'Senior Account Executive', title: 'Senior Account Executive', level: 'T5', teamSize: 0, region: 'EMEA', country: 'Germany', riskLevel: 'low', reportsTo: 'Sales Director EMEA', position: { x: 425, y: 650 } }
            ]
        },
        'regional': {
            name: '🌍 Regional Focus',
            description: 'Geographic-based organization',
            structure: [
                { name: 'Global CEO', title: 'Global Chief Executive Officer', level: 'GEL', teamSize: 350, region: 'Global', country: 'Global', riskLevel: 'low', reportsTo: null, position: { x: 500, y: 50 } },
                { name: 'EMEA President', title: 'President EMEA', level: 'SEL', teamSize: 150, region: 'EMEA', country: 'United Kingdom', riskLevel: 'medium', reportsTo: 'Global CEO', position: { x: 250, y: 200 } },
                { name: 'APJ President', title: 'President APJ', level: 'SEL', teamSize: 120, region: 'APJ', country: 'Singapore', riskLevel: 'low', reportsTo: 'Global CEO', position: { x: 500, y: 200 } },
                { name: 'Americas President', title: 'President Americas', level: 'SEL', teamSize: 180, region: 'Americas', country: 'United States', riskLevel: 'high', reportsTo: 'Global CEO', position: { x: 750, y: 200 } },
                { name: 'UK/Ireland GM', title: 'General Manager UK/Ireland', level: 'EL', teamSize: 45, region: 'EMEA', country: 'UK & Ireland', riskLevel: 'medium', reportsTo: 'EMEA President', position: { x: 150, y: 350 } },
                { name: 'Germany GM', title: 'General Manager Germany', level: 'EL', teamSize: 60, region: 'EMEA', country: 'Germany, Austria, Switzerland', riskLevel: 'low', reportsTo: 'EMEA President', position: { x: 350, y: 350 } },
                { name: 'UK Regional Lead', title: 'Regional Sales Lead UK', level: 'T5', teamSize: 12, region: 'EMEA', country: 'UK & Ireland', riskLevel: 'low', reportsTo: 'UK/Ireland GM', position: { x: 100, y: 500 } },
                { name: 'Germany Regional Lead', title: 'Regional Sales Lead Germany', level: 'T5', teamSize: 15, region: 'EMEA', country: 'Germany, Austria, Switzerland', riskLevel: 'medium', reportsTo: 'Germany GM', position: { x: 400, y: 500 } }
            ]
        }
    };

// Edit Person Modal Component
const EditPersonModal = ({ person, onSave, onCancel, regions, existingPeople }) => {
    // Corporate hierarchy levels (redefining here for this component)
    const corporateLevels = {
        'T5': { label: 'T5 - Senior Leader', numericValue: 4, color: '#9ca3af' },
        'EL': { label: 'EL - Executive Leader', numericValue: 3, color: '#6b7280' },
        'SEL': { label: 'SEL - Senior Executive Leader', numericValue: 2, color: '#374151' },
        'GEL': { label: 'GEL - Global Executive Leader', numericValue: 1, color: '#1f2937' }
    };

    const [formData, setFormData] = useState({
        name: person.name,
        title: person.title,
        level: person.level,
        region: person.region,
        country: person.country,
        reportsTo: person.reportsTo || '',
        teamSize: person.teamSize,
        riskLevel: person.riskLevel
    });

    // Debug: log the regions to ensure they're being passed
    React.useEffect(() => {
        console.log('EditPersonModal regions:', regions);
        console.log('Current formData.region:', formData.region);
        console.log('Available countries for region:', regions[formData.region]?.countries);
    }, [regions, formData.region]);

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '700' }}>
                Edit Person Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Job Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Corporate Level</label>
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            {Object.entries(corporateLevels).map(([key, level]) => (
                                <option key={key} value={key}>{level.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Team Size</label>
                        <input
                            type="number"
                            value={formData.teamSize}
                            onChange={(e) => setFormData({...formData, teamSize: parseInt(e.target.value) || 0})}
                            min="0"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Region</label>
                        <select
                            value={formData.region}
                            onChange={(e) => setFormData({...formData, region: e.target.value, country: ''})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            {Object.entries(regions).map(([key, region]) => (
                                <option key={key} value={key}>{key} - {region.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Country ({regions[formData.region]?.countries?.length || 0} available)
                        </label>
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: !regions[formData.region]?.countries ? '#f9fafb' : 'white'
                            }}
                        >
                            <option value="">Select Country</option>
                            {regions[formData.region]?.countries?.map(country => (
                                <option key={country} value={country}>{country}</option>
                            )) || []}
                        </select>
                        {/* Debug info */}
                        {!regions[formData.region]?.countries && (
                            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px' }}>
                                No countries found for region: {formData.region}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Reports To</label>
                        <select
                            value={formData.reportsTo}
                            onChange={(e) => setFormData({...formData, reportsTo: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">No Manager</option>
                            {existingPeople.filter(p => p.id !== person.id).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            🎯 Risk Level
                        </label>
                        <select
                            value={formData.riskLevel}
                            onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="low">🟢 Low Risk</option>
                            <option value="medium">🟡 Medium Risk</option>
                            <option value="high">🟠 High Risk</option>
                            <option value="critical">🔴 Critical Risk</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                        onClick={handleSubmit}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: '#e5e7eb',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#374151',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Successor Modal Component
const SuccessorModal = ({ person, editingData, existingPeople, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: editingData?.successor?.name || '',
        type: editingData?.successor?.type || 'internal',
        priority: editingData?.successor?.priority || 'medium',
        readiness: editingData?.successor?.readiness || '12-24 months',
        currentRole: editingData?.successor?.currentRole || '',
        notes: editingData?.successor?.notes || ''
    });

    const [availableInternal, setAvailableInternal] = useState([]);

    React.useEffect(() => {
        // Filter out people who are already successors for this person
        const currentSuccessors = person.successors.map(s => s.name);
        const available = existingPeople.filter(p => 
            p.id !== person.id && !currentSuccessors.includes(p.name)
        );
        setAvailableInternal(available);
    }, [existingPeople, person]);

    const handleSubmit = () => {
        if (formData.name) {
            onSave(formData);
        }
    };

    const isEditing = !!editingData;

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '700' }}>
                {isEditing ? 'Edit Successor' : 'Add Successor'} for {person.name}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Successor Type
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="successorType"
                                value="internal"
                                checked={formData.type === 'internal'}
                                onChange={(e) => setFormData({...formData, type: e.target.value, name: ''})}
                                style={{ accentColor: '#667eea' }}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                👥 Internal Candidate
                            </span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="successorType"
                                value="external"
                                checked={formData.type === 'external'}
                                onChange={(e) => setFormData({...formData, type: e.target.value, name: ''})}
                                style={{ accentColor: '#667eea' }}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🌟 External Hire
                            </span>
                        </label>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        {formData.type === 'internal' ? 'Select Internal Person' : 'External Candidate Name'}
                    </label>
                    {formData.type === 'internal' ? (
                        <select
                            value={formData.name}
                            onChange={(e) => {
                                const selectedPerson = availableInternal.find(p => p.name === e.target.value);
                                setFormData({
                                    ...formData, 
                                    name: e.target.value,
                                    currentRole: selectedPerson ? selectedPerson.title : ''
                                });
                            }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select person...</option>
                            {availableInternal.map(p => (
                                <option key={p.id} value={p.name}>
                                    {p.name} - {p.title}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Enter candidate name"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    )}
                </div>

                {formData.type === 'external' && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Current Role/Company
                        </label>
                        <input
                            type="text"
                            value={formData.currentRole}
                            onChange={(e) => setFormData({...formData, currentRole: e.target.value})}
                            placeholder="e.g. VP Sales at Company XYZ"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Readiness</label>
                        <select
                            value={formData.readiness}
                            onChange={(e) => setFormData({...formData, readiness: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="0-3 months">⚡ 0-3 months</option>
                            <option value="3-6 months">🚀 3-6 months</option>
                            <option value="6-12 months">📈 6-12 months</option>
                            <option value="12-24 months">🎯 12-24 months</option>
                            <option value="24+ months">📚 24+ months</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Notes (optional)
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Development needs, strengths, considerations..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.name}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: formData.name 
                                ? 'linear-gradient(135deg, #4facfe, #00f2fe)' 
                                : '#d1d5db',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: formData.name ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isEditing ? 'Save Changes' : 'Add Successor'}
                    </button>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: '#e5e7eb',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#374151',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

    // Risk levels with colors
    const riskLevels = {
        'low': { color: '#22c55e', label: 'Low Risk' },
        'medium': { color: '#f59e0b', label: 'Medium Risk' },
        'high': { color: '#ef4444', label: 'High Risk' },
        'critical': { color: '#dc2626', label: 'Critical Risk' }
    };

    // State management
    const [activeBoard, setActiveBoard] = useState('Customer Success / Sales & Services');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccessionOnly, setShowSuccessionOnly] = useState(false);

    // Sample organizational data with corporate levels - with better localStorage handling
    const [orgData, setOrgData] = useState(() => {
        // First check localStorage availability and space
        try {
            const testKey = 'storage_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
        } catch (error) {
            console.warn('⚠️ localStorage not available:', error.message);
            // Continue with default data but don't try to save to localStorage
            return getDefaultOrgData();
        }

        // Try to load from localStorage
        try {
            const savedData = localStorage.getItem('recruitpro_organogram_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                console.log('✅ Organogram data loaded from localStorage');
                return parsedData;
            }
        } catch (error) {
            console.error('Error loading organogram data from localStorage:', error);
            // Clear corrupted data
            try {
                localStorage.removeItem('recruitpro_organogram_data');
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        
        // Return default data without trying to save yet
        console.log('📝 Using default organogram data');
        return getDefaultOrgData();
    });

    // Helper function to get default data
    function getDefaultOrgData() {
        return {
            'Customer Success / Sales & Services': [
                {
                    id: 'cs-001',
                    name: 'Sarah Mitchell',
                    title: 'Chief Customer Officer',
                    level: 'GEL',
                    region: 'Global',
                    country: 'Global',
                    reportsTo: null,
                    teamSize: 450,
                    riskLevel: 'low',
                    photo: null,
                    successors: [
                        { name: 'David Chen', priority: 'high', readiness: '6-12 months', type: 'internal' },
                        { name: 'Maria Rodriguez', priority: 'medium', readiness: '12-24 months', type: 'external' }
                    ],
                    position: { x: 400, y: 50 }
                },
                {
                    id: 'cs-002', 
                    name: 'David Chen',
                    title: 'VP Customer Success EMEA',
                    level: 'SEL',
                    region: 'EMEA',
                    country: 'United Kingdom',
                    reportsTo: 'cs-001',
                    teamSize: 120,
                    riskLevel: 'medium',
                    photo: null,
                    successors: [
                        { name: 'Emma Thompson', priority: 'high', readiness: '3-6 months', type: 'internal' }
                    ],
                    position: { x: 200, y: 200 }
                },
                {
                    id: 'cs-003',
                    name: 'Hiroshi Tanaka', 
                    title: 'VP Customer Success APJ',
                    level: 'SEL',
                    region: 'APJ',
                    country: 'Japan',
                    reportsTo: 'cs-001',
                    teamSize: 95,
                    riskLevel: 'high',
                    photo: null,
                    successors: [],
                    position: { x: 600, y: 200 }
                }
            ]
        };
    }

    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showAddPersonModal, setShowAddPersonModal] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSuccessorModal, setShowSuccessorModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showDataMenu, setShowDataMenu] = useState(false);
    const [hoveredPerson, setHoveredPerson] = useState(null);           // ADD THIS
const [highlightedChain, setHighlightedChain] = useState(new Set()); // ADD THIS
    
    // Zoom and navigation state
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [viewMode, setViewMode] = useState('auto'); // auto, manual, compact, hierarchical
    const [collapsedNodes, setCollapsedNodes] = useState(new Set());
    const [layoutGenerated, setLayoutGenerated] = useState(false);
    
    // Mouse panning state
    const [isPanning, setIsPanning] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
    const dragRef = useRef(null);
    const [draggedPerson, setDraggedPerson] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Auto-layout algorithm - hierarchical positioning with better spacing
    const generateAutoLayout = useCallback(() => {
        const data = getCurrentBoardData();
        if (data.length === 0) return;
    
        const LEVEL_HEIGHT = 250;
        const PERSON_WIDTH = 200;
        const MIN_SPACING = 60;
        const TEAM_SPACING = 120; // Extra space between different teams
        const MARGIN_LEFT = 150;
    
        // Find root nodes (no manager)
        const roots = data.filter(person => !person.reportsTo);
        
        // Build complete hierarchy tree
        const buildTeamTree = (manager) => {
            const directReports = data.filter(p => p.reportsTo === manager.id);
            return {
                person: manager,
                children: directReports.map(report => buildTeamTree(report)),
                width: 0, // Will be calculated
                x: 0      // Will be calculated
            };
        };
    
        // Calculate subtree width (how much horizontal space this person + their team needs)
        const calculateSubtreeWidth = (node) => {
            if (node.children.length === 0) {
                node.width = PERSON_WIDTH;
                return PERSON_WIDTH;
            }
    
            // Calculate total width needed for all children
            const childrenWidth = node.children.reduce((total, child) => {
                return total + calculateSubtreeWidth(child);
            }, 0);
            
            // Add spacing between children
            const spacingWidth = (node.children.length - 1) * MIN_SPACING;
            const totalChildrenWidth = childrenWidth + spacingWidth;
            
            // This node needs at least enough space for its children, or its own width
            node.width = Math.max(PERSON_WIDTH, totalChildrenWidth);
            return node.width;
        };
    
        // Position nodes in the tree
        const positionNodes = (node, level, startX) => {
            const nodeX = startX + (node.width - PERSON_WIDTH) / 2; // Center the person in their allocated space
            const nodeY = 80 + level * LEVEL_HEIGHT;
    
            // Set position for this person
            const personIndex = data.findIndex(p => p.id === node.person.id);
            if (personIndex >= 0) {
                const newOrgData = { ...orgData };
                const boardData = newOrgData[activeBoard];
                const boardPersonIndex = boardData.findIndex(p => p.id === node.person.id);
                
                if (boardPersonIndex >= 0) {
                    boardData[boardPersonIndex] = {
                        ...boardData[boardPersonIndex],
                        position: { x: nodeX, y: nodeY }
                    };
                    setOrgData(newOrgData);
                }
            }
    
            // Position children
            if (node.children.length > 0) {
                let childX = startX;
                node.children.forEach(child => {
                    positionNodes(child, level + 1, childX);
                    childX += child.width + MIN_SPACING;
                });
            }
        };
    
        // Create trees for each root and calculate their widths
        const trees = roots.map(root => buildTeamTree(root));
        trees.forEach(tree => calculateSubtreeWidth(tree));
    
        // Position each tree with proper spacing between different top-level teams
        let currentX = MARGIN_LEFT;
        trees.forEach((tree, index) => {
            positionNodes(tree, 0, currentX);
            currentX += tree.width + (index < trees.length - 1 ? TEAM_SPACING : 0);
        });
    
        setHasUserChanges(true);
        setLayoutGenerated(true);
        
        // Auto-fit to screen after layout generation
        setTimeout(() => {
            handleFitToScreen();
        }, 100);
    }, [activeBoard, selectedRegion, selectedCountry, searchTerm, showSuccessionOnly, orgData]);

    // Function to find entire reporting chain
    const getReportingChain = useCallback((personId) => {
        const chain = new Set();
        const data = getCurrentBoardData();
        
        // Find all people who report up to this person (going up)
        let current = data.find(p => p.id === personId);
        while (current) {
            chain.add(current.id);
            current = data.find(p => p.id === current.reportsTo);
        }
        
        // Find all people who report down from this person (going down)
        const addDownwardReports = (managerId) => {
            const reports = data.filter(p => p.reportsTo === managerId);
            reports.forEach(person => {
                chain.add(person.id);
                addDownwardReports(person.id);
            });
        };
        addDownwardReports(personId);
        
        return chain;
    }, [activeBoard, orgData]);

    // Zoom functions
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev * 1.2, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
    };

    const handleResetView = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        setIsPanning(false);
    };

    const handleFitToScreen = () => {
        const data = getCurrentBoardData();
        if (data.length === 0) return;

        const positions = data.map(p => p.position);
        const minX = Math.min(...positions.map(p => p.x)) - 50;
        const maxX = Math.max(...positions.map(p => p.x)) + 250;
        const minY = Math.min(...positions.map(p => p.y)) - 50;
        const maxY = Math.max(...positions.map(p => p.y)) + 150;

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const containerWidth = window.innerWidth - 400; // Account for sidebar
        const containerHeight = window.innerHeight - 200; // Account for header

        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        const optimalScale = Math.min(scaleX, scaleY, 1);

        setZoomLevel(optimalScale);
        setPanOffset({
            x: (containerWidth - contentWidth * optimalScale) / 2,
            y: (containerHeight - contentHeight * optimalScale) / 2
        });
    };

    // Toggle full-screen mode
const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
};

// Handle ESC key to exit full-screen
React.useEffect(() => {
    const handleEscKey = (e) => {
        if (e.key === 'Escape' && isFullScreen) {
            setIsFullScreen(false);
        }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
}, [isFullScreen]);

    // Mouse panning handlers
    const handleCanvasMouseDown = useCallback((e) => {
        // Only start panning if clicking on the canvas background (not on a person card)
        if (e.target.closest('.person-card')) return;
        
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        setLastPanOffset(panOffset);
        e.preventDefault();
    }, [panOffset]);

    const handleCanvasMouseMove = useCallback((e) => {
        if (!isPanning) return;
        
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        
        setPanOffset({
            x: lastPanOffset.x + deltaX,
            y: lastPanOffset.y + deltaY
        });
    }, [isPanning, panStart, lastPanOffset]);

    const handleCanvasMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // State to track if this is initial load vs user changes
    const [hasUserChanges, setHasUserChanges] = useState(false);
    const [storageAvailable, setStorageAvailable] = useState(true);

    // Save organogram data to localStorage with better error handling
    React.useEffect(() => {
        // Don't try to save on initial load with default data
        if (!hasUserChanges) {
            return;
        }

        // Check if localStorage is available
        if (!storageAvailable) {
            console.log('⚠️ localStorage not available, skipping save');
            return;
        }

        try {
            // Calculate storage size before saving
            const dataString = JSON.stringify(orgData);
            const dataSize = new Blob([dataString]).size;
            const maxSize = 4.5 * 1024 * 1024; // 4.5MB limit (leave buffer for other data)
            
            if (dataSize > maxSize) {
                console.warn('⚠️ Organogram data too large for localStorage, compressing...');
                
                // Create compressed version without photos for localStorage
                const compressedData = JSON.parse(dataString);
                Object.keys(compressedData).forEach(boardKey => {
                    if (compressedData[boardKey]) {
                        compressedData[boardKey].forEach(person => {
                            if (person.photo) {
                                // Store photo indicator instead of full base64
                                person.photoStored = true;
                                delete person.photo;
                            }
                        });
                    }
                });
                
                localStorage.setItem('recruitpro_organogram_data', JSON.stringify(compressedData));
                console.log('💾 Organogram data saved to localStorage (compressed - photos removed)');
                
                // Show user notification about storage optimization
                if (!localStorage.getItem('storage_warning_shown')) {
                    setTimeout(() => {
                        alert('💾 Storage Optimization\n\nYour organogram data has grown large due to photos.\n\nOptimizations applied:\n• Core data saved locally\n• Photos temporarily removed from storage\n• Use "Data → Backup" to preserve all data including photos\n\nThis won\'t affect your current session!');
                        localStorage.setItem('storage_warning_shown', 'true');
                    }, 1000);
                }
            } else {
                localStorage.setItem('recruitpro_organogram_data', dataString);
                console.log('💾 Organogram data saved to localStorage');
            }
        } catch (error) {
            console.error('Error saving organogram data to localStorage:', error);
            
            if (error.name === 'QuotaExceededError') {
                setStorageAvailable(false);
                
                // Show helpful error message instead of critical error
                setTimeout(() => {
                    alert(`🌐 Browser Storage Full\n\nYour browser's localStorage is full (likely from other websites).\n\n✅ Your organogram still works!\n• All changes are kept in your current session\n• Use "Data → Backup" to save your work\n\n🔧 To fix permanently:\n1. Clear browser data for other sites\n2. Use "Data → Backup" regularly\n3. Your organogram data is safe for now!`);
                }, 500);
            }
        }
    }, [orgData, hasUserChanges, storageAvailable]);

    // Mouse wheel zoom handler
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newZoom = Math.min(Math.max(zoomLevel + delta, 0.3), 3);
        setZoomLevel(newZoom);
    }, [zoomLevel]);

    // Add global mouse event listeners for panning
    React.useEffect(() => {
        if (isPanning) {
            document.addEventListener('mousemove', handleCanvasMouseMove);
            document.addEventListener('mouseup', handleCanvasMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleCanvasMouseMove);
                document.removeEventListener('mouseup', handleCanvasMouseUp);
            };
        }
    }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

    // Add wheel event listener and close data menu on outside clicks
    React.useEffect(() => {
        const canvas = document.querySelector('.organogram-canvas');
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
        }
        
        // Close data menu when clicking outside
        const handleClickOutside = (event) => {
            if (showDataMenu && !event.target.closest('[data-menu="data"]')) {
                setShowDataMenu(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            if (canvas) {
                canvas.removeEventListener('wheel', handleWheel);
            }
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleWheel, showDataMenu]);
    const focusOnPerson = (person) => {
        const containerWidth = window.innerWidth - 400;
        const containerHeight = window.innerHeight - 200;
        
        setPanOffset({
            x: containerWidth / 2 - person.position.x * zoomLevel - 100,
            y: containerHeight / 2 - person.position.y * zoomLevel - 75
        });
        setSelectedPerson(person);
    };

    // Toggle node collapse
    const toggleNodeCollapse = (personId) => {
        const newCollapsed = new Set(collapsedNodes);
        if (newCollapsed.has(personId)) {
            newCollapsed.delete(personId);
        } else {
            newCollapsed.add(personId);
        }
        setCollapsedNodes(newCollapsed);
    };

    // Check if person should be visible (not under collapsed node)
    const isPersonVisible = (person) => {
        if (!person.reportsTo) return true; // Root nodes always visible
        
        let currentPerson = person;
        while (currentPerson.reportsTo) {
            const manager = getCurrentBoardData().find(p => p.id === currentPerson.reportsTo);
            if (!manager) break;
            if (collapsedNodes.has(manager.id)) return false;
            currentPerson = manager;
        }
        return true;
    };
    const getCurrentBoardData = useCallback(() => {
        const boardData = orgData[activeBoard] || [];
        return boardData.filter(person => {
            const matchesRegion = selectedRegion === 'all' || person.region === selectedRegion;
            const matchesCountry = selectedCountry === 'all' || person.country === selectedCountry;
            const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                person.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSuccession = !showSuccessionOnly || person.successors.length === 0;
            
            return matchesRegion && matchesCountry && matchesSearch && matchesSuccession;
        });
    }, [activeBoard, selectedRegion, selectedCountry, searchTerm, showSuccessionOnly, orgData]);

    // Drag handlers for person cards (separate from canvas panning)
    const handleMouseDown = (e, person) => {
        // Only allow dragging in manual mode
        if (viewMode !== 'manual') return;
        
        e.preventDefault();
        e.stopPropagation(); // Prevent canvas panning when dragging person cards
        setDraggedPerson(person);
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !draggedPerson) return;
        
        const newOrgData = { ...orgData };
        const boardData = newOrgData[activeBoard];
        const personIndex = boardData.findIndex(p => p.id === draggedPerson.id);
        
        if (personIndex >= 0) {
            boardData[personIndex] = {
                ...boardData[personIndex],
                position: { x: e.clientX - 100, y: e.clientY - 50 }
            };
            setOrgData(newOrgData);
            setHasUserChanges(true); // Mark as user change when dragging cards
        }
    }, [isDragging, draggedPerson, orgData, activeBoard]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setDraggedPerson(null);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Update person data
    const updatePerson = (personId, updates) => {
        const newOrgData = { ...orgData };
        const boardData = newOrgData[activeBoard];
        const personIndex = boardData.findIndex(p => p.id === personId);
        
        if (personIndex >= 0) {
            boardData[personIndex] = { ...boardData[personIndex], ...updates };
            setOrgData(newOrgData);
            setHasUserChanges(true); // Mark as user change
            
            // Update selected person if it's the one being edited
            if (selectedPerson?.id === personId) {
                setSelectedPerson(boardData[personIndex]);
            }
        }
    };

    // Add successor to person
    const addSuccessor = (personId, successorData) => {
        const newOrgData = { ...orgData };
        const boardData = newOrgData[activeBoard];
        const personIndex = boardData.findIndex(p => p.id === personId);
        
        if (personIndex >= 0) {
            const updatedSuccessors = [...boardData[personIndex].successors, successorData];
            boardData[personIndex] = { 
                ...boardData[personIndex], 
                successors: updatedSuccessors 
            };
            setOrgData(newOrgData);
            setHasUserChanges(true); // Mark as user change
            
            if (selectedPerson?.id === personId) {
                setSelectedPerson(boardData[personIndex]);
            }
        }
    };

    // Remove successor
    const removeSuccessor = (personId, successorIndex) => {
        const newOrgData = { ...orgData };
        const boardData = newOrgData[activeBoard];
        const personIndex = boardData.findIndex(p => p.id === personId);
        
        if (personIndex >= 0) {
            const updatedSuccessors = boardData[personIndex].successors.filter((_, idx) => idx !== successorIndex);
            boardData[personIndex] = { 
                ...boardData[personIndex], 
                successors: updatedSuccessors 
            };
            setOrgData(newOrgData);
            setHasUserChanges(true); // Mark as user change
            
            if (selectedPerson?.id === personId) {
                setSelectedPerson(boardData[personIndex]);
            }
        }
    };

    // Edit existing successor
    const updateSuccessor = (personId, successorIndex, updates) => {
        const newOrgData = { ...orgData };
        const boardData = newOrgData[activeBoard];
        const personIndex = boardData.findIndex(p => p.id === personId);
        
        if (personIndex >= 0) {
            const updatedSuccessors = [...boardData[personIndex].successors];
            updatedSuccessors[successorIndex] = { ...updatedSuccessors[successorIndex], ...updates };
            boardData[personIndex] = { 
                ...boardData[personIndex], 
                successors: updatedSuccessors 
            };
            setOrgData(newOrgData);
            setHasUserChanges(true); // Mark as user change
            
            if (selectedPerson?.id === personId) {
                setSelectedPerson(boardData[personIndex]);
            }
        }
    };
    const handleAddPerson = (newPerson) => {
        const newOrgData = { ...orgData };
        if (!newOrgData[activeBoard]) {
            newOrgData[activeBoard] = [];
        }
        
        newOrgData[activeBoard].push({
            ...newPerson,
            id: `${activeBoard.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
            position: { x: 400, y: 300 }
        });
        
        setOrgData(newOrgData);
        setShowAddPersonModal(false);
    };

    // Enhanced PDF export with beautiful executive document and error handling
    const exportToPDF = async () => {
        try {
            // Use filtered data instead of all data
            const data = getCurrentBoardData();
            
            // Ensure we have data to export
            if (!data || data.length === 0) {
                alert('⚠️ No data to export!\n\nPlease add some people to the organogram first.');
                return;
            }
            
            // Calculate analytics for PDF with error handling
            let analytics;
            try {
                analytics = calculateAnalytics(data);
            } catch (analyticsError) {
                console.error('Analytics calculation error:', analyticsError);
                // Fallback analytics if calculation fails
                analytics = {
                    totalPeople: data.length,
                    successorCoverage: data.filter(p => p.successors && p.successors.length > 0).length / data.length * 100 || 0,
                    averageReadiness: 50, // Default fallback
                    riskDistribution: {
                        critical: data.filter(p => p.riskLevel === 'critical').length || 0,
                        high: data.filter(p => p.riskLevel === 'high').length || 0,
                        medium: data.filter(p => p.riskLevel === 'medium').length || 0,
                        low: data.filter(p => p.riskLevel === 'low').length || 0
                    },
                    criticalGaps: data.filter(p => (!p.successors || p.successors.length === 0) && ['critical', 'high'].includes(p.riskLevel)) || [],
                    healthScore: 75 // Default fallback
                };
            }
            
            // Ensure criticalGaps exists
            if (!analytics.criticalGaps) {
                analytics.criticalGaps = data.filter(p => (!p.successors || p.successors.length === 0) && ['critical', 'high'].includes(p.riskLevel)) || [];
            }
            
            const successionGaps = data.filter(p => !p.successors || p.successors.length === 0);
            
            // Create filter summary for report
            const filterSummary = {
                boardArea: activeBoard,
                region: selectedRegion === 'all' ? 'All Regions' : selectedRegion,
                country: selectedCountry === 'all' ? 'All Countries' : selectedCountry,
                searchTerm: searchTerm || 'None',
                showSuccessionOnly: showSuccessionOnly ? 'Yes' : 'No'
            };

            // Create beautiful HTML document for PDF
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${activeBoard} - Organizational Chart & Succession Plan</title>
    <style>
        @page {
            margin: 0.5in;
            size: A4;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: white;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 12px;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 16px;
        }
        .header .date {
            font-size: 14px;
            opacity: 0.8;
        }
        .filters-applied {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin-bottom: 24px;
            border-radius: 8px;
        }
        .filters-applied h3 {
            color: #2d3748;
            margin-bottom: 12px;
            font-size: 16px;
        }
        .filter-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 14px;
        }
        .section {
            margin-bottom: 32px;
            page-break-inside: avoid;
        }
        .section-header {
            font-size: 20px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }
        .metric-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .metric-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .risk-matrix {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
        }
        .risk-item {
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            color: white;
            font-weight: 600;
        }
        .risk-critical { background: #dc2626; }
        .risk-high { background: #ef4444; }
        .risk-medium { background: #f59e0b; }
        .risk-low { background: #22c55e; }
        .succession-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 14px;
        }
        .succession-table th {
            background: #f7fafc;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #e2e8f0;
        }
        .succession-table td {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .succession-table tr:nth-child(even) {
            background: #fafafa;
        }
        .gap-alert {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .gap-alert h4 {
            color: #dc2626;
            margin-bottom: 8px;
        }
        .recommendations {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 20px;
            border-radius: 8px;
        }
        .recommendations h3 {
            color: #0c4a6e;
            margin-bottom: 16px;
        }
        .recommendations ul {
            list-style: none;
            padding: 0;
        }
        .recommendations li {
            padding: 8px 0;
            border-bottom: 1px solid #e0f2fe;
            font-size: 14px;
        }
        .recommendations li:before {
            content: "▶ ";
            color: #0ea5e9;
            font-weight: bold;
        }
        .page-break {
            page-break-before: always;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #64748b;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${activeBoard}</h1>
        <div class="subtitle">Organizational Chart & Succession Planning Report</div>
        <div class="subtitle">${filterSummary.region}${filterSummary.country !== 'All Countries' ? ` • ${filterSummary.country}` : ''}${showSuccessionOnly ? ' • Succession Gaps Focus' : ''}</div>
        <div class="date">Generated: ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}</div>
    </div>

    <div class="filters-applied">
        <h3>📋 Filters Applied</h3>
        <div class="filter-grid">
            <div><strong>Board Area:</strong> ${filterSummary.boardArea}</div>
            <div><strong>Region:</strong> ${filterSummary.region}</div>
            <div><strong>Country:</strong> ${filterSummary.country}</div>
            <div><strong>Search Term:</strong> ${filterSummary.searchTerm}</div>
            <div><strong>Succession Gaps Only:</strong> ${filterSummary.showSuccessionOnly}</div>
            <div><strong>Results:</strong> ${data.length} people</div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">📊 Executive Summary</div>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${analytics.totalPeople || data.length}</div>
                <div class="metric-label">Total People</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(analytics.successorCoverage || 0)}%</div>
                <div class="metric-label">Succession Coverage</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${analytics.healthScore || 0}</div>
                <div class="metric-label">Health Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${analytics.criticalGaps ? analytics.criticalGaps.length : 0}</div>
                <div class="metric-label">Critical Gaps</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">⚠️ Risk Assessment</div>
        <div class="risk-matrix">
            <div class="risk-item risk-critical">
                <div style="font-size: 24px; margin-bottom: 8px;">${analytics.riskDistribution.critical || 0}</div>
                <div>Critical Risk</div>
            </div>
            <div class="risk-item risk-high">
                <div style="font-size: 24px; margin-bottom: 8px;">${analytics.riskDistribution.high || 0}</div>
                <div>High Risk</div>
            </div>
            <div class="risk-item risk-medium">
                <div style="font-size: 24px; margin-bottom: 8px;">${analytics.riskDistribution.medium || 0}</div>
                <div>Medium Risk</div>
            </div>
            <div class="risk-item risk-low">
                <div style="font-size: 24px; margin-bottom: 8px;">${analytics.riskDistribution.low || 0}</div>
                <div>Low Risk</div>
            </div>
        </div>
    </div>

    ${analytics.criticalGaps && analytics.criticalGaps.length > 0 ? `
    <div class="section">
        <div class="section-header">🚨 Critical Succession Gaps</div>
        ${analytics.criticalGaps.map(person => `
            <div class="gap-alert">
                <h4>${person.name} - ${person.title}</h4>
                <div><strong>Risk Level:</strong> ${(person.riskLevel || 'unknown').toUpperCase()} • <strong>Location:</strong> ${person.region}, ${person.country} • <strong>Team Size:</strong> ${person.teamSize || 0} people</div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section page-break">
        <div class="section-header">👥 Detailed Succession Planning</div>
        <table class="succession-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Level</th>
                    <th>Location</th>
                    <th>Team Size</th>
                    <th>Risk</th>
                    <th>Successors</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(person => {
                    const successors = person.successors || [];
                    const successorText = successors.length > 0 
                        ? successors.map(s => `${s.name} (${s.type || 'unknown'}, ${s.readiness || 'TBD'})`).join('<br>')
                        : '<span style="color: #ef4444; font-weight: 600;">⚠️ No Successors</span>';
                    
                    const riskColor = riskLevels[person.riskLevel] ? riskLevels[person.riskLevel].color : '#6b7280';
                    
                    return `
                    <tr>
                        <td><strong>${person.name || 'Unknown'}</strong></td>
                        <td>${person.title || 'Unknown Title'}</td>
                        <td>${person.level || 'Unknown'}</td>
                        <td>${person.region || 'Unknown'}<br>${person.country || 'Unknown'}</td>
                        <td style="text-align: center;">${person.teamSize || 0}</td>
                        <td style="text-align: center;"><span style="color: ${riskColor}; font-weight: 600;">${(person.riskLevel || 'unknown').toUpperCase()}</span></td>
                        <td>${successorText}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="recommendations">
            <h3>💡 Strategic Recommendations</h3>
            <ul>
                ${generateRecommendations(data, analytics).map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="footer">
        <div>Generated by RecruitPro Organogram System • Confidential Document</div>
        <div>Report Date: ${new Date().toLocaleDateString()} • Data as of: ${new Date().toLocaleDateString()}</div>
    </div>
</body>
</html>
            `;

            // Create new window and display the beautiful report
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('❌ Pop-up blocked!\n\nPlease allow pop-ups for this site to export PDF reports.');
                return;
            }
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Wait for content to load, then trigger print dialog
            setTimeout(() => {
                printWindow.print();
                
                // Show instructions to user
                alert(`📄 Beautiful PDF Report Ready!\n\n📋 Instructions:\n1. A new window opened with your executive report\n2. Use the print dialog to "Save as PDF"\n3. Choose your preferred PDF settings\n4. Save with a professional filename\n\n💡 The report includes:\n• Executive summary with key metrics\n• Risk assessment matrix\n• Critical succession gaps\n• Detailed succession planning\n• Strategic recommendations\n\n🎯 Perfect for executive presentations!`);
            }, 500);
            
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert(`❌ Error generating PDF report.\n\nError details: ${error.message}\n\nPlease try again or use "Data → Backup" to save your data first.`);
        }
    };

    // Calculate comprehensive analytics
    const calculateAnalytics = (data) => {
        const totalPeople = data.length;
        const successorCoverage = data.filter(p => p.successors.length > 0).length / totalPeople * 100;
        const averageReadiness = data.reduce((sum, person) => {
            const readinessScores = person.successors.map(s => {
                switch(s.readiness) {
                    case '0-3 months': return 100;
                    case '3-6 months': return 85;
                    case '6-12 months': return 70;
                    case '12-24 months': return 50;
                    case '24+ months': return 25;
                    default: return 50;
                }
            });
            return sum + (readinessScores.length > 0 ? Math.max(...readinessScores) : 0);
        }, 0) / totalPeople;

        const riskDistribution = {
            critical: data.filter(p => p.riskLevel === 'critical').length,
            high: data.filter(p => p.riskLevel === 'high').length,
            medium: data.filter(p => p.riskLevel === 'medium').length,
            low: data.filter(p => p.riskLevel === 'low').length
        };

        return {
            totalPeople,
            successorCoverage,
            averageReadiness,
            riskDistribution,
            criticalRoles: data.filter(p => ['critical', 'high'].includes(p.riskLevel)),
            healthScore: Math.round((successorCoverage + averageReadiness) / 2)
        };
    };

    // Generate risk matrix
    const generateRiskMatrix = (data) => {
        const matrix = {};
        data.forEach(person => {
            const successorCount = person.successors.length;
            const riskLevel = person.riskLevel;
            const key = `${riskLevel}-${successorCount > 0 ? 'covered' : 'gap'}`;
            matrix[key] = (matrix[key] || 0) + 1;
        });
        return matrix;
    };

    // Generate recommendations
    const generateRecommendations = (data, analytics) => {
        const recommendations = [];
        
        if (analytics.successorCoverage < 70) {
            recommendations.push('🎯 Focus on increasing succession coverage - currently below 70% target');
        }
        
        if (analytics.criticalRoles.length > 0) {
            const gapsInCritical = analytics.criticalRoles.filter(p => p.successors.length === 0);
            if (gapsInCritical.length > 0) {
                recommendations.push(`🚨 Immediate action needed: ${gapsInCritical.length} critical/high-risk roles without successors`);
            }
        }
        
        if (analytics.averageReadiness < 60) {
            recommendations.push('📚 Implement accelerated development programs to improve successor readiness');
        }
        
        const externalHeavyRoles = data.filter(p => 
            p.successors.length > 0 && 
            p.successors.filter(s => s.type === 'external').length > p.successors.filter(s => s.type === 'internal').length
        );
        
        if (externalHeavyRoles.length > data.length * 0.3) {
            recommendations.push('🏢 Consider internal talent development to reduce external dependency');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ Succession planning appears healthy - continue monitoring and regular updates');
        }
        
        return recommendations;
    };

    // Apply template to current board
    const applyTemplate = (templateKey) => {
        const template = orgTemplates[templateKey];
        if (!template) return;

        const newOrgData = { ...orgData };
        
        // Convert template structure to proper format
        const templatePeople = template.structure.map((person, idx) => ({
            ...person,
            id: `${activeBoard.toLowerCase().replace(/\s/g, '-')}-${idx}`,
            successors: [],
            photo: null,
            reportsTo: person.reportsTo === null ? null : `${activeBoard.toLowerCase().replace(/\s/g, '-')}-${template.structure.findIndex(p => p.name === person.reportsTo)}`
        }));

        newOrgData[activeBoard] = templatePeople;
        setOrgData(newOrgData);
        setShowTemplates(false);
        
        // Auto-generate layout after applying template
        setTimeout(() => generateAutoLayout(), 100);
    };

    // Data management functions
    const backupOrgData = () => {
        try {
            const dataToExport = {
                organogramData: orgData,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `organogram-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            alert('📁 Organogram data backed up successfully!');
        } catch (error) {
            console.error('Error backing up organogram data:', error);
            alert('❌ Error backing up data. Please try again.');
        }
    };

    const restoreOrgData = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.organogramData) {
                    setOrgData(importedData.organogramData);
                    setHasUserChanges(true); // Mark as user change to save restored data
                    alert(`✅ Organogram data restored successfully!\nBackup Date: ${importedData.exportDate ? new Date(importedData.exportDate).toLocaleDateString() : 'Unknown'}`);
                } else {
                    alert('❌ Invalid backup file format.');
                }
            } catch (error) {
                console.error('Error restoring organogram data:', error);
                alert('❌ Error reading backup file. Please check the file format.');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    };

    const clearAllOrgData = () => {
        if (window.confirm('⚠️ Are you sure you want to clear ALL organogram data?\n\nThis will delete all people, succession plans, and organizational structure.\n\nThis action cannot be undone!')) {
            const confirmText = window.prompt('Type "DELETE ALL" to confirm this action:');
            if (confirmText === 'DELETE ALL') {
                setOrgData({});
                setHasUserChanges(false); // Reset user changes flag
                localStorage.removeItem('recruitpro_organogram_data');
                alert('🗑️ All organogram data has been cleared.');
            } else {
                alert('❌ Action cancelled - data not cleared.');
            }
        }
    };

    // Photo upload handler
    const handlePhotoUpload = (personId, file) => {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const photoDataUrl = e.target.result;
            updatePerson(personId, { photo: photoDataUrl });
        };
        reader.readAsDataURL(file);
    };

    // Enhanced Excel export with analytics
    const exportToExcel = () => {
        const data = getCurrentBoardData(); // Uses filtered data
        const analytics = calculateAnalytics(data);
        
        // Create filter summary for Excel
        const filterSummary = {
            boardArea: activeBoard,
            region: selectedRegion === 'all' ? 'All Regions' : selectedRegion,
            country: selectedCountry === 'all' ? 'All Countries' : selectedCountry,
            searchTerm: searchTerm || 'None',
            showSuccessionOnly: showSuccessionOnly ? 'Yes' : 'No'
        };
        
        // Main data sheet with filter info header
        const csv = [
            [`FILTERED ORGANIZATIONAL DATA - ${activeBoard}`],
            ['FILTERS APPLIED:'],
            ['Region', filterSummary.region],
            ['Country', filterSummary.country],
            ['Search Term', filterSummary.searchTerm],
            ['Succession Gaps Only', filterSummary.showSuccessionOnly],
            ['Export Date', new Date().toLocaleDateString()],
            [''],
            ['FILTERED RESULTS:', `${data.length} people match current filters`],
            [''],
            ['Name', 'Title', 'Corporate Level', 'Region', 'Country', 'Team Size', 'Risk Level', 'Reports To', 'Successors', 'Successor Count', 'Internal Successors', 'External Successors']
        ];
        
        data.forEach(person => {
            const reportsTo = data.find(p => p.id === person.reportsTo)?.name || 'None';
            const successors = person.successors.map(s => `${s.name} (${s.type})`).join('; ');
            const internalCount = person.successors.filter(s => s.type === 'internal').length;
            const externalCount = person.successors.filter(s => s.type === 'external').length;
            
            csv.push([
                person.name,
                person.title,
                `${person.level} - ${corporateLevels[person.level]?.label || person.level}`,
                person.region,
                person.country,
                person.teamSize,
                person.riskLevel,
                reportsTo,
                successors,
                person.successors.length,
                internalCount,
                externalCount
            ]);
        });

        // Add analytics section based on filtered data
        csv.push([''], ['FILTERED ANALYTICS SUMMARY'], ['Metric', 'Value']);
        csv.push(['Total People (Filtered)', data.length]);
        csv.push(['Succession Coverage', `${analytics.successorCoverage.toFixed(1)}%`]);
        csv.push(['Average Team Size', Math.round(data.reduce((sum, p) => sum + p.teamSize, 0) / data.length || 0)]);
        csv.push(['Health Score', `${analytics.healthScore}/100`]);
        csv.push(['Critical Risk Roles', analytics.riskDistribution.critical]);
        csv.push(['High Risk Roles', analytics.riskDistribution.high]);
        csv.push(['Medium Risk Roles', analytics.riskDistribution.medium]);
        csv.push(['Low Risk Roles', analytics.riskDistribution.low]);

        // Add succession gaps from filtered data
        const gaps = data.filter(p => p.successors.length === 0);
        if (gaps.length > 0) {
            csv.push([''], ['SUCCESSION GAPS (FILTERED)'], ['Name', 'Title', 'Risk Level', 'Region', 'Country']);
            gaps.forEach(person => {
                csv.push([person.name, person.title, person.riskLevel, person.region, person.country]);
            });
        }
        
        const csvContent = csv.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Include filter info in filename
        const filterSuffix = selectedRegion !== 'all' ? `_${selectedRegion}` : '';
        const countrySuffix = selectedCountry !== 'all' ? `_${selectedCountry.replace(/\s+/g, '_')}` : '';
        const gapsOnlySuffix = showSuccessionOnly ? '_SuccessionGaps' : '';
        
        a.download = `${activeBoard}${filterSuffix}${countrySuffix}${gapsOnlySuffix}_Analysis.csv`;
        a.click();
        
        alert(`📊 Filtered Excel Export Complete!\n\nExported ${data.length} people based on current filters:\n• ${filterSummary.region}\n• ${filterSummary.country}\n• Search: ${filterSummary.searchTerm}\n• Gaps only: ${filterSummary.showSuccessionOnly}`);
    };

    const currentData = getCurrentBoardData();

    return (
        <div className="organogram-container" style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: isFullScreen ? 'fixed' : 'relative',
            top: isFullScreen ? 0 : 'auto',
            left: isFullScreen ? 0 : 'auto',
            right: isFullScreen ? 0 : 'auto',
            bottom: isFullScreen ? 0 : 'auto',
            zIndex: isFullScreen ? 9999 : 'auto'
        }}>
            {/* Header */}
{!isFullScreen && (
<div style={{
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
}}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h1 style={{ 
                        margin: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        fontSize: '28px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        <Users size={32} />
                        Interactive Organogram
                    </h1>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => setShowAddPersonModal(true)}
                            style={{
                                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px 20px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0px)'}
                        >
                            <Plus size={18} />
                            Add Person
                        </button>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                                onClick={() => setShowAnalytics(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #ec4899, #f97316)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}
                                title="Advanced Analytics Dashboard"
                            >
                                <BarChart3 size={16} />
                                Analytics
                            </button>

                            <button
                                onClick={() => setShowTemplates(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}
                                title="Apply company templates"
                            >
                                <Layout size={16} />
                                Templates
                            </button>

                            {/* Data Management Dropdown */}
                            <div style={{ position: 'relative' }} data-menu="data">
                                <button
                                    onClick={() => setShowDataMenu(!showDataMenu)}
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                    title="Data Management - Backup, Restore, Clear"
                                >
                                    <Save size={16} />
                                    Data ▾
                                </button>
                                
                                {showDataMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '4px',
                                        background: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                        border: '1px solid #e5e7eb',
                                        minWidth: '200px',
                                        zIndex: 1000
                                    }}>
                                        <button
                                            onClick={() => {
                                                backupOrgData();
                                                setShowDataMenu(false);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                borderRadius: '12px 12px 0 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                                            onMouseOut={(e) => e.target.style.background = 'none'}
                                        >
                                            📁 Backup Data
                                        </button>
                                        
                                        <label style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            margin: 0
                                        }}
                                        onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                                        onMouseOut={(e) => e.target.style.background = 'none'}
                                        >
                                            📂 Restore Data
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={restoreOrgData}
                                                style={{ display: 'none' }}
                                                onClick={() => setShowDataMenu(false)}
                                            />
                                        </label>
                                        
                                        <hr style={{ margin: '8px 16px', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                                        
                                        <button
                                            onClick={() => {
                                                clearAllOrgData();
                                                setShowDataMenu(false);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                borderRadius: '0 0 12px 12px',
                                                color: '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                                            onMouseOut={(e) => e.target.style.background = 'none'}
                                        >
                                            🗑️ Clear All Data
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={() => setViewMode(viewMode === 'manual' ? 'auto' : 'manual')}
                                style={{
                                    background: viewMode === 'manual' 
                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                        : 'rgba(255,255,255,0.8)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: viewMode === 'manual' ? 'white' : '#374151'
                                }}
                                title={viewMode === 'manual' ? 'Switch to Pan Mode' : 'Switch to Drag Mode'}
                            >
                                {viewMode === 'manual' ? '🔧 Drag Mode' : '✋ Pan Mode'}
                            </button>
                            
                            <button
                                onClick={generateAutoLayout}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}
                                title="Auto-arrange layout"
                            >
                                📊 Auto Layout
                            </button>
                            
                            <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', background: 'rgba(255,255,255,0.8)' }}>
                                <button onClick={handleZoomOut} style={{ padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }} title="Zoom out">➖</button>
                                <span style={{ padding: '10px 12px', fontSize: '12px', minWidth: '60px', textAlign: 'center', fontWeight: '600' }}>
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <button onClick={handleZoomIn} style={{ padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }} title="Zoom in">➕</button>
                            </div>
                            
                            <button onClick={handleFitToScreen} style={{
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                padding: '12px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                            }} title="Fit to screen">
                                🔍 Fit
                            </button>
                            
                            <button onClick={handleResetView} style={{
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                padding: '12px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                            }} title="Reset view">
                                🎯 Reset
                            </button>

                            <button onClick={toggleFullScreen} style={{
    background: isFullScreen ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: isFullScreen ? 'white' : '#374151'
}} title={isFullScreen ? "Exit Full Screen (ESC)" : "Enter Full Screen"}>
    {isFullScreen ? '🗗 Exit' : '⛶ Full'}
</button>
                        </div>

                        <button onClick={exportToExcel} style={{
                            background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 20px',
                            color: '#2d3748',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}>
                            <Download size={18} />
                            Export Excel
                        </button>
                        <button onClick={exportToPDF} style={{
                            background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 20px',
                            color: '#2d3748',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}>
                            <Download size={18} />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Board Area Tabs */}
                <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '20px',
                    overflowX: 'auto',
                    paddingBottom: '8px'
                }}>
                    {boardAreas.map(board => (
                        <button
                            key={board}
                            onClick={() => setActiveBoard(board)}
                            style={{
                                padding: '10px 16px',
                                border: 'none',
                                borderRadius: '25px',
                                background: activeBoard === board 
                                    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                                    : 'rgba(255,255,255,0.7)',
                                color: activeBoard === board ? 'white' : '#4a5568',
                                fontWeight: activeBoard === board ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                fontSize: '14px'
                            }}
                        >
                            {board}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        alignItems: 'center'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ 
                                position: 'absolute', 
                                left: '12px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }} />
                            <input
                                type="text"
                                placeholder="Search people..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 44px',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.8)',
                                    fontSize: '14px'
                                }}
                            />
                            {searchTerm && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    marginTop: '4px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    zIndex: 100
                                }}>
                                    {getCurrentBoardData()
                                        .filter(person => 
                                            person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            person.title.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .slice(0, 10)
                                        .map(person => (
                                            <button
                                                key={person.id}
                                                onClick={() => {
                                                    focusOnPerson(person);
                                                    setSearchTerm('');
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: 'none',
                                                    background: 'none',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    fontSize: '14px'
                                                }}
                                                onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                                                onMouseOut={(e) => e.target.style.background = 'none'}
                                            >
                                                <div style={{ fontWeight: '600' }}>{person.name}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{person.title}</div>
                                            </button>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        
                        <select 
                            value={selectedRegion}
                            onChange={(e) => {
                                setSelectedRegion(e.target.value);
                                setSelectedCountry('all');
                            }}
                            style={{
                                padding: '12px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.8)',
                                fontSize: '14px'
                            }}
                        >
                            <option value="all">All Regions</option>
                            {Object.entries(regions).map(([key, region]) => (
                                <option key={key} value={key}>{key} - {region.name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            disabled={selectedRegion === 'all'}
                            style={{
                                padding: '12px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                background: selectedRegion === 'all' ? 'rgba(200,200,200,0.5)' : 'rgba(255,255,255,0.8)',
                                fontSize: '14px'
                            }}
                        >
                            <option value="all">All Countries</option>
                            {selectedRegion !== 'all' && regions[selectedRegion]?.countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input
                                    type="checkbox"
                                    checked={showSuccessionOnly}
                                    onChange={(e) => setShowSuccessionOnly(e.target.checked)}
                                    style={{ accentColor: '#667eea' }}
                                />
                                <AlertTriangle size={16} />
                                Succession Gaps Only
                            </label>
                        </div>
                    </div>
                    </div>
)}

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Organogram Canvas */}
                <div 
                    className="organogram-canvas"
                    style={{ 
                        flex: 1, 
                        position: 'relative', 
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.1)',
                        margin: '20px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)',
                        cursor: isPanning ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleCanvasMouseDown}
                >
                    {/* Canvas container with zoom and pan */}
                    <div 
                        style={{
                            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                            transformOrigin: '0 0',
                            transition: viewMode === 'auto' && !isPanning ? 'transform 0.3s ease' : 'none',
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            pointerEvents: isPanning ? 'none' : 'auto' // Prevent interference during panning
                        }}
                    >
                        <svg style={{ 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top left'
}}>

{/* Department background groupings */}
{(() => {
    const visiblePeople = currentData.filter(person => isPersonVisible(person));
    const departments = {};
    
    // Group people by department
    visiblePeople.forEach(person => {
        const dept = person.department || 'Other';
        if (!departments[dept]) departments[dept] = [];
        departments[dept].push(person);
    });
    
    return Object.entries(departments).map(([deptName, people], deptIndex) => {
        if (people.length < 2) return null; // Don't group single person departments
        
        // Find bounding box for department
        const minX = Math.min(...people.map(p => p.position.x)) - 20;
        const maxX = Math.max(...people.map(p => p.position.x + 200)) + 20;
        const minY = Math.min(...people.map(p => p.position.y)) - 20;
        const maxY = Math.max(...people.map(p => p.position.y + 120)) + 20;
        
        const colors = [
            ['rgba(59, 130, 246, 0.08)', 'rgba(59, 130, 246, 0.02)'], // Blue
            ['rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.02)'], // Green  
            ['rgba(245, 101, 101, 0.08)', 'rgba(245, 101, 101, 0.02)'], // Red
            ['rgba(251, 191, 36, 0.08)', 'rgba(251, 191, 36, 0.02)'], // Yellow
            ['rgba(168, 85, 247, 0.08)', 'rgba(168, 85, 247, 0.02)'], // Purple
        ];
        
        const [startColor, endColor] = colors[deptIndex % colors.length];
        const gradientId = `dept-gradient-${deptIndex}`;
        
        return (
            <g key={`dept-group-${deptName}`}>
                {/* Define gradient */}
                <defs>
                    <radialGradient id={gradientId} cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor={startColor} />
                        <stop offset="100%" stopColor={endColor} />
                    </radialGradient>
                </defs>
                {/* Background rectangle */}
                <rect
                    x={minX}
                    y={minY}
                    width={maxX - minX}
                    height={maxY - minY}
                    fill={`url(#${gradientId})`}
                    rx="16"
                    ry="16"
                    opacity="0.7"
                />
                {/* Department label */}
                <text
                    x={minX + 12}
                    y={minY + 20}
                    fill="rgba(255,255,255,0.9)"
                    fontSize="12"
                    fontWeight="bold"
                    textShadow="0 1px 3px rgba(0,0,0,0.3)"
                >
                    {deptName}
                </text>
            </g>
        );
    });
})()}

                     {/* Solid, clearly visible reporting lines */}
{currentData.filter(person => isPersonVisible(person)).map(person => {
    const manager = currentData.find(p => p.id === person.reportsTo);
    if (!manager || !isPersonVisible(manager)) return null;
    
    // Calculate connection points
    const cardWidth = 200;
    const cardHeight = 120;
    
    // Manager bottom center
    const managerX = manager.position.x + cardWidth / 2;
    const managerY = manager.position.y + cardHeight;
    
    // Employee top center  
    const employeeX = person.position.x + cardWidth / 2;
    const employeeY = person.position.y;
    
    // Create stepped path
    const midY = managerY + 30;
    
    // Check if this line is part of highlighted chain
    const isHighlighted = highlightedChain.has(person.id) || highlightedChain.has(manager.id);
    
    return (
        <g key={`connection-${person.id}`}>
            {/* Main connecting path - much more visible */}
            <path
                d={`M ${managerX} ${managerY} 
                    L ${managerX} ${midY} 
                    L ${employeeX} ${midY} 
                    L ${employeeX} ${employeeY}`}
                stroke={isHighlighted ? "#ef4444" : "#3b82f6"}
                strokeWidth={isHighlighted ? "4" : "3"}
                fill="none"
                opacity={isHighlighted ? "1" : "0.9"}
            />
            
            {/* Arrow pointing to employee */}
            <polygon
                points={`${employeeX-6},${employeeY-12} ${employeeX+6},${employeeY-12} ${employeeX},${employeeY-3}`}
                fill={isHighlighted ? "#ef4444" : "#3b82f6"}
                opacity={isHighlighted ? "1" : "0.9"}
            />
            
            {/* Connection dots */}
            <circle cx={managerX} cy={managerY} r="4" fill={isHighlighted ? "#ef4444" : "#3b82f6"} />
            <circle cx={employeeX} cy={employeeY} r="4" fill={isHighlighted ? "#ef4444" : "#3b82f6"} />
        </g>
    );
})}

 {/* ADD STEP 5 CODE HERE - Connection dots for better visibility */}
 {currentData.filter(person => isPersonVisible(person)).map(person => {
        const manager = currentData.find(p => p.id === person.reportsTo);
        if (!manager || !isPersonVisible(manager)) return null;
        
        const cardWidth = 200;
        const cardHeight = 120;
        const managerX = manager.position.x + cardWidth / 2;
        const managerY = manager.position.y + cardHeight;
        const employeeX = person.position.x + cardWidth / 2;
        const employeeY = person.position.y;
        
        return (
            <g key={`dots-${person.id}`}>
                {/* Dot at manager end */}
                <circle
                    cx={managerX}
                    cy={managerY}
                    r="3"
                    fill="rgba(255,255,255,0.9)"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="1"
                />
                {/* Dot at employee end */}
                <circle
                    cx={employeeX}
                    cy={employeeY}
                    r="3"
                    fill="rgba(255,255,255,0.9)"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="1"
                />
            </g>
        );
    })}


                        </svg>

                        {/* Person cards */}
                        {currentData.filter(person => isPersonVisible(person)).map(person => {
                            const hasDirectReports = currentData.some(p => p.reportsTo === person.id);
                            const isCollapsed = collapsedNodes.has(person.id);
                            
                            return (
                                <div
                                    key={person.id}
                                    className="person-card"
                                    onMouseDown={(e) => viewMode === 'manual' && handleMouseDown(e, person)}
                                    onClick={() => setSelectedPerson(person)}
                                    onMouseEnter={() => {
                                        setHoveredPerson(person.id);
                                        setHighlightedChain(getReportingChain(person.id));
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredPerson(null);
                                        setHighlightedChain(new Set());
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: person.position.x,
                                        top: person.position.y,
                                        width: '200px',
                                        background: highlightedChain.has(person.id) 
                                            ? 'rgba(59, 130, 246, 0.15)' 
                                            : 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        cursor: viewMode === 'manual' && isDragging ? 'grabbing' : 
                                               viewMode === 'manual' ? 'grab' : 'pointer',
                                        boxShadow: highlightedChain.has(person.id)
                                            ? '0 8px 32px rgba(59, 130, 246, 0.3)'
                                            : '0 8px 32px rgba(31, 38, 135, 0.37)',
                                        border: highlightedChain.has(person.id) 
                                            ? '3px solid #3b82f6' 
                                            : `3px solid ${riskLevels[person.riskLevel].color}`,
                                        transition: 'all 0.3s ease',
                                        transform: highlightedChain.has(person.id) || selectedPerson?.id === person.id 
                                            ? 'scale(1.05)' : 'scale(1)',
                                        zIndex: highlightedChain.has(person.id) || selectedPerson?.id === person.id ? 10 : 5
                                    }}
                                >
                                    {/* Collapse/Expand button for managers */}
                                    {hasDirectReports && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleNodeCollapse(person.id);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                background: 'rgba(103, 126, 234, 0.8)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 20
                                            }}
                                            title={isCollapsed ? 'Expand team' : 'Collapse team'}
                                        >
                                            {isCollapsed ? '+' : '−'}
                                        </button>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: person.photo 
                                                ? `url(${person.photo}) center/cover` 
                                                : 'linear-gradient(135deg, #667eea, #764ba2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '18px',
                                            overflow: 'hidden'
                                        }}>
                                            {!person.photo && person.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                                                {person.name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.3' }}>
                                                {person.title}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                                        <div>Team: {person.teamSize} people</div>
                                        <div>{person.region} • {person.country}</div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <div style={{
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                background: riskLevels[person.riskLevel].color,
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: '600'
                                            }}>
                                                {riskLevels[person.riskLevel].label}
                                            </div>
                                            {person.successors.length === 0 && (
                                                <div style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '8px',
                                                    background: '#f59e0b',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    fontWeight: '600'
                                                }}>
                                                    No Successor
                                                </div>
                                            )}
                                        </div>
                                        
                                        {hasDirectReports && (
                                            <div style={{
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                background: 'rgba(103, 126, 234, 0.1)',
                                                color: '#667eea',
                                                fontSize: '10px',
                                                fontWeight: '600'
                                            }}>
                                                {currentData.filter(p => p.reportsTo === person.id).length} reports
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Full-Screen Indicator */}
{isFullScreen && (
    <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(245, 158, 11, 0.95)',
        borderRadius: '12px',
        padding: '12px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        fontSize: '13px',
        color: 'white',
        zIndex: 100,
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    }}>
        ⛶ Full Screen Mode
        <span style={{ fontSize: '11px', opacity: 0.9 }}>Press ESC to exit</span>
    </div>
)}

                    {/* Navigation Instructions */}
                    {!isPanning && currentData.length > 5 && (
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            fontSize: '12px',
                            color: '#6b7280',
                            zIndex: 50,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            maxWidth: '200px'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>🖱️ Navigation:</div>
                            <div>• <strong>Click & Drag:</strong> Pan around canvas</div>
                            <div>• <strong>Mouse Wheel:</strong> Zoom in/out</div>
                            {viewMode === 'manual' && <div>• <strong>Drag Mode:</strong> Move person cards</div>}
                            <div style={{ fontSize: '10px', marginTop: '4px', fontStyle: 'italic' }}>
                                Switch modes in toolbar above
                            </div>
                        </div>
                    )}

                    {/* Panning Indicator */}
                    {isPanning && (
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(79, 172, 254, 0.9)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            fontSize: '12px',
                            color: 'white',
                            zIndex: 50,
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🤚 Panning Mode Active
                        </div>
                    )}

                    {/* Mini-map for navigation when zoomed */}
                    {zoomLevel > 1 && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            width: '200px',
                            height: '150px',
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            zIndex: 100
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Navigation</div>
                            <div style={{
                                width: '100%',
                                height: '100px',
                                background: 'rgba(103, 126, 234, 0.1)',
                                borderRadius: '8px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {currentData.map(person => (
                                    <button
                                        key={person.id}
                                        onClick={() => focusOnPerson(person)}
                                        style={{
                                            position: 'absolute',
                                            left: `${(person.position.x / 1000) * 100}%`,
                                            top: `${(person.position.y / 600) * 100}%`,
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: selectedPerson?.id === person.id ? '#ef4444' : '#667eea',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                        title={person.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statistics overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        minWidth: '200px'
                    }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>
                            {activeBoard}
                        </h4>
                        <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div>👥 Total People: {currentData.length}</div>
                            <div>🔴 High Risk: {currentData.filter(p => ['high', 'critical'].includes(p.riskLevel)).length}</div>
                            <div>⚠️ Succession Gaps: {currentData.filter(p => p.successors.length === 0).length}</div>
                            <div>📊 Avg Team Size: {Math.round(currentData.reduce((sum, p) => sum + p.teamSize, 0) / currentData.length || 0)}</div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: storageAvailable ? '#10b981' : '#f59e0b', 
                                marginTop: '8px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px' 
                            }}>
                                {storageAvailable ? '💾 Auto-saved locally' : '⚠️ Session only - use Backup'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                {selectedPerson && (
                    <div style={{
                        width: '350px',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        margin: '20px 20px 20px 0',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(100vh - 240px)', // Ensure it fits within viewport
                        overflow: 'hidden' // Prevent overall panel overflow
                    }}>
                        {/* Fixed Header */}
                        <div style={{
                            padding: '24px 24px 0 24px',
                            flexShrink: 0 // Prevent header from shrinking
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Person Details</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Edit3 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setSelectedPerson(null)}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: selectedPerson.photo 
                                        ? `url(${selectedPerson.photo}) center/cover` 
                                        : 'linear-gradient(135deg, #667eea, #764ba2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '24px',
                                    margin: '0 auto 16px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {!selectedPerson.photo && selectedPerson.name.split(' ').map(n => n[0]).join('')}
                                    
                                    {/* Photo upload overlay */}
                                    <label style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        width: '24px',
                                        height: '24px',
                                        background: 'rgba(255,255,255,0.9)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: '2px solid white'
                                    }}>
                                        <Camera size={12} style={{ color: '#6b7280' }} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) handlePhotoUpload(selectedPerson.id, file);
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                                <h4 style={{ textAlign: 'center', margin: '0 0 8px', fontSize: '18px' }}>
                                    {selectedPerson.name}
                                </h4>
                                <p style={{ textAlign: 'center', margin: 0, color: '#6b7280' }}>
                                    {selectedPerson.title}
                                </p>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto', // Allow scrolling for content
                            padding: '0 24px 24px 24px'
                        }}>
                            <div style={{ marginBottom: '24px' }}>
                                <h5 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600' }}>Details</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                                    <div>Level: {selectedPerson.level}</div>
                                    <div>Region: {selectedPerson.region}</div>
                                    <div>Country: {selectedPerson.country}</div>
                                    <div>Team Size: {selectedPerson.teamSize} people</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Risk Level:
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            background: riskLevels[selectedPerson.riskLevel].color,
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {riskLevels[selectedPerson.riskLevel].label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                                        Succession Planning ({selectedPerson.successors.length})
                                    </h5>
                                    <button
                                        onClick={() => setShowSuccessorModal(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '6px 10px',
                                            color: '#2d3748',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Plus size={12} />
                                        Add Successor
                                    </button>
                                </div>
                                {selectedPerson.successors.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {selectedPerson.successors.map((successor, idx) => (
                                            <div key={idx} style={{
                                                padding: '12px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.7)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                                        {successor.name}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button
                                                            onClick={() => {
                                                                setEditingPerson({ personId: selectedPerson.id, successorIndex: idx, successor });
                                                                setShowSuccessorModal(true);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                borderRadius: '4px'
                                                            }}
                                                            title="Edit successor"
                                                        >
                                                            <Edit3 size={12} style={{ color: '#6b7280' }} />
                                                        </button>
                                                        <button
                                                            onClick={() => removeSuccessor(selectedPerson.id, idx)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                borderRadius: '4px'
                                                            }}
                                                            title="Remove successor"
                                                        >
                                                            <Trash2 size={12} style={{ color: '#ef4444' }} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                                    Priority: {successor.priority} • Ready: {successor.readiness}
                                                </div>
                                                {successor.type && (
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        background: successor.type === 'internal' ? '#dbeafe' : '#fef3c7',
                                                        color: successor.type === 'internal' ? '#1e40af' : '#92400e',
                                                        fontSize: '10px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {successor.type === 'internal' ? '👥 Internal' : '🌟 External'}
                                                    </div>
                                                )}
                                                {successor.notes && (
                                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
                                                        Notes: {successor.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '16px',
                                        border: '2px dashed #f59e0b',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        background: 'rgba(245, 158, 11, 0.1)'
                                    }}>
                                        <AlertTriangle size={24} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                                        <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>
                                            Succession Gap
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            No identified successors
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Analytics Dashboard Modal */}
            {showAnalytics && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <AnalyticsDashboard 
                        data={getCurrentBoardData()}
                        boardArea={activeBoard}
                        onClose={() => setShowAnalytics(false)}
                    />
                </div>
            )}

            {/* Templates Modal */}
            {showTemplates && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <TemplateModal 
                        templates={orgTemplates}
                        onApply={applyTemplate}
                        onClose={() => setShowTemplates(false)}
                    />
                </div>
            )}

            {/* Add Person Modal */}
            {showAddPersonModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <AddPersonForm 
                        onSave={handleAddPerson}
                        onCancel={() => setShowAddPersonModal(false)}
                        regions={regions}
                        boardArea={activeBoard}
                        existingPeople={getCurrentBoardData()}
                    />
                </div>
            )}

            {/* Edit Person Modal */}
            {showEditModal && selectedPerson && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <EditPersonModal 
                        person={selectedPerson}
                        onSave={(updates) => {
                            updatePerson(selectedPerson.id, updates);
                            setShowEditModal(false);
                        }}
                        onCancel={() => setShowEditModal(false)}
                        regions={regions}
                        existingPeople={getCurrentBoardData()}
                    />
                </div>
            )}

            {/* Successor Modal */}
            {showSuccessorModal && selectedPerson && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <SuccessorModal 
                        person={selectedPerson}
                        editingData={editingPerson}
                        existingPeople={getCurrentBoardData()}
                        onSave={(successorData) => {
                            if (editingPerson) {
                                updateSuccessor(editingPerson.personId, editingPerson.successorIndex, successorData);
                                setEditingPerson(null);
                            } else {
                                addSuccessor(selectedPerson.id, successorData);
                            }
                            setShowSuccessorModal(false);
                        }}
                        onCancel={() => {
                            setShowSuccessorModal(false);
                            setEditingPerson(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

// Add Person Form Component
const AddPersonForm = ({ onSave, onCancel, regions, boardArea, existingPeople }) => {
    // Corporate hierarchy levels
    const corporateLevels = {
        'T5': { label: 'T5 - Senior Leader', numericValue: 4, color: '#9ca3af' },
        'EL': { label: 'EL - Executive Leader', numericValue: 3, color: '#6b7280' },
        'SEL': { label: 'SEL - Senior Executive Leader', numericValue: 2, color: '#374151' },
        'GEL': { label: 'GEL - Global Executive Leader', numericValue: 1, color: '#1f2937' }
    };

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        level: 'EL',
        region: 'EMEA',
        country: '',
        reportsTo: '',
        teamSize: 0,
        riskLevel: 'low',
        successors: [],
        photo: null
    });

    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const photoUrl = event.target.result;
                setFormData({...formData, photo: photoUrl});
                setPhotoPreview(photoUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (formData.name && formData.title) {
            onSave(formData);
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
        }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '700' }}>
                Add New Person - {boardArea}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Photo Upload Section */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: photoPreview 
                            ? `url(${photoPreview}) center/cover` 
                            : 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '24px',
                        margin: '0 auto 16px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {!photoPreview && (formData.name ? formData.name.split(' ').map(n => n[0]).join('') : '?')}
                        
                        <label style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '28px',
                            height: '28px',
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '2px solid white'
                        }}>
                            <Camera size={14} style={{ color: '#6b7280' }} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        Click camera icon to upload photo (optional)
                    </p>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Job Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Corporate Level</label>
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            {Object.entries(corporateLevels).map(([key, level]) => (
                                <option key={key} value={key}>{level.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Team Size</label>
                        <input
                            type="number"
                            value={formData.teamSize}
                            onChange={(e) => setFormData({...formData, teamSize: parseInt(e.target.value) || 0})}
                            min="0"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Region</label>
                        <select
                            value={formData.region}
                            onChange={(e) => setFormData({...formData, region: e.target.value, country: ''})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            {Object.entries(regions).map(([key, region]) => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Country</label>
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select Country</option>
                            {regions[formData.region]?.countries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Reports To</label>
                        <select
                            value={formData.reportsTo}
                            onChange={(e) => setFormData({...formData, reportsTo: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">No Manager</option>
                            {existingPeople.map(person => (
                                <option key={person.id} value={person.id}>{person.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Risk Level</label>
                        <select
                            value={formData.riskLevel}
                            onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="low">Low Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                            <option value="critical">Critical Risk</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                        onClick={handleSubmit}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Add Person
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: '#e5e7eb',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#374151',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

window.InteractiveOrganogram = InteractiveOrganogram;