// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Load Skills from Database
async function loadSkills() {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    try {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .order('category', { ascending: true });

        if (error) throw error;

        // Group skills by category
        const groupedSkills = data.reduce((acc, skill) => {
            if (!acc[skill.category]) {
                acc[skill.category] = [];
            }
            acc[skill.category].push(skill);
            return acc;
        }, {});

        skillsContainer.innerHTML = '';
        
        Object.entries(groupedSkills).forEach(([category, skills]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'skill-category';
            categoryDiv.setAttribute('data-aos', 'fade-up');
            
            let skillsHTML = `
                <h3>${category}</h3>
                <div class="skills-list">
            `;
            
            skills.forEach(skill => {
                skillsHTML += `
                    <div class="skill-item">
                        <div class="skill-info">
                            <i class="${skill.icon}"></i>
                            <span>${skill.name}</span>
                            <span class="skill-level">${skill.level}%</span>
                        </div>
                        <div class="skill-progress">
                            <div class="skill-progress-bar" style="width: ${skill.level}%"></div>
                        </div>
                    </div>
                `;
            });
            
            skillsHTML += '</div>';
            categoryDiv.innerHTML = skillsHTML;
            skillsContainer.appendChild(categoryDiv);
        });
    } catch (error) {
        console.error('Error loading skills:', error);
        skillsContainer.innerHTML = '<p>Error loading skills. Please try again later.</p>';
    }
}

// Load Portfolio Projects
async function loadPortfolio() {
    const portfolioContainer = document.getElementById('portfolioContainer');
    if (!portfolioContainer) return;

    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;

        portfolioContainer.innerHTML = '';
        
        data.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'portfolio-item';
            projectCard.setAttribute('data-aos', 'fade-up');
            
            projectCard.innerHTML = `
                <div class="portfolio-image">
                    <img src="${project.image_url || 'assets/images/project-placeholder.jpg'}" alt="${project.title}">
                    <div class="portfolio-overlay">
                        ${project.demo_url ? `<a href="${project.demo_url}" target="_blank"><i class="fas fa-link"></i></a>` : ''}
                        ${project.github_url ? `<a href="${project.github_url}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                    </div>
                </div>
                <div class="portfolio-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="portfolio-tech">
                        ${project.tech_stack ? project.tech_stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('') : ''}
                    </div>
                </div>
            `;
            
            portfolioContainer.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error loading portfolio:', error);
        portfolioContainer.innerHTML = '<p>Error loading portfolio. Please try again later.</p>';
    }
}

// Load Certifications
async function loadCertifications() {
    const certificationsContainer = document.getElementById('certificationsContainer');
    if (!certificationsContainer) return;

    try {
        const { data, error } = await supabase
            .from('certifications')
            .select('*')
            .order('issue_date', { descending: true });

        if (error) throw error;

        certificationsContainer.innerHTML = '';
        
        data.forEach(cert => {
            const certCard = document.createElement('div');
            certCard.className = 'cert-card';
            certCard.setAttribute('data-aos', 'fade-up');
            
            certCard.innerHTML = `
                <div class="cert-icon">
                    <img src="${cert.image_url || 'assets/images/cert-placeholder.png'}" alt="${cert.name}">
                </div>
                <h3>${cert.name}</h3>
                <p>${cert.issuer}</p>
                <p class="cert-date">${new Date(cert.issue_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</p>
                ${cert.credential_url ? `<a href="${cert.credential_url}" target="_blank" class="cert-link">View Certificate <i class="fas fa-external-link-alt"></i></a>` : ''}
            `;
            
            certificationsContainer.appendChild(certCard);
        });
    } catch (error) {
        console.error('Error loading certifications:', error);
        certificationsContainer.innerHTML = '<p>Error loading certifications. Please try again later.</p>';
    }
}

// Contact Form Handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            // Here you can integrate with EmailJS or your preferred email service
            // For now, we'll just show a success message
            
            setTimeout(() => {
                showToast('Message sent successfully!', 'success');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
            }, 2000);
        } catch (error) {
            showToast('Failed to send message. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
        }
    });
}

// Toast Notification Function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Typing Effect
const typed = document.querySelector('.typed');
if (typed) {
    const strings = ['Professional', 'Specialist', 'Expert'];
    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentString = strings[stringIndex];
        
        if (isDeleting) {
            typed.textContent = currentString.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typed.textContent = currentString.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentString.length) {
            isDeleting = true;
            setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            stringIndex = (stringIndex + 1) % strings.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 50 : 100);
        }
    }
    
    type();
}

// Load all data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadSkills();
    loadPortfolio();
    loadCertifications();
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'var(--white)';
        navbar.style.backdropFilter = 'none';
    }
});