// Interactive Skills Assessment React Component
// Save as js/components/InteractiveSkillsAssessment.js

const InteractiveSkillsAssessment = ({ aiAnalysis, candidate, onSkillsUpdate }) => {
  const [skillsData, setSkillsData] = React.useState({});
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingSkillName, setEditingSkillName] = React.useState(null);
  const [newSkillName, setNewSkillName] = React.useState('');

  // Initialize skills from AI analysis
  React.useEffect(() => {
    if (aiAnalysis && aiAnalysis.analysis) {
      const initialSkills = {};
      
      Object.entries(aiAnalysis.analysis).forEach(([key, value]) => {
        if (key !== 'overall_impression') {
          initialSkills[key] = {
            aiScore: value,
            humanScore: null,
            label: key.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            category: getSkillCategory(key),
            importance: 'medium'
          };
        }
      });
      
      setSkillsData(initialSkills);
    }
  }, [aiAnalysis]);

  const getSkillCategory = (skillKey) => {
    if (skillKey.includes('technical') || skillKey.includes('problem')) return 'technical';
    if (skillKey.includes('communication') || skillKey.includes('leadership') || skillKey.includes('cultural')) return 'soft_skills';
    if (skillKey.includes('experience')) return 'experience';
    return 'general';
  };

  const handleBarClick = (skillKey, event) => {
    if (!isEditing || editingSkillName === skillKey) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    const updatedSkills = {
      ...skillsData,
      [skillKey]: {
        ...skillsData[skillKey],
        humanScore: Math.round(percentage * 100) / 100
      }
    };
    
    setSkillsData(updatedSkills);
    
    // Notify parent component of changes
    if (onSkillsUpdate) {
      onSkillsUpdate(updatedSkills);
    }
  };

  const resetScore = (skillKey) => {
    const updatedSkills = {
      ...skillsData,
      [skillKey]: {
        ...skillsData[skillKey],
        humanScore: null
      }
    };
    
    setSkillsData(updatedSkills);
    if (onSkillsUpdate) onSkillsUpdate(updatedSkills);
  };

  const updateSkillName = (skillKey, newName) => {
    if (!newName.trim()) return;
    
    const updatedSkills = {
      ...skillsData,
      [skillKey]: {
        ...skillsData[skillKey],
        label: newName.trim()
      }
    };
    
    setSkillsData(updatedSkills);
    setEditingSkillName(null);
    if (onSkillsUpdate) onSkillsUpdate(updatedSkills);
  };

  const deleteSkill = (skillKey) => {
    const updatedSkills = { ...skillsData };
    delete updatedSkills[skillKey];
    setSkillsData(updatedSkills);
    if (onSkillsUpdate) onSkillsUpdate(updatedSkills);
  };

  const addNewSkill = () => {
    if (!newSkillName.trim()) return;
    
    const skillKey = newSkillName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const updatedSkills = {
      ...skillsData,
      [skillKey]: {
        aiScore: 0.5,
        humanScore: null,
        label: newSkillName.trim(),
        category: 'custom',
        importance: 'medium'
      }
    };
    
    setSkillsData(updatedSkills);
    setNewSkillName('');
    if (onSkillsUpdate) onSkillsUpdate(updatedSkills);
  };

  const getDisplayScore = (skill) => {
    return skill.humanScore !== null ? skill.humanScore : skill.aiScore;
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#10b981'; // green
    if (score >= 0.6) return '#f59e0b'; // amber
    if (score >= 0.4) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Needs Improvement';
    return 'Concerning';
  };

  if (!skillsData || Object.keys(skillsData).length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>🎯 Interactive Skills Assessment</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>Generate AI analysis first to see skill bars</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      padding: '24px',
      borderRadius: '16px',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            🎯 Interactive Skills Assessment
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
            {isEditing ? 'Click bars to adjust scores, edit names, or add/remove skills' : 'AI-generated assessment - click Edit to customize'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              background: isEditing ? '#ef4444' : '#3b82f6',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isEditing ? '✅ Done' : '✏️ Edit'}
          </button>
        </div>
      </div>

      {/* Add New Skill (when editing) */}
      {isEditing && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
            ➕ Add Role-Specific Skill
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g., SAP Knowledge, Client Relations, Domain Expertise..."
              onKeyPress={(e) => e.key === 'Enter' && addNewSkill()}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              onClick={addNewSkill}
              disabled={!newSkillName.trim()}
              style={{
                background: newSkillName.trim() ? '#10b981' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: newSkillName.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
        fontSize: '11px',
        opacity: 0.8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px',
            height: '3px',
            background: '#64748b',
            borderRadius: '2px'
          }}></div>
          AI Assessment
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px',
            height: '3px',
            background: '#3b82f6',
            borderRadius: '2px'
          }}></div>
          Human Override
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px',
            height: '3px',
            background: '#10b981',
            borderRadius: '2px'
          }}></div>
          Custom Added
        </div>
      </div>

      {/* Skills Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(skillsData).map(([skillKey, skill]) => {
          const displayScore = getDisplayScore(skill);
          const hasHumanOverride = skill.humanScore !== null;
          const isCustomSkill = skill.category === 'custom';
          
          return (
            <div key={skillKey}>
              {/* Skill Label and Score */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 1
                }}>
                  {editingSkillName === skillKey ? (
                    <input
                      type="text"
                      defaultValue={skill.label}
                      autoFocus
                      onBlur={(e) => updateSkillName(skillKey, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateSkillName(skillKey, e.target.value);
                        } else if (e.key === 'Escape') {
                          setEditingSkillName(null);
                        }
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '600',
                        minWidth: '150px',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <>
                      <span 
                        onClick={() => isEditing && setEditingSkillName(skillKey)}
                        style={{
                          cursor: isEditing ? 'pointer' : 'default',
                          padding: isEditing ? '4px' : '0',
                          borderRadius: '4px',
                          background: isEditing ? 'rgba(255,255,255,0.05)' : 'transparent'
                        }}
                        title={isEditing ? 'Click to edit skill name' : ''}
                      >
                        {skill.label}
                      </span>
                      {hasHumanOverride && (
                        <span style={{
                          background: '#3b82f6',
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>
                          HUMAN
                        </span>
                      )}
                      {isCustomSkill && (
                        <span style={{
                          background: '#10b981',
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>
                          CUSTOM
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: getScoreColor(displayScore)
                  }}>
                    {Math.round(displayScore * 100)}%
                  </span>
                  
                  <span style={{
                    fontSize: '10px',
                    opacity: 0.7,
                    minWidth: '70px',
                    textAlign: 'right'
                  }}>
                    {getScoreLabel(displayScore)}
                  </span>
                  
                  {hasHumanOverride && (
                    <button
                      onClick={() => resetScore(skillKey)}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                      title="Reset to AI score"
                    >
                      ↶
                    </button>
                  )}

                  {isEditing && (
                    <button
                      onClick={() => deleteSkill(skillKey)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      title="Delete this skill"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div
                onClick={(e) => handleBarClick(skillKey, e)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  height: '20px',
                  position: 'relative',
                  cursor: isEditing ? 'pointer' : 'default',
                  border: isEditing ? '2px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                  overflow: 'hidden'
                }}
              >
                {/* AI Score Background Bar */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${skill.aiScore * 100}%`,
                  background: 'rgba(100, 116, 139, 0.6)',
                  borderRadius: '6px'
                }}></div>

                {/* Current Score Bar */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${displayScore * 100}%`,
                  background: hasHumanOverride 
                    ? 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                    : isCustomSkill
                    ? 'linear-gradient(90deg, #10b981, #059669)'
                    : `linear-gradient(90deg, ${getScoreColor(displayScore)}, ${getScoreColor(displayScore)}dd)`,
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}></div>

                {/* Score Difference Indicator */}
                {hasHumanOverride && (
                  <div style={{
                    position: 'absolute',
                    left: `${Math.min(skill.aiScore, skill.humanScore) * 100}%`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: `${Math.abs(skill.aiScore - skill.humanScore) * 100}%`,
                    height: '2px',
                    background: skill.humanScore > skill.aiScore ? '#10b981' : '#ef4444',
                    borderRadius: '1px'
                  }}></div>
                )}

                {/* Click Target Overlay */}
                {isEditing && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '600',
                    opacity: 0.8
                  }}>
                    Click to adjust
                  </div>
                )}
              </div>

              {/* Score Comparison */}
              {hasHumanOverride && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  fontSize: '10px',
                  opacity: 0.7
                }}>
                  <span>AI: {Math.round(skill.aiScore * 100)}%</span>
                  <span>Your Assessment: {Math.round(skill.humanScore * 100)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
          📊 Assessment Summary
        </div>
        <div style={{ fontSize: '11px', opacity: 0.8, lineHeight: '1.4' }}>
          {(() => {
            const totalSkills = Object.keys(skillsData).length;
            const overriddenScores = Object.values(skillsData).filter(s => s.humanScore !== null).length;
            const customSkills = Object.values(skillsData).filter(s => s.category === 'custom').length;
            
            if (overriddenScores > 0 || customSkills > 0) {
              return (
                <>
                  {overriddenScores > 0 && `You've adjusted ${overriddenScores} of ${totalSkills} scores. `}
                  {customSkills > 0 && `Added ${customSkills} custom skill${customSkills > 1 ? 's' : ''}. `}
                  Your customizations will be saved and used for decision-making.
                </>
              );
            } else {
              return (
                <>
                  Using AI-generated assessments. Click "Edit" to adjust scores, edit skill names, or add role-specific skills.
                </>
              );
            }
          })()}
        </div>
        
        {isEditing && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '6px',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <strong>💡 Tips:</strong> Click skill names to edit them • Click bars to adjust scores • Use the trash icon to remove irrelevant skills • Add role-specific skills above
          </div>
        )}
      </div>
    </div>
  );
};

// Export for use in other components
window.InteractiveSkillsAssessment = InteractiveSkillsAssessment;