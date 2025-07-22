document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeBtn = document.querySelector('.close-btn');

    hamburgerMenu.addEventListener('click', function() {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', function() {
        mobileNav.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    // Optional: Close mobile nav when clicking a link
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
});
