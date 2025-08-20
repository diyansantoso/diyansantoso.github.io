// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin state
let currentSection = 'blog';
let editingItemId = null;
let isAuthenticated = false;

// Check authentication on load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    if (isAuthenticated) {
        showSection('blog');
        loadBlogPosts();
    }
});

// Authentication Functions
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        showLoginForm();
        return false;
    }
    
    isAuthenticated = true;
    return true;
}

function showLoginForm() {
    document.querySelector('.admin-container').innerHTML = `
        <div class="login-container" style="max-width: 400px; margin: 100px auto;">
            <h2>Admin Login</h2>
            <form id="loginForm" style="background: white; padding: 30px; border-radius: 10px; box-shadow: var(--shadow);">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
        </div>
    `;
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        showToast('Login successful!', 'success');
        location.reload();
    } catch (error) {
        showToast('Login failed: ' + error.message, 'error');
    }
}

// Logout Function
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        showToast('Logged out successfully', 'success');
        location.reload();
    }
});

// Section Management
function showSection(section) {
    currentSection = section;
    
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => {
        s.style.display = 'none';
    });
    
    // Update nav buttons
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target?.classList.add('active');
    
    // Show selected section
    switch(section) {
        case 'blog':
            showBlogSection();
            break;
        case 'projects':
            showProjectsSection();
            break;
        case 'skills':
            showSkillsSection();
            break;
        case 'certifications':
            showCertificationsSection();
            break;
    }
}

// ==================== BLOG SECTION ====================
function showBlogSection() {
    const adminContent = document.querySelector('.admin-content');
    adminContent.innerHTML = `
        <div id="blogSection" class="admin-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Manage Blog Posts</h2>
                <button onclick="showBlogForm()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add New Post
                </button>
            </div>
            
            <div id="blogForm" style="display: none; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h3 id="blogFormTitle">Add New Post</h3>
                <form id="postForm">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" id="postTitle" required>
                    </div>
                    <div class="form-group">
                        <label>Slug * (URL-friendly version of title)</label>
                        <input type="text" id="postSlug" required>
                        <small>Example: "how-to-fix-network-issues"</small>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="postCategory">
                            <option value="tutorial">Tutorial</option>
                            <option value="tips">Tips & Tricks</option>
                            <option value="news">Tech News</option>
                            <option value="troubleshooting">Troubleshooting</option>
                            <option value="security">Security</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Excerpt (Short description)</label>
                        <textarea id="postExcerpt" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Content * (Supports Markdown)</label>
                        <textarea id="postContent" rows="15" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Featured Image URL</label>
                        <input type="url" id="postImage" placeholder="https://example.com/image.jpg">
                    </div>
                    <div class="form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" id="postTags" placeholder="windows, networking, troubleshooting">
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="postPublished">
                            <span>Publish immediately</span>
                        </label>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Post
                        </button>
                        <button type="button" onclick="hideBlogForm()" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <div id="blogList">
                <div class="loading">Loading posts...</div>
            </div>
        </div>
    `;
    
    // Add event listener for form
    document.getElementById('postForm').addEventListener('submit', handleBlogSubmit);
    
    // Auto-generate slug from title
    document.getElementById('postTitle')?.addEventListener('input', (e) => {
        const slug = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        document.getElementById('postSlug').value = slug;
    });
    
    loadBlogPosts();
}

function showBlogForm(postId = null) {
    document.getElementById('blogForm').style.display = 'block';
    
    if (postId) {
        editingItemId = postId;
        document.getElementById('blogFormTitle').textContent = 'Edit Post';
        loadBlogPost(postId);
    } else {
        editingItemId = null;
        document.getElementById('blogFormTitle').textContent = 'Add New Post';
        document.getElementById('postForm').reset();
    }
    
    // Scroll to form
    document.getElementById('blogForm').scrollIntoView({ behavior: 'smooth' });
}

function hideBlogForm() {
    document.getElementById('blogForm').style.display = 'none';
    document.getElementById('postForm').reset();
    editingItemId = null;
}

