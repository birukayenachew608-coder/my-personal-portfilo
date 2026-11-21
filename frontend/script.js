/* ==========================================================
   Script for Biruk Ayenachew's portfolio
   ========================================================== */

// Tailwind theme config.
// This file is loaded in <head> right after the Tailwind CDN script,
// so the config is applied before the page renders.
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            colors: {
                primary: '#f59e0b', // Amber 500
                darkBg: '#0f172a',  // Slate 900
                cardBg: '#1e293b',  // Slate 800
            },
        },
    },
};

document.addEventListener('DOMContentLoaded', function () {
    // Keep the BA monogram visible until a real profile photo loads.
    var profileImage = document.getElementById('profile-avatar-image');
    var profileFallback = document.getElementById('profile-avatar-fallback');

    if (profileImage && profileFallback) {
        var showProfileFallback = function () {
            profileImage.classList.add('hidden');
            profileFallback.classList.remove('hidden');
        };

        var showProfileImage = function () {
            profileFallback.classList.add('hidden');
            profileImage.classList.remove('hidden');
        };

        profileImage.addEventListener('load', showProfileImage);
        profileImage.addEventListener('error', showProfileFallback);

        if (profileImage.complete) {
            profileImage.naturalWidth > 0 ? showProfileImage() : showProfileFallback();
        }
    }

    // ----- Toggle extra About details and collapse when leaving the About section -----
    var moreAboutContent = document.getElementById('more-about-content');
    var aboutSection = document.getElementById('about');
    var moreAboutToggle = document.getElementById('toggle-more-about');

    if (moreAboutContent && moreAboutToggle) {
        var setAboutExpanded = function (expanded) {
            moreAboutContent.hidden = !expanded;
            moreAboutToggle.setAttribute('aria-expanded', String(expanded));
            moreAboutToggle.textContent = expanded ? 'Less' : 'More About Me';
        };

        moreAboutToggle.addEventListener('click', function () {
            setAboutExpanded(moreAboutContent.hidden);
        });

        // Collapse when the user activates a link to another section.
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function () {
                if (link.getAttribute('href') !== '#about') {
                    setAboutExpanded(false);
                }
            });
        });

        // Collapse for clicks outside the expanded content and its toggle button.
        document.addEventListener('click', function (event) {
            if (!moreAboutContent.hidden &&
                !moreAboutContent.contains(event.target) &&
                !moreAboutToggle.contains(event.target)) {
                setAboutExpanded(false);
            }
        });

        if (aboutSection) {
            if ('IntersectionObserver' in window) {
                var aboutWasVisible = false;
                var aboutObserver = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            aboutWasVisible = true;
                        } else if (aboutWasVisible) {
                            setAboutExpanded(false);
                            aboutWasVisible = false;
                        }
                    });
                });
                aboutObserver.observe(aboutSection);
            } else {
                var aboutWasVisible = false;
                window.addEventListener('scroll', function () {
                    var bounds = aboutSection.getBoundingClientRect();
                    var isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;

                    if (isVisible) {
                        aboutWasVisible = true;
                    } else if (aboutWasVisible) {
                        setAboutExpanded(false);
                        aboutWasVisible = false;
                    }
                }, { passive: true });
            }
        }
    }

    // ----- Mobile menu toggle -----
    var menuButton = document.getElementById('menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });

        // Close the mobile menu after a link is tapped
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // ----- Contact form: submit to the Node.js/Express backend -----
    const CONTACT_API_URL = 'http://localhost:5000/api/contact';
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var chatForm = document.getElementById('contact-form');
    var senderName = document.getElementById('senderName');
    var senderEmail = document.getElementById('senderEmail');
    var senderMessage = document.getElementById('senderMessage');
    var chatStatus = document.getElementById('chatStatus');
    var submitChatBtn = document.getElementById('submitChatBtn');

    var STATUS_BASE = ['text-center', 'text-sm', 'font-medium', 'rounded-xl', 'px-4', 'py-3'];
    var STATUS_SUCCESS = ['bg-green-500/10', 'border', 'border-green-500/40', 'text-green-400'];
    var STATUS_ERROR = ['bg-red-500/10', 'border', 'border-red-500/40', 'text-red-400'];
    var chatStatusTimeout;

    function showChatStatus(text, success) {
        if (!chatStatus) return;
        clearTimeout(chatStatusTimeout);
        chatStatus.className = STATUS_BASE.concat(success ? STATUS_SUCCESS : STATUS_ERROR).join(' ');
        chatStatus.hidden = false;
        chatStatus.textContent = text;
        chatStatusTimeout = setTimeout(function () {
            chatStatus.hidden = true;
            chatStatus.textContent = '';
        }, 10000);
    }

    if (chatForm && senderName && senderEmail && senderMessage && chatStatus && submitChatBtn) {
        senderEmail.addEventListener('invalid', function () {
            showChatStatus('Please enter a valid email address.', false);
        });

        chatForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            var name = senderName.value.trim();
            var email = senderEmail.value.trim();
            var message = senderMessage.value.trim();
            if (!EMAIL_PATTERN.test(email)) {
                showChatStatus('Please enter a valid email address.', false);
                return;
            }

            clearTimeout(chatStatusTimeout);
            chatStatus.hidden = true;
            chatStatus.textContent = '';
            submitChatBtn.disabled = true;
            submitChatBtn.textContent = 'Sending...';

            try {
                var response = await fetch(CONTACT_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, email: email, message: message }),
                });
                var data = await response.json();

                if (response.ok && data.success) {
                    showChatStatus('Message successfully submitted!', true);
                    chatForm.reset();
                } else {
                    showChatStatus('Message not sent. Please try again.', false);
                }
            } catch (error) {
                showChatStatus('Message not sent. Please try again.', false);
            } finally {
                submitChatBtn.disabled = false;
                submitChatBtn.textContent = 'Submit Message';
            }
        });
    }
});