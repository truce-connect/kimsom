// Admin Panel JavaScript

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';
let authToken = localStorage.getItem('adminToken');
let currentAdmin = null;

// Check if admin is logged in
document.addEventListener('DOMContentLoaded', async () => {
    if (authToken) {
        const valid = await verifyToken();
        if (valid) {
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'flex';
            loadDashboardData();
        } else {
            localStorage.removeItem('adminToken');
            authToken = null;
        }
    }
});

// Verify JWT token
async function verifyToken() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        if (res.ok) {
            const data = await res.json();
            currentAdmin = data.data;
            return currentAdmin.role === 'admin';
        }
        return false;
    } catch {
        return false;
    }
}

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success && data.user.role === 'admin') {
                authToken = data.token;
                localStorage.setItem('adminToken', authToken);
                currentAdmin = data.user;
                
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'flex';
                loadDashboardData();
            } else {
                const message = data.message || 'Invalid email or password';
                alert(message);
            }
        } catch (err) {
            alert('Login failed. Please check your internet connection and try again.\n\nError: ' + err.message);
        }
    });
}

// Password visibility toggle
const passwordToggle = document.getElementById('passwordToggle');
const passwordInput = document.getElementById('password');
if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        passwordToggle.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        authToken = null;
        currentAdmin = null;
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminLogin').style.display = 'flex';
        loginForm.reset();
    });
}

// Navigation
const navItems = document.querySelectorAll('.nav-item[data-section]');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const section = item.getAttribute('data-section');
        if (section === 'add-product') {
            resetProductForm();
        }
        showSection(section);
        
        if (window.innerWidth <= 768) {
            document.getElementById('adminSidebar').classList.remove('active');
        }
    });
});

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const adminSidebar = document.getElementById('adminSidebar');
if (mobileMenuToggle && adminSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
        adminSidebar.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !adminSidebar.contains(e.target) && 
            !mobileMenuToggle.contains(e.target) &&
            adminSidebar.classList.contains('active')) {
            adminSidebar.classList.remove('active');
        }
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    const titles = {
        'dashboard': 'Dashboard',
        'products': 'Products',
        'add-product': 'Add Product',
        'orders': 'Orders',
        'categories': 'Categories'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';
    
    if (sectionName === 'products') {
        loadProducts();
    } else if (sectionName === 'orders') {
        loadOrders();
    } else if (sectionName === 'dashboard') {
        loadDashboardData();
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const [statsRes, ordersRes] = await Promise.all([
            fetch(`${API_BASE}/admin/stats`, {
                headers: { Authorization: `Bearer ${authToken}` }
            }),
            fetch(`${API_BASE}/orders`, {
                headers: { Authorization: `Bearer ${authToken}` }
            })
        ]);
        
        if (!statsRes.ok || !ordersRes.ok) {
            console.error('Failed to load dashboard data');
            return;
        }
        
        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        
        if (statsData.success) {
            document.getElementById('totalProducts').textContent = statsData.data.totalProducts;
            document.getElementById('totalOrders').textContent = statsData.data.totalOrders;
            document.getElementById('totalRevenue').textContent = '₦' + (statsData.data.totalRevenue || 0).toLocaleString();
            document.getElementById('totalCustomers').textContent = statsData.data.totalCustomers;
        }
    } catch (err) {
        console.error('Failed to load dashboard:', err);
    }
}

// Product Management
const productForm = document.getElementById('productForm');
const submitProductBtn = productForm ? productForm.querySelector('button[type="submit"]') : null;

function resetProductForm() {
    if (productForm) productForm.reset();
    const editId = document.getElementById('editProductId');
    if (editId) editId.value = '';
    const fileInput = document.getElementById('productImageFile');
    if (fileInput) fileInput.value = '';
    const imageInput = document.getElementById('productImage');
    if (imageInput) imageInput.value = '';
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.style.display = 'none';
    const uploadBtn = document.getElementById('uploadImageBtn');
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Image';
        uploadBtn.style.display = 'block';
    }
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = 'Add Product';
    if (submitProductBtn) submitProductBtn.textContent = 'Add Product';
}

