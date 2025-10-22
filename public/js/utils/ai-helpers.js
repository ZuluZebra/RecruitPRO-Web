// Ultra Safe AI Helper Functions - EXACT OLD FORMAT
// This version returns data in exactly the same format as your original

class AIAssistant {
    constructor() {
        this.keywords = {
            technical: ['javascript', 'react', 'python', 'node.js', 'aws', 'docker', 'kubernetes', 'api', 'database', 'sql', 'nosql', 'mongodb', 'typescript', 'vue', 'angular', 'git', 'ci/cd', 'testing', 'agile', 'scrum', 'cloud', 'microservices', 'devops', 'frontend', 'backend', 'full-stack'],
            soft_skills: ['communication', 'leadership', 'teamwork', 'problem-solving', 'creativity', 'adaptability', 'time management', 'critical thinking', 'collaboration', 'presentation', 'negotiation', 'analytical', 'strategic', 'initiative', 'mentoring'],
            experience: ['senior', 'junior', 'lead', 'architect', 'manager', 'director', 'years', 'experience', 'background', 'worked', 'managed', 'developed', 'implemented', 'designed', 'built', 'created', 'launched'],
            concerns: ['concern', 'worry', 'issue', 'problem', 'weakness', 'lack', 'insufficient', 'poor', 'needs improvement', 'struggle', 'difficulty', 'unclear', 'confusing', 'inadequate', 'limited', 'weak'],
            strengths: ['excellent', 'strong', 'outstanding', 'impressive', 'skilled', 'proficient', 'experienced', 'knowledgeable', 'talented', 'capable', 'good', 'solid', 'exceptional', 'remarkable', 'superior']
        };
        
        // Real sentiment analysis word scores
        this.sentimentWords = {
            positive: {
                'excellent': 3, 'outstanding': 3, 'exceptional': 3, 'brilliant': 3, 'amazing': 3,
                'great': 2, 'good': 2, 'strong': 2, 'impressive': 2, 'solid': 2, 'skilled': 2,
                'capable': 1, 'adequate': 1, 'satisfactory': 1, 'decent': 1, 'fine': 1
            },
            negative: {
                'terrible': -3, 'awful': -3, 'horrible': -3, 'poor': -3, 'bad': -3,
                'weak': -2, 'inadequate': -2, 'insufficient': -2, 'lacking': -2, 'limited': -2,
                'concerning': -1, 'unclear': -1, 'confusing': -1, 'needs improvement': -1
            }
        };
        
        // Skills database for intelligent matching
        this.skillsDatabase = {
            'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015', 'node'],
            'react': ['react', 'reactjs', 'react.js', 'jsx', 'hooks', 'redux'],
            'python': ['python', 'py', 'django', 'flask', 'pandas', 'numpy'],
            'leadership': ['lead', 'leadership', 'manage', 'manager', 'team lead', 'director'],
            'communication': ['communicate', 'presentation', 'public speaking', 'articulate'],
            'problem-solving': ['problem solving', 'analytical', 'debugging', 'troubleshooting']
        };
        