async function loadBlogPosts() {
    const blogList = document.getElementById('blogList');
    
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data.length === 0) {
            blogList.innerHTML = '<p>No blog posts yet. Create your first post!</p>';
            return;
        }
        
        let html = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Title</th>
                        <th style="padding: 10px; text-align: left;">Category</th>
                        <th style="padding: 10px; text-align: left;">Status</th>
                        <th style="padding: 10px; text-align: left;">Created</th>
                        <th style="padding: 10px; text-align: left;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.forEach(post => {
            const date = new Date(post.created_at).toLocaleDateString();
            const status = post.published ? 
                '<span style="color: green;">Published</span>' : 
                '<span style="color: orange;">Draft</span>';
            
            html += `
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px;">
                        <strong>${post.title}</strong><br>
                        <small style="color: #6c757d;">/${post.slug}</small>
                    </td>
                    <td style="padding: 10px;">${post.category || 'Uncategorized'}</td>
                    <td style="padding: 10px;">${status}</td>
                    <td style="padding: 10px;">${date}</td>
                    <td style="padding: 10px;">
                        <button onclick="showBlogForm(${post.id})" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteBlogPost(${post.id})" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        blogList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogList.innerHTML = '<p>Error loading posts. Please try again.</p>';
    }
}

async function loadBlogPost(id) {
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        document.getElementById('postTitle').value = data.title;
        document.getElementById('postSlug').value = data.slug;
        document.getElementById('postCategory').value = data.category;
        document.getElementById('postExcerpt').value = data.excerpt || '';
        document.getElementById('postContent').value = data.content;
        document.getElementById('postImage').value = data.image_url || '';
        document.getElementById('postTags').value = data.tags ? data.tags.join(', ') : '';
        document.getElementById('postPublished').checked = data.published;
        
    } catch (error) {
        console.error('Error loading post:', error);
        showToast('Error loading post', 'error');
    }
}

async function handleBlogSubmit(e) {
    e.preventDefault();
    
    const postData = {
        title: document.getElementById('postTitle').value,
        slug: document.getElementById('postSlug').value,
        category: document.getElementById('postCategory').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: document.getElementById('postContent').value,
        image_url: document.getElementById('postImage').value,
        tags: document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        published: document.getElementById('postPublished').checked,
        updated_at: new Date().toISOString()
    };
    
    try {
        if (editingItemId) {
            // Update existing post
            const { error } = await supabase
                .from('blog_posts')
                .update(postData)
                .eq('id', editingItemId);
            
            if (error) throw error;
            showToast('Post updated successfully!', 'success');
        } else {
            // Create new post
            const { error } = await supabase
                .from('blog_posts')
                .insert([postData]);
            
            if (error) throw error;
            showToast('Post created successfully!', 'success');
        }
        
        hideBlogForm();
        loadBlogPosts();
        
    } catch (error) {
        console.error('Error saving post:', error);
        showToast('Error saving post: ' + error.message, 'error');
    }
}

async function deleteBlogPost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showToast('Post deleted successfully!', 'success');
        loadBlogPosts();
        
    } catch (error) {
        console.error('Error deleting post:', error);
        showToast('Error deleting post', 'error');
    }
}

// ==================== PROJECTS SECTION ====================
function showProjectsSection() {
    const adminContent = document.querySelector('.admin-content');
    adminContent.innerHTML = `
        <div id="projectsSection" class="admin-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Manage Projects</h2>
                <button onclick="showProjectForm()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add New Project
                </button>
            </div>
            
            <div id="projectForm" style="display: none; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h3 id="projectFormTitle">Add New Project</h3>
                <form id="projectFormElement">
                    <div class="form-group">
                        <label>Project Title *</label>
                        <input type="text" id="projectTitle" required>
                    </div>
                    <div class="form-group">
                        <label>Description *</label>
                        <textarea id="projectDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Tech Stack (comma separated)</label>
                        <input type="text" id="projectTechStack" placeholder="Windows Server, Active Directory, PowerShell">
                    </div>
                    <div class="form-group">
                        <label>Project Image URL</label>
                        <input type="url" id="projectImage" placeholder="https://example.com/project-image.jpg">
                    </div>
                    <div class="form-group">
                        <label>Demo URL</label>
                        <input type="url" id="projectDemoUrl" placeholder="https://example.com">
                    </div>
                    <div class="form-group">
                        <label>GitHub URL</label>
                        <input type="url" id="projectGithubUrl" placeholder="https://github.com/username/project">
                    </div>
                    <div class="form-group">
                        <label>Display Order</label>
                        <input type="number" id="projectOrder" value="0" min="0">
                        <small>Lower numbers appear first</small>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Project
                        </button>
                        <button type="button" onclick="hideProjectForm()" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <div id="projectsList">
                <div class="loading">Loading projects...</div>
            </div>
        </div>
    `;
    
    document.getElementById('projectFormElement').addEventListener('submit', handleProjectSubmit);
    loadProjects();
}

function showProjectForm(projectId = null) {
    document.getElementById('projectForm').style.display = 'block';
    
    if (projectId) {
        editingItemId = projectId;
        document.getElementById('projectFormTitle').textContent = 'Edit Project';
        loadProject(projectId);
    } else {
        editingItemId = null;
        document.getElementById('projectFormTitle').textContent = 'Add New Project';
        document.getElementById('projectFormElement').reset();
    }
    
    document.getElementById('projectForm').scrollIntoView({ behavior: 'smooth' });
}

function hideProjectForm() {
    document.getElementById('projectForm').style.display = 'none';
    document.getElementById('projectFormElement').reset();
    editingItemId = null;
}

async function loadProjects() {
    const projectsList = document.getElementById('projectsList');
    
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        
        if (data.length === 0) {
            projectsList.innerHTML = '<p>No projects yet. Add your first project!</p>';
            return;
        }
        
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
        
        data.forEach(project => {
            html += `
                <div style="background: white; border: 1px solid #dee2e6; border-radius: 10px; padding: 20px;">
                    <h4>${project.title}</h4>
                    <p style="color: #6c757d; margin: 10px 0;">${project.description}</p>
                    <div style="margin: 10px 0;">
                        ${project.tech_stack ? project.tech_stack.map(tech => 
                            `<span style="display: inline-block; background: #e9ecef; padding: 2px 8px; border-radius: 3px; margin: 2px; font-size: 0.85rem;">${tech}</span>`
                        ).join('') : ''}
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button onclick="showProjectForm(${project.id})" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteProject(${project.id})" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        projectsList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsList.innerHTML = '<p>Error loading projects. Please try again.</p>';
    }
}

