document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Theme Toggle with Animation
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    const setTheme = (isDark) => {
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Animate theme transition
        gsap.to('body', {
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            duration: 0.5,
            ease: 'power2.inOut'
        });
    };

    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        setTheme(true);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
    });

    // Custom Cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1
        });
        gsap.to(cursorDot, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.3
        });
    });

    // Hero Section Animations
    gsap.from('.hero-content', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.hero-image', {
        x: 100,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Features Section Animation
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.2,
            ease: 'power2.out'
        });
    });

    // How It Works Section Animation
    gsap.utils.toArray('.step').forEach((step, i) => {
        gsap.from(step, {
            scrollTrigger: {
                trigger: step,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            },
            x: i % 2 === 0 ? -50 : 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.2,
            ease: 'power2.out'
        });
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('scrolled');
            return;
        }
        
        if (currentScroll > lastScroll) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
            navbar.classList.add('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Mobile Menu with Animation
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = navLinks.style.display === 'flex';
        
        if (isOpen) {
            gsap.to(navLinks, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                onComplete: () => {
                    navLinks.style.display = 'none';
                }
            });
        } else {
            navLinks.style.display = 'flex';
            gsap.from(navLinks, {
                opacity: 0,
                y: -20,
                duration: 0.3
            });
        }
        
        mobileMenuBtn.classList.toggle('active');
    });

    // Smooth Scrolling with GSAP
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: target,
                        offsetY: 70
                    },
                    ease: 'power2.inOut'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });

    // Form Handling with Animation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Animate button
            gsap.to(submitBtn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
            
            submitBtn.textContent = 'Sending...';
            submitBtn.classList.add('loading');

            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Success animation
                gsap.to(submitBtn, {
                    backgroundColor: '#4CAF50',
                    duration: 0.3
                });
                
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } catch (error) {
                // Error animation
                gsap.to(submitBtn, {
                    backgroundColor: '#f44336',
                    duration: 0.3
                });
                
                alert('Sorry, there was an error sending your message. Please try again.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('loading');
                
                // Reset button color
                gsap.to(submitBtn, {
                    backgroundColor: 'var(--primary-color)',
                    duration: 0.3
                });
            }
        });
    }

    // Particle Background Effect
    const createParticles = () => {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        document.querySelector('.hero').appendChild(particlesContainer);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particlesContainer.appendChild(particle);

            gsap.set(particle, {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
            });

            gsap.to(particle, {
                x: '+=100',
                y: '+=100',
                duration: Math.random() * 10 + 10,
                repeat: -1,
                yoyo: true,
                ease: 'none'
            });
        }
    };

    createParticles();
}); 