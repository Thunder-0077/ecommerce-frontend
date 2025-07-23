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

    updateCartCount();
});

function renderProductCards(products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
            </a>
            <div class="product-name">
                <a href="product.html?id=${product.id}">${product.title}</a>
            </div>
            <div class="product-price">$${product.price}</div>
            <div class="product-description">${product.description}</div>
            <a href="#" class="cta-btn">Add to Cart</a>
        </div>
    `).join('');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const uniqueIds = new Set(cart.map(item => item.id));
    document.getElementById('cartCount').textContent = uniqueIds.size;
}

// Call this on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    // ...existing code...
});

// Add to Cart handler for product grid
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cta-btn')) {
        e.preventDefault();
        const card = e.target.closest('.product-card');
        if (!card) return;
        const id = card.querySelector('a').href.split('id=')[1];
        const name = card.querySelector('.product-name').textContent;
        const price = card.querySelector('.product-price').textContent.replace('$','');
        const image = card.querySelector('.product-image').src;
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.id === id);
        if (!existing) {
            cart.push({ id, name, price, image });
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        updateCartCount();
        e.target.textContent = "Added!";
        setTimeout(() => { e.target.textContent = "Add to Cart"; }, 1200);
    }
});