// Upload image button
const uploadImageBtn = document.getElementById('uploadImageBtn');
if (uploadImageBtn) {
    uploadImageBtn.addEventListener('click', () => {
        document.getElementById('productImageFile').click();
    });
}

// File input change handler
const productImageFile = document.getElementById('productImageFile');
if (productImageFile) {
    productImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imagePreview = document.getElementById('imagePreview');
                const previewImg = imagePreview.querySelector('img');
                if (imagePreview && previewImg) {
                    previewImg.src = e.target.result;
                    imagePreview.style.display = 'block';
                    uploadImageBtn.innerHTML = '<i class="fas fa-check"></i> Image Selected';
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Clear image button
const clearImageBtn = document.getElementById('clearImageBtn');
if (clearImageBtn) {
    clearImageBtn.addEventListener('click', () => {
        document.getElementById('productImageFile').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        uploadImageBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Image';
    });
}

if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editId = document.getElementById('editProductId').value;
        const isEdit = !!editId;

        if (submitProductBtn) {
            submitProductBtn.textContent = isEdit ? 'Updating...' : 'Adding...';
            submitProductBtn.disabled = true;
        }

        const fileInput = document.getElementById('productImageFile');
        const file = fileInput ? fileInput.files[0] : null;

        try {
            const url = isEdit ? `${API_BASE}/products/${editId}` : `${API_BASE}/products`;
            const method = isEdit ? 'PUT' : 'POST';

            let res;

            if (file) {
                const formData = new FormData();
                formData.append('name', document.getElementById('productName').value);
                formData.append('category', document.getElementById('productCategory').value);
                formData.append('price', parseFloat(document.getElementById('productPrice').value));
                if (document.getElementById('productOldPrice').value) {
                    formData.append('oldPrice', parseFloat(document.getElementById('productOldPrice').value));
                }
                formData.append('stock', parseInt(document.getElementById('productStock').value));
                formData.append('badge', document.getElementById('productBadge').value);
                formData.append('description', document.getElementById('productDescription').value);
                if (document.getElementById('productImage').value) {
                    formData.append('image', document.getElementById('productImage').value);
                }
                formData.append('rating', 5.0);
                formData.append('reviews', 0);
                formData.append('image', file);

                res = await fetch(url, {
                    method: method,
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    },
                    body: formData
                });
            } else {
                const product = {
                    name: document.getElementById('productName').value,
                    category: document.getElementById('productCategory').value,
                    price: parseFloat(document.getElementById('productPrice').value),
                    oldPrice: document.getElementById('productOldPrice').value ? parseFloat(document.getElementById('productOldPrice').value) : null,
                    stock: parseInt(document.getElementById('productStock').value),
                    badge: document.getElementById('productBadge').value,
                    description: document.getElementById('productDescription').value,
                    image: document.getElementById('productImage').value || '',
                    rating: 5.0,
                    reviews: 0
                };

                res = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify(product)
                });
            }

            if (!res.ok) {
                alert('Failed to save product. Please try again.');
                return;
            }

            const data = await res.json();

            if (data.success) {
                alert(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
                resetProductForm();
                loadDashboardData();
                showSection('products');
            } else {
                alert('Failed to save product: ' + data.message);
            }
        } catch (err) {
            alert('Error saving product. Please try again.');
        } finally {
            if (submitProductBtn) {
                submitProductBtn.disabled = false;
                submitProductBtn.textContent = isEdit ? 'Update Product' : 'Add Product';
            }
        }
    });
}

// Load Products
async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    
    try {
        const res = await fetch(`${API_BASE}/products/admin/all`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Failed to load products</td></tr>';
            return;
        }
        
        const data = await res.json();
        
        if (!data.success) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Failed to load products</td></tr>';
            return;
        }
        
        const products = data.data;
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No products found</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-thumb"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₦${product.price.toLocaleString()}</td>
                <td>${product.stock}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit-btn" onclick="editProduct('${product._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteProduct('${product._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Failed to load products:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error loading products</td></tr>';
    }
}

