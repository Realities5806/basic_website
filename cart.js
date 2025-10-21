// ===== CONFIGURATION =====
// By default, this uses a demo payment form (no Square connection required)
// To use real Square payments, get credentials from https://developer.squareup.com/ and update below
const SQUARE_APP_ID = 'sandbox-sq0idb-YOUR_APP_ID'; // Replace with your Square Application ID
const SQUARE_LOCATION_ID = 'YOUR_LOCATION_ID'; // Replace with your Square Location ID

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

let useDemoMode = false; // Flag to track if we're using demo mode

async function initSquarePayment() {
    // Try to initialize Square, fall back to demo mode if it fails
    if (!window.Square) {
        console.log('Square.js not loaded, using demo mode');
        initDemoPaymentForm();
        return;
    }

    try {
        payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        card = await payments.card();
        await card.attach('#card-container');

        // Enable pay button
        document.getElementById('pay-button').disabled = false;
        useDemoMode = false;
    } catch (e) {
        console.log('Square initialization failed, using demo mode:', e);
        initDemoPaymentForm();
    }
}

function initDemoPaymentForm() {
    useDemoMode = true;
    const cardContainer = document.getElementById('card-container');

    cardContainer.innerHTML = `
        <div class="demo-payment-notice">
            <p style="color: var(--gray-400); font-size: 0.9rem; margin-bottom: 1rem;">
                Demo Mode - Enter test card details below
            </p>
        </div>
        <div class="demo-card-form">
            <div class="form-group">
                <label for="demo-card-number">Card Number</label>
                <input type="text" id="demo-card-number" placeholder="4111 1111 1111 1111" maxlength="19">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="demo-expiry">Expiry</label>
                    <input type="text" id="demo-expiry" placeholder="MM/YY" maxlength="5">
                </div>
                <div class="form-group">
                    <label for="demo-cvv">CVV</label>
                    <input type="text" id="demo-cvv" placeholder="123" maxlength="4">
                </div>
            </div>
            <div class="form-group">
                <label for="demo-zip">ZIP Code</label>
                <input type="text" id="demo-zip" placeholder="12345" maxlength="5">
            </div>
        </div>
    `;

    // Add input formatting
    const cardNumberInput = document.getElementById('demo-card-number');
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    const expiryInput = document.getElementById('demo-expiry');
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // Enable pay button
    document.getElementById('pay-button').disabled = false;
}

async function handlePayment() {
    const payButton = document.getElementById('pay-button');
    const paymentStatus = document.getElementById('payment-status');

    payButton.disabled = true;
    paymentStatus.innerHTML = '<p class="processing">Processing payment...</p>';

    try {
        if (useDemoMode) {
            // Demo mode validation and processing
            const cardNumber = document.getElementById('demo-card-number').value.replace(/\s/g, '');
            const expiry = document.getElementById('demo-expiry').value;
            const cvv = document.getElementById('demo-cvv').value;
            const zip = document.getElementById('demo-zip').value;

            // Basic validation
            if (!cardNumber || cardNumber.length < 13) {
                paymentStatus.innerHTML = '<p class="error">Please enter a valid card number</p>';
                payButton.disabled = false;
                return;
            }
            if (!expiry || expiry.length < 5) {
                paymentStatus.innerHTML = '<p class="error">Please enter a valid expiry date</p>';
                payButton.disabled = false;
                return;
            }
            if (!cvv || cvv.length < 3) {
                paymentStatus.innerHTML = '<p class="error">Please enter a valid CVV</p>';
                payButton.disabled = false;
                return;
            }
            if (!zip || zip.length < 5) {
                paymentStatus.innerHTML = '<p class="error">Please enter a valid ZIP code</p>';
                payButton.disabled = false;
                return;
            }

            // Simulate payment processing
            await simulatePaymentProcessing('demo-token');

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
            // Real Square payment processing
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