async function loadProject(id) {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        document.getElementById('projectTitle').value = data.title;
        document.getElementById('projectDescription').value = data.description;
        document.getElementById('projectTechStack').value = data.tech_stack ? data.tech_stack.join(', ') : '';
        document.getElementById('projectImage').value = data.image_url || '';
        document.getElementById('projectDemoUrl').value = data.demo_url || '';
        document.getElementById('projectGithubUrl').value = data.github_url || '';
        document.getElementById('projectOrder').value = data.order_index || 0;
        
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Error loading project', 'error');
    }
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        tech_stack: document.getElementById('projectTechStack').value.split(',').map(tech => tech.trim()).filter(tech => tech),
        image_url: document.getElementById('projectImage').value,
        demo_url: document.getElementById('projectDemoUrl').value,
        github_url: document.getElementById('projectGithubUrl').value,
        order_index: parseInt(document.getElementById('projectOrder').value) || 0
    };
    
    try {
        if (editingItemId) {
            const { error } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', editingItemId);
            
            if (error) throw error;
            showToast('Project updated successfully!', 'success');
        } else {
            const { error } = await supabase
                .from('projects')
                .insert([projectData]);
            
            if (error) throw error;
            showToast('Project created successfully!', 'success');
        }
        
        hideProjectForm();
        loadProjects();
        
    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Error saving project: ' + error.message, 'error');
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showToast('Project deleted successfully!', 'success');
        loadProjects();
        
    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Error deleting project', 'error');
    }
}

