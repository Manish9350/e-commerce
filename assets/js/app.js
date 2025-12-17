// E-commerce App JavaScript
const CART_KEY = 'ecom_cart';
const ORDERS_KEY = 'ecom_orders';
const USERS_KEY = 'ecom_users';
const USER_KEY = 'ecom_current_user';
let products = [];
let currentCart = [];
let currentStep = 1;
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadProducts();
        loadCart();
        loadCurrentUser();
        updateCartBadge();
        initializeEventListeners();
        setupAuthEventHandlers();
        updateAuthUI();
        
        // Page-specific initialization
        const currentPage = getCurrentPage();
        switch(currentPage) {
            case 'index':
                renderFeaturedProducts();
                break;
            case 'shop':
                renderShopPage();
                break;
            case 'product':
                renderProductPage();
                break;
            case 'cart':
                renderCartPage();
                break;
            case 'checkout':
                initializeCheckout();
                break;
            case 'payment':
                initializePayment();
                break;
            case 'order-confirm':
                renderOrderConfirmation();
                break;
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('assets/data/products.json');
        products = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
    }
}

// Cart Management
function loadCart() {
    const cartData = localStorage.getItem(CART_KEY);
    currentCart = cartData ? JSON.parse(cartData) : [];
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(currentCart));
}

function addToCart(productId, qty = 1) {
    const existingItem = currentCart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        currentCart.push({ id: productId, qty: qty });
    }
    
    saveCart();
    updateCartBadge();
    
    // Show success message
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    currentCart = currentCart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    
    if (getCurrentPage() === 'cart') {
        renderCartPage();
    }
}

function updateCartQuantity(productId, newQty) {
    const item = currentCart.find(item => item.id === productId);
    if (item) {
        if (newQty <= 0) {
            removeFromCart(productId);
        } else {
            item.qty = newQty;
            saveCart();
            updateCartBadge();
        }
    }
}

