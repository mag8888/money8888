// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Play buttons now use direct links, no JavaScript needed
    // Smooth scrolling for anchor links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .step, .pricing-card, .story-card, .problem-item, .solution-item, .flow-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Staggered animation for flow items
    const flowItems = document.querySelectorAll('.flow-item');
    flowItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
        item.style.animation = 'slideInFromLeft 0.6s ease forwards';
    });

    // Add slideInFromLeft animation
    const style = document.createElement('style');
    style.textContent += `
        @keyframes slideInFromLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .flow-item {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);

    // Enhanced game preview interaction
    const gamePreview = document.querySelector('.game-preview');
    const floatingCards = document.querySelectorAll('.card');
    const boardCells = document.querySelectorAll('.board-cell');
    const profitIndicator = document.querySelector('.profit-indicator');
    
    if (gamePreview) {
        // Hover effects for game preview
        gamePreview.addEventListener('mouseenter', function() {
            floatingCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animationPlayState = 'paused';
                    card.style.transform = 'scale(1.15) rotate(8deg)';
                    card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
                }, index * 150);
            });
            
            boardCells.forEach((cell, index) => {
                setTimeout(() => {
                    cell.style.transform = 'scale(1.05)';
                    cell.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }, index * 100);
            });
            
            if (profitIndicator) {
                profitIndicator.style.animation = 'none';
                profitIndicator.style.transform = 'scale(1.2)';
            }
        });
        
        gamePreview.addEventListener('mouseleave', function() {
            floatingCards.forEach(card => {
                card.style.animationPlayState = 'running';
                card.style.transform = '';
                card.style.boxShadow = '';
            });
            
            boardCells.forEach(cell => {
                cell.style.transform = '';
                cell.style.boxShadow = '';
            });
            
            if (profitIndicator) {
                profitIndicator.style.animation = 'pulse 2s ease-in-out infinite';
                profitIndicator.style.transform = '';
            }
        });
        
        // Click effects for board cells
        boardCells.forEach(cell => {
            cell.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    // Button click animations
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple effect styles
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent += `
        .btn-primary, .btn-secondary, .btn-outline {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .story-card {
            cursor: pointer;
        }
        
        .story-card:hover .story-result {
            transform: scale(1.05);
        }
        
        .feature-card:hover .feature-example {
            background: #e2e8f0;
            border-left-color: #764ba2;
        }
        
        .step:hover .step-details {
            background: #e2e8f0;
        }
    `;
    document.head.appendChild(rippleStyle);

    // Story cards interaction
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Feature cards hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const example = this.querySelector('.feature-example');
            if (example) {
                example.style.transform = 'translateX(5px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const example = this.querySelector('.feature-example');
            if (example) {
                example.style.transform = '';
            }
        });
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (hero && heroVisual) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            heroVisual.style.transform = `translateY(${rate}px)`;
        });
    }

    // Counter animation for stats
    const stats = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (target >= 1000 ? '+' : '');
        }, 20);
    };

    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/[^\d]/g, ''));
                animateCounter(entry.target, number);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });

    // Mobile menu toggle (if needed)
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.innerHTML = '☰';
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #1a1a1a;
    `;

    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.appendChild(mobileMenuButton);
    }

    // Show/hide mobile menu button
    function checkMobileMenu() {
        if (window.innerWidth <= 768) {
            mobileMenuButton.style.display = 'block';
            document.querySelector('.nav-menu').style.display = 'none';
        } else {
            mobileMenuButton.style.display = 'none';
            document.querySelector('.nav-menu').style.display = 'flex';
        }
    }

    window.addEventListener('resize', checkMobileMenu);
    checkMobileMenu();

    // Mobile menu functionality
    mobileMenuButton.addEventListener('click', function() {
        const navMenu = document.querySelector('.nav-menu');
        const isVisible = navMenu.style.display === 'flex';
        
        if (isVisible) {
            navMenu.style.display = 'none';
        } else {
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'white';
            navMenu.style.padding = '20px';
            navMenu.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.nav-menu a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                document.querySelector('.nav-menu').style.display = 'none';
            }
        });
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // Form validation and submission (if forms are added later)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Add form submission logic here
            console.log('Form submitted');
        });
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modals or menus
            const mobileMenu = document.querySelector('.nav-menu');
            if (window.innerWidth <= 768 && mobileMenu.style.display === 'flex') {
                mobileMenu.style.display = 'none';
            }
        }
    });

    // Performance optimization: Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(function() {
            // Scroll-based animations and effects
        }, 10);
    });
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for potential use in other scripts
window.LandingUtils = {
    debounce,
    throttle
};
