// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
    }, 1500);
});

const API_BASE = 'http://localhost:5000/api';

// Load products from backend
async function loadProductsFromAPI() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    try {
        const res = await fetch(`${API_BASE}/products?sort=newest`);
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            productsGrid.innerHTML = '';
            
            data.data.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.setAttribute('data-category', product.category);
                
                const badge = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
                const oldPrice = product.oldPrice ? `<span class="old-price">₦${product.oldPrice.toLocaleString()}</span>` : '';
                
                card.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image || 'https://via.placeholder.com/600x400?text=No+Image'}" alt="${product.name}">
                        ${badge}
                        <div class="product-actions">
                            <button class="action-btn quick-view"><i class="fas fa-eye"></i></button>
                            <button class="action-btn wishlist"><i class="fas fa-heart"></i></button>
                            <button class="action-btn compare"><i class="fas fa-exchange-alt"></i></button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                            <span>(${product.rating || 5.0})</span>
                        </div>
                        <div class="product-price">
                            <span class="current-price">₦${product.price.toLocaleString()}</span>
                            ${oldPrice}
                        </div>
                        <div class="product-availability">
                            <span class="in-stock"><i class="fas fa-check-circle"></i> In Stock</span>
                        </div>
                        <button class="btn btn-primary add-to-cart" data-name="${product.name}" data-price="${product.price}" data-image="${product.image || ''}">Add to Cart</button>
                    </div>
                `;
                
                productsGrid.appendChild(card);
            });
            
            // Re-attach add to cart listeners
            attachAddToCartListeners();
        }
    } catch (err) {
        console.error('Failed to load products from API:', err);
    }
}

function attachAddToCartListeners() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const productName = btn.getAttribute('data-name');
            const productPrice = parseFloat(btn.getAttribute('data-price'));
            const productImage = btn.getAttribute('data-image') || 'https://via.placeholder.com/300';
            
            const existingItem = cart.find(item => item.name === productName);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id: Date.now(),
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            btn.innerText = 'Added!';
            btn.style.background = '#16A34A';
            
            setTimeout(() => {
                btn.innerText = 'Add to Cart';
                btn.style.background = '';
            }, 1500);
        });
    });
}

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromAPI();
});

// Scroll Progress Indicator
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollProgress = (scrollTop / scrollHeight) * 100;
    document.querySelector('.progress-bar').style.width = scrollProgress + '%';
});

// Sticky Navigation
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Search Modal
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const closeSearch = document.getElementById('closeSearch');

searchBtn.addEventListener('click', () => {
    searchModal.classList.add('active');
});

closeSearch.addEventListener('click', () => {
    searchModal.classList.remove('active');
});

searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) {
        searchModal.classList.remove('active');
    }
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const icon = darkModeToggle.querySelector('i');
    
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
});

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    darkModeToggle.querySelector('i').classList.remove('fa-moon');
    darkModeToggle.querySelector('i').classList.add('fa-sun');
}

// Animated Counters
const counters = document.querySelectorAll('.counter');
const speed = 200;

const animateCounters = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(animateCounters, 1);
        } else {
            counter.innerText = target.toLocaleString();
        }
    });
};

// Intersection Observer for counters
const counterSection = document.querySelector('.trust-indicators');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

if (counterSection) {
    counterObserver.observe(counterSection);
}

// Product Filtering
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Cart Functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartBtn = document.querySelector('.cart-btn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');

// Open cart modal
cartBtn.addEventListener('click', () => {
    cartModal.classList.add('active');
    renderCart();
});

// Close cart modal
closeCart.addEventListener('click', () => {
    cartModal.classList.remove('active');
});

cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
    }
});

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').innerText = totalItems;
}

// Render cart
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #64748B;">Your cart is empty</p>';
        cartTotal.innerText = '₦0';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₦${item.price.toLocaleString()}</div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    cartTotal.innerText = '₦' + total.toLocaleString();
}

// Update quantity
window.updateQuantity = function(id, change) {
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }
};

// Remove from cart
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
};

// Checkout button
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    cartModal.classList.remove('active');
    checkoutModal.classList.add('active');
    updateOrderSummary();
});

// Close checkout modal
closeCheckout.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
        checkoutModal.classList.remove('active');
    }
});

// Update order summary
function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2000;
    const total = subtotal + deliveryFee;
    
    document.getElementById('summarySubtotal').innerText = '₦' + subtotal.toLocaleString();
    document.getElementById('deliveryFee').innerText = '₦' + deliveryFee.toLocaleString();
    document.getElementById('summaryTotal').innerText = '₦' + total.toLocaleString();
}

// Checkout form submission
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2000;
    const total = subtotal + deliveryFee;
    
    const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod
    };
    
    try {
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        submitBtn.innerText = 'Processing...';
        submitBtn.disabled = true;
        
        // Create order via API
        const orderRes = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const orderResult = await orderRes.json();
        
        if (!orderResult.success) {
            throw new Error(orderResult.message || 'Failed to create order');
        }
        
        const orderId = orderResult.data._id;
        
        // If card payment, initialize Paystack
        if (paymentMethod === 'card') {
            const paymentRes = await fetch(`${API_BASE}/payment/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: customerEmail,
                    amount: total,
                    orderId: orderId,
                    customerName,
                    customerPhone
                })
            });
            
            const paymentResult = await paymentRes.json();
            
            if (paymentResult.success) {
                // Store cart in sessionStorage for recovery after payment
                sessionStorage.setItem('pendingCart', JSON.stringify(cart));
                sessionStorage.setItem('pendingOrderId', orderId);
                
                // Redirect to Paystack
                window.location.href = paymentResult.data.authorization_url;
                return;
            } else {
                throw new Error(paymentResult.message || 'Payment initialization failed');
            }
        }
        
        // For bank transfer or cash on delivery
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        checkoutModal.classList.remove('active');
        
        let message = `Order placed successfully! Order ID: #${orderResult.data.orderNumber || orderId}\n\nThank you for your purchase. We will contact you shortly to confirm your order.`;
        
        if (paymentMethod === 'bank_transfer') {
            message += '\n\nBank Transfer Details:\nBank: [Your Bank Name]\nAccount Name: Kinmson Int\'l Success Venture\nAccount Number: [Your Account Number]\n\nPlease transfer ₦' + total.toLocaleString() + ' and send your payment confirmation to +234 805 597 4919';
        }
        
        alert(message);
        checkoutForm.reset();
        
    } catch (err) {
        alert('Error: ' + err.message);
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        submitBtn.innerText = 'Place Order';
        submitBtn.disabled = false;
    }
});

