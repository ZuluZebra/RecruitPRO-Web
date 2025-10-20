// Complete Enhanced RecruitPro Server with Project Comments & Timeline
// Replace your entire server/server.js file with this enhanced version

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the parent directory (where your frontend is)
app.use(express.static(path.join(__dirname, '..')));

// Data storage directory
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('📁 Created data directory:', DATA_DIR);
}

const DATA_FILES = {
    candidates: path.join(DATA_DIR, 'candidates.json'),
    projects: path.join(DATA_DIR, 'projects.json'),
    interviews: path.join(DATA_DIR, 'interviews.json'),
    interviewTemplates: path.join(DATA_DIR, 'interview-templates.json'),
    tasks: path.join(DATA_DIR, 'tasks.json'),
    categories: path.join(DATA_DIR, 'note-categories.json'),
    notes: path.join(DATA_DIR, 'notes.json'),
    companies: path.join(DATA_DIR, 'companies.json')  // ADD THIS LINE
};

// ==============================================
// DATA STORAGE HELPER FUNCTIONS
// ==============================================

function loadData(type) {
    const filePath = DATA_FILES[type];
    
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(data);
            console.log(`📊 Loaded ${parsed.length} ${type} from ${filePath}`);
            return parsed;
        } else {
            console.log(`📁 No ${type} file found, creating empty array`);
            return [];
        }
    } catch (error) {
        console.error(`❌ Error loading ${type}:`, error.message);
        return [];
    }
}

function saveData(type, data) {
    const filePath = DATA_FILES[type];
    
    try {
        // Ensure data directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`💾 Saved ${data.length} ${type} to ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error saving ${type}:`, error.message);
        return false;
    }
}

// Initialize demo data if files don't exist
function initializeDemoData() {
    console.log('🚀 Initializing demo data...');
    
    // Demo candidates
    if (!fs.existsSync(DATA_FILES.candidates)) {
        const demoCandidates = [
            {
                id: 1,
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                job_title: 'Senior Frontend Developer',
                company: 'TechCorp',
                status: 'interviewing',
                readiness: 'ready',
                created_at: new Date().toISOString(),
                created_by: 'System',
                interview_feedback: [],
                timeline: [
                    {
                        id: 1,
                        type: 'created',
                        message: 'Candidate added to system',
                        user: 'System',
                        created_at: new Date().toISOString()
                    }
                ]
            },
            {
                id: 2,
                name: 'Michael Chen',
                email: 'michael.chen@email.com',
                job_title: 'Full Stack Developer',
                company: 'StartupXYZ',
                status: 'new',
                readiness: 'almost_ready',
                created_at: new Date().toISOString(),
                created_by: 'System',
                interview_feedback: [],
                timeline: [
                    {
                        id: 2,
                        type: 'created',
                        message: 'Candidate added to system',
                        user: 'System',
                        created_at: new Date().toISOString()
                    }
                ]
            }
        ];
        
        saveData('candidates', demoCandidates);
    }
    
    // Demo projects
    if (!fs.existsSync(DATA_FILES.projects)) {
        const demoProjects = [
            {
                id: 1,
                name: 'Frontend Team Expansion',
                description: 'Hiring 3 senior frontend developers for the React team',
                target_hires: 3,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                created_at: new Date().toISOString(),
                created_by: 'System',
                comments: [
                    {
                        id: 1,
                        text: 'Project kicked off - focusing on React and TypeScript experience',
                        user: 'System',
                        created_at: new Date().toISOString()
                    }
                ],
                timeline: [
                    {
                        id: 1,
                        type: 'created',
                        message: 'Project created by System',
                        user: 'System',
                        created_at: new Date().toISOString()
                    }
                ]
            }
        ];
        
        saveData('projects', demoProjects);
    }
    
    // Initialize other empty files
    if (!fs.existsSync(DATA_FILES.interviews)) {
        saveData('interviews', []);
    }
    
    if (!fs.existsSync(DATA_FILES.interviewTemplates)) {
        saveData('interviewTemplates', []);
    }
    
    if (!fs.existsSync(DATA_FILES.tasks)) {
        saveData('tasks', []);
    }
    
    console.log('✅ Demo data initialization complete');
}