// ==================== SKILLS SECTION ====================
function showSkillsSection() {
    const adminContent = document.querySelector('.admin-content');
    adminContent.innerHTML = `
        <div id="skillsSection" class="admin-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Manage Skills</h2>
                <button onclick="showSkillForm()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add New Skill
                </button>
            </div>
            
            <div id="skillForm" style="display: none; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h3 id="skillFormTitle">Add New Skill</h3>
                <form id="skillFormElement">
                    <div class="form-group">
                        <label>Category *</label>
                        <select id="skillCategory" required>
                            <option value="Operating Systems">Operating Systems</option>
                            <option value="Networking">Networking</option>
                            <option value="Security">Security</option>
                            <option value="Cloud Services">Cloud Services</option>
                            <option value="Software">Software</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Programming">Programming</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Skill Name *</label>
                        <input type="text" id="skillName" required placeholder="e.g., Windows Server">
                    </div>
                    <div class="form-group">
                        <label>Proficiency Level (0-100) *</label>
                        <input type="number" id="skillLevel" min="0" max="100" required>
                        <small>0 = Beginner, 100 = Expert</small>
                    </div>
                    <div class="form-group">
                        <label>Icon Class (Font Awesome)</label>
                        <input type="text" id="skillIcon" placeholder="fas fa-server">
                        <small>Find icons at <a href="https://fontawesome.com/icons" target="_blank">Font Awesome</a></small>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Skill
                        </button>
                        <button type="button" onclick="hideSkillForm()" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <div id="skillsList">
                <div class="loading">Loading skills...</div>
            </div>
        </div>
    `;
    
    document.getElementById('skillFormElement').addEventListener('submit', handleSkillSubmit);
    loadSkills();
}

function showSkillForm(skillId = null) {
    document.getElementById('skillForm').style.display = 'block';
    
    if (skillId) {
        editingItemId = skillId;
        document.getElementById('skillFormTitle').textContent = 'Edit Skill';
        loadSkill(skillId);
    } else {
        editingItemId = null;
        document.getElementById('skillFormTitle').textContent = 'Add New Skill';
        document.getElementById('skillFormElement').reset();
    }
    
    document.getElementById('skillForm').scrollIntoView({ behavior: 'smooth' });
}

function hideSkillForm() {
    document.getElementById('skillForm').style.display = 'none';
    document.getElementById('skillFormElement').reset();
    editingItemId = null;
}

