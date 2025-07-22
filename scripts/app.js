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

    // Product grid dynamic rendering
    const productGrid = document.getElementById('productGrid');
    const apiUrl = 'https://fakestoreapi.com/products?limit=8';

    // Show loading message
    productGrid.innerHTML = `<div class="loading-message">Loading products...</div>`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            renderProductCards(products);
        })
        .catch(error => {
            productGrid.innerHTML = `<p class="error-message">Failed to load products: ${error.message}</p>`;
        });
});

function renderProductCards(products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
            <div class="product-name">${product.title}</div>
            <div class="product-price">$${product.price}</div>
            <div class="product-description">${product.description}</div>
            <a href="#" class="cta-btn">Add to Cart</a>
        </div>
    `).join('');
}