// Initialize cart count on page load
updateCartCount();

// Wishlist functionality
const wishlistBtns = document.querySelectorAll('.wishlist');

wishlistBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const icon = btn.querySelector('i');
        icon.classList.toggle('fas');
        icon.classList.toggle('far');
        
        if (icon.classList.contains('fas')) {
            icon.style.color = '#ef4444';
        } else {
            icon.style.color = '';
        }
    });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        item.classList.toggle('active');
    });
});

// Testimonials Carousel
const testimonialCards = document.querySelectorAll('.testimonial-card');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentTestimonial = 0;

const showTestimonial = (index) => {
    testimonialCards.forEach((card, i) => {
        card.classList.remove('active');
        if (i === index) {
            card.classList.add('active');
        }
    });
};

prevBtn.addEventListener('click', () => {
    currentTestimonial--;
    if (currentTestimonial < 0) {
        currentTestimonial = testimonialCards.length - 1;
    }
    showTestimonial(currentTestimonial);
});

nextBtn.addEventListener('click', () => {
    currentTestimonial++;
    if (currentTestimonial >= testimonialCards.length) {
        currentTestimonial = 0;
    }
    showTestimonial(currentTestimonial);
});

// Auto-rotate testimonials
setInterval(() => {
    currentTestimonial++;
    if (currentTestimonial >= testimonialCards.length) {
        currentTestimonial = 0;
    }
    showTestimonial(currentTestimonial);
}, 5000);

// Back to Top Button
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerText = 'Message Sent!';
            submitBtn.style.background = '#16A34A';
            
            setTimeout(() => {
                submitBtn.innerText = 'Send Message';
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 2000);
        }, 1500);
    });
}

// Newsletter Form
const newsletterForms = document.querySelectorAll('.newsletter-form');

newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input').value;
        const submitBtn = form.querySelector('button');
        
        submitBtn.innerText = 'Subscribing...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerText = 'Subscribed!';
            submitBtn.style.background = '#16A34A';
            
            setTimeout(() => {
                submitBtn.innerText = 'Subscribe';
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                form.reset();
            }, 2000);
        }, 1500);
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.category-card, .product-card, .feature-card, .service-card, .project-card, .trust-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Add fadeInUp animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Brands Slider Auto-scroll
const brandsSlider = document.querySelector('.brands-slider');

if (brandsSlider) {
    let scrollAmount = 0;
    const scrollStep = 1;
    
    const autoScroll = () => {
        scrollAmount += scrollStep;
        if (scrollAmount >= brandsSlider.scrollWidth - brandsSlider.clientWidth) {
            scrollAmount = 0;
        }
        brandsSlider.scrollLeft = scrollAmount;
        requestAnimationFrame(autoScroll);
    };
    
    // Start auto-scroll after a delay
    setTimeout(() => {
        requestAnimationFrame(autoScroll);
    }, 2000);
}

// Live Chat Button
const chatBtn = document.getElementById('chatBtn');

if (chatBtn) {
    chatBtn.addEventListener('click', () => {
        // Simulate opening chat
        chatBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        
        setTimeout(() => {
            chatBtn.innerHTML = '<i class="fas fa-comments"></i> <span>Chat with us</span>';
            alert('Live chat feature would open here. Integrate with your preferred chat service.');
        }, 1500);
    });
}

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchForm = document.querySelector('.search-form');

if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (query) {
            // Simulate search
            alert(`Searching for: ${query}\n\nIntegrate with your backend search functionality.`);
            searchModal.classList.remove('active');
            searchInput.value = '';
        }
    });
}

// Escape key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchModal.classList.remove('active');
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < window.innerHeight) {
        const floatingIcons = document.querySelector('.floating-icons');
        if (floatingIcons) {
            floatingIcons.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    }
});

// Product Quick View (placeholder)
const quickViewBtns = document.querySelectorAll('.quick-view');

quickViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Quick view modal would open here. Integrate with your product details.');
    });
});

// Compare functionality (placeholder)
const compareBtns = document.querySelectorAll('.compare');

compareBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Product added to compare list. Integrate with your compare functionality.');
    });
});

// Initialize tooltips (if using a tooltip library)
// This is a placeholder for tooltip initialization
document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        // Tooltip logic would go here
    });
});

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Console welcome message
console.log('%c Kinmson Int\'l Success Venture ', 'background: #0B1F3A; color: #F4B400; font-size: 20px; padding: 10px;');
console.log('%c Premium Electrical Solutions ', 'background: #0B1F3A; color: #fff; font-size: 14px; padding: 10px;');