function clearCart() {
    currentCart = [];
    saveCart();
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = currentCart.reduce((sum, item) => sum + item.qty, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Product rendering
function renderProductCard(product) {
    return `
        <div class="col-6 col-md-4 col-lg-3 mb-4">
            <div class="card h-100 product-card">
                <img src="${product.images[0]}" class="card-img-top" alt="${product.title}" style="height:180px; object-fit:contain;" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title mb-1">${product.title}</h6>
                    <p class="text-muted small mb-2">${product.brand} • ${product.category}</p>
                    <div class="mb-2">
                        <div class="rating-stars">
                            ${renderStars(product.rating)}
                        </div>
                        <span class="rating-number">(${product.rating})</span>
                    </div>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center">
                            <div><strong>$${product.price}</strong></div>
                            <button class="btn btn-sm btn-warning add-to-cart" data-id="${product.id}">Add</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Page-specific functions
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page || 'index';
}

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    const featuredProducts = products.slice(0, 8);
    container.innerHTML = featuredProducts.map(product => renderProductCard(product)).join('');
}

function renderShopPage() {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    // Apply filters
    const filteredProducts = getFilteredProducts();
    container.innerHTML = filteredProducts.map(product => renderProductCard(product)).join('');
    
    // Update product count
    const countElement = document.getElementById('product-count');
    if (countElement) {
        countElement.textContent = `${filteredProducts.length} products found`;
    }
}

function getFilteredProducts() {
    let filtered = [...products];
    
    // Category filter
    const categoryFilter = new URLSearchParams(window.location.search).get('category');
    if (categoryFilter) {
        filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Search filter
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Price filter
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        const maxPrice = parseFloat(priceRange.value);
        filtered = filtered.filter(product => product.price <= maxPrice);
    }
    
    // Brand filter
    const brandFilters = document.querySelectorAll('input[name="brand"]:checked');
    if (brandFilters.length > 0) {
        const selectedBrands = Array.from(brandFilters).map(cb => cb.value);
        filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }
    
    // Sort
    const sortBy = document.getElementById('sortBy')?.value;
    switch (sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            // Assuming products are already sorted by newest
            break;
    }
    
    return filtered;
}

function renderProductPage() {
    const productId = new URLSearchParams(window.location.search).get('id');
    if (!productId) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Update page title
    document.title = `${product.title} - ShopEasy`;
    
    // Render product details
    const container = document.getElementById('product-details');
    if (container) {
        container.innerHTML = renderProductDetails(product);
    }
    
    // Initialize image gallery
    initializeImageGallery(product.images);
}

function renderProductDetails(product) {
    return `
        <div class="row">
            <div class="col-lg-6">
                <div class="product-gallery">
                    <img src="${product.images[0]}" class="main-image" id="mainImage" alt="${product.title}">
                    <div class="d-flex gap-2 mt-3">
                        ${product.images.map((img, index) => `
                            <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                                 onclick="changeMainImage('${img}', this)" alt="${product.title}">
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <h1 class="h3 mb-3">${product.title}</h1>
                <div class="mb-3">
                    <div class="rating-stars d-inline">
                        ${renderStars(product.rating)}
                    </div>
                    <span class="rating-number ms-2">${product.rating} (${Math.floor(Math.random() * 100) + 1} reviews)</span>
                </div>
                <div class="mb-3">
                    <span class="h4 text-primary">$${product.price}</span>
                </div>
                <div class="mb-3">
                    <span class="badge bg-success">In Stock (${product.stock} available)</span>
                </div>
                <div class="mb-4">
                    <p>${product.description}</p>
                </div>
                <div class="row mb-4">
                    <div class="col-4">
                        <label for="quantity" class="form-label">Quantity:</label>
                        <select class="form-select" id="quantity">
                            ${Array.from({length: Math.min(product.stock, 10)}, (_, i) => 
                                `<option value="${i + 1}">${i + 1}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="d-grid gap-2 d-md-block">
                    <button class="btn btn-primary btn-lg me-2" onclick="addToCartFromProduct('${product.id}')">
                        Add to Cart
                    </button>
                    <button class="btn btn-outline-primary btn-lg" onclick="buyNow('${product.id}')">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
        
        <div class="row mt-5">
            <div class="col-12">
                <ul class="nav nav-pills mb-3" id="product-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" data-bs-toggle="pill" href="#description">Description</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="pill" href="#specifications">Specifications</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="pill" href="#reviews">Reviews</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" data-bs-toggle="pill" href="#shipping">Shipping & Returns</a>
                    </li>
                </ul>
                
                <div class="tab-content">
                    <div class="tab-pane fade show active" id="description">
                        <p>${product.description}</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                    </div>
                    <div class="tab-pane fade" id="specifications">
                        <table class="table">
                            ${Object.entries(product.specs).map(([key, value]) => `
                                <tr>
                                    <td><strong>${key.charAt(0).toUpperCase() + key.slice(1)}</strong></td>
                                    <td>${value}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                    <div class="tab-pane fade" id="reviews">
                        <div class="row">
                            <div class="col-md-4">
                                <h5>Customer Reviews</h5>
                                <div class="text-center">
                                    <div class="h2 text-primary">${product.rating}</div>
                                    <div class="rating-stars">${renderStars(product.rating)}</div>
                                    <p class="text-muted">Based on ${Math.floor(Math.random() * 100) + 1} reviews</p>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="review-item border-bottom pb-3 mb-3">
                                    <div class="d-flex justify-content-between">
                                        <strong>John D.</strong>
                                        <div class="rating-stars">${renderStars(4)}</div>
                                    </div>
                                    <p class="mb-1">Great product! Exactly as described.</p>
                                    <small class="text-muted">2 days ago</small>
                                </div>
                                <div class="review-item border-bottom pb-3 mb-3">
                                    <div class="d-flex justify-content-between">
                                        <strong>Sarah M.</strong>
                                        <div class="rating-stars">${renderStars(5)}</div>
                                    </div>
                                    <p class="mb-1">Excellent quality and fast shipping!</p>
                                    <small class="text-muted">1 week ago</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="shipping">
                        <h5>Shipping Information</h5>
                        <ul>
                            <li>Free shipping on orders over $50</li>
                            <li>Standard shipping: $5 (3-5 business days)</li>
                            <li>Express shipping: $15 (1-2 business days)</li>
                        </ul>
                        <h5 class="mt-4">Returns</h5>
                        <ul>
                            <li>30-day return policy</li>
                            <li>Items must be in original condition</li>
                            <li>Free return shipping</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCartPage() {
    const container = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!container) return;
    
    if (currentCart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h4>Your cart is empty</h4>
                <p class="text-muted">Add some products to get started!</p>
                <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        if (summaryContainer) {
            summaryContainer.innerHTML = '';
        }
        return;
    }
    
    // Get cart items with product details
    const cartItems = currentCart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        return { ...cartItem, product };
    }).filter(item => item.product);
    
    container.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="row align-items-center">
                <div class="col-md-2">
                    <img src="${item.product.images[0]}" class="img-fluid rounded" alt="${item.product.title}">
                </div>
                <div class="col-md-4">
                    <h6 class="mb-1">${item.product.title}</h6>
                    <p class="text-muted small mb-0">${item.product.brand}</p>
                </div>
                <div class="col-md-2">
                    <span class="fw-bold">$${item.product.price}</span>
                </div>
                <div class="col-md-2">
                    <select class="form-select form-select-sm" onchange="updateCartQuantity('${item.id}', this.value)">
                        ${Array.from({length: Math.min(item.product.stock, 10)}, (_, i) => 
                            `<option value="${i + 1}" ${i + 1 === item.qty ? 'selected' : ''}>${i + 1}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <span class="fw-bold">$${(item.product.price * item.qty).toFixed(2)}</span>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Update summary
    if (summaryContainer) {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
        const shipping = subtotal >= 50 ? 0 : 5;
        const tax = subtotal * 0.05;
        const total = subtotal + shipping + tax;
        
        summaryContainer.innerHTML = `
            <h5 class="mb-3">Order Summary</h5>
            <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>$${total.toFixed(2)}</strong>
            </div>
            
            <div class="mb-3">
                <label for="couponCode" class="form-label">Coupon Code:</label>
                <div class="input-group">
                    <input type="text" class="form-control" id="couponCode" placeholder="Enter code">
                    <button class="btn btn-outline-primary" onclick="applyCoupon()">Apply</button>
                </div>
                <div id="couponMessage" class="small mt-1"></div>
            </div>
            
            <button class="btn btn-primary w-100 btn-lg" onclick="proceedToCheckout()">
                Proceed to Checkout
            </button>
        `;
    }
}

// Checkout functions
function initializeCheckout() {
    showCheckoutStep(1);
}

function showCheckoutStep(step) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    
    // Show current step
    const currentStepEl = document.getElementById(`step-${step}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((el, index) => {
        el.classList.remove('active', 'completed');
        if (index + 1 < step) {
            el.classList.add('completed');
        } else if (index + 1 === step) {
            el.classList.add('active');
        }
    });
    
    currentStep = step;
}

function nextCheckoutStep() {
    if (validateCurrentStep()) {
        if (currentStep < 3) {
            showCheckoutStep(currentStep + 1);
        }
    }
}

function previousCheckoutStep() {
    if (currentStep > 1) {
        showCheckoutStep(currentStep - 1);
    }
}

function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Payment functions
function initializePayment() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            
            const methodType = this.dataset.method;
            showPaymentForm(methodType);
        });
    });
}

function showPaymentForm(methodType) {
    const cardForm = document.getElementById('cardForm');
    if (cardForm) {
        cardForm.style.display = methodType === 'card' ? 'block' : 'none';
    }
}

function processPayment() {
    const selectedMethod = document.querySelector('.payment-method.selected');
    if (!selectedMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }
    
    const methodType = selectedMethod.dataset.method;
    
    if (methodType === 'card') {
        if (!validateCardForm()) {
            return;
        }
    }
    
    // Simulate payment processing
    showNotification('Processing payment...', 'info');
    
    setTimeout(() => {
        // Create order
        const order = createOrder(methodType);
        saveOrder(order);
        
        // Clear cart
        clearCart();
        
        // Redirect to confirmation
        window.location.href = `order-confirm.html?orderId=${order.orderId}`;
    }, 2000);
}

function validateCardForm() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    
    let isValid = true;
    
    // Basic validation (mock)
    if (!cardNumber.value || cardNumber.value.length < 16) {
        cardNumber.classList.add('is-invalid');
        isValid = false;
    } else {
        cardNumber.classList.remove('is-invalid');
    }
    
    if (!expiryDate.value) {
        expiryDate.classList.add('is-invalid');
        isValid = false;
    } else {
        expiryDate.classList.remove('is-invalid');
    }
    
    if (!cvv.value || cvv.value.length < 3) {
        cvv.classList.add('is-invalid');
        isValid = false;
    } else {
        cvv.classList.remove('is-invalid');
    }
    
    return isValid;
}

function createOrder(paymentMethod) {
    const orderId = 'ORD' + Date.now();
    const cartItems = currentCart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        return { ...cartItem, product };
    }).filter(item => item.product);
    
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    const shipping = subtotal >= 50 ? 0 : 5;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;
    
    return {
        orderId,
        items: cartItems,
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress: getShippingAddress(),
        paymentMethod,
        date: new Date().toISOString(),
        status: 'confirmed'
    };
}

function getShippingAddress() {
    return {
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        zipCode: document.getElementById('zipCode')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || ''
    };
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function renderOrderConfirmation() {
    const orderId = new URLSearchParams(window.location.search).get('orderId');
    if (!orderId) {
        window.location.href = 'index.html';
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
        window.location.href = 'index.html';
        return;
    }
    
    const container = document.getElementById('order-details');
    if (container) {
        container.innerHTML = renderOrderDetails(order);
    }
}

function renderOrderDetails(order) {
    return `
        <div class="order-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 class="text-success">Order Confirmed!</h2>
            <p class="lead">Thank you for your purchase. Your order has been received.</p>
            <div class="alert alert-info">
                <strong>Order ID:</strong> ${order.orderId}<br>
                <strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}<br>
                <strong>Estimated Delivery:</strong> ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-lg-8">
                <h4>Order Items</h4>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <img src="${item.product.images[0]}" class="me-3" style="width: 50px; height: 50px; object-fit: contain;" alt="${item.product.title}">
                                            <div>
                                                <h6 class="mb-0">${item.product.title}</h6>
                                                <small class="text-muted">${item.product.brand}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${item.qty}</td>
                                    <td>$${item.product.price}</td>
                                    <td>$${(item.product.price * item.qty).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-lg-4">
                <h4>Order Summary</h4>
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>$${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Shipping:</span>
                            <span>${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Tax:</span>
                            <span>$${order.tax.toFixed(2)}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between">
                            <strong>Total:</strong>
                            <strong>$${order.total.toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
                
                <div class="mt-3">
                    <h5>Shipping Address</h5>
                    <address>
                        ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                        ${order.shippingAddress.address}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                        Phone: ${order.shippingAddress.phone}
                    </address>
                </div>
                
                <div class="d-grid gap-2 mt-4">
                    <button class="btn btn-outline-primary" onclick="downloadInvoice('${order.orderId}')">
                        <i class="fas fa-download me-2"></i>Download Invoice
                    </button>
                    <button class="btn btn-primary" onclick="window.location.href='shop.html'">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Utility functions
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.dataset.id;
            addToCart(productId);
        }
    });
    
    // Filter changes
    document.addEventListener('change', function(e) {
        if (e.target.matches('#priceRange, #sortBy, input[name="brand"]')) {
            if (getCurrentPage() === 'shop') {
                renderShopPage();
            }
        }
    });
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

function addToCartFromProduct(productId) {
    const quantity = parseInt(document.getElementById('quantity').value);
    addToCart(productId, quantity);
}

function buyNow(productId) {
    const quantity = parseInt(document.getElementById('quantity').value);
    addToCart(productId, quantity);
    window.location.href = 'checkout.html';
}

function changeMainImage(imageSrc, thumbnail) {
    document.getElementById('mainImage').src = imageSrc;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.trim();
    const messageEl = document.getElementById('couponMessage');
    
    if (couponCode === 'SAVE10') {
        messageEl.innerHTML = '<span class="text-success">10% discount applied!</span>';
        // Apply discount logic here
    } else if (couponCode === '') {
        messageEl.innerHTML = '';
    } else {
        messageEl.innerHTML = '<span class="text-danger">Invalid coupon code</span>';
    }
}

function proceedToCheckout() {
    window.location.href = 'checkout.html';
}

function downloadInvoice(orderId) {
    // Mock invoice download
    showNotification('Invoice download started...', 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Authentication helpers
function setupAuthEventHandlers() {
    const signInForm = document.getElementById('signInForm');
    if (signInForm && !signInForm.dataset.bound) {
        signInForm.addEventListener('submit', handleSignInSubmit);
        signInForm.dataset.bound = 'true';
    }
    
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn && !signOutBtn.dataset.bound) {
        signOutBtn.addEventListener('click', handleSignOut);
        signOutBtn.dataset.bound = 'true';
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm && !signupForm.dataset.bound) {
        signupForm.addEventListener('submit', handleSignupSubmit);
        signupForm.dataset.bound = 'true';
    }
}

function loadCurrentUser() {
    try {
        const stored = localStorage.getItem(USER_KEY);
        currentUser = stored ? JSON.parse(stored) : null;
    } catch (error) {
        currentUser = null;
        console.error('Error loading user session:', error);
    }
}

function saveCurrentUser(user) {
    currentUser = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function loadStoredUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

function saveStoredUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function updateAuthUI() {
    const authLinks = document.getElementById('authLinks');
    const userDropdown = document.getElementById('userDropdown');
    const userInitial = document.getElementById('userInitial');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userGreeting = document.getElementById('userGreeting');
    
    if (!authLinks && !userDropdown) {
        return;
    }
    
    if (currentUser) {
        authLinks?.classList.add('d-none');
        userDropdown?.classList.remove('d-none');
        
        if (userInitial) {
            userInitial.textContent = getUserInitial(currentUser.fullName);
        }
        if (userNameDisplay) {
            userNameDisplay.textContent = currentUser.fullName;
        }
        if (userGreeting) {
            const firstName = currentUser.fullName?.split(' ')[0] || 'Friend';
            userGreeting.textContent = `Hi, ${firstName}`;
        }
    } else {
        authLinks?.classList.remove('d-none');
        userDropdown?.classList.add('d-none');
    }
}

function handleSignInSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('signInEmail');
    const passwordInput = document.getElementById('signInPassword');
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    const users = loadStoredUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showNotification('Invalid email or password', 'error');
        return;
    }
    
    saveCurrentUser(user);
    updateAuthUI();
    
    const modalEl = document.getElementById('signInModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        let modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (!modalInstance) {
            modalInstance = new bootstrap.Modal(modalEl);
        }
        modalInstance.hide();
    }
    
    showNotification(`Welcome back, ${user.fullName.split(' ')[0]}!`, 'success');
    emailInput.value = '';
    passwordInput.value = '';
}

function handleSignupSubmit(event) {
    event.preventDefault();
    
    const fullNameInput = document.getElementById('signupFullName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('signupConfirmPassword');
    
    const termsCheck = document.getElementById('termsCheck');
    
    if (!fullNameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
        return;
    }
    
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!fullName || !email || !password || !confirmPassword) {
        showNotification('All fields are required', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (termsCheck && !termsCheck.checked) {
        showNotification('Please agree to the terms to continue', 'error');
        return;
    }
    
    const users = loadStoredUsers();
    if (users.some(user => user.email === email)) {
        showNotification('An account with this email already exists', 'error');
        return;
    }
    
    const newUser = {
        id: `USER${Date.now()}`,
        fullName,
        email,
        password
    };
    
    users.push(newUser);
    saveStoredUsers(users);
    saveCurrentUser(newUser);
    updateAuthUI();
    
    showNotification('Account created! Redirecting...', 'success');
    event.target.reset();
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
}

function handleSignOut(event) {
    event.preventDefault();
    localStorage.removeItem(USER_KEY);
    currentUser = null;
    updateAuthUI();
    showNotification('You have been signed out', 'info');
}

function getUserInitial(name = '') {
    return name.trim().charAt(0).toUpperCase() || 'U';
}
