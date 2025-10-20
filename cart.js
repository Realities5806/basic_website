// ===== CONFIGURATION =====
// Replace with your actual Square Application ID and Location ID
const SQUARE_APP_ID = 'sandbox-sq0idb-YOUR_APP_ID'; // Update this!
const SQUARE_LOCATION_ID = 'YOUR_LOCATION_ID'; // Update this!

// ===== CART STATE =====
let cart = [];
let payments = null;
let card = null;

// ===== CART FUNCTIONS =====

// Initialize cart from localStorage
function initCart() {
    const savedCart = localStorage.getItem('bloomCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('bloomCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            emoji: product.emoji,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showNotification(`${product.name} added to cart`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Calculate cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartTotalAmount = document.getElementById('cart-total-amount');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartItems.innerHTML = '';
    } else {
        cartEmpty.style.display = 'none';
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item glass">
                <div class="cart-item-emoji">${item.emoji}</div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">&times;</button>
            </div>
        `).join('');
    }

    // Update total
    const total = getCartTotal();
    cartTotalAmount.textContent = `$${total.toFixed(2)}`;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification glass';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// ===== CART SIDEBAR =====

function openCart() {
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
}

function closeCart() {
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
}

// ===== CHECKOUT =====

function openCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }

    // Update checkout summary
    const checkoutItems = document.getElementById('checkout-items');
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.emoji} ${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    const checkoutTotalAmount = document.getElementById('checkout-total-amount');
    checkoutTotalAmount.textContent = `$${getCartTotal().toFixed(2)}`;

    // Show checkout modal
    document.getElementById('checkout-modal').classList.add('active');
    closeCart();

    // Initialize Square payment form
    initSquarePayment();
}

function closeCheckout() {
    document.getElementById('checkout-modal').classList.remove('active');
    if (card) {
        card.destroy();
        card = null;
    }
}

// ===== SQUARE PAYMENT INTEGRATION =====

async function initSquarePayment() {
    if (!window.Square) {
        console.error('Square.js failed to load properly');
        showNotification('Payment system is not available');
        return;
    }

    try {
        payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        card = await payments.card();
        await card.attach('#card-container');

        // Enable pay button
        document.getElementById('pay-button').disabled = false;
    } catch (e) {
        console.error('Failed to initialize Square payment:', e);
        document.getElementById('payment-status').innerHTML =
            '<p class="error">Payment system initialization failed. Please check your Square credentials.</p>';
        document.getElementById('pay-button').disabled = true;
    }
}

async function handlePayment() {
    const payButton = document.getElementById('pay-button');
    const paymentStatus = document.getElementById('payment-status');

    payButton.disabled = true;
    paymentStatus.innerHTML = '<p class="processing">Processing payment...</p>';

    try {
        const result = await card.tokenize();

        if (result.status === 'OK') {
            // Here you would send the token to your server to process the payment
            // For now, we'll simulate a successful payment
            console.log('Payment token:', result.token);

            // Simulate server response
            await simulatePaymentProcessing(result.token);

            paymentStatus.innerHTML = '<p class="success">Payment successful! Thank you for your order.</p>';

            // Clear cart after successful payment
            setTimeout(() => {
                cart = [];
                saveCart();
                updateCartUI();
                closeCheckout();
                showNotification('Order placed successfully!');
            }, 2000);
        } else {
            let errorMessage = 'Payment failed. Please try again.';
            if (result.errors) {
                errorMessage = result.errors.map(error => error.message).join(', ');
            }
            paymentStatus.innerHTML = `<p class="error">${errorMessage}</p>`;
            payButton.disabled = false;
        }
    } catch (e) {
        console.error('Payment error:', e);
        paymentStatus.innerHTML = '<p class="error">Payment processing error. Please try again.</p>';
        payButton.disabled = false;
    }
}

// Simulate payment processing (replace with actual server call)
async function simulatePaymentProcessing(token) {
    // In a real implementation, you would send the token to your server
    // which would then process the payment using Square's Payments API

    /*
    Example server call:
    const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: token,
            amount: getCartTotal() * 100, // Amount in cents
            currency: 'USD',
            items: cart
        })
    });

    return await response.json();
    */

    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 1500));
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    initCart();

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const product = {
                id: productCard.dataset.productId,
                name: productCard.dataset.productName,
                price: productCard.dataset.productPrice,
                emoji: productCard.dataset.productEmoji
            };
            addToCart(product);
        });
    });

    // Cart button
    document.getElementById('cart-btn').addEventListener('click', openCart);

    // Close cart
    document.getElementById('close-cart').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);

    // Checkout button
    document.getElementById('checkout-btn').addEventListener('click', openCheckout);

    // Close checkout
    document.getElementById('close-checkout').addEventListener('click', closeCheckout);

    // Pay button
    document.getElementById('pay-button').addEventListener('click', handlePayment);
});
