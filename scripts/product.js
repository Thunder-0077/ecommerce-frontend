document.addEventListener('DOMContentLoaded', function() {
    const productDetail = document.getElementById('productDetail');

    // Extract product ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        productDetail.innerHTML = '<p class="error-message">No product selected.</p>';
        return;
    }

    productDetail.innerHTML = `<div class="loading-message">Loading product...</div>`;

    // Fetch product data from API
    fetch(`https://fakestoreapi.com/products/${productId}`)
        .then(response => {
            if (!response.ok) throw new Error('Product not found');
            return response.json();
        })
        .then(product => {
            // Simulated available variations
            const availableSizes = ['S', 'M', 'L'];
            const availableColors = [
                { name: 'Red', value: 'Red', image: product.image },
                { name: 'Blue', value: 'Blue', image: product.image },
                { name: 'Black', value: 'Black', image: product.image }
            ];
            const unavailable = { Blue: ['L'] };
            let selectedColor = 'Red';
            let selectedSize = 'S';
            let quantity = 1;
            const maxQuantity = 10;
            function getImageForColor(color) {
                return product.image;
            }
            function renderDetail() {
                const totalPrice = (product.price * quantity).toFixed(2);
                // Only show size/color for clothing categories (not for bags, backpacks, jewelry, etc.)
                const category = product.category ? product.category.toLowerCase() : '';
                const isClothing = category.includes('clothing');
                const isBagOrJewelry = category.includes('bag') || category.includes('backpack') || category.includes('jewel');
                productDetail.innerHTML = `
                <div class="product-detail-card">
                    <div class="product-images">
                        <img src="${getImageForColor(selectedColor)}" alt="${product.title}" class="product-image" loading="lazy">
                    </div>
                    <h1 class="product-name">${product.title}</h1>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-variations">
                        ${isClothing && !isBagOrJewelry ? `
                        <div class="variation-group">
                            <span>Color:</span>
                            ${availableColors.map(c => `
                                <button class="color-btn${selectedColor === c.value ? ' selected' : ''}" data-color="${c.value}">${c.name}</button>
                            `).join('')}
                        </div>
                        <div class="variation-group">
                            <label for="size">Size:</label>
                            <select id="size">
                                ${availableSizes.map(size => {
                                    const disabled = unavailable[selectedColor] && unavailable[selectedColor].includes(size) ? 'disabled' : '';
                                    const selected = selectedSize === size ? 'selected' : '';
                                    return `<option value="${size}" ${selected} ${disabled}>${size}${disabled ? ' (Unavailable)' : ''}</option>`;
                                }).join('')}
                            </select>
                        </div>
                        ` : ''}
                        <div class="variation-group">
                            <label>Quantity:</label>
                            <button class="qty-btn" id="qty-decrease" ${quantity <= 1 ? 'disabled' : ''}>−</button>
                            <span class="qty-value" id="qty-value">${quantity}</span>
                            <button class="qty-btn" id="qty-increase" ${quantity >= maxQuantity ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                    <div class="total-price">Total: $<span id="totalPrice">${totalPrice}</span></div>
                    <a href="#" class="cta-btn">Add to Cart</a>
                </div>
                `;
            }
            renderDetail();
            // --- Overlay Zoom Preview ---
            const img = document.querySelector('.product-image');
            function openZoomOverlay() {
                const oldOverlay = document.querySelector('.product-zoom-overlay');
                if (oldOverlay) oldOverlay.remove();
                const overlay = document.createElement('div');
                overlay.className = 'product-zoom-overlay';
                overlay.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
                document.body.appendChild(overlay);
                function closeOverlay() {
                    overlay.remove();
                    document.removeEventListener('keydown', escListener);
                }
                overlay.addEventListener('click', closeOverlay);
                function escListener(e) {
                    if (e.key === 'Escape') closeOverlay();
                }
                document.addEventListener('keydown', escListener);
            }
            img.addEventListener('click', openZoomOverlay);
            img.addEventListener('touchend', function(e) {
                e.preventDefault();
                openZoomOverlay();
            });
            // Variation and quantity selection handlers
            productDetail.addEventListener('click', function(e) {
                if (e.target.classList.contains('color-btn')) {
                    selectedColor = e.target.getAttribute('data-color');
                    if (unavailable[selectedColor] && unavailable[selectedColor].includes(selectedSize)) {
                        selectedSize = availableSizes.find(size => !(unavailable[selectedColor] && unavailable[selectedColor].includes(size)));
                    }
                    renderDetail();
                }
                if (e.target.id === 'qty-increase') {
                    if (quantity < maxQuantity) {
                        quantity++;
                        renderDetail();
                    }
                }
                if (e.target.id === 'qty-decrease') {
                    if (quantity > 1) {
                        quantity--;
                        renderDetail();
                    }
                }
            });
            productDetail.addEventListener('change', function(e) {
                if (e.target.id === 'size') {
                    selectedSize = e.target.value;
                    renderDetail();
                }
            });
        })
        .catch(error => {
            productDetail.innerHTML = `<p class="error-message">Failed to load product: ${error.message}</p>`;
        });

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const uniqueIds = new Set(cart.map(item => item.id));
        document.getElementById('cartCount').textContent = uniqueIds.size;
    }

    updateCartCount();

    // Add to Cart handler for product detail
    productDetail.addEventListener('click', function(e) {
        if (e.target.classList.contains('cta-btn')) {
            e.preventDefault();
            const card = e.target.closest('.product-detail-card');
            const id = new URLSearchParams(window.location.search).get('id');
            const name = card.querySelector('.product-name').textContent;
            const price = card.querySelector('.product-price').textContent.replace('$','');
            const image = card.querySelector('.product-image').src;
            // Get selected variations and quantity
            let color = null, size = null, qty = 1;
            const colorBtn = card.querySelector('.color-btn.selected');
            if (colorBtn) color = colorBtn.getAttribute('data-color');
            const sizeSelect = card.querySelector('select#size');
            if (sizeSelect) size = sizeSelect.value;
            const qtyValue = card.querySelector('.qty-value');
            if (qtyValue) qty = parseInt(qtyValue.textContent, 10);
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            // Store all variations and quantity in cart item
            const cartItem = { id, name, price, image, color, size, quantity: qty };
            // Only add if not already in cart with same variations
            const existing = cart.find(item => item.id === id && item.color === color && item.size === size);
            if (!existing) {
                cart.push(cartItem);
                localStorage.setItem('cart', JSON.stringify(cart));
            }
            updateCartCount();
            // Show success message
            let msg = card.querySelector('.cart-success-msg');
            if (!msg) {
                msg = document.createElement('div');
                msg.className = 'cart-success-msg';
                card.appendChild(msg);
            }
            msg.textContent = 'Added to cart!';
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 1500);
        }
    });
});