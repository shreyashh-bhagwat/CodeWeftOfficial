(function () {
    'use strict';

    // Utility Functions
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const validatePhoneNumber = (phone) => /^\+?\d{10,15}$/.test(phone.trim());
    const sanitizeInput = (input) => input.replace(/[<>&"']/g, (char) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
    })[char]);
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Initialize EmailJS
    emailjs.init('O7WpaFo4MejiGNzXO');

    // Hamburger Menu
    const initHamburgerMenu = () => {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (!hamburger || !navMenu) return;

        hamburger.addEventListener('click', () => {
            const isExpanded = navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
            hamburger.textContent = isExpanded ? '✕' : '☰';
            if (isExpanded) navMenu.querySelector('a').focus();
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.textContent = '☰';
                hamburger.focus();
            });
        });

        // Close menu on Esc key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.textContent = '☰';
                hamburger.focus();
            }
        });
    };

    // Fade-in Animation
    const initFadeInAnimation = () => {
        const fadeInElements = document.querySelectorAll('.fade-in');
        if (!fadeInElements.length) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        fadeInElements.forEach(element => observer.observe(element));
    };

    // Product Filter
    const initProductFilter = () => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const products = document.querySelectorAll('.product');
        if (!filterButtons.length || !products.length) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');

                const filter = button.getAttribute('data-filter');
                products.forEach(product => {
                    product.classList.toggle('hidden', !(filter === 'all' || product.classList.contains(filter)));
                });
            });

            // Keyboard navigation
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    };

    // Back to Top Button
    const initBackToTop = () => {
        const backToTop = document.querySelector('.back-to-top');
        if (!backToTop) return;

        const handleScroll = debounce(() => {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        }, 100);

        window.addEventListener('scroll', handleScroll);
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    // Smooth Scroll for Anchor Links
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    targetElement.focus({ preventScroll: true });
                }
            });
        });
    };

    // Form Submission
    const initForms = () => {
        const contactForm = document.getElementById('contact-form');
        const newsletterForm = document.getElementById('newsletter-form');
        if (!contactForm || !newsletterForm) return;

        const showFormMessage = (form, message, type) => {
            const formMessage = form.querySelector('.form-message') || document.createElement('div');
            if (!formMessage.parentElement) {
                formMessage.className = 'form-message';
                formMessage.style.marginTop = '10px';
                form.appendChild(formMessage);
            }
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            formMessage.style.display = 'block';
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        };

        const handleFormSubmit = async (form, templateId, submitBtn, isNewsletter = false) => {
            submitBtn.disabled = true;
            submitBtn.textContent = isNewsletter ? 'Subscribing...' : 'Sending...';

            try {
                let templateParams;
                if (isNewsletter) {
                    const email = sanitizeInput(form.querySelector('input[type="email"]').value);
                    if (!email) throw new Error('Email is required.');
                    if (!validateEmail(email)) throw new Error('Invalid email address.');
                    templateParams = { to_email: 'shreyashbhagwat505@gmail.com', from_email: email, reply_to: email };
                } else {
                    const name = sanitizeInput(document.getElementById('name').value);
                    const number = sanitizeInput(document.getElementById('number').value);
                    const message = sanitizeInput(document.getElementById('msg').value);
                    const product = document.getElementById('product').value;
                    const email = sanitizeInput(document.getElementById('email').value);

                    if (!name || !number || !message || !product || !email) {
                        throw new Error('All fields are required.');
                    }
                    if (!validateEmail(email)) throw new Error('Invalid email address.');
                    if (!validatePhoneNumber(number)) throw new Error('Invalid phone number (10-15 digits, optional country code).');

                    templateParams = {
                        to_email: 'shreyashbhagwat505@gmail.com',
                        from_name: name,
                        from_email: email,
                        phone_number: number,
                        message,
                        product,
                        reply_to: email
                    };
                }

                await emailjs.send('service_tg7bulc', templateId, templateParams);
                showFormMessage(form, isNewsletter ? 'Subscribed successfully! Stay tuned for updates.' : 'Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                form.querySelector(isNewsletter ? 'input[type="email"]' : '#name').focus();
            } catch (error) {
                showFormMessage(form, error.message || 'Failed to send. Please try again later.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = isNewsletter ? 'Subscribe' : 'Send';
            }
        };

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit(contactForm, 'template_40s4dsu', document.getElementById('submit-btn'));
        });

        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Make sure the button selector matches your HTML (e.g., use '#newsletter-submit' if you have an id)
            const submitBtn = newsletterForm.querySelector('button[type="submit"]') || newsletterForm.querySelector('button');
            handleFormSubmit(newsletterForm, 'template_40s4dsu', submitBtn, true);
        });

        // Persist form data temporarily
        ['name', 'number', 'msg', 'email', 'product'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    localStorage.setItem(`contact-${id}`, input.value);
                });
                const savedValue = localStorage.getItem(`contact-${id}`);
                if (savedValue) input.value = savedValue;
            }
        });

        contactForm.addEventListener('submit', () => {
            ['name', 'number', 'msg', 'email', 'product'].forEach(id => localStorage.removeItem(`contact-${id}`));
        });
    };

    // Initialize All
    document.addEventListener('DOMContentLoaded', () => {
        initHamburgerMenu();
        initFadeInAnimation();
        initProductFilter();
        initBackToTop();
        initSmoothScroll();
        initForms();
    });
})();