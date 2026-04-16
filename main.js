
        document.addEventListener('DOMContentLoaded', () => {

            const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycby4H7pjWBrQLTI0VnSnIVLu-4g_XgA9F1nKE0-X0_SwDWW5SpXyTgykFYI0qIfOeP5PJg/exec';
            const mainContent = document.getElementById('main-content');
            const pricingPage = document.getElementById('pricing-page');
            const termsPage = document.getElementById('terms-page');
            const allPages = [mainContent, pricingPage, termsPage];
            const allNavLinks = document.querySelectorAll('.nav-link');
            const allContactLinks = document.querySelectorAll('.nav-link-contact');
            const allLogoLinks = document.querySelectorAll('.nav-logo');
            const mobileMenu = document.getElementById('mobile-menu');

            const header = document.getElementById('main-header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            const showPage = (pageId) => {
                allPages.forEach(page => page.classList.add('hidden'));
                const pageToShow = document.getElementById(pageId === 'home' ? 'main-content' : pageId + '-page');
                if (pageToShow) pageToShow.classList.remove('hidden');

                allNavLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.page === pageId);
                });

                window.scrollTo(0, 0);
                document.querySelectorAll('.scroll-animate').forEach(el => el.classList.remove('visible'));
                setTimeout(() => {
                    const scrollObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('visible');
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.1 });
                    document.querySelectorAll('.scroll-animate').forEach(el => scrollObserver.observe(el));
                }, 100);
            };

            allNavLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.dataset.page;
                    showPage(pageId);
                    if (!mobileMenu.classList.contains('hidden')) {
                         mobileMenu.classList.add('hidden');
                         document.getElementById('mobile-menu-toggle').querySelector('svg').innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />`;
                    }
                });
            });

            allLogoLinks.forEach(link => {
                 link.addEventListener('click', (e) => {
                    e.preventDefault();
                    showPage('home');
                });
            });

            allContactLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    showPage('home');
                    setTimeout(() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }), 100);
                    if (!mobileMenu.classList.contains('hidden')) {
                         mobileMenu.classList.add('hidden');
                         document.getElementById('mobile-menu-toggle').querySelector('svg').innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />`;
                    }
                });
            });

            document.querySelectorAll('.select-plan-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    showPage('home');
                    setTimeout(() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }), 100);
                });
            });

            showPage('home');

            const preloader = document.getElementById('preloader');
            window.addEventListener('load', () => {
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    document.body.classList.remove('invisible', 'opacity-0');
                    document.body.classList.add('visible', 'opacity-100', 'transition-opacity', 'duration-500');
                }, 300);
            });

            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            const menuIcon = mobileMenuToggle.querySelector('svg');

            mobileMenuToggle.addEventListener('click', () => {
                const isExpanded = mobileMenu.classList.toggle('hidden');
                menuIcon.innerHTML = !isExpanded
                    ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`
                    : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />`;
            });

            const form = document.getElementById('registration-form');
            const submitButton = document.getElementById('submit-button');
            const btnText = submitButton.querySelector('.btn-text');
            const spinnerIcon = submitButton.querySelector('.spinner-icon');
            const formFeedback = document.getElementById('form-feedback');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                submitButton.disabled = true;
                btnText.innerText = 'Submitting...';
                spinnerIcon.classList.remove('hidden');
                formFeedback.classList.add('hidden');

                try {
                    const response = await fetch(googleAppsScriptUrl, { method: 'POST', body: new FormData(form) });
                    if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
                    const result = await response.json();
                    if (result.status === 'success') {
                        showFeedback('success', 'Registration successful! Our team will contact you shortly.');
                        form.reset();
                    } else {
                        throw new Error(result.message || 'An unknown error occurred during submission.');
                    }
                } catch (error) {
                    showFeedback('error', `Submission failed. Please try again or contact us directly.`);
                    console.error('Form submission error:', error);
                } finally {
                    submitButton.disabled = false;
                    btnText.innerText = 'Register Now for Free';
                    spinnerIcon.classList.add('hidden');
                }
            });

            function showFeedback(type, message) {
                formFeedback.textContent = message;
                formFeedback.className = 'p-4 rounded-lg text-sm';
                formFeedback.classList.add(type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
                formFeedback.classList.remove('hidden');
            }

            const regPopup = document.getElementById('registration-popup');
            const regPopupContent = document.getElementById('popup-content-reg');
            const openRegBtn = document.getElementById('open-popup-btn');
            const closeRegBtn = document.getElementById('popup-close-btn-reg');

            const openRegPopup = (e) => {
                if(e) e.preventDefault();
                regPopup.classList.remove('hidden');
                regPopup.classList.add('flex');
                setTimeout(() => {
                    regPopupContent.classList.remove('scale-95', 'opacity-0');
                    regPopupContent.classList.add('scale-100', 'opacity-100');
                }, 50);
            };

            const closeRegPopup = () => {
                regPopupContent.classList.add('scale-95', 'opacity-0');
                regPopupContent.classList.remove('scale-100', 'opacity-100');
                setTimeout(() => {
                    regPopup.classList.add('hidden');
                    regPopup.classList.remove('flex');
                }, 300);
            };

            if(openRegBtn) openRegBtn.addEventListener('click', openRegPopup);
            if(closeRegBtn) closeRegBtn.addEventListener('click', closeRegPopup);
            if(regPopup) regPopup.addEventListener('click', (e) => {
                if (e.target === regPopup) closeRegPopup();
            });

            document.getElementById('currentYear').textContent = new Date().getFullYear();
        });