        this.processingCache = new Map();
        this.cacheTimeout = 5000;
    }

    // ===== EXACT OLD FORMAT METHODS =====
    
    /**
     * Returns data in EXACTLY the same format as the original
     */
    generateInterviewSummary(interviewData, candidate) {
        const { feedback } = interviewData;
        
        const analysis = this.analyzeInterviewContent(feedback, candidate);
        const insights = this.extractKeyInsights(feedback, candidate);
        const recommendations = this.generateRecommendations(feedback, analysis, candidate);
        const executiveSummary = this.createExecutiveSummary(feedback, analysis, candidate);
        
        return {
            executiveSummary,
            keyInsights: insights,
            recommendations,
            analysis,
            riskFactors: this.identifyRiskFactors(feedback, candidate),
            nextSteps: this.suggestInterviewNextSteps(feedback, feedback.recommendation, candidate),
            confidenceScore: this.calculateConfidenceScore(analysis),
            candidateId: candidate.id,
            candidateName: candidate.name,
            generatedAt: new Date().toISOString()
        };
    }

    analyzeInterviewContent(feedback, candidate) {
        const fullText = [feedback.notes, feedback.strengths, feedback.concerns].join(' ');
        const textLower = fullText.toLowerCase();
        const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 5);
        const rating = feedback.rating || 5;
        
        console.log('🤖 AI: Analyzing interview content for', candidate.name);
        
        // Real sentiment analysis
        const sentimentScore = this.calculateSentiment(textLower);
        
        // Intelligent skill detection
        const detectedSkills = this.detectSkills(textLower);
        
        // Context analysis based on job requirements
        const jobContext = this.analyzeJobContext(candidate.job_title || '', textLower);
        
        // Real analysis scores
        const analysis = {};
        
        // Technical skills (weighted by job relevance and mention context)
        analysis.technical_skills = this.calculateTechnicalScore(textLower, detectedSkills, jobContext, rating);
        
        // Communication skills (based on interview style and feedback quality)
        analysis.communication = this.calculateCommunicationScore(textLower, sentences, sentimentScore, rating);
        
        // Problem solving (context-aware detection)
        analysis.problem_solving = this.calculateProblemSolvingScore(textLower, sentences, rating);
        
        // Cultural fit (team dynamics and collaboration indicators)
        analysis.cultural_fit = this.calculateCulturalFitScore(textLower, sentimentScore, rating);
        
        // Leadership potential (based on experience level and indicators)
        analysis.leadership_potential = this.calculateLeadershipScore(textLower, candidate, rating);
        
        // Growth potential (learning mindset and adaptability)
        analysis.growth_potential = this.calculateGrowthScore(textLower, sentences, rating);
        
        // Overall impression (weighted combination of factors)
        analysis.overall_impression = this.calculateOverallScore(analysis, sentimentScore, rating);
        
        // Store detected skills for insights
        analysis._detectedSkills = detectedSkills;
        analysis._sentimentScore = sentimentScore;
        
        console.log('🤖 AI: Analysis complete. Detected skills:', detectedSkills.slice(0, 5));
        
        return analysis;
    }
    
    // Real sentiment analysis
    calculateSentiment(text) {
        let score = 0;
        let wordCount = 0;
        
        // Check positive words
        Object.entries(this.sentimentWords.positive).forEach(([word, value]) => {
            const matches = (text.match(new RegExp(word, 'g')) || []).length;
            score += matches * value;
            wordCount += matches;
        });
        
        // Check negative words
        Object.entries(this.sentimentWords.negative).forEach(([word, value]) => {
            const matches = (text.match(new RegExp(word, 'g')) || []).length;
            score += matches * value;
            wordCount += matches;
        });
        
        // Normalize score (-1 to 1)
        return wordCount > 0 ? Math.max(-1, Math.min(1, score / Math.max(wordCount, 3))) : 0;
    }
    
    // Intelligent skill detection
    detectSkills(text) {
        const detectedSkills = [];
        
        Object.entries(this.skillsDatabase).forEach(([skill, variants]) => {
            const skillScore = variants.reduce((score, variant) => {
                const matches = (text.match(new RegExp(variant, 'g')) || []).length;
                return score + matches;
            }, 0);
            
            if (skillScore > 0) {
                detectedSkills.push({
                    skill: skill,
                    confidence: Math.min(1, skillScore * 0.3),
                    mentions: skillScore
                });
            }
        });
        
        return detectedSkills.sort((a, b) => b.confidence - a.confidence);
    }
    
    // Job context analysis
    analyzeJobContext(jobTitle, text) {
        const jobLower = jobTitle.toLowerCase();
        const context = {
            seniority: 'mid',
            domain: 'general',
            techStack: [],
            isLeadership: false
        };
        
        // Detect seniority
        if (jobLower.includes('senior') || jobLower.includes('lead') || jobLower.includes('architect')) {
            context.seniority = 'senior';
        } else if (jobLower.includes('junior') || jobLower.includes('graduate') || jobLower.includes('entry')) {
            context.seniority = 'junior';
        }
        
        // Detect leadership role
        context.isLeadership = jobLower.includes('lead') || jobLower.includes('manager') || jobLower.includes('director');
        
        // Detect tech domain
        if (jobLower.includes('frontend') || jobLower.includes('react') || jobLower.includes('ui')) {
            context.domain = 'frontend';
        } else if (jobLower.includes('backend') || jobLower.includes('api') || jobLower.includes('server')) {
            context.domain = 'backend';
        } else if (jobLower.includes('full') || jobLower.includes('fullstack')) {
            context.domain = 'fullstack';
        }
        
        return context;
    }
    
    // Calculate technical skills score
    calculateTechnicalScore(text, detectedSkills, jobContext, rating) {
        let baseScore = rating / 10;
        
        // Boost for relevant technical skills
        const relevantSkills = detectedSkills.filter(s => 
            this.keywords.technical.some(tech => s.skill.includes(tech))
        );
        
        const skillBonus = Math.min(0.4, relevantSkills.length * 0.1);
        
        // Context bonus for seniority expectations
        let contextBonus = 0;
        if (jobContext.seniority === 'senior' && relevantSkills.length >= 3) {
            contextBonus = 0.2;
        } else if (jobContext.seniority === 'junior' && relevantSkills.length >= 1) {
            contextBonus = 0.1;
        }
        
        return Math.min(1, Math.max(0, baseScore + skillBonus + contextBonus));
    }
    
    // Calculate communication score
    calculateCommunicationScore(text, sentences, sentimentScore, rating) {
        let baseScore = rating / 10;
        
        // Analyze sentence complexity and structure
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
        const structureBonus = avgSentenceLength > 10 && avgSentenceLength < 25 ? 0.1 : 0;
        
        // Sentiment consistency
        const sentimentBonus = sentimentScore > 0 ? 0.1 : (sentimentScore < -0.3 ? -0.1 : 0);
        
        // Communication keywords
        const commKeywords = ['articulate', 'clear', 'explain', 'communicate', 'present'];
        const commMentions = commKeywords.reduce((count, word) => 
            count + (text.includes(word) ? 1 : 0), 0
        );
        const commBonus = Math.min(0.2, commMentions * 0.1);
        
        return Math.min(1, Math.max(0, baseScore + structureBonus + sentimentBonus + commBonus));
    }
    
    // Calculate problem solving score
    calculateProblemSolvingScore(text, sentences, rating) {
        let baseScore = rating / 10;
        
        // Look for problem-solving indicators
        const problemPatterns = [
            'solved', 'solution', 'approach', 'strategy', 'debug', 'troubleshoot',
            'analyze', 'optimize', 'improve', 'fix', 'resolve'
        ];
        
        const problemMentions = problemPatterns.reduce((count, pattern) => 
            count + (text.includes(pattern) ? 1 : 0), 0
        );
        
        const problemBonus = Math.min(0.3, problemMentions * 0.05);
        
        return Math.min(1, Math.max(0, baseScore + problemBonus));
    }
    
    // Calculate cultural fit score
    calculateCulturalFitScore(text, sentimentScore, rating) {
        let baseScore = rating / 10;
        
        // Team collaboration indicators
        const teamWords = ['team', 'collaborate', 'together', 'support', 'help', 'share'];
        const teamMentions = teamWords.reduce((count, word) => 
            count + (text.includes(word) ? 1 : 0), 0
        );
        
        const teamBonus = Math.min(0.2, teamMentions * 0.05);
        
        // Sentiment factor
        const sentimentFactor = sentimentScore * 0.1;
        
        return Math.min(1, Math.max(0, baseScore + teamBonus + sentimentFactor));
    }
    
    // Calculate leadership score
    calculateLeadershipScore(text, candidate, rating) {
        let baseScore = rating / 10;
        
        // Leadership indicators
        const leadershipWords = ['lead', 'manage', 'mentor', 'guide', 'direct', 'oversee'];
        const leadershipMentions = leadershipWords.reduce((count, word) => 
            count + (text.includes(word) ? 1 : 0), 0
        );
        
        // Experience factor
        const jobTitle = (candidate.job_title || '').toLowerCase();
        const hasLeadershipTitle = jobTitle.includes('lead') || jobTitle.includes('senior') || jobTitle.includes('manager');
        
        const leadershipBonus = Math.min(0.3, leadershipMentions * 0.1);
        const titleBonus = hasLeadershipTitle ? 0.1 : 0;
        
        return Math.min(1, Math.max(0, baseScore + leadershipBonus + titleBonus));
    }
    
    // Calculate growth potential score
    calculateGrowthScore(text, sentences, rating) {
        let baseScore = rating / 10;
        
        // Growth mindset indicators
        const growthWords = ['learn', 'grow', 'develop', 'improve', 'adapt', 'curious', 'eager'];
        const growthMentions = growthWords.reduce((count, word) => 
            count + (text.includes(word) ? 1 : 0), 0
        );
        
        const growthBonus = Math.min(0.2, growthMentions * 0.05);
        
        return Math.min(1, Math.max(0, baseScore + growthBonus));
    }
    
    // Calculate overall impression score
    calculateOverallScore(analysis, sentimentScore, rating) {
        const weights = {
            technical_skills: 0.25,
            communication: 0.20,
            problem_solving: 0.20,
            cultural_fit: 0.15,
            leadership_potential: 0.10,
            growth_potential: 0.10
        };
        
        let weightedScore = 0;
        Object.entries(weights).forEach(([key, weight]) => {
            weightedScore += (analysis[key] || 0) * weight;
        });
        
        // Factor in sentiment and rating
        const sentimentFactor = sentimentScore * 0.1;
        const ratingFactor = (rating / 10) * 0.3;
        
        return Math.min(1, Math.max(0, weightedScore * 0.7 + ratingFactor + sentimentFactor));
    }

    extractKeyInsights(feedback, candidate) {
        const insights = [];
        const fullText = [feedback.notes, feedback.strengths, feedback.concerns].join(' ');
        const textLower = fullText.toLowerCase();
        const rating = feedback.rating || 5;
        
        console.log('🤖 AI: Generating intelligent insights for', candidate.name);
        
        // Get analysis data for context
        const analysis = this.analyzeInterviewContent(feedback, candidate);
        const detectedSkills = analysis._detectedSkills || [];
        const sentimentScore = analysis._sentimentScore || 0;
        
        // 1. SKILL-BASED INSIGHTS
        this.generateSkillInsights(insights, detectedSkills, candidate, rating, textLower);
        
        // 2. PERFORMANCE INSIGHTS
        this.generatePerformanceInsights(insights, analysis, candidate, rating, sentimentScore);
        
        // 3. EXPERIENCE & BACKGROUND INSIGHTS
        this.generateExperienceInsights(insights, candidate, textLower, rating);
        
        // 4. CULTURAL FIT INSIGHTS
        this.generateCulturalInsights(insights, analysis, candidate, textLower);
        
        // 5. RISK & CONCERN INSIGHTS
        this.generateRiskInsights(insights, feedback, candidate, textLower, rating);
        
        // 6. POTENTIAL & GROWTH INSIGHTS
        this.generateGrowthInsights(insights, analysis, candidate, textLower);
        
        // Sort by importance and confidence
        return insights
            .sort((a, b) => {
                const importanceOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
                return importanceOrder[b.importance] - importanceOrder[a.importance];
            })
            .slice(0, 8); // Limit to top 8 insights
    }
    
    // Generate skill-based insights
    generateSkillInsights(insights, detectedSkills, candidate, rating, textLower) {
        if (detectedSkills.length === 0) return;
        
        const topSkills = detectedSkills.slice(0, 3);
        const jobTitle = (candidate.job_title || '').toLowerCase();
        
        // Strong technical skills insight
        if (topSkills.length >= 2 && rating >= 7) {
            const skillNames = topSkills.map(s => s.skill).join(', ');
            insights.push({
                category: 'technical',
                insight: `Strong technical capabilities demonstrated in ${skillNames}. Skills align well with ${candidate.job_title || 'role'} requirements.`,
                importance: 'high',
                confidence: 0.9,
                candidateId: candidate.id,
                actionable: true,
                data: { skills: topSkills.map(s => s.skill) }
            });
        }
        
        // Skill gap insight
        const expectedSkills = this.getExpectedSkillsForRole(jobTitle);
        const missingSkills = expectedSkills.filter(expected => 
            !topSkills.some(detected => detected.skill.includes(expected))
        );
        
        if (missingSkills.length > 0 && rating < 8) {
            insights.push({
                category: 'technical',
                insight: `Consider exploring ${missingSkills.slice(0, 2).join(' and ')} experience in follow-up discussions. Not mentioned in current feedback.`,
                importance: 'medium',
                confidence: 0.7,
                candidateId: candidate.id,
                actionable: true,
                data: { missingSkills }
            });
        }
        
        // Standout skill insight
        const standoutSkill = topSkills.find(s => s.confidence > 0.8);
        if (standoutSkill && textLower.includes('expert') || textLower.includes('exceptional')) {
            insights.push({
                category: 'technical',
                insight: `Exceptional ${standoutSkill.skill} expertise highlighted. This could be valuable for mentoring and technical leadership.`,
                importance: 'high',
                confidence: 0.85,
                candidateId: candidate.id,
                actionable: true,
                data: { standoutSkill: standoutSkill.skill }
            });
        }
    }
    
    // Generate performance insights
    generatePerformanceInsights(insights, analysis, candidate, rating, sentimentScore) {
        // Outstanding performance
        if (rating >= 9 && sentimentScore > 0.5) {
            insights.push({
                category: 'performance',
                insight: `Exceptional interview performance (${rating}/10) with overwhelmingly positive feedback. Strong hire recommendation.`,
                importance: 'critical',
                confidence: 0.95,
                candidateId: candidate.id,
                actionable: true,
                data: { rating, sentiment: 'very_positive' }
            });
        }
        
        // Inconsistent performance
        else if (Math.abs(rating - (sentimentScore * 5 + 5)) > 2) {
            const direction = rating > (sentimentScore * 5 + 5) ? 'higher than' : 'lower than';
            insights.push({
                category: 'performance',
                insight: `Rating (${rating}/10) appears ${direction} sentiment in written feedback. May warrant discussion with interviewer for clarity.`,
                importance: 'medium',
                confidence: 0.8,
                candidateId: candidate.id,
                actionable: true,
                data: { rating, sentimentScore }
            });
        }
        
        // Communication strength
        if (analysis.communication > 0.8) {
            insights.push({
                category: 'soft_skills',
                insight: `Excellent communication skills noted. Strong indicator for client-facing roles and team collaboration.`,
                importance: 'high',
                confidence: 0.85,
                candidateId: candidate.id,
                actionable: false,
                data: { communicationScore: analysis.communication }
            });
        }
    }
    
    // Generate experience insights
    generateExperienceInsights(insights, candidate, textLower, rating) {
        const company = candidate.company;
        const jobTitle = candidate.job_title || '';
        
        // Company background insight
        if (company && textLower.includes(company.toLowerCase())) {
            const isPositive = rating >= 7;
            const sentiment = isPositive ? 'valuable' : 'relevant but requires assessment';
            
            insights.push({
                category: 'experience',
                insight: `${company} background provides ${sentiment} context for this role. Direct industry experience could accelerate onboarding.`,
                importance: isPositive ? 'high' : 'medium',
                confidence: 0.8,
                candidateId: candidate.id,
                actionable: true,
                data: { company, relevance: sentiment }
            });
        }
        
        // Seniority alignment
        const isSeniorRole = jobTitle.toLowerCase().includes('senior') || jobTitle.toLowerCase().includes('lead');
        const hasLeadershipMentions = textLower.includes('lead') || textLower.includes('manage') || textLower.includes('mentor');
        
        if (isSeniorRole && !hasLeadershipMentions && rating >= 7) {
            insights.push({
                category: 'experience',
                insight: `Strong technical performance but limited leadership discussion for ${jobTitle}. Consider exploring team management experience.`,
                importance: 'medium',
                confidence: 0.75,
                candidateId: candidate.id,
                actionable: true,
                data: { roleLevel: 'senior', leadershipGap: true }
            });
        }
    }
    
    // Generate cultural fit insights  
    generateCulturalInsights(insights, analysis, candidate, textLower) {
        // Team collaboration
        if (analysis.cultural_fit > 0.8) {
            insights.push({
                category: 'cultural_fit',
                insight: `Strong team collaboration indicators. Feedback suggests excellent cultural alignment and interpersonal skills.`,
                importance: 'high',
                confidence: 0.85,
                candidateId: candidate.id,
                actionable: false,
                data: { culturalFitScore: analysis.cultural_fit }
            });
        }
        
        // Potential cultural concerns
        else if (analysis.cultural_fit < 0.5 && textLower.includes('concern')) {
            insights.push({
                category: 'cultural_fit',
                insight: `Some cultural fit concerns noted in feedback. Recommend additional team interaction or reference checks.`,
                importance: 'medium',
                confidence: 0.7,
                candidateId: candidate.id,
                actionable: true,
                data: { culturalFitScore: analysis.cultural_fit, requiresFollowUp: true }
            });
        }
    }
    
    // Generate risk insights
    generateRiskInsights(insights, feedback, candidate, textLower, rating) {
        const concerns = feedback.concerns || '';
        const concernsLower = concerns.toLowerCase();
        
        // Red flag detection
        const redFlags = ['poor communication', 'unprepared', 'attitude', 'dishonest', 'rude'];
        const detectedFlags = redFlags.filter(flag => concernsLower.includes(flag));
        
        if (detectedFlags.length > 0) {
            insights.push({
                category: 'risk',
                insight: `⚠️ Significant concerns raised: ${detectedFlags.join(', ')}. High-risk candidate requiring careful consideration.`,
                importance: 'critical',
                confidence: 0.9,
                candidateId: candidate.id,
                actionable: true,
                data: { redFlags: detectedFlags }
            });
        }
        
        // Experience gaps
        else if (concernsLower.includes('experience') && concernsLower.includes('lack')) {
            insights.push({
                category: 'risk',
                insight: `Experience gaps noted in feedback. Consider if additional training or mentoring could address these concerns.`,
                importance: 'medium',
                confidence: 0.8,
                candidateId: candidate.id,
                actionable: true,
                data: { riskType: 'experience_gap' }
            });
        }
        
        // Low rating with unclear reasons
        else if (rating <= 5 && concerns.length < 20) {
            insights.push({
                category: 'risk',
                insight: `Low rating (${rating}/10) with limited feedback detail. Recommend following up with interviewer for specific concerns.`,
                importance: 'medium',
                confidence: 0.75,
                candidateId: candidate.id,
                actionable: true,
                data: { rating, feedbackQuality: 'low' }
            });
        }
    }
    
    // Generate growth potential insights
    generateGrowthInsights(insights, analysis, candidate, textLower) {
        // High growth potential
        if (analysis.growth_potential > 0.7) {
            insights.push({
                category: 'growth',
                insight: `Strong learning mindset and growth potential identified. Excellent candidate for roles requiring adaptability and development.`,
                importance: 'high',
                confidence: 0.8,
                candidateId: candidate.id,
                actionable: false,
                data: { growthScore: analysis.growth_potential }
            });
        }
        
        // Leadership development potential
        if (analysis.leadership_potential > 0.6 && analysis.growth_potential > 0.6) {
            insights.push({
                category: 'growth',
                insight: `Shows leadership development potential. Consider for roles with growth trajectory or mentorship opportunities.`,
                importance: 'medium',
                confidence: 0.75,
                candidateId: candidate.id,
                actionable: true,
                data: { leadershipPotential: analysis.leadership_potential }
            });
        }
    }
    
    // Helper: Get expected skills for role
    getExpectedSkillsForRole(jobTitle) {
        const roleSkillMap = {
            'frontend': ['javascript', 'react', 'css', 'html'],
            'backend': ['python', 'javascript', 'database', 'api'],
            'fullstack': ['javascript', 'react', 'python', 'database'],
            'lead': ['leadership', 'communication', 'management'],
            'senior': ['leadership', 'mentoring', 'architecture']
        };
        
        const expectedSkills = [];
        Object.entries(roleSkillMap).forEach(([key, skills]) => {
            if (jobTitle.includes(key)) {
                expectedSkills.push(...skills);
            }
        });
        
        return [...new Set(expectedSkills)]; // Remove duplicates
    }

    generateRecommendations(feedback, analysis, candidate) {
        const recommendations = [];
        const rating = feedback.rating || 5;
        const textLower = [feedback.notes, feedback.strengths, feedback.concerns].join(' ').toLowerCase();
        const sentimentScore = analysis._sentimentScore || 0;
        const detectedSkills = analysis._detectedSkills || [];
        
        console.log('🤖 AI: Generating intelligent recommendations for', candidate.name);
        
        // Calculate overall candidate strength
        const overallStrength = this.calculateCandidateStrength(analysis, rating, sentimentScore);
        
        // Generate primary recommendation
        const primaryRec = this.generatePrimaryRecommendation(overallStrength, candidate, rating, analysis);
        recommendations.push(primaryRec);
        
        // Generate specific action recommendations
        const actionRecs = this.generateActionRecommendations(feedback, analysis, candidate, textLower);
        recommendations.push(...actionRecs);
        
        // Generate follow-up recommendations
        const followUpRecs = this.generateFollowUpRecommendations(analysis, candidate, rating);
        recommendations.push(...followUpRecs);
        
        return recommendations.slice(0, 5); // Limit to top 5 recommendations
    }
    
    // Calculate overall candidate strength
    calculateCandidateStrength(analysis, rating, sentimentScore) {
        const weights = {
            rating: 0.4,
            sentiment: 0.2,
            technical: 0.15,
            communication: 0.15,
            cultural_fit: 0.1
        };
        
        const normalizedRating = rating / 10;
        const normalizedSentiment = (sentimentScore + 1) / 2; // Convert -1,1 to 0,1
        
        return (
            normalizedRating * weights.rating +
            normalizedSentiment * weights.sentiment +
            (analysis.technical_skills || 0) * weights.technical +
            (analysis.communication || 0) * weights.communication +
            (analysis.cultural_fit || 0) * weights.cultural_fit
        );
    }
    
    // Generate primary recommendation
    generatePrimaryRecommendation(strength, candidate, rating, analysis) {
        const name = candidate.name || 'candidate';
        
        if (strength >= 0.8) {
            return {
                type: 'strong_advance',
                text: `🌟 Strong hire recommendation for ${name}. Exceptional candidate who meets all key criteria.`,
                confidence: 'very_high',
                reasoning: `Outstanding performance (${rating}/10) with strong scores across technical skills, communication, and cultural fit.`,
                priority: 'immediate',
                candidateId: candidate.id,
                actionItems: ['Expedite to final round', 'Prepare competitive offer', 'Check references ASAP']
            };
        } else if (strength >= 0.65) {
            return {
                type: 'advance',
                text: `✅ Recommend advancing ${name} to next round. Solid candidate with strong potential.`,
                confidence: 'high',
                reasoning: `Good performance (${rating}/10) with notable strengths. Some areas may need clarification but overall positive.`,
                priority: 'normal',
                candidateId: candidate.id,
                actionItems: ['Schedule next round', 'Address any concerns noted', 'Continue evaluation process']
            };
        } else if (strength >= 0.45) {
            return {
                type: 'conditional',
                text: `⚠️ Conditional recommendation for ${name}. Requires additional evaluation before final decision.`,
                confidence: 'medium',
                reasoning: `Mixed performance (${rating}/10). Has potential but concerns need addressing.`,
                priority: 'careful_review',
                candidateId: candidate.id,
                actionItems: ['Additional technical round', 'Panel interview', 'Reference check critical']
            };
        } else {
            return {
                type: 'decline',
                text: `❌ Recommend declining ${name} at this time. Performance below hiring threshold.`,
                confidence: 'high',
                reasoning: `Below standard performance (${rating}/10) with multiple concerns that are difficult to address.`,
                priority: 'decline_respectfully',
                candidateId: candidate.id,
                actionItems: ['Send respectful decline', 'Provide constructive feedback if requested', 'Keep in talent pool for future']
            };
        }
    }
    
    // Generate specific action recommendations
    generateActionRecommendations(feedback, analysis, candidate, textLower) {
        const recommendations = [];
        const rating = feedback.rating || 5;
        
        // Technical follow-up needed
        if (analysis.technical_skills < 0.6 && rating >= 6) {
            recommendations.push({
                type: 'technical_followup',
                text: `📋 Schedule technical deep-dive session. Current feedback lacks sufficient technical detail.`,
                confidence: 'high',
                reasoning: 'Good overall rating but technical capabilities unclear from current interview.',
                priority: 'next_round',
                candidateId: candidate.id,
                actionItems: ['Code review session', 'Architecture discussion', 'Hands-on problem solving']
            });
        }
        
        // Reference check urgently needed
        if (rating >= 7 && (textLower.includes('concern') || analysis.cultural_fit < 0.6)) {
            recommendations.push({
                type: 'reference_check',
                text: `📞 Prioritize reference checks. Strong performance but cultural concerns noted.`,
                confidence: 'high',
                reasoning: 'Good technical performance but need validation on team dynamics and collaboration.',
                priority: 'before_offer',
                candidateId: candidate.id,
                actionItems: ['Contact 2-3 recent managers', 'Ask specifically about teamwork', 'Verify cultural fit claims']
            });
        }
        
        // Salary discussion needed
        if (rating >= 8 && analysis.overall_impression > 0.8) {
            recommendations.push({
                type: 'salary_prep',
                text: `💰 Prepare competitive offer package. High-quality candidate likely has multiple options.`,
                confidence: 'high',
                reasoning: 'Exceptional candidate who will likely receive competing offers.',
                priority: 'urgent',
                candidateId: candidate.id,
                actionItems: ['Research market rates', 'Prepare benefits package', 'Consider signing bonus']
            });
        }
        
        return recommendations;
    }
    
    // Generate follow-up recommendations
    generateFollowUpRecommendations(analysis, candidate, rating) {
        const recommendations = [];
        
        // Leadership potential follow-up
        if (analysis.leadership_potential > 0.7 && rating >= 7) {
            recommendations.push({
                type: 'leadership_track',
                text: `🎯 Consider for leadership development track. Shows strong management potential.`,
                confidence: 'medium',
                reasoning: 'Demonstrates leadership qualities that could be valuable for team growth.',
                priority: 'future_planning',
                candidateId: candidate.id,
                actionItems: ['Discuss career aspirations', 'Share leadership opportunities', 'Consider mentorship role']
            });
        }
        
        // Growth opportunity alignment
        if (analysis.growth_potential > 0.7 && analysis.technical_skills < 0.7) {
            recommendations.push({
                type: 'growth_opportunity',
                text: `📈 Excellent learning candidate. Consider for roles with growth and training opportunities.`,
                confidence: 'high',
                reasoning: 'Strong growth mindset could overcome current skill gaps with proper support.',
                priority: 'role_consideration',
                candidateId: candidate.id,
                actionItems: ['Discuss learning goals', 'Outline training program', 'Set 90-day milestones']
            });
        }
        
        return recommendations;
    }

    /**
     * OLD FORMAT: Returns simple string array
     */
    suggestInterviewNextSteps(feedback, recommendedAction, candidate) {
        const steps = [];
        const rating = feedback.rating || 5;
        
        if (rating >= 7) {
            steps.push('Schedule final round interview');
            if (feedback.notes && feedback.notes.includes('reference')) {
                steps.push('Conduct reference checks');
            }
        } else if (rating >= 5) {
            steps.push('Additional technical assessment');
            steps.push('Follow up on specific concerns');
        } else {
            steps.push('Document feedback for future reference');
            steps.push('Consider alternative candidates');
        }
        
        return steps;
    }

    createExecutiveSummary(feedback, analysis, candidate) {
        const rating = feedback.rating || 5;
        const name = candidate.name || 'candidate';
        const role = candidate.job_title || 'role';
        const detectedSkills = analysis._detectedSkills || [];
        const sentimentScore = analysis._sentimentScore || 0;
        
        console.log('🤖 AI: Creating executive summary for', name);
        
        // Build intelligent summary
        let summary = this.generateOpeningStatement(name, role, rating, sentimentScore);
        summary += this.generateStrengthsStatement(analysis, detectedSkills);
        summary += this.generateConcernsStatement(feedback, analysis, rating);
        summary += this.generateRecommendationStatement(analysis, rating, sentimentScore);
        
        return summary.trim();
    }
    
    // Generate opening statement
    generateOpeningStatement(name, role, rating, sentimentScore) {
        const performanceLevel = this.getPerformanceLevel(rating, sentimentScore);
        
        switch (performanceLevel) {
            case 'exceptional':
                return `${name} delivered an exceptional interview performance for the ${role} position (${rating}/10). `;
            case 'strong':
                return `${name} demonstrated strong capabilities during the ${role} interview (${rating}/10). `;
            case 'solid':
                return `${name} showed solid performance in the ${role} interview (${rating}/10). `;
            case 'mixed':
                return `${name}'s interview performance for ${role} showed mixed results (${rating}/10). `;
            case 'concerning':
                return `${name}'s interview for the ${role} position raised several concerns (${rating}/10). `;
            default:
                return `Interview assessment completed for ${name} - ${role} position (${rating}/10). `;
        }
    }
    
    // Generate strengths statement
    generateStrengthsStatement(analysis, detectedSkills) {
        const strengths = [];
        
        // Technical strengths
        if (analysis.technical_skills > 0.7) {
            const topSkills = detectedSkills.slice(0, 3).map(s => s.skill);
            if (topSkills.length > 0) {
                strengths.push(`demonstrated strong technical proficiency in ${topSkills.join(', ')}`);
            } else {
                strengths.push('showed solid technical capabilities');
            }
        }
        
        // Communication strengths
        if (analysis.communication > 0.8) {
            strengths.push('exhibited excellent communication and presentation skills');
        } else if (analysis.communication > 0.6) {
            strengths.push('displayed good communication abilities');
        }
        
        // Leadership potential
        if (analysis.leadership_potential > 0.7) {
            strengths.push('demonstrated clear leadership potential and team management capabilities');
        }
        
        // Cultural fit
        if (analysis.cultural_fit > 0.8) {
            strengths.push('showed strong cultural alignment and team collaboration mindset');
        }
        
        // Growth mindset
        if (analysis.growth_potential > 0.7) {
            strengths.push('displayed strong learning orientation and adaptability');
        }
        
        if (strengths.length === 0) {
            return 'Key strengths require further evaluation. ';
        } else if (strengths.length === 1) {
            return `${name} ${strengths[0]}. `;
        } else {
            const lastStrength = strengths.pop();
            return `${name} ${strengths.join(', ')} and ${lastStrength}. `;
        }
    }
    
    // Generate concerns statement
    generateConcernsStatement(feedback, analysis, rating) {
        const concerns = [];
        const concernsText = (feedback.concerns || '').toLowerCase();
        
        // Technical concerns
        if (analysis.technical_skills < 0.5 && rating <= 6) {
            concerns.push('technical competency gaps that may impact role performance');
        }
        
        // Communication concerns
        if (analysis.communication < 0.5) {
            concerns.push('communication challenges that could affect team dynamics');
        }
        
        // Experience concerns
        if (concernsText.includes('experience') && concernsText.includes('lack')) {
            concerns.push('limited relevant experience for role requirements');
        }
        
        // Cultural fit concerns
        if (analysis.cultural_fit < 0.5) {
            concerns.push('potential cultural fit challenges');
        }
        
        // Specific feedback concerns
        if (concernsText.length > 50) {
            concerns.push('several areas requiring clarification or development');
        }
        
        if (concerns.length === 0) {
            return rating >= 7 ? 'No significant concerns identified. ' : '';
        } else if (concerns.length === 1) {
            return `However, feedback highlighted ${concerns[0]}. `;
        } else {
            const lastConcern = concerns.pop();
            return `However, areas of concern include ${concerns.join(', ')} and ${lastConcern}. `;
        }
    }
    
    // Generate recommendation statement
    generateRecommendationStatement(analysis, rating, sentimentScore) {
        const overallStrength = this.calculateCandidateStrength(analysis, rating, sentimentScore);
        
        if (overallStrength >= 0.8) {
            return 'Strong recommendation to advance to final round with expedited timeline.';
        } else if (overallStrength >= 0.65) {
            return 'Recommend proceeding to next interview round for continued evaluation.';
        } else if (overallStrength >= 0.45) {
            return 'Conditional recommendation pending additional assessment and clarification of concerns.';
        } else {
            return 'Recommend declining candidate based on current interview performance.';
        }
    }
    
    // Get performance level classification
    getPerformanceLevel(rating, sentimentScore) {
        const combinedScore = (rating / 10) * 0.7 + ((sentimentScore + 1) / 2) * 0.3;
        
        if (combinedScore >= 0.85) return 'exceptional';
        if (combinedScore >= 0.75) return 'strong';
        if (combinedScore >= 0.65) return 'solid';
        if (combinedScore >= 0.45) return 'mixed';
        return 'concerning';
    }

    identifyRiskFactors(feedback, candidate) {
        const risks = [];
        const fullText = [feedback.notes, feedback.strengths, feedback.concerns].join(' ');
        const textLower = fullText.toLowerCase();
        const rating = feedback.rating || 5;
        const concerns = (feedback.concerns || '').toLowerCase();
        
        console.log('🤖 AI: Analyzing risk factors for', candidate.name);
        
        // CRITICAL RISKS (Deal breakers)
        const criticalRisks = this.detectCriticalRisks(textLower, concerns, rating);
        risks.push(...criticalRisks);
        
        // HIGH RISKS (Significant concerns)
        const highRisks = this.detectHighRisks(textLower, concerns, rating, candidate);
        risks.push(...highRisks);
        
        // MEDIUM RISKS (Areas for careful evaluation)
        const mediumRisks = this.detectMediumRisks(textLower, rating, candidate);
        risks.push(...mediumRisks);
        
        // LOW RISKS (Monitor during onboarding)
        const lowRisks = this.detectLowRisks(textLower, candidate);
        risks.push(...lowRisks);
        
        return risks.slice(0, 6); // Limit to top 6 most relevant risks
    }
    
    // Detect critical risks (deal breakers)
    detectCriticalRisks(textLower, concerns, rating) {
        const risks = [];
        
        // Integrity issues
        const integrityFlags = ['dishonest', 'lied', 'fabricated', 'misrepresented', 'deceptive'];
        const integrityIssues = integrityFlags.filter(flag => textLower.includes(flag));
        if (integrityIssues.length > 0) {
            risks.push({
                level: 'critical',
                category: 'integrity',
                description: `🚨 Integrity concerns: ${integrityIssues.join(', ')} mentioned in feedback`,
                impact: 'immediate_disqualification',
                confidence: 0.95,
                actionRequired: 'Do not proceed with candidate'
            });
        }
        
        // Severe behavioral issues
        const behaviorFlags = ['rude', 'unprofessional', 'hostile', 'inappropriate', 'aggressive'];
        const behaviorIssues = behaviorFlags.filter(flag => textLower.includes(flag));
        if (behaviorIssues.length > 0) {
            risks.push({
                level: 'critical',
                category: 'behavior',
                description: `🚨 Severe behavioral concerns: ${behaviorIssues.join(', ')}`,
                impact: 'cultural_disruption',
                confidence: 0.9,
                actionRequired: 'Immediate decline recommended'
            });
        }
        
        // Extreme performance gap
        if (rating <= 3 && concerns.length > 100) {
            risks.push({
                level: 'critical',
                category: 'performance',
                description: `🚨 Critically low performance (${rating}/10) with extensive documented concerns`,
                impact: 'role_failure_likely',
                confidence: 0.85,
                actionRequired: 'Strong decline recommendation'
            });
        }
        
        return risks;
    }
    
    // Detect high risks (significant concerns)
    detectHighRisks(textLower, concerns, rating, candidate) {
        const risks = [];
        
        // Major communication issues
        if (textLower.includes('poor communication') || textLower.includes('difficult to understand')) {
            risks.push({
                level: 'high',
                category: 'communication',
                description: `⚠️ Significant communication barriers noted`,
                impact: 'team_collaboration_issues',
                confidence: 0.8,
                actionRequired: 'Additional communication assessment needed'
            });
        }
        
        // Technical competency gaps for senior roles
        const isSeniorRole = (candidate.job_title || '').toLowerCase().includes('senior');
        if (isSeniorRole && rating <= 5 && textLower.includes('technical')) {
            risks.push({
                level: 'high',
                category: 'technical',
                description: `⚠️ Technical skills below expectations for ${candidate.job_title}`,
                impact: 'performance_concerns',
                confidence: 0.85,
                actionRequired: 'Technical deep-dive interview required'
            });
        }
        
        // Cultural fit concerns
        if (textLower.includes('culture') && (textLower.includes('concern') || textLower.includes('fit'))) {
            risks.push({
                level: 'high',
                category: 'cultural_fit',
                description: `⚠️ Cultural alignment concerns raised during interview`,
                impact: 'team_integration_issues',
                confidence: 0.75,
                actionRequired: 'Team interview and reference checks critical'
            });
        }
        
        // Experience misalignment
        if (textLower.includes('overqualified') || textLower.includes('underqualified')) {
            const direction = textLower.includes('overqualified') ? 'over' : 'under';
            risks.push({
                level: 'high',
                category: 'experience',
                description: `⚠️ Experience level ${direction}qualified for role requirements`,
                impact: direction === 'over' ? 'flight_risk' : 'performance_gap',
                confidence: 0.8,
                actionRequired: 'Role scope and expectations discussion needed'
            });
        }
        
        return risks;
    }
    
    // Detect medium risks (careful evaluation needed)
    detectMediumRisks(textLower, rating, candidate) {
        const risks = [];
        
        // Inconsistent performance indicators
        if (rating >= 7 && textLower.includes('concern')) {
            risks.push({
                level: 'medium',
                category: 'consistency',
                description: `⚡ Mixed signals: High rating (${rating}/10) but concerns noted`,
                impact: 'needs_clarification',
                confidence: 0.7,
                actionRequired: 'Follow-up with interviewer for clarity'
            });
        }
        
        // Limited team collaboration evidence
        const teamWords = ['team', 'collaborate', 'together'];
        const hasTeamMentions = teamWords.some(word => textLower.includes(word));
        if (!hasTeamMentions && rating >= 6) {
            risks.push({
                level: 'medium',
                category: 'teamwork',
                description: `⚡ Limited discussion of team collaboration during interview`,
                impact: 'unknown_team_dynamics',
                confidence: 0.6,
                actionRequired: 'Team-focused interview round recommended'
            });
        }
        
        // Career stability concerns
        if (textLower.includes('job hopping') || textLower.includes('short tenure')) {
            risks.push({
                level: 'medium',
                category: 'retention',
                description: `⚡ Career stability concerns mentioned in feedback`,
                impact: 'retention_risk',
                confidence: 0.75,
                actionRequired: 'Discuss career goals and commitment'
            });
        }
        
        return risks;
    }
    
    // Detect low risks (monitor during onboarding)
    detectLowRisks(textLower, candidate) {
        const risks = [];
        
        // Learning curve indicators
        if (textLower.includes('learning curve') || textLower.includes('ramp up')) {
            risks.push({
                level: 'low',
                category: 'onboarding',
                description: `📝 Extended onboarding period may be needed`,
                impact: 'slower_initial_productivity',
                confidence: 0.6,
                actionRequired: 'Plan comprehensive onboarding program'
            });
        }
        
        // Domain knowledge gaps
        if (textLower.includes('new to') || textLower.includes('unfamiliar with')) {
            risks.push({
                level: 'low',
                category: 'domain_knowledge',
                description: `📝 Some domain-specific knowledge gaps identified`,
                impact: 'training_investment_needed',
                confidence: 0.65,
                actionRequired: 'Include domain training in onboarding'
            });
        }
        
        return risks;
    }

    calculateConfidenceScore(analysis) {
        const factors = [];
        
        // Content quality factor
        const contentQuality = this.assessContentQuality(analysis);
        factors.push({ weight: 0.3, score: contentQuality });
        
        // Data consistency factor  
        const consistency = this.assessDataConsistency(analysis);
        factors.push({ weight: 0.25, score: consistency });
        
        // Coverage completeness factor
        const coverage = this.assessCoverage(analysis);
        factors.push({ weight: 0.2, score: coverage });
        
        // Analysis depth factor
        const depth = this.assessAnalysisDepth(analysis);
        factors.push({ weight: 0.15, score: depth });
        
        // Signal strength factor
        const signalStrength = this.assessSignalStrength(analysis);
        factors.push({ weight: 0.1, score: signalStrength });
        
        // Calculate weighted confidence score
        const weightedScore = factors.reduce((sum, factor) => 
            sum + (factor.score * factor.weight), 0
        );
        
        // Apply minimum confidence threshold
        const finalConfidence = Math.max(0.15, Math.min(0.98, weightedScore));
        
        console.log('🤖 AI: Confidence score calculated:', Math.round(finalConfidence * 100) + '%');
        
        return finalConfidence;
    }
    
    // Assess content quality
    assessContentQuality(analysis) {
        const detectedSkills = analysis._detectedSkills || [];
        const sentimentScore = analysis._sentimentScore || 0;
        
        let quality = 0.5; // Base score
        
        // Skill detection quality
        if (detectedSkills.length >= 3) quality += 0.2;
        else if (detectedSkills.length >= 1) quality += 0.1;
        
        // Sentiment analysis confidence
        if (Math.abs(sentimentScore) > 0.3) quality += 0.15;
        
        // Analysis completeness
        const analysisKeys = Object.keys(analysis).filter(key => !key.startsWith('_'));
        if (analysisKeys.length >= 6) quality += 0.15;
        
        return Math.min(1, quality);
    }
    
    // Assess data consistency
    assessDataConsistency(analysis) {
        const scores = Object.values(analysis).filter(val => 
            typeof val === 'number' && !isNaN(val)
        );
        
        if (scores.length < 3) return 0.3;
        
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => 
            sum + Math.pow(score - average, 2), 0
        ) / scores.length;
        
        // Lower variance = higher consistency
        return Math.max(0.2, Math.min(1, 1 - variance));
    }
    
    // Assess coverage completeness
    assessCoverage(analysis) {
        const expectedFields = [
            'technical_skills', 'communication', 'problem_solving', 
            'cultural_fit', 'leadership_potential', 'growth_potential'
        ];
        
        const presentFields = expectedFields.filter(field => 
            analysis[field] !== undefined && analysis[field] !== null
        );
        
        return presentFields.length / expectedFields.length;
    }
    
    // Assess analysis depth
    assessAnalysisDepth(analysis) {
        const detectedSkills = analysis._detectedSkills || [];
        let depth = 0.4; // Base depth
        
        // Skill analysis depth
        if (detectedSkills.length > 0) {
            const avgConfidence = detectedSkills.reduce((sum, skill) => 
                sum + skill.confidence, 0
            ) / detectedSkills.length;
            depth += avgConfidence * 0.3;
        }
        
        // Analysis score range (diverse scores indicate deeper analysis)
        const scores = Object.values(analysis).filter(val => typeof val === 'number');
        const range = Math.max(...scores) - Math.min(...scores);
        if (range > 0.3) depth += 0.3;
        
        return Math.min(1, depth);
    }
    
    // Assess signal strength
    assessSignalStrength(analysis) {
        const sentimentScore = Math.abs(analysis._sentimentScore || 0);
        const detectedSkills = analysis._detectedSkills || [];
        
        let signal = 0.5;
        
        // Strong sentiment indicates clear signal
        if (sentimentScore > 0.5) signal += 0.3;
        else if (sentimentScore > 0.2) signal += 0.1;
        
        // Skill detection indicates strong signal
        if (detectedSkills.length >= 2) signal += 0.2;
        
        return Math.min(1, signal);
    }

    /**
     * Count keyword matches
     */
    countKeywordMatches(text, keywords) {
        return keywords.reduce((count, keyword) => {
            return count + (text.includes(keyword.toLowerCase()) ? 1 : 0);
        }, 0);
    }

    // ===== LEGACY COMPATIBILITY =====
    
    /**
     * Legacy method for backward compatibility
     */
    processNotes(text, context = {}) {
        const mockFeedback = {
            notes: text,
            rating: 5,
            recommendation: 'review'
        };
        
        return this.generateInterviewSummary({ feedback: mockFeedback }, context);
    }

    clearCache() {
        this.processingCache.clear();
        console.log('🧹 AI processing cache cleared');
    }

    getCacheStats() {
        return {
            size: this.processingCache.size,
            timeout: this.cacheTimeout,
            keys: Array.from(this.processingCache.keys())
        };
    }
}

// Export for global use
window.AIAssistant = new AIAssistant();

console.log('🤖 Ultra Safe AI Assistant initialized');
console.log('✅ Returns data in exact old format');
console.log('✅ Should work with existing UI without changes');