// Delete Product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const res = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (!res.ok) {
            alert('Failed to delete product');
            return;
        }
        
        const data = await res.json();
        
        if (data.success) {
            loadProducts();
            loadDashboardData();
        } else {
            alert('Failed to delete product: ' + data.message);
        }
    } catch (err) {
        alert('Error deleting product. Please try again.');
    }
}

// Edit Product
async function editProduct(id) {
    try {
        const res = await fetch(`${API_BASE}/products/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (!res.ok) {
            alert('Failed to load product details');
            return;
        }
        
        const data = await res.json();
        
        if (!data.success) {
            alert('Failed to load product details');
            return;
        }
        
        const product = data.data;
        
        document.getElementById('editProductId').value = product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productOldPrice').value = product.oldPrice || '';
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productBadge').value = product.badge || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productImage').value = product.image || '';

        const imagePreview = document.getElementById('imagePreview');
        const previewImg = imagePreview.querySelector('img');
        if (product.image) {
            previewImg.src = product.image.startsWith('/uploads/') ? `${API_BASE.replace('/api', '')}${product.image}` : product.image;
            imagePreview.style.display = 'block';
            uploadImageBtn.innerHTML = '<i class="fas fa-check"></i> Image Set';
        } else {
            imagePreview.style.display = 'none';
            uploadImageBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Image';
        }
        
        document.getElementById('pageTitle').textContent = 'Edit Product';
        if (submitProductBtn) submitProductBtn.textContent = 'Update Product';
        showSection('add-product');
    } catch (err) {
        alert('Error loading product details');
    }
}

// Load Orders
async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    
    try {
        const res = await fetch(`${API_BASE}/orders`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Failed to load orders</td></tr>';
            return;
        }
        
        const data = await res.json();
        
        if (!data.success) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Failed to load orders</td></tr>';
            return;
        }
        
        const orders = data.data;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderNumber || order._id}</td>
                <td>${order.customerName}</td>
                <td>${order.items.length} items</td>
                <td>₦${order.total.toLocaleString()}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit-btn" onclick="viewOrder('${order._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="updateOrderStatus('${order._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Failed to load orders:', err);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error loading orders</td></tr>';
    }
}

// View Order
async function viewOrder(id) {
    try {
        const res = await fetch(`${API_BASE}/orders/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (!res.ok) {
            alert('Failed to load order details');
            return;
        }
        
        const data = await res.json();
        
        if (!data.success) {
            alert('Failed to load order details');
            return;
        }
        
        const order = data.data;
        let orderDetails = `Order #${order.orderNumber || order._id}\n\n`;
        orderDetails += `Customer: ${order.customerName}\n`;
        orderDetails += `Email: ${order.customerEmail}\n`;
        orderDetails += `Phone: ${order.customerPhone}\n`;
        orderDetails += `Address: ${order.customerAddress}\n\n`;
        orderDetails += `Items:\n`;
        
        order.items.forEach(item => {
            orderDetails += `- ${item.name} x ${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}\n`;
        });
        
        orderDetails += `\nTotal: ₦${order.total.toLocaleString()}\n`;
        orderDetails += `Status: ${order.status}\n`;
        orderDetails += `Payment: ${order.paymentMethod}\n`;
        orderDetails += `Payment Status: ${order.paymentStatus}`;
        
        alert(orderDetails);
    } catch (err) {
        alert('Error loading order details');
    }
}

// Update Order Status
async function updateOrderStatus(id) {
    const newStatus = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):');
    
    if (!newStatus || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
        alert('Invalid status');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!res.ok) {
            alert('Failed to update status');
            return;
        }
        
        const data = await res.json();
        
        if (data.success) {
            loadOrders();
            loadDashboardData();
        } else {
            alert('Failed to update status: ' + data.message);
        }
    } catch (err) {
        alert('Error updating order status');
    }
}

// Silent seed data check for debugging
async function checkSeedData() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        
        if (data.success && data.count === 0) {
            console.warn('No products found in database. Run: npm run seed');
        }
    } catch (err) {
        console.error('Error checking products:', err);
    }
}

// Only check seed data when backend is reachable
checkSeedData();