// ==============================================
// API ROUTES - HEALTH CHECK
// ==============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        database: 'JSON Files',
        storage: DATA_DIR,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ==============================================
// API ROUTES - CANDIDATES
// ==============================================

app.get('/api/candidates', (req, res) => {
    try {
        const candidates = loadData('candidates');
        res.json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
});

app.post('/api/candidates', (req, res) => {
    try {
        const candidates = loadData('candidates');
        const newCandidate = {
            id: Date.now(),
            ...req.body,
            created_at: new Date().toISOString(),
            interview_feedback: [],
            timeline: [
                {
                    id: Date.now() + 1,
                    type: 'created',
                    message: `Candidate added by ${req.body.created_by || 'Unknown'}`,
                    user: req.body.created_by || 'Unknown',
                    created_at: new Date().toISOString()
                }
            ]
        };
        
        candidates.unshift(newCandidate);
        saveData('candidates', candidates);
        
        res.status(201).json(newCandidate);
    } catch (error) {
        console.error('Error creating candidate:', error);
        res.status(500).json({ error: 'Failed to create candidate' });
    }
});

app.put('/api/candidates/:id', (req, res) => {
    try {
        const candidates = loadData('candidates');
        const candidateIndex = candidates.findIndex(c => c.id == req.params.id);
        
        if (candidateIndex === -1) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        
        candidates[candidateIndex] = {
            ...candidates[candidateIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        saveData('candidates', candidates);
        res.json(candidates[candidateIndex]);
    } catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({ error: 'Failed to update candidate' });
    }
});

app.delete('/api/candidates/:id', (req, res) => {
    try {
        const candidates = loadData('candidates');
        const updatedCandidates = candidates.filter(c => c.id != req.params.id);
        
        if (candidates.length === updatedCandidates.length) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        
        saveData('candidates', updatedCandidates);
        res.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        console.error('Error deleting candidate:', error);
        res.status(500).json({ error: 'Failed to delete candidate' });
    }
});

// ==============================================
// API ROUTES - PROJECTS (ENHANCED)
// ==============================================

app.get('/api/projects', (req, res) => {
    try {
        const projects = loadData('projects');
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Enhanced Get Single Project Route (with comments and timeline)
app.get('/api/projects/:id', (req, res) => {
    try {
        const projects = loadData('projects');
        const project = projects.find(p => p.id == req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Ensure comments and timeline arrays exist
        if (!project.comments) project.comments = [];
        if (!project.timeline) project.timeline = [];
        
        // Sort timeline by date (newest first)
        project.timeline.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        project.comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

app.post('/api/projects', (req, res) => {
    try {
        const projects = loadData('projects');
        const newProject = {
            id: Date.now(),
            ...req.body,
            created_at: new Date().toISOString(),
            status: req.body.status || 'active',
            comments: [],
            timeline: [
                {
                    id: Date.now() + 1,
                    type: 'created',
                    message: `Project created by ${req.body.created_by || 'Unknown'}`,
                    user: req.body.created_by || 'Unknown',
                    created_at: new Date().toISOString()
                }
            ]
        };
        
        projects.unshift(newProject);
        saveData('projects', projects);
        
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.put('/api/projects/:id', (req, res) => {
    try {
        const projects = loadData('projects');
        const projectIndex = projects.findIndex(p => p.id == req.params.id);
        
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const oldProject = projects[projectIndex];
        projects[projectIndex] = {
            ...oldProject,
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        // Add timeline entry for status changes
        if (req.body.status && req.body.status !== oldProject.status) {
            if (!projects[projectIndex].timeline) {
                projects[projectIndex].timeline = [];
            }
            
            projects[projectIndex].timeline.unshift({
                id: Date.now(),
                type: 'status_change',
                message: `Project status changed from ${oldProject.status || 'active'} to ${req.body.status}`,
                user: req.body.updated_by || 'System',
                created_at: new Date().toISOString()
            });
        }
        
        saveData('projects', projects);
        res.json(projects[projectIndex]);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:id', (req, res) => {
    try {
        const projects = loadData('projects');
        const updatedProjects = projects.filter(p => p.id != req.params.id);
        
        if (projects.length === updatedProjects.length) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        saveData('projects', updatedProjects);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// ==============================================
// API ROUTES - PROJECT COMMENTS (NEW)
// ==============================================

app.get('/api/projects/:id/comments', (req, res) => {
    try {
        const projects = loadData('projects');
        const project = projects.find(p => p.id == req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(project.comments || []);
    } catch (error) {
        console.error('Error fetching project comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/projects/:id/comments', (req, res) => {
    try {
        const { text, user } = req.body;
        
        if (!text || !user) {
            return res.status(400).json({ error: 'Text and user are required' });
        }
        
        const projects = loadData('projects');
        const projectIndex = projects.findIndex(p => p.id == req.params.id);
        
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const comment = {
            id: Date.now(),
            text: text.trim(),
            user,
            created_at: new Date().toISOString()
        };
        
        if (!projects[projectIndex].comments) {
            projects[projectIndex].comments = [];
        }
        
        projects[projectIndex].comments.unshift(comment);
        
        // Also add to timeline
        if (!projects[projectIndex].timeline) {
            projects[projectIndex].timeline = [];
        }
        
        projects[projectIndex].timeline.unshift({
            id: Date.now() + 1,
            type: 'comment',
            message: `${user} added a comment`,
            user,
            created_at: new Date().toISOString()
        });
        
        saveData('projects', projects);
        
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding project comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// ==============================================
// API ROUTES - PROJECT TIMELINE (NEW)
// ==============================================

app.get('/api/projects/:id/timeline', (req, res) => {
    try {
        const projects = loadData('projects');
        const project = projects.find(p => p.id == req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const timeline = project.timeline || [];
        res.json(timeline.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
        console.error('Error fetching project timeline:', error);
        res.status(500).json({ error: 'Failed to fetch timeline' });
    }
});

app.post('/api/projects/:id/timeline', (req, res) => {
    try {
        const { type, message, user } = req.body;
        
        if (!type || !message || !user) {
            return res.status(400).json({ error: 'Type, message, and user are required' });
        }
        
        const projects = loadData('projects');
        const projectIndex = projects.findIndex(p => p.id == req.params.id);
        
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const timelineEntry = {
            id: Date.now(),
            type,
            message: message.trim(),
            user,
            created_at: new Date().toISOString()
        };
        
        if (!projects[projectIndex].timeline) {
            projects[projectIndex].timeline = [];
        }
        
        projects[projectIndex].timeline.unshift(timelineEntry);
        saveData('projects', projects);
        
        res.status(201).json(timelineEntry);
    } catch (error) {
        console.error('Error adding timeline entry:', error);
        res.status(500).json({ error: 'Failed to add timeline entry' });
    }
});

// ==============================================
// API ROUTES - INTERVIEWS
// ==============================================

app.get('/api/interviews', (req, res) => {
    try {
        const interviews = loadData('interviews');
        res.json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ error: 'Failed to fetch interviews' });
    }
});

app.post('/api/interviews', (req, res) => {
    try {
        const interviews = loadData('interviews');
        const newInterview = {
            id: Date.now(),
            ...req.body,
            scheduled_at: new Date().toISOString(),
            status: 'scheduled'
        };
        
        interviews.unshift(newInterview);
        saveData('interviews', interviews);
        
        res.status(201).json(newInterview);
    } catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({ error: 'Failed to create interview' });
    }
});

app.put('/api/interviews/:id', (req, res) => {
    try {
        const interviews = loadData('interviews');
        const interviewIndex = interviews.findIndex(i => i.id == req.params.id);
        
        if (interviewIndex === -1) {
            return res.status(404).json({ error: 'Interview not found' });
        }
        
        interviews[interviewIndex] = {
            ...interviews[interviewIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        saveData('interviews', interviews);
        res.json(interviews[interviewIndex]);
    } catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({ error: 'Failed to update interview' });
    }
});

app.delete('/api/interviews/:id', (req, res) => {
    try {
        const interviews = loadData('interviews');
        const updatedInterviews = interviews.filter(i => i.id != req.params.id);
        
        if (interviews.length === updatedInterviews.length) {
            return res.status(404).json({ error: 'Interview not found' });
        }
        
        saveData('interviews', updatedInterviews);
        res.json({ message: 'Interview deleted successfully' });
    } catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({ error: 'Failed to delete interview' });
    }
});

// ==============================================
// API ROUTES - INTERVIEW TEMPLATES
// ==============================================

app.get('/api/interview-templates', (req, res) => {
    try {
        const templates = loadData('interviewTemplates');
        res.json(templates);
    } catch (error) {
        console.error('Error fetching interview templates:', error);
        res.status(500).json({ error: 'Failed to fetch interview templates' });
    }
});

app.post('/api/interview-templates', (req, res) => {
    try {
        const templates = loadData('interviewTemplates');
        const newTemplate = {
            id: Date.now(),
            ...req.body,
            created_at: new Date().toISOString()
        };
        
        templates.unshift(newTemplate);
        saveData('interviewTemplates', templates);
        
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error('Error creating interview template:', error);
        res.status(500).json({ error: 'Failed to create interview template' });
    }
});

app.put('/api/interview-templates/:id', (req, res) => {
    try {
        const templates = loadData('interviewTemplates');
        const templateIndex = templates.findIndex(t => t.id == req.params.id);
        
        if (templateIndex === -1) {
            return res.status(404).json({ error: 'Interview template not found' });
        }
        
        templates[templateIndex] = {
            ...templates[templateIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        saveData('interviewTemplates', templates);
        res.json(templates[templateIndex]);
    } catch (error) {
        console.error('Error updating interview template:', error);
        res.status(500).json({ error: 'Failed to update interview template' });
    }
});

app.delete('/api/interview-templates/:id', (req, res) => {
    try {
        const templates = loadData('interviewTemplates');
        const updatedTemplates = templates.filter(t => t.id != req.params.id);
        
        if (templates.length === updatedTemplates.length) {
            return res.status(404).json({ error: 'Interview template not found' });
        }
        
        saveData('interviewTemplates', updatedTemplates);
        res.json({ message: 'Interview template deleted successfully' });
    } catch (error) {
        console.error('Error deleting interview template:', error);
        res.status(500).json({ error: 'Failed to delete interview template' });
    }
});

// ==============================================
// API ROUTES - TASKS
// ==============================================

app.get('/api/tasks', (req, res) => {
    try {
        const tasks = loadData('tasks');
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks', (req, res) => {
    try {
        const tasks = loadData('tasks');
        const newTask = {
            id: Date.now(),
            ...req.body,
            created_at: new Date().toISOString(),
            status: req.body.status || 'pending'
        };
        
        tasks.unshift(newTask);
        saveData('tasks', tasks);
        
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.put('/api/tasks/:id', (req, res) => {
    try {
        const tasks = loadData('tasks');
        const taskIndex = tasks.findIndex(t => t.id == req.params.id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        saveData('tasks', tasks);
        res.json(tasks[taskIndex]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/api/tasks/:id', (req, res) => {
    try {
        const tasks = loadData('tasks');
        const updatedTasks = tasks.filter(t => t.id != req.params.id);
        
        if (tasks.length === updatedTasks.length) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        saveData('tasks', updatedTasks);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// ==============================================
// API ROUTES - NOTES & CATEGORIES
// ==============================================

// Categories routes
app.get('/api/categories', (req, res) => {
    try {
        const categories = loadData('categories');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/categories', (req, res) => {
    try {
        const categories = loadData('categories');
        const newCategory = {
            id: Date.now() + Math.random(),
            ...req.body,
            created_at: new Date().toISOString()
        };
        
        categories.unshift(newCategory);
        saveData('categories', categories);
        
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.put('/api/categories/:id', (req, res) => {
    try {
        const categories = loadData('categories');
        const categoryIndex = categories.findIndex(c => c.id == req.params.id);
        
        if (categoryIndex === -1) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        categories[categoryIndex] = {
            ...categories[categoryIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        saveData('categories', categories);
        res.json(categories[categoryIndex]);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    try {
        const categories = loadData('categories');
        const updatedCategories = categories.filter(c => c.id != req.params.id);
        
        if (categories.length === updatedCategories.length) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        // Also delete all notes in this category
        const notes = loadData('notes');
        const updatedNotes = notes.filter(n => n.category_id != req.params.id);
        saveData('notes', updatedNotes);
        
        saveData('categories', updatedCategories);
        res.json({ message: 'Category and its notes deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Notes routes
app.get('/api/notes', (req, res) => {
    try {
        const notes = loadData('notes');
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/api/notes', (req, res) => {
    try {
        const notes = loadData('notes');
        const newNote = {
            id: Date.now() + Math.random(),
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        notes.unshift(newNote);
        saveData('notes', notes);
        
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.put('/api/notes/:id', (req, res) => {
    try {
        const notes = loadData('notes');
        const noteIndex = notes.findIndex(n => n.id == req.params.id);
        
        if (noteIndex === -1) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        notes[noteIndex] = {
            ...notes[noteIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        saveData('notes', notes);
        res.json(notes[noteIndex]);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/api/notes/:id', (req, res) => {
    try {
        const notes = loadData('notes');
        const updatedNotes = notes.filter(n => n.id != req.params.id);
        
        if (notes.length === updatedNotes.length) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        saveData('notes', updatedNotes);
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// ==============================================
// API ROUTES - DATA MIGRATION & EXPORT
// ==============================================

// Migration from browser localStorage to server
app.post('/api/migrate-from-browser', (req, res) => {
    try {
        const { candidates, interviews, projects, templates, tasks } = req.body;
        
        console.log('📊 Data received:');
console.log(`  📋 Candidates: ${candidates?.length || 0}`);
console.log(`  🎯 Projects: ${projects?.length || 0}`);
console.log(`  🗣️ Interviews: ${interviews?.length || 0}`);
console.log(`  📋 Templates: ${templates?.length || 0}`);
console.log(`  ✅ Tasks: ${tasks?.length || 0}`);
console.log(`  📁 Categories: ${req.body.categories?.length || 0}`);
console.log(`  📝 Notes: ${req.body.notes?.length || 0}`);
        
const migrated = {
    candidates: 0,
   interviews: 0,
   projects: 0,
   templates: 0,
    tasks: 0,
    categories: 0,
    notes: 0
    };
        
        // Migrate candidates
        if (candidates && candidates.length > 0) {
            const existingCandidates = loadData('candidates');
            const mergedCandidates = [...candidates, ...existingCandidates];
            saveData('candidates', mergedCandidates);
            migrated.candidates = candidates.length;
        }
        
        // Migrate projects (with comments and timeline)
        if (projects && projects.length > 0) {
            const existingProjects = loadData('projects');
            // Ensure new projects have comments and timeline arrays
            const enhancedProjects = projects.map(project => ({
                ...project,
                comments: project.comments || [],
                timeline: project.timeline || []
            }));
            const mergedProjects = [...enhancedProjects, ...existingProjects];
            saveData('projects', mergedProjects);
            migrated.projects = projects.length;
        }
        
        // Migrate interviews
        if (interviews && interviews.length > 0) {
            const existingInterviews = loadData('interviews');
            const mergedInterviews = [...interviews, ...existingInterviews];
            saveData('interviews', mergedInterviews);
            migrated.interviews = interviews.length;
        }
        
        // Migrate templates
        if (templates && templates.length > 0) {
            const existingTemplates = loadData('interviewTemplates');
            const mergedTemplates = [...templates, ...existingTemplates];
            saveData('interviewTemplates', mergedTemplates);
            migrated.templates = templates.length;
        }

        // Migrate categories
if (req.body.categories && req.body.categories.length > 0) {
    saveData('categories', req.body.categories);
    migrated.categories = req.body.categories.length;
    console.log(`📁 Migrated ${req.body.categories.length} categories`);
}

// Migrate notes
if (req.body.notes && req.body.notes.length > 0) {
    saveData('notes', req.body.notes);
    migrated.notes = req.body.notes.length;
    console.log(`📝 Migrated ${req.body.notes.length} notes`);
}
        
        // Migrate tasks
        if (tasks && tasks.length > 0) {
            const existingTasks = loadData('tasks');
            const mergedTasks = [...tasks, ...existingTasks];
            saveData('tasks', mergedTasks);
            migrated.tasks = tasks.length;
        }
        
        console.log('✅ Migration completed successfully!');
        console.log('📊 Migration summary:', migrated);
        
        res.json({ migrated });
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({ error: 'Migration failed: ' + error.message });
    }
});

// Export data as CSV
app.get('/api/export/csv', (req, res) => {
    try {
        console.log('📊 Exporting data as CSV...');
        
        const candidates = loadData('candidates');
        const projects = loadData('projects');
        const interviews = loadData('interviews');
        const tasks = loadData('tasks');
        
        // Create CSV content
        let csvContent = 'Type,ID,Name,Email,Status,Created,Details\n';
        
        // Add candidates
        candidates.forEach(candidate => {
            csvContent += `Candidate,${candidate.id},"${candidate.name}","${candidate.email}",${candidate.status},${candidate.created_at},"${candidate.job_title || ''}"\n`;
        });
        
        // Add projects
        projects.forEach(project => {
            csvContent += `Project,${project.id},"${project.name}","",${project.status},${project.created_at},"${project.description || ''}"\n`;
        });
        
        // Add interviews
        interviews.forEach(interview => {
            csvContent += `Interview,${interview.id},"${interview.candidate_name || ''}","",${interview.status},${interview.scheduled_at},"${interview.type || ''}"\n`;
        });
        
        // Add tasks
        tasks.forEach(task => {
            csvContent += `Task,${task.id},"${task.title}","",${task.status},${task.created_at},"${task.description || ''}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="recruitpro-export-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
        
        console.log('✅ CSV export completed');
    } catch (error) {
        console.error('❌ Export failed:', error);
        res.status(500).json({ error: 'Export failed: ' + error.message });
    }
});

// Structured Candidates Export as CSV/Excel
app.get('/api/export/candidates', (req, res) => {
    try {
        console.log('📊 Exporting structured candidates data...');
        
        const candidates = loadData('candidates');
        const projects = loadData('projects');
        
        // Create a map of project IDs to project names for reference
        const projectMap = {};
        projects.forEach(project => {
            projectMap[project.id] = project.name;
        });
        
        // CSV Headers - structured for candidates
        const headers = [
            'Name',
            'Email', 
            'Phone',
            'Country',
            'City',
            'Job Title',
            'Company',
            'LinkedIn',
            'GitHub',
            'Portfolio',
            'Status',
            'Source',
            'Projects',
            'Skills',
            'Experience Level',
            'Salary Expectation',
            'Notice Period',
            'Interview Count',
            'Last Interview Date',
            'Average Rating',
            'Created Date',
            'Last Updated',
            'Notes'
        ];
        
        // Create CSV content with proper escaping
        let csvContent = headers.join(',') + '\n';
        
        candidates.forEach(candidate => {
            // Handle projects - convert project IDs to names
            let projectNames = '';
            if (candidate.projects && Array.isArray(candidate.projects)) {
                projectNames = candidate.projects
                    .map(projId => projectMap[projId] || `Unknown Project (${projId})`)
                    .join('; ');
            }
            
            // Handle skills
            let skills = '';
            if (candidate.skills && Array.isArray(candidate.skills)) {
                skills = candidate.skills.join('; ');
            }
            
            // Calculate interview stats
            let interviewCount = 0;
            let lastInterviewDate = '';
            let averageRating = '';
            
            if (candidate.interview_feedback && Array.isArray(candidate.interview_feedback)) {
                interviewCount = candidate.interview_feedback.length;
                
                if (interviewCount > 0) {
                    // Get last interview date
                    const sortedFeedback = candidate.interview_feedback
                        .sort((a, b) => new Date(b.interview_date) - new Date(a.interview_date));
                    lastInterviewDate = new Date(sortedFeedback[0].interview_date).toLocaleDateString();
                    
                    // Calculate average rating
                    const ratings = candidate.interview_feedback
                        .map(f => f.feedback?.rating)
                        .filter(rating => rating !== undefined && rating !== null);
                    
                    if (ratings.length > 0) {
                        const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
                        averageRating = avgRating.toFixed(1) + '/10';
                    }
                }
            }
            
            // Helper function to escape CSV values
            const escapeCSV = (value) => {
                if (value == null || value == undefined) return '';
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            
            // Build row data
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
        
        // Set headers for Excel-compatible CSV
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="RecruitPro-Candidates-${new Date().toISOString().split('T')[0]}.csv"`);
        
        // Add BOM for proper UTF-8 handling in Excel
        const BOM = '\uFEFF';
        res.send(BOM + csvContent);
        
        console.log(`✅ Exported ${candidates.length} candidates with structured data`);
    } catch (error) {
        console.error('❌ Candidate export failed:', error);
        res.status(500).json({ error: 'Export failed: ' + error.message });
    }
});

// ==============================================
// API ROUTES - COMPANIES
// ==============================================

app.get('/api/companies', (req, res) => {
    try {
        const companies = loadData('companies');
        res.json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

app.post('/api/companies', (req, res) => {
    try {
        const companies = loadData('companies');
        const newCompany = {
            id: Date.now() + Math.random(),
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        companies.unshift(newCompany);
        saveData('companies', companies);
        
        res.status(201).json(newCompany);
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ error: 'Failed to create company' });
    }
});

app.put('/api/companies/:id', (req, res) => {
    try {
        const companies = loadData('companies');
        const companyIndex = companies.findIndex(c => c.id == req.params.id);
        
        if (companyIndex === -1) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        companies[companyIndex] = {
            ...companies[companyIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        saveData('companies', companies);
        res.json(companies[companyIndex]);
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ error: 'Failed to update company' });
    }
});

app.delete('/api/companies/:id', (req, res) => {
    try {
        const companies = loadData('companies');
        const updatedCompanies = companies.filter(c => c.id != req.params.id);
        
        if (companies.length === updatedCompanies.length) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        saveData('companies', updatedCompanies);
        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ error: 'Failed to delete company' });
    }
});

// ==============================================
// STATIC FILE SERVING & CATCH-ALL
// ==============================================

// Serve the main HTML file for any non-API routes
app.get('*', (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ==============================================
// SERVER STARTUP
// ==============================================

// Initialize demo data on startup
initializeDemoData();

app.listen(PORT, () => {
    console.log('🚀 ===================================');
    console.log(`🌐 RecruitPro Server running on port ${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🔗 Frontend: http://localhost:${PORT}`);
    console.log(`⚡ API: http://localhost:${PORT}/api/health`);
    console.log('✨ Features enabled:');
    console.log('   • Project Comments & Timeline');
    console.log('   • Full CRUD operations');
    console.log('   • Data migration support');
    console.log('   • CSV export functionality');
    console.log('🚀 ===================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down RecruitPro server...');
    console.log('💾 Data has been saved to JSON files');
    console.log('👋 Goodbye!');
    process.exit(0);
});