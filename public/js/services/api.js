// Complete Enhanced API Service for RecruitPro CRM - SERVER-BASED STORAGE
// Replace your entire js/services/api.js with this enhanced version

class APIService {
    constructor() {
        this.baseURL = window.location.origin;
        this.isOnline = false;
        this.syncQueue = []; // Queue for offline operations
        this.checkConnection();
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            if (response.ok) {
                const health = await response.json();
                this.isOnline = true;
                console.log('🌐 Server Connected:', health.status);
                console.log('💾 Storage Type:', health.database);
                console.log('📁 Storage Location:', health.storage);
                return true;
            }
        } catch (error) {
            console.error('❌ Server connection failed:', error.message);
            this.isOnline = false;
        }
        
        return false;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/api${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error.message);
            return { data: null, error: error.message };
        }
    }

    // ==============================================
    // CANDIDATES API
    // ==============================================
    async getCandidates() {
        if (!this.isOnline) {
            return { data: helpers.storage.load('recruitpro_candidates') || [], error: null };
        }
        
        return await this.request('/candidates');
    }

    async createCandidate(candidate) {
        if (!this.isOnline) {
            const candidates = helpers.storage.load('recruitpro_candidates') || [];
            const newCandidate = { 
                ...candidate, 
                id: Date.now(), 
                created_at: new Date().toISOString(),
                interview_feedback: [],
                timeline: []
            };
            const updatedCandidates = [newCandidate, ...candidates];
            helpers.storage.save('recruitpro_candidates', updatedCandidates);
            return { data: newCandidate, error: null };
        }

        return await this.request('/candidates', {
            method: 'POST',
            body: JSON.stringify(candidate)
        });
    }

    async updateCandidate(id, updates) {
        console.log(`👤 Updating candidate ${id} with:`, Object.keys(updates));
        
        if (!this.isOnline) {
            console.log('📱 Fallback to localStorage (server offline)');
            const candidates = helpers.storage.load('recruitpro_candidates') || [];
            const candidateIndex = candidates.findIndex(c => c.id == id);
            
            if (candidateIndex === -1) {
                return { data: null, error: 'Candidate not found' };
            }
            
            const updatedCandidate = window.updateUserAttribution({
    ...candidates[candidateIndex], 
    ...updates
});
candidates[candidateIndex] = updatedCandidate;
helpers.storage.save('recruitpro_candidates', candidates);
            return { data: candidates[candidateIndex], error: null };
        }

        const result = await this.request(`/candidates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        if (result.data && updates.interview_feedback) {
            console.log(`🎯 Interview feedback added for candidate ${id}`);
        }

        return result;
    }

    async deleteCandidate(id) {
        if (!this.isOnline) {
            const candidates = helpers.storage.load('recruitpro_candidates') || [];
            const updatedCandidates = candidates.filter(c => c.id != id);
            helpers.storage.save('recruitpro_candidates', updatedCandidates);
            return { data: { message: 'Candidate deleted successfully' }, error: null };
        }

        return await this.request(`/candidates/${id}`, {
            method: 'DELETE'
        });
    }

    // ==============================================
    // PROJECTS API (ENHANCED WITH COMMENTS & TIMELINE)
    // ==============================================
    async getProjects() {
        if (!this.isOnline) {
            return { data: helpers.storage.load('recruitpro_projects') || [], error: null };
        }
        
        return await this.request('/projects');
    }

    // Enhanced Get Single Project Method with comments and timeline
    async getProject(projectId) {
        if (!this.isOnline) {
            const projects = helpers.storage.load('recruitpro_projects') || [];
            const project = projects.find(p => p.id == projectId);
            
            if (!project) {
                return { data: null, error: 'Project not found' };
            }
            
            // Ensure arrays exist and are sorted
            if (!project.comments) project.comments = [];
            if (!project.timeline) project.timeline = [];
            
            project.timeline.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            project.comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            return { data: project, error: null };
        }

        return await this.request(`/projects/${projectId}`);
    }

    async createProject(project) {
        if (!this.isOnline) {
            const projects = helpers.storage.load('recruitpro_projects') || [];
            const baseProject = { 
    ...project, 
    id: Date.now(), 
    status: 'active',
    comments: [],
    timeline: [{
        id: Date.now() + 1,
        type: 'created',
        message: `Project created by ${project.created_by}`,
        user: project.created_by,
        created_at: new Date().toISOString()
    }]
};
const newProject = window.addUserAttribution(baseProject);
const updatedProjects = [newProject, ...projects];
            helpers.storage.save('recruitpro_projects', updatedProjects);
            return { data: newProject, error: null };
        }

        return await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(project)
        });
    }

    async updateProject(id, updates) {
        if (!this.isOnline) {
            const projects = helpers.storage.load('recruitpro_projects') || [];
            const updatedProjects = projects.map(p => 
    p.id == id ? window.updateUserAttribution({ ...p, ...updates }) : p
);
            helpers.storage.save('recruitpro_projects', updatedProjects);
            return { data: { message: 'Project updated successfully' }, error: null };
        }

        return await this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async deleteProject(id) {
        if (!this.isOnline) {
            const projects = helpers.storage.load('recruitpro_projects') || [];
            const updatedProjects = projects.filter(p => p.id != id);
            helpers.storage.save('recruitpro_projects', updatedProjects);
            return { data: { message: 'Project deleted successfully' }, error: null };
        }

        return await this.request(`/projects/${id}`, {
            method: 'DELETE'
        });
    }

    // ==============================================
    // PROJECT COMMENTS API (NEW)
    // ==============================================
    async getProjectComments(projectId) {
        if (!this.isOnline) {
            const projects = helpers.storage.load('recruitpro_projects') || [];
            const project = projects.find(p => p.id == projectId);
            return { data: project?.comments || [], error: null };
        }

        return await this.request(`/projects/${projectId}/comments`);
    }

    async addProjectComment(projectId, comment) {
        if (!this.isOnline) {
            const projects = helpers.storage.load('recruitpro_projects') || [];
            const projectIndex = projects.findIndex(p => p.id == projectId);
            
            if (projectIndex === -1) {
                return { data: null, error: 'Project not found' };
            }
            
            const newComment = {
                id: Date.now(),
                text: comment.text,
                user: comment.user,
                created_at: new Date().toISOString()
            };
            
            if (!projects[projectIndex].comments) {
                projects[projectIndex].comments = [];
            }
            
            projects[projectIndex].comments.unshift(newComment);
            helpers.storage.save('recruitpro_projects', projects);
            
            return { data: newComment, error: null };
        }

        return await this.request(`/projects/${projectId}/comments`, {
            method: 'POST',
            body: JSON.stringify(comment)
        });
    }

    // ==============================================
    // PROJECT TIMELINE API (NEW)
    // ==============================================
    async getProjectTimeline(projectId) {
        if (!this.isOnline) {
            const projects = helpers.storage.load('recruitpro_projects') || [];
            const project = projects.find(p => p.id == projectId);
            const timeline = project?.timeline || [];
            return { data: timeline.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), error: null };
        }

        return await this.request(`/projects/${projectId}/timeline`);
    }

    async addProjectTimelineEntry(projectId, entry) {
        if (!this.isOnline) {
            const projects = helpers.storage.load('recruitpro_projects') || [];
            const projectIndex = projects.findIndex(p => p.id == projectId);
            
            if (projectIndex === -1) {
                return { data: null, error: 'Project not found' };
            }
            
            const newEntry = {
                id: Date.now(),
                type: entry.type,
                message: entry.message,
                user: entry.user,
                created_at: new Date().toISOString()
            };
            
            if (!projects[projectIndex].timeline) {
                projects[projectIndex].timeline = [];
            }
            
            projects[projectIndex].timeline.unshift(newEntry);
            helpers.storage.save('recruitpro_projects', projects);
            
            return { data: newEntry, error: null };
        }

        return await this.request(`/projects/${projectId}/timeline`, {
            method: 'POST',
            body: JSON.stringify(entry)
        });
    }

    // ==============================================
    // INTERVIEWS API
    // ==============================================
    async getInterviews() {
        if (!this.isOnline) {
            return { data: helpers.storage.load('recruitpro_interviews') || [], error: null };
        }
        
        return await this.request('/interviews');
    }

    async createInterview(interview) {
        if (!this.isOnline) {
            const interviews = helpers.storage.load('recruitpro_interviews') || [];
            const newInterview = { 
                ...interview, 
                id: Date.now(), 
                scheduled_at: new Date().toISOString(),
                status: 'scheduled'
            };
            const updatedInterviews = [newInterview, ...interviews];
            helpers.storage.save('recruitpro_interviews', updatedInterviews);
            return { data: newInterview, error: null };
        }

        return await this.request('/interviews', {
            method: 'POST',
            body: JSON.stringify(interview)
        });
    }

    async updateInterviewTemplate(id, updates) {
        if (!this.isOnline) {
            const templates = helpers.storage.load('recruitpro_interview_templates') || [];
            const templateIndex = templates.findIndex(t => t.id == id);
            
            if (templateIndex === -1) {
                return { data: null, error: 'Template not found' };
            }
            
            templates[templateIndex] = { ...templates[templateIndex], ...updates };
            helpers.storage.save('recruitpro_interview_templates', templates);
            return { data: templates[templateIndex], error: null };
        }

        return await this.request(`/interview-templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async deleteInterviewTemplate(id) {
        if (!this.isOnline) {
            const templates = helpers.storage.load('recruitpro_interview_templates') || [];
            const updatedTemplates = templates.filter(t => t.id != id);
            helpers.storage.save('recruitpro_interview_templates', updatedTemplates);
            return { data: { message: 'Template deleted successfully' }, error: null };
        }

        return await this.request(`/interview-templates/${id}`, {
            method: 'DELETE'
        });
    }

    async updateInterview(id, updates) {
        console.log(`🎤 Updating interview ${id}`);
        
        if (!this.isOnline) {
            const interviews = helpers.storage.load('recruitpro_interviews') || [];
            const interviewIndex = interviews.findIndex(i => i.id == id);
            
            if (interviewIndex === -1) {
                return { data: null, error: 'Interview not found' };
            }
            
            interviews[interviewIndex] = { ...interviews[interviewIndex], ...updates };
            helpers.storage.save('recruitpro_interviews', interviews);
            return { data: interviews[interviewIndex], error: null };
        }

        const result = await this.request(`/interviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        if (result.data && updates.feedback) {
            console.log(`🎯 Interview feedback added: Rating ${updates.feedback.rating}/10`);
        }

        return result;
    }

    async deleteInterview(id) {
        if (!this.isOnline) {
            const interviews = helpers.storage.load('recruitpro_interviews') || [];
            const updatedInterviews = interviews.filter(i => i.id != id);
            helpers.storage.save('recruitpro_interviews', updatedInterviews);
            return { data: { message: 'Interview deleted successfully' }, error: null };
        }

        return await this.request(`/interviews/${id}`, {
            method: 'DELETE'
        });
    }

    // ==============================================
    // INTERVIEW TEMPLATES API
    // ==============================================
    async getInterviewTemplates() {
        if (!this.isOnline) {
            return { data: helpers.storage.load('recruitpro_interview_templates') || [], error: null };
        }
        
        return await this.request('/interview-templates');
    }

    async createInterviewTemplate(template) {
        if (!this.isOnline) {
            const templates = helpers.storage.load('recruitpro_interview_templates') || [];
            const newTemplate = { ...template, id: Date.now(), created_at: new Date().toISOString() };
            const updatedTemplates = [newTemplate, ...templates];
            helpers.storage.save('recruitpro_interview_templates', updatedTemplates);
            return { data: newTemplate, error: null };
        }

        return await this.request('/interview-templates', {
            method: 'POST',
            body: JSON.stringify(template)
        });
    }

    // ==============================================
    // TASKS API
    // ==============================================
    async getTasks() {
        if (!this.isOnline) {
            console.log('📱 Fallback to localStorage (server offline)');
            return { data: helpers.storage.load('recruitpro_tasks') || [], error: null };
        }
        
        const result = await this.request('/tasks');
        if (result.data) {
            console.log(`📋 Retrieved ${result.data.length} tasks from server`);
            
            // Merge with local changes
            const localTasks = helpers.storage.load('recruitpro_tasks') || [];
            const mergedTasks = this.mergeTaskData(result.data, localTasks);
            
            // Update localStorage with merged data
            helpers.storage.save('recruitpro_tasks', mergedTasks);
            
            return { data: mergedTasks, error: null };
        }
        
        return result;
    }

    // Merge task data to handle conflicts
    mergeTaskData(serverData, localData) {
        const merged = [...serverData];
        
        localData.forEach(localTask => {
            const serverIndex = merged.findIndex(s => s.id === localTask.id);
            
            if (serverIndex >= 0) {
                const serverTask = merged[serverIndex];
                const localUpdated = new Date(localTask.updated_at || localTask.created_at);
                const serverUpdated = new Date(serverTask.updated_at || serverTask.created_at);
                
                // Use the more recently updated version
                if (localUpdated > serverUpdated) {
                    console.log(`🔄 Local version of task "${localTask.title}" is newer, using local data`);
                    merged[serverIndex] = localTask;
                }
            } else {
                // Local task doesn't exist on server, add it to merge
                merged.push(localTask);
                console.log(`📤 Adding local task "${localTask.title}" to server merge`);
            }
        });
        
        return merged;
    }

    async createTask(task) {
        const taskData = {
            ...task,
            created_at: task.created_at || new Date().toISOString(),
            status: task.status || 'pending'
        };

        if (!this.isOnline) {
            // Fallback to localStorage
            const tasks = helpers.storage.load('recruitpro_tasks') || [];
            const newTask = { ...taskData, id: Date.now() };
            const updatedTasks = [newTask, ...tasks];
            helpers.storage.save('recruitpro_tasks', updatedTasks);
            return { data: newTask, error: null };
        }

        return await this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async updateTask(id, updates) {
        console.log(`📝 Updating task ${id} with:`, Object.keys(updates));
        
        if (!this.isOnline) {
            console.log('📱 Fallback to localStorage (server offline)');
            const tasks = helpers.storage.load('recruitpro_tasks') || [];
            const taskIndex = tasks.findIndex(t => t.id == id);
            
            if (taskIndex === -1) {
                return { data: null, error: 'Task not found' };
            }
            
            tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updated_at: new Date().toISOString() };
            helpers.storage.save('recruitpro_tasks', tasks);
            return { data: tasks[taskIndex], error: null };
        }

        const result = await this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        return result;
    }

    async deleteTask(id) {
        if (!this.isOnline) {
            const tasks = helpers.storage.load('recruitpro_tasks') || [];
            const updatedTasks = tasks.filter(t => t.id != id);
            helpers.storage.save('recruitpro_tasks', updatedTasks);
            return { data: { message: 'Task deleted successfully' }, error: null };
        }

        return await this.request(`/tasks/${id}`, {
            method: 'DELETE'
        });
    }

    // ==============================================
// NOTES & CATEGORIES API
// ==============================================
async getCategories() {
    if (!this.isOnline) {
        console.log('📱 Fallback to localStorage (server offline)');
        return { data: helpers.storage.load('recruitpro_note_categories') || [], error: null };
    }
    
    const result = await this.request('/categories');
    if (result.data) {
        console.log(`📁 Retrieved ${result.data.length} categories from server`);
        // Update localStorage as backup
        helpers.storage.save('recruitpro_note_categories', result.data);
        return { data: result.data, error: null };
    }
    
    return result;
}

async createCategory(category) {
    const categoryData = {
        ...category,
        created_at: category.created_at || new Date().toISOString()
    };

    if (!this.isOnline) {
        // Fallback to localStorage
        const categories = helpers.storage.load('recruitpro_note_categories') || [];
        const newCategory = { ...categoryData, id: Date.now() + Math.random() };
        const updatedCategories = [newCategory, ...categories];
        helpers.storage.save('recruitpro_note_categories', updatedCategories);
        return { data: newCategory, error: null };
    }

    return await this.request('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
    });
}

async updateCategory(id, updates) {
    console.log(`📁 Updating category ${id} with:`, Object.keys(updates));
    
    if (!this.isOnline) {
        console.log('📱 Fallback to localStorage (server offline)');
        const categories = helpers.storage.load('recruitpro_note_categories') || [];
        const categoryIndex = categories.findIndex(c => c.id == id);
        
        if (categoryIndex === -1) {
            return { data: null, error: 'Category not found' };
        }
        
        categories[categoryIndex] = { ...categories[categoryIndex], ...updates, updated_at: new Date().toISOString() };
        helpers.storage.save('recruitpro_note_categories', categories);
        return { data: categories[categoryIndex], error: null };
    }

    return await this.request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
}

async deleteCategory(id) {
    if (!this.isOnline) {
        const categories = helpers.storage.load('recruitpro_note_categories') || [];
        const notes = helpers.storage.load('recruitpro_notes') || [];
        
        const updatedCategories = categories.filter(c => c.id != id);
        const updatedNotes = notes.filter(n => n.category_id != id);
        
        helpers.storage.save('recruitpro_note_categories', updatedCategories);
        helpers.storage.save('recruitpro_notes', updatedNotes);
        
        return { data: { message: 'Category and its notes deleted successfully' }, error: null };
    }

    return await this.request(`/categories/${id}`, {
        method: 'DELETE'
    });
}

async getNotes() {
    if (!this.isOnline) {
        console.log('📱 Fallback to localStorage (server offline)');
        return { data: helpers.storage.load('recruitpro_notes') || [], error: null };
    }
    
    const result = await this.request('/notes');
    if (result.data) {
        console.log(`📝 Retrieved ${result.data.length} notes from server`);
        // Update localStorage as backup
        helpers.storage.save('recruitpro_notes', result.data);
        return { data: result.data, error: null };
    }
    
    return result;
}

async createNote(note) {
    const noteData = {
        ...note,
        created_at: note.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    if (!this.isOnline) {
        // Fallback to localStorage
        const notes = helpers.storage.load('recruitpro_notes') || [];
        const newNote = { ...noteData, id: Date.now() + Math.random() };
        const updatedNotes = [newNote, ...notes];
        helpers.storage.save('recruitpro_notes', updatedNotes);
        return { data: newNote, error: null };
    }

    return await this.request('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData)
    });
}

async updateNote(id, updates) {
    console.log(`📝 Updating note ${id} with:`, Object.keys(updates));
    
    if (!this.isOnline) {
        console.log('📱 Fallback to localStorage (server offline)');
        const notes = helpers.storage.load('recruitpro_notes') || [];
        const noteIndex = notes.findIndex(n => n.id == id);
        
        if (noteIndex === -1) {
            return { data: null, error: 'Note not found' };
        }
        
        notes[noteIndex] = { ...notes[noteIndex], ...updates, updated_at: new Date().toISOString() };
        helpers.storage.save('recruitpro_notes', notes);
        return { data: notes[noteIndex], error: null };
    }

    return await this.request(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
}

async deleteNote(id) {
    if (!this.isOnline) {
        const notes = helpers.storage.load('recruitpro_notes') || [];
        const updatedNotes = notes.filter(n => n.id != id);
        helpers.storage.save('recruitpro_notes', updatedNotes);
        return { data: { message: 'Note deleted successfully' }, error: null };
    }

    return await this.request(`/notes/${id}`, {
        method: 'DELETE'
    });
}

    // ==============================================
    // DATA MIGRATION & IMPORT/EXPORT
    // ==============================================
    
    // Migration from browser localStorage to server
    async migrateBrowserDataToServer() {
        console.log('🚀 === MIGRATING DATA FROM BROWSER TO SERVER ===');
        
        if (!this.isOnline) {
            console.error('❌ Server is offline - cannot migrate data');
            return { success: false, error: 'Server offline' };
        }

        try {
            // Get all data from localStorage
            const browserData = {
                candidates: helpers.storage.load('recruitpro_candidates') || [],
                interviews: helpers.storage.load('recruitpro_interviews') || [],
                projects: helpers.storage.load('recruitpro_projects') || [],
                templates: helpers.storage.load('recruitpro_interview_templates') || [],
                tasks: helpers.storage.load('recruitpro_tasks') || [],
                categories: helpers.storage.load('recruitpro_note_categories') || [],
                notes: helpers.storage.load('recruitpro_notes') || []
            };

            console.log('📊 Browser data found:');
            console.log(`  📋 Candidates: ${browserData.candidates.length}`);
            console.log(`  🎤 Interviews: ${browserData.interviews.length}`);
            console.log(`  📁 Projects: ${browserData.projects.length}`);
            console.log(`  📝 Templates: ${browserData.templates.length}`);
            console.log(`  ✅ Tasks: ${browserData.tasks.length}`);

            // Check for candidates with feedback
            const candidatesWithFeedback = browserData.candidates.filter(c => 
                c.interview_feedback && c.interview_feedback.length > 0
            );
            console.log(`  💬 Candidates with feedback: ${candidatesWithFeedback.length}`);

            if (browserData.candidates.length === 0 && 
                browserData.interviews.length === 0 && 
                browserData.projects.length === 0 &&
                browserData.tasks.length === 0) {
                console.log('ℹ️ No browser data to migrate');
                return { success: true, migrated: { candidates: 0, interviews: 0, projects: 0, templates: 0, tasks: 0 } };
            }

            // Send migration request to server
            const result = await this.request('/migrate-from-browser', {
                method: 'POST',
                body: JSON.stringify(browserData)
            });

            if (result.error) {
                throw new Error(result.error);
            }

            console.log('✅ Migration completed successfully!');
            console.log('📊 Migrated:', result.data.migrated);

            // Optionally clear browser storage after successful migration
            if (confirm('Migration successful! Clear browser storage to prevent conflicts?')) {
                localStorage.removeItem('recruitpro_candidates');
                localStorage.removeItem('recruitpro_interviews');
                localStorage.removeItem('recruitpro_projects');
                localStorage.removeItem('recruitpro_interview_templates');
                localStorage.removeItem('recruitpro_tasks');
                localStorage.removeItem('recruitpro_note_categories');
localStorage.removeItem('recruitpro_notes');
                console.log('🧹 Browser storage cleared');
            }

            return { success: true, migrated: result.data.migrated };

        } catch (error) {
            console.error('❌ Migration failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper method to create structured CSV for offline mode
createStructuredCandidateCSV(candidates, projects) {
    const projectMap = {};
    projects.forEach(project => {
        projectMap[project.id] = project.name;
    });
    
    const headers = [
        'Name', 'Email', 'Phone', 'Country', 'City', 'Job Title', 'Company',
        'LinkedIn', 'GitHub', 'Portfolio', 'Status', 'Source', 'Projects',
        'Skills', 'Experience Level', 'Salary Expectation', 'Notice Period',
        'Interview Count', 'Last Interview Date', 'Average Rating',
        'Created Date', 'Last Updated', 'Notes'
    ];
    
    let csvContent = '\uFEFF' + headers.join(',') + '\n'; // BOM for Excel compatibility
    
    candidates.forEach(candidate => {
        const projectNames = candidate.projects && Array.isArray(candidate.projects)
            ? candidate.projects.map(projId => projectMap[projId] || `Unknown Project (${projId})`).join('; ')
            : '';
            
        const skills = candidate.skills && Array.isArray(candidate.skills) 
            ? candidate.skills.join('; ') 
            : '';
            
        let interviewCount = 0;
        let lastInterviewDate = '';
        let averageRating = '';
        
        if (candidate.interview_feedback && Array.isArray(candidate.interview_feedback)) {
            interviewCount = candidate.interview_feedback.length;
            if (interviewCount > 0) {
                const sortedFeedback = candidate.interview_feedback
                    .sort((a, b) => new Date(b.interview_date) - new Date(a.interview_date));
                lastInterviewDate = new Date(sortedFeedback[0].interview_date).toLocaleDateString();
                
                const ratings = candidate.interview_feedback
                    .map(f => f.feedback?.rating)
                    .filter(rating => rating !== undefined && rating !== null);
                    
                if (ratings.length > 0) {
                    const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
                    averageRating = avgRating.toFixed(1) + '/10';
                }
            }
        }
        
        const escapeCSV = (value) => {
            if (value == null || value == undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        
        const rowData = [
            escapeCSV(candidate.name || ''),
            escapeCSV(candidate.email || ''),
            escapeCSV(candidate.phone || ''),
            escapeCSV(candidate.country || ''),
            escapeCSV(candidate.city || ''),
            escapeCSV(candidate.job_title || ''),
            escapeCSV(candidate.company || ''),
            escapeCSV(candidate.linkedin_url || ''),
            escapeCSV(candidate.github_url || ''),
            escapeCSV(candidate.portfolio_url || ''),
            escapeCSV(candidate.status || 'applied'),
            escapeCSV(candidate.source || ''),
            escapeCSV(projectNames),
            escapeCSV(skills),
            escapeCSV(candidate.experience_level || ''),
            escapeCSV(candidate.salary_expectation || ''),
            escapeCSV(candidate.notice_period || ''),
            escapeCSV(interviewCount.toString()),
            escapeCSV(lastInterviewDate),
            escapeCSV(averageRating),
            escapeCSV(candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : ''),
            escapeCSV(candidate.last_updated ? new Date(candidate.last_updated).toLocaleDateString() : ''),
            escapeCSV(candidate.notes || '')
        ];
        
        csvContent += rowData.join(',') + '\n';
    });
    
    return csvContent;
}

    // Download blob as file
    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Get server health and stats
    async getServerHealth() {
        if (!this.isOnline) {
            return { 
                status: 'offline', 
                error: 'Server connection not available',
                fallback: 'Using browser localStorage'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Server responded with ${response.status}`);
            }
        } catch (error) {
            return { 
                status: 'error', 
                error: error.message 
            };
        }
    }

    // Initialize - no demo data creation (server handles this)
    async initializeDemoData() {
        // Server handles demo data initialization
        // Just check if migration is needed
        
        if (this.isOnline) {
            console.log('🌐 Server connected - checking for migration needs...');
            
            // Check if we have browser data that needs migration
            const browserData = helpers.storage.load('recruitpro_candidates') || [];
            if (browserData.length > 0) {
                console.log('📱 Browser data detected - you may want to migrate to server');
                console.log('💡 Run: api.migrateBrowserDataToServer()');
            }
        } else {
            console.log('📱 Server offline - using browser storage');
            
            // Only create demo data if absolutely nothing exists
            const existingData = helpers.storage.load('recruitpro_candidates') || [];
            if (existingData.length === 0) {
                console.log('🎯 Creating minimal demo data in browser...');
                // Create minimal demo data locally
                const demoCandidate = {
                    id: Date.now(),
                    name: 'Demo Candidate',
                    email: 'demo@example.com',
                    job_title: 'Software Engineer',
                    company: 'Demo Company',
                    status: 'new',
                    readiness: 'not_ready',
                    created_at: new Date().toISOString(),
                    created_by: 'System',
                    interview_feedback: [],
                    timeline: []
                };
                
                helpers.storage.save('recruitpro_candidates', [demoCandidate]);
            }
        }
    }

    // ==============================================
    // COMPANIES API
    // ==============================================

    async getCompanies() {
        if (!this.isOnline) {
            console.log('📱 Fallback to localStorage (server offline)');
            return { data: helpers.storage.load('recruitpro_companies') || [], error: null };
        }
        
        const result = await this.request('/companies');
        if (result.data) {
            console.log(`🏢 Retrieved ${result.data.length} companies from server`);
            helpers.storage.save('recruitpro_companies', result.data);
            return { data: result.data, error: null };
        }
        
        return result;
    }

    async createCompany(company) {
        const companyData = {
            ...company,
            created_at: company.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (!this.isOnline) {
            const companies = helpers.storage.load('recruitpro_companies') || [];
            const newCompany = { ...companyData, id: Date.now() + Math.random() };
            const updatedCompanies = [newCompany, ...companies];
            helpers.storage.save('recruitpro_companies', updatedCompanies);
            return { data: newCompany, error: null };
        }

        return await this.request('/companies', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    }

    async updateCompany(id, updates) {
        console.log(`🏢 Updating company ${id} with:`, Object.keys(updates));
        
        if (!this.isOnline) {
            console.log('📱 Fallback to localStorage (server offline)');
            const companies = helpers.storage.load('recruitpro_companies') || [];
            const companyIndex = companies.findIndex(c => c.id == id);
            
            if (companyIndex === -1) {
                return { data: null, error: 'Company not found' };
            }
            
            companies[companyIndex] = { 
                ...companies[companyIndex], 
                ...updates, 
                updated_at: new Date().toISOString() 
            };
            helpers.storage.save('recruitpro_companies', companies);
            return { data: companies[companyIndex], error: null };
        }

        return await this.request(`/companies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async deleteCompany(id) {
        if (!this.isOnline) {
            const companies = helpers.storage.load('recruitpro_companies') || [];
            const updatedCompanies = companies.filter(c => c.id != id);
            helpers.storage.save('recruitpro_companies', updatedCompanies);
            return { data: { message: 'Company deleted successfully' }, error: null };
        }

        return await this.request(`/companies/${id}`, {
            method: 'DELETE'
        });
    }
}

// Create global API instance
window.api = new APIService();