async function loadSkills() {
    const skillsList = document.getElementById('skillsList');
    
    try {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .order('category', { ascending: true })
            .order('level', { descending: true });
        
        if (error) throw error;
        
        if (data.length === 0) {
            skillsList.innerHTML = '<p>No skills yet. Add your skills!</p>';
            return;
        }
        
        // Group skills by category
        const groupedSkills = data.reduce((acc, skill) => {
            if (!acc[skill.category]) {
                acc[skill.category] = [];
            }
            acc[skill.category].push(skill);
            return acc;
        }, {});
        
        let html = '';
        
        Object.entries(groupedSkills).forEach(([category, skills]) => {
            html += `
                <div style="margin-bottom: 30px;">
                    <h4 style="color: var(--primary-color); margin-bottom: 15px;">${category}</h4>
                    <div style="display: grid; gap: 10px;">
            `;
            
            skills.forEach(skill => {
                html += `
                    <div style="display: flex; align-items: center; background: white; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px;">
                        <i class="${skill.icon || 'fas fa-cog'}" style="font-size: 1.5rem; color: var(--primary-color); margin-right: 15px;"></i>
                        <div style="flex: 1;">
                            <strong>${skill.name}</strong>
                            <div style="display: flex; align-items: center; margin-top: 5px;">
                                <div style="flex: 1; background: #e9ecef; height: 10px; border-radius: 5px; overflow: hidden;">
                                    <div style="width: ${skill.level}%; height: 100%; background: var(--primary-color);"></div>
                                </div>
                                <span style="margin-left: 10px; color: #6c757d;">${skill.level}%</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px; margin-left: 15px;">
                            <button onclick="showSkillForm(${skill.id})" class="btn btn-sm btn-primary">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteSkill(${skill.id})" class="btn btn-sm btn-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        });
        
        skillsList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading skills:', error);
        skillsList.innerHTML = '<p>Error loading skills. Please try again.</p>';
    }
}

async function loadSkill(id) {
    try {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        document.getElementById('skillCategory').value = data.category;
        document.getElementById('skillName').value = data.name;
        document.getElementById('skillLevel').value = data.level;
        document.getElementById('skillIcon').value = data.icon || '';
        
    } catch (error) {
        console.error('Error loading skill:', error);
        showToast('Error loading skill', 'error');
    }
}

async function handleSkillSubmit(e) {
    e.preventDefault();
    
    const skillData = {
        category: document.getElementById('skillCategory').value,
        name: document.getElementById('skillName').value,
        level: parseInt(document.getElementById('skillLevel').value),
        icon: document.getElementById('skillIcon').value || 'fas fa-cog'
    };
    
    try {
        if (editingItemId) {
            const { error } = await supabase
                .from('skills')
                .update(skillData)
                .eq('id', editingItemId);
            
            if (error) throw error;
            showToast('Skill updated successfully!', 'success');
        } else {
            const { error } = await supabase
                .from('skills')
                .insert([skillData]);
            
            if (error) throw error;
            showToast('Skill added successfully!', 'success');
        }
        
        hideSkillForm();
        loadSkills();
        
    } catch (error) {
        console.error('Error saving skill:', error);
        showToast('Error saving skill: ' + error.message, 'error');
    }
}

async function deleteSkill(id) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showToast('Skill deleted successfully!', 'success');
        loadSkills();
        
    } catch (error) {
        console.error('Error deleting skill:', error);
        showToast('Error deleting skill', 'error');
    }
}

// ==================== CERTIFICATIONS SECTION ====================
function showCertificationsSection() {
    const adminContent = document.querySelector('.admin-content');
    adminContent.innerHTML = `
        <div id="certificationsSection" class="admin-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Manage Certifications</h2>
                <button onclick="showCertForm()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add New Certification
                </button>
            </div>
            
            <div id="certForm" style="display: none; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h3 id="certFormTitle">Add New Certification</h3>
                <form id="certFormElement">
                    <div class="form-group">
                        <label>Certification Name *</label>
                        <input type="text" id="certName" required placeholder="e.g., CompTIA A+">
                    </div>
                    <div class="form-group">
                        <label>Issuing Organization *</label>
                        <input type="text" id="certIssuer" required placeholder="e.g., CompTIA">
                    </div>
                    <div class="form-group">
                        <label>Issue Date *</label>
                        <input type="date" id="certDate" required>
                    </div>
                    <div class="form-group">
                        <label>Credential URL</label>
                        <input type="url" id="certUrl" placeholder="https://www.certmetrics.com/...">
                    </div>
                    <div class="form-group">
                        <label>Certificate Image URL</label>
                        <input type="url" id="certImage" placeholder="https://example.com/cert-image.jpg">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Certification
                        </button>
                        <button type="button" onclick="hideCertForm()" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <div id="certsList">
                <div class="loading">Loading certifications...</div>
            </div>
        </div>
    `;
    
    document.getElementById('certFormElement').addEventListener('submit', handleCertSubmit);
    loadCertifications();
}

function showCertForm(certId = null) {
    document.getElementById('certForm').style.display = 'block';
    
    if (certId) {
        editingItemId = certId;
        document.getElementById('certFormTitle').textContent = 'Edit Certification';
        loadCertification(certId);
    } else {
        editingItemId = null;
        document.getElementById('certFormTitle').textContent = 'Add New Certification';
        document.getElementById('certFormElement').reset();
    }
    
    document.getElementById('certForm').scrollIntoView({ behavior: 'smooth' });
}

function hideCertForm() {
    document.getElementById('certForm').style.display = 'none';
    document.getElementById('certFormElement').reset();
    editingItemId = null;
}

async function loadCertifications() {
    const certsList = document.getElementById('certsList');
    
    try {
        const { data, error } = await supabase
            .from('certifications')
            .select('*')
            .order('issue_date', { descending: true });
        
        if (error) throw error;
        
        if (data.length === 0) {
            certsList.innerHTML = '<p>No certifications yet. Add your certifications!</p>';
            return;
        }
        
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
        
        data.forEach(cert => {
            const date = new Date(cert.issue_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });
            
            html += `
                <div style="background: white; border: 1px solid #dee2e6; border-radius: 10px; padding: 20px; text-align: center;">
                    ${cert.image_url ? 
                        `<img src="${cert.image_url}" alt="${cert.name}" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 15px;">` :
                        `<i class="fas fa-certificate" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 15px;"></i>`
                    }
                    <h4>${cert.name}</h4>
                    <p style="color: #6c757d; margin: 5px 0;">${cert.issuer}</p>
                    <p style="color: #6c757d; font-size: 0.9rem;">${date}</p>
                    ${cert.credential_url ? 
                        `<a href="${cert.credential_url}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-size: 0.9rem;">
                            <i class="fas fa-external-link-alt"></i> View Certificate
                        </a>` : ''
                    }
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <button onclick="showCertForm(${cert.id})" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteCertification(${cert.id})" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        certsList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading certifications:', error);
        certsList.innerHTML = '<p>Error loading certifications. Please try again.</p>';
    }
}

async function loadCertification(id) {
    try {
        const { data, error } = await supabase
            .from('certifications')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        document.getElementById('certName').value = data.name;
        document.getElementById('certIssuer').value = data.issuer;
        document.getElementById('certDate').value = data.issue_date;
        document.getElementById('certUrl').value = data.credential_url || '';
        document.getElementById('certImage').value = data.image_url || '';
        
    } catch (error) {
        console.error('Error loading certification:', error);
        showToast('Error loading certification', 'error');
    }
}

async function handleCertSubmit(e) {
    e.preventDefault();
    
    const certData = {
        name: document.getElementById('certName').value,
        issuer: document.getElementById('certIssuer').value,
        issue_date: document.getElementById('certDate').value,
        credential_url: document.getElementById('certUrl').value,
        image_url: document.getElementById('certImage').value
    };
    
    try {
        if (editingItemId) {
            const { error } = await supabase
                .from('certifications')
                .update(certData)
                .eq('id', editingItemId);
            
            if (error) throw error;
            showToast('Certification updated successfully!', 'success');
        } else {
            const { error } = await supabase
                .from('certifications')
                .insert([certData]);
            
            if (error) throw error;
            showToast('Certification added successfully!', 'success');
        }
        
        hideCertForm();
        loadCertifications();
        
    } catch (error) {
        console.error('Error saving certification:', error);
        showToast('Error saving certification: ' + error.message, 'error');
    }
}

async function deleteCertification(id) {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    
    try {
        const { error } = await supabase
            .from('certifications')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showToast('Certification deleted successfully!', 'success');
        loadCertifications();
        
    } catch (error) {
        console.error('Error deleting certification:', error);
        showToast('Error deleting certification', 'error');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add some additional CSS for the admin panel
const style = document.createElement('style');
style.textContent = `
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }
    
    .btn-primary {
        background: var(--primary-color);
        color: white;
    }
    
    .btn-primary:hover {
        background: #0056b3;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #5a6268;
    }
    
    .btn-danger {
        background: #dc3545;
        color: white;
    }
    
    .btn-danger:hover {
        background: #c82333;
    }
    
    .btn-sm {
        padding: 5px 10px;
        font-size: 12px;
    }
    
    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        color: #6c757d;
    }
    
    .loading::after {
        content: '';
        width: 30px;
        height: 30px;
        margin-left: 10px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .admin-nav button.active {
        background: var(--primary-color);
        color: white;
    }
    
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast.success {
        background: #28a745;
    }
    
    .toast.error {
        background: #dc3545;
    }
    
    .toast.info {
        background: #17a2b8;
    }
`;

document.head.appendChild(style);