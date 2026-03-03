// Enhanced VIKINGOS-MTY JavaScript 

// productos
const sampleProducts = [
    {
        id: 1,
        name: "Combo 2 Salchipapas",
        price: 90.00,
        stock: 15,
        category: "combos",
        image: "Imagenes/13.jpeg",
        description: "2 porciones de salchipapas con salsas incluidas"
    },
    {
        id: 2,
        name: "Combo 2 Salsas Boneles",
        price: 170.00,
        stock: 20,
        category: "combos",
        image: "Imagenes/9.jpeg",
        description: "Boneles con 2 salsas a elegir"
    },
    {
        id: 3,
        name: "Combo 2 Hotdogs Bonelees Papas",
        price: 200.00,
        stock: 12,
        category: "combos",
        image: "Imagenes/12.jpeg",
        description: "2 Hotdogs bonelees con papas fritas"
    },
    {
        id: 4,
        name: "Combo Boneles con Hotdog",
        price: 150.00,
        stock: 8,
        category: "combos",
        image: "Imagenes/11.jpeg",
        description: "Boneles acompañados de hotdog"
    },
    {
        id: 5,
        name: "Hotdog Polaco",
        price: 60.00,
        stock: 18,
        category: "hotdogs",
        image: "Imagenes/5.jpeg",
        description: "Hotdog estilo polaco con ingredientes especiales"
    },
    {
        id: 6,
        name: "Hotdog Sencillo",
        price: 35.99,
        stock: 35,
        category: "hotdogs",
        image: "Imagenes/HD.jpg",
        description: "Hotdog sencillo pero delicioso"
    },
    {
        id: 7,
        name: "Dedos de Queso",
        price: 75.00,
        stock: 30,
        category: "snacks",
        image: "Imagenes/16.jpeg",
        description: "Deliciosos dedos de queso fritos"
    },
    {
        id: 8,
        name: "Elote",
        price: 50.00,
        stock: 20,
        category: "snacks",
        image: "Imagenes/15.jpeg",
        description: "Elote preparado con mayonesa, queso y chile"
    },
    {
        id: 9,
        name: "Ensalada",
        price: 145.00,
        stock: 15,
        category: "especiales",
        image: "Imagenes/14.jpeg",
        description: "Ensalada fresca con ingredientes premium"
    },
    {
        id: 10,
        name: "Nachos",
        price: 60.00,
        stock: 16,
        category: "snacks",
        image: "Imagenes/19.jpeg",
        description: "Nachos con queso y jalapeños"
    },
    {
        id: 11,
        name: "Salchipapas",
        price: 65.99,
        stock: 20,
        category: "salchipapas",
        image: "Imagenes/SP.jpg",
        description: "Salchipapas con todo incluido"
    },
    {
        id: 12,
        name: "Milanesas",
        price: 75.99,
        stock: 14,
        category: "especiales",
        image: "Imagenes/4.jpeg",
        description: "Milanesas crujientes con guarnición"
    }
];

//ESTO ES PARA CATALOGAR LOS PRODUCTOS

let cart = [];
let products = [...sampleProducts];

// ELEMENTOS
const productsGrid = document.getElementById('products-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart-count');

// INICICALIZACION DE LA APP
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    animateStats();
    setupScrollAnimations();
});

// CARGA DE PRODUCTOS
function loadProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCard = createProductCard(product);
        productCard.style.animationDelay = `${index * 0.1}s`;
        productsGrid.appendChild(productCard);
    });
}

