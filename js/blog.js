// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Blog variables
let currentPage = 1;
const postsPerPage = 6;
let currentCategory = 'all';
let searchQuery = '';

// Load Blog Posts
async function loadBlogPosts(page = 1, category = 'all', search = '') {
    const blogContainer = document.getElementById('blogPostsContainer');
    
    try {
        blogContainer.innerHTML = '<div class="loading"></div>';
        
        let query = supabase
            .from('blog_posts')
            .select('*', { count: 'exact' })
            .eq('published', true)
            .order('created_at', { ascending: false })
            .range((page - 1) * postsPerPage, page * postsPerPage - 1);
        
        if (category !== 'all') {
            query = query.eq('category', category);
        }
        
        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        blogContainer.innerHTML = '';
        
        if (data.length === 0) {
            blogContainer.innerHTML = '<p class="no-posts">No posts found.</p>';
            return;
        }
        
        data.forEach(post => {
            const postCard = createBlogCard(post);
            blogContainer.appendChild(postCard);
        });
        
        // Update pagination
        updatePagination(count, page);
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

// Create Blog Card
function createBlogCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    
    const date = new Date(post.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="blog-card-image">
            <img src="${post.image_url || 'assets/images/blog-placeholder.jpg'}" alt="${post.title}">
        </div>
        <div class="blog-card-content">
            <div class="blog-meta">
                <span><i class="far fa-calendar"></i> ${date}</span>
                <span><i class="far fa-folder"></i> ${post.category}</span>
            </div>
            <h3><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
            <p>${post.excerpt || post.content.substring(0, 150)}...</p>
            <a href="post.html?slug=${post.slug}" class="read-more">
                Read More <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    return card;
}

// Update Pagination
function updatePagination(totalPosts, currentPage) {
    const pagination = document.getElementById('blogPagination');
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Change Page
function changePage(page) {
    currentPage = page;
    loadBlogPosts(page, currentCategory, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load Recent Posts
async function loadRecentPosts() {
    const recentPostsContainer = document.getElementById('recentPosts');
    
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('title, slug, image_url, created_at')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        
        recentPostsContainer.innerHTML = '';
        
        data.forEach(post => {
            const date = new Date(post.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const postElement = document.createElement('div');
            postElement.className = 'recent-post';
            postElement.innerHTML = `
                <img src="${post.image_url || 'assets/images/blog-placeholder.jpg'}" alt="${post.title}">
                <div class="recent-post-content">
                    <h4><a href="post.html?slug=${post.slug}">${post.title}</a></h4>
                    <span>${date}</span>
                </div>
            `;
            
            recentPostsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading recent posts:', error);
    }
}

// Filter Posts by Category
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        currentCategory = this.dataset.category;
        currentPage = 1;
        loadBlogPosts(1, currentCategory, searchQuery);
    });
});

// Search Functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
}

if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    searchQuery = searchInput.value.trim();
    currentPage = 1;
    loadBlogPosts(1, currentCategory, searchQuery);
}

// Initialize Blog Page
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
    loadRecentPosts();
});

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}