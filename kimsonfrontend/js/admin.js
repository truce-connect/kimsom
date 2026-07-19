// Admin Panel JavaScript

const API_BASE = 'http://localhost:5000/api';
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
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password })
            });
            
            const data = await res.json();
            
            if (data.success && data.user.role === 'admin') {
                authToken = data.token;
                localStorage.setItem('adminToken', authToken);
                currentAdmin = data.user;
                
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'flex';
                loadDashboardData();
            } else {
                alert('Invalid username or password');
            }
        } catch (err) {
            alert('Login failed. Please try again.');
        }
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
        showSection(section);
    });
});

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
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const editId = document.getElementById('editProductId').value;
        
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
        
        try {
            const isEdit = !!editId;
            const url = isEdit ? `${API_BASE}/products/${editId}` : `${API_BASE}/products`;
            const method = isEdit ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify(product)
            });
            
            const data = await res.json();
            
            if (data.success) {
                alert(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
                productForm.reset();
                document.getElementById('editProductId').value = '';
                loadDashboardData();
                showSection('products');
            } else {
                alert('Failed to save product: ' + data.message);
            }
        } catch (err) {
            alert('Error saving product. Please try again.');
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

// Initialize with seed data check
async function checkSeedData() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        
        if (data.success && data.count === 0) {
            alert('No products found. Please run the seed script: npm run seed');
        }
    } catch (err) {
        console.error('Error checking products:', err);
    }
}

checkSeedData();