// Create enhanced product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animation = 'fadeInUp 0.6s ease both';
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-description">${product.description}</p>
            <p class="product-stock ${product.stock === 0 ? 'out-of-stock' : ''}">
                ${product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </p>
            <button class="add-to-cart" onclick="addToCart(${product.id})" 
                    ${product.stock === 0 ? 'disabled' : ''}>
                <i class="fas fa-cart-plus"></i> Agregar al Carrito
            </button>
        </div>
    `;
    
    return card;
}

// Add to cart with animation
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    product.stock -= 1;
    
    // Animate cart icon
    animateCartIcon();
    updateCartDisplay();
    loadProducts(); // Refresh to update stock
    
    // Show success notification
    showNotification(`${product.name} agregado al carrito`, 'success');
}

// Animate cart icon
function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 300);
}

// Update cart display
function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    updateCartTotal();
    updateCartCount();
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        const product = products.find(p => p.id === productId);
        product.stock -= change;
        updateCartDisplay();
        loadProducts();
    }
}

// Remove from cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    const product = products.find(p => p.id === productId);
    product.stock += cart[itemIndex].quantity;
    
    cart.splice(itemIndex, 1);
    updateCartDisplay();
    loadProducts();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: var(--success-color)' : 'background: var(--primary-color)'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Show add product form
function showAddProductForm() {
    document.getElementById('add-product-form').style.display = 'block';
    document.getElementById('inventory-list').style.display = 'none';
}

// Show inventory list
function showInventoryList() {
    document.getElementById('inventory-list').style.display = 'block';
    document.getElementById('add-product-form').style.display = 'none';
    loadInventoryTable();
}

// Load inventory table
function loadInventoryTable() {
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td class="${product.stock > 0 ? 'status-active' : 'status-inactive'}">
                ${product.stock > 0 ? 'Disponible' : 'Agotado'}
            </td>
            <td>
                <button onclick="editProduct(${product.id})" class="btn-edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct(${product.id})" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    // Create payment modal if it doesn't exist
    if (!document.getElementById('payment-modal')) {
        createPaymentModal();
    }
    
    document.getElementById('payment-modal').style.display = 'block';
}

// Create enhanced payment modal with better centering and styling
function createPaymentModal() {
    const modal = document.createElement('div');
    modal.id = 'payment-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Procesar Pago</h3>
            <div class="payment-options">
                <button class="payment-btn" onclick="selectPayment('cash')">
                    <i class="fas fa-money-bill-wave"></i> Efectivo
                </button>
                <button class="payment-btn" onclick="selectPayment('card')">
                    <i class="fas fa-credit-card"></i> Tarjeta
                </button>
            </div>
            <div id="cash-payment" style="display: none;">
                <h4>Pago en Efectivo</h4>
                <div class="payment-amount-display">
                    <p><strong>Total a pagar: $<span id="payment-total-amount">0.00</span></strong></p>
                </div>
                <div class="form-group">
                    <label>Monto recibido:</label>
                    <input type="number" id="cash-amount" step="0.01" min="0" placeholder="Ingrese el monto">
                </div>
                <div id="cash-change" style="display: none;">
                    <p><strong>Cambio: $<span id="cash-change-amount">0.00</span></strong></p>
                </div>
                <div class="payment-actions">
                    <button class="btn-primary" onclick="calculateChange()">
                        <i class="fas fa-calculator"></i> Calcular Cambio
                    </button>
                    <button class="btn-success" onclick="confirmPayment('cash')" style="display: none;" id="confirm-cash-btn">
                        <i class="fas fa-check-circle"></i> Confirmar Venta
                    </button>
                </div>
            </div>
            <div id="card-payment" style="display: none;">
                <h4>Pago con Tarjeta</h4>
                <div class="payment-amount-display">
                    <p><strong>Total a pagar: $<span id="payment-total-amount">0.00</span></strong></p>
                </div>
                <div class="form-group">
                    <label>Número de tarjeta:</label>
                    <input type="text" id="card-number" placeholder="**** **** **** ****" maxlength="19">
                </div>
                <div class="form-group">
                    <label>Nombre del titular:</label>
                    <input type="text" id="card-holder" placeholder="Nombre completo">
                </div>
                <div class="payment-actions">
                    <button class="btn-success" onclick="confirmPayment('card')">
                        <i class="fas fa-check-circle"></i> Confirmar Venta
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Process payment
function processPayment(method) {
    const total = parseFloat(document.getElementById('cart-total').textContent);
    
    if (method === 'cash') {
        const cashAmount = parseFloat(document.getElementById('cash-amount')?.value || 0);
        if (cashAmount < total) {
            showNotification('Monto insuficiente', 'error');
            return;
        }
        
        const change = cashAmount - total;
        generateTicket(method, cashAmount, change);
    } else {
        generateTicket(method, total, 0);
    }
    
    document.getElementById('payment-modal').style.display = 'none';
}

// Add function to display payment amount when cash is selected
function displayPaymentAmount() {
    const total = parseFloat(document.getElementById('cart-total').textContent);
    const paymentTotal = document.getElementById('payment-total-amount');
    if (paymentTotal) {
        paymentTotal.textContent = total.toFixed(2);
    }
}

// Function to handle payment method selection
function selectPayment(method) {
    const cashPayment = document.getElementById('cash-payment');
    const cardPayment = document.getElementById('card-payment');
    
    if (method === 'cash') {
        cashPayment.style.display = 'block';
        cardPayment.style.display = 'none';
        displayPaymentAmount();
    } else {
        cashPayment.style.display = 'none';
        cardPayment.style.display = 'block';
    }
}

// GENERA EL TICKET
function generateTicket(method, amount, change) {
    const now = new Date();
    document.getElementById('ticket-date').textContent = now.toLocaleDateString();
    document.getElementById('ticket-time').textContent = now.toLocaleTimeString();
    document.getElementById('ticket-payment-method').textContent = method === 'cash' ? 'Efectivo' : 'Tarjeta';
    document.getElementById('ticket-payment-amount').textContent = amount.toFixed(2);
    document.getElementById('ticket-change').textContent = change.toFixed(2);
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    
    document.getElementById('ticket-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('ticket-igv').textContent = igv.toFixed(2);
    document.getElementById('ticket-final-total').textContent = total.toFixed(2);
    
    const tbody = document.getElementById('ticket-items-body');
    tbody.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('ticket-container').style.display = 'block';
    
    // LIMPIAR LA CARTA
    cart = [];
    updateCartDisplay();
    loadProducts();
}

// CALCULA LA COMPRA DE LOS PRODUCTOS
function calculateChange() {
    const total = parseFloat(document.getElementById('cart-total').textContent);
    const cashAmount = parseFloat(document.getElementById('cash-amount')?.value || 0);
    
    if (cashAmount < total) {
        showNotification('Monto insuficiente', 'error');
        return;
    }
    
    const change = cashAmount - total;
    document.getElementById('cash-change-amount').textContent = change.toFixed(2);
    document.getElementById('cash-change').style.display = 'block';
    document.getElementById('confirm-cash-btn').style.display = 'inline-block';
    
    showNotification(`Cambio calculado: $${change.toFixed(2)}`, 'success');
}

// PARA CONFIRMAR EL METODO DE PAGO
function confirmPayment(method) {
    const total = parseFloat(document.getElementById('cart-total').textContent);
    
    if (method === 'cash') {
        const cashAmount = parseFloat(document.getElementById('cash-amount')?.value || 0);
        if (cashAmount < total) {
            showNotification('Monto insuficiente', 'error');
            return;
        }
        
        const change = cashAmount - total;
        generateTicket(method, cashAmount, change);
    } else if (method === 'card') {
        const cardNumber = document.getElementById('card-number')?.value.trim();
        const cardHolder = document.getElementById('card-holder')?.value.trim();
        
        if (!cardNumber || !cardHolder) {
            showNotification('Por favor complete todos los datos de la tarjeta', 'error');
            return;
        }
        
        generateTicket(method, total, 0);
    }
    
    document.getElementById('payment-modal').style.display = 'none';
    showNotification('¡Venta completada exitosamente!', 'success');
}

// IMPRIE EL TICKET
function printTicket() {
    window.print();
}

// PARA INSERTAR NUEVOS PRODUCTOS
function setupEventListeners() {
    // INFORMACION DEL PRODUCTO A INGRESAR
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newProduct = {
            id: products.length + 1,
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            category: document.getElementById('product-category').value,
            image: document.getElementById('product-image').value,
            description: document.getElementById('product-description').value
        };
        
        products.push(newProduct);
        loadProducts();
        this.reset();
        showNotification('Producto agregado exitosamente', 'success');
    });
    
    //TIPO DE PAGO
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('payment-modal');
        if (modal && e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ANIMACIONES DE NOTIFICACIONES
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .modal {
        display: none;
        position: fixed;
        z-index: 2000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d) !important;
        color: #ffeb3b !important;
        margin: 15% auto;
        padding: 2rem;
        border-radius: 15px;
        width: 80%;
        max-width: 500px;
        text-align: center;
        border: 2px solid #4caf50 !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
    }
    
    .modal-content h3 {
        color: #4caf50 !important;
        font-size: 1.8rem;
        margin-bottom: 1.5rem;
    }
    
    .modal-content h4 {
        color: #4caf50 !important;
        font-size: 1.4rem;
        margin-bottom: 1rem;
    }
    
    .close {
        color: #ffeb3b !important;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }
    
    .close:hover {
        color: #4caf50 !important;
    }
    
    .payment-options {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin: 1.5rem 0;
    }
    
    .payment-btn {
        padding: 15px 30px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 1.1rem;
        font-weight: bold;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #2d5a2d, #1a3a1a) !important;
        color: #ffeb3b !important;
        border: 2px solid #ffeb3b !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .payment-btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #1a3a1a, #0d1f0d) !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
    
    .payment-amount-display {
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d) !important;
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1.5rem 0;
        border: 2px solid #ffeb3b !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    .payment-amount-display p {
        margin: 0;
        font-size: 1.4rem;
        font-weight: bold;
        color: #4caf50 !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .form-group {
        margin: 1rem 0;
    }
    
    .form-group label {
        color: #ffeb3b !important;
        font-weight: bold;
        display: block;
        margin-bottom: 0.5rem;
    }
    
    .form-group input {
        background: #2d2d2d !important;
        border: 2px solid #4caf50 !important;
        color: #ffeb3b !important;
        padding: 0.75rem;
        border-radius: 8px;
        width: 100%;
        box-sizing: border-box;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: #ffeb3b !important;
        box-shadow: 0 0 10px rgba(255, 235, 59, 0.3) !important;
    }
    
    button {
        background: linear-gradient(135deg, #2d5a2d, #1a3a1a) !important;
        color: #ffeb3b !important;
        border: 2px solid #ffeb3b !important;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    button:hover {
        background: linear-gradient(135deg, #1a3a1a, #0d1f0d) !important;
        transform: translateY(-2px);
    }
    
    .btn-success {
        background: linear-gradient(135deg, #4caf50, #2d5a2d) !important;
        color: #ffeb3b !important;
        border: 2px solid #ffeb3b !important;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        margin-top: 1rem;
        font-size: 1.1rem;
    }
    
    .btn-success:hover {
        background: linear-gradient(135deg, #2d5a2d, #1a3a1a) !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4) !important;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #ffeb3b, #ffc107) !important;
        color: #1a1a1a !important;
        border: 2px solid #1a1a1a !important;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        margin-top: 1rem;
        font-size: 1.1rem;
    }
    
    .btn-primary:hover {
        background: linear-gradient(135deg, #ffc107, #ff9800) !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 235, 59, 0.4) !important;
    }
`;
document.head.appendChild(style);
