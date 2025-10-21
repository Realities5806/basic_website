# Bloom - Minimalist Flower Shop

A minimalistic flower shop website with a glassmorphism design featuring black, white, and gray colors. Includes a fully functional shopping cart with Square payment integration.

## Features

- **Minimalist Design**: Clean, modern interface with glassmorphism effects
- **Shopping Cart**: Functional cart with add/remove items and quantity management
- **Square Payment Integration**: Secure payment processing via Square Web Payments SDK
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: Cart persists across page refreshes
- **Smooth Animations**: Polished UI with transitions and notifications

## Getting Started

### Quick Start (Demo Mode)

**The payment system works out of the box!** No configuration needed for testing.

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Add items to cart and click "Proceed to Checkout"
4. The Square payment form will load automatically in **sandbox mode**

**Test it now with these test card numbers:**
- Card: `4111 1111 1111 1111` (Visa)
- CVV: Any 3 digits (e.g., `123`)
- Expiration: Any future date (e.g., `12/25`)
- ZIP: Any 5 digits (e.g., `12345`)

No real charges will be made - this is for testing the interface only!

### Prerequisites

- A web browser (Chrome, Firefox, Safari, etc.)
- **Optional**: A Square account (only needed for real payment processing)

## Square Payment Integration Setup

**Note:** The site is already configured with Square sandbox credentials for demo purposes. You only need to follow these steps if you want to process real payments:

### Step 1: Create a Square Account

1. Go to [Square Developer Portal](https://developer.squareup.com/)
2. Sign up for a free Square developer account
3. Create a new application

### Step 2: Get Your Credentials

1. In the Square Developer Dashboard, navigate to your application
2. Find your **Application ID** and **Location ID**:
   - **Application ID**: Found in the "Credentials" tab
   - **Location ID**: Found in the "Locations" tab

### Step 3: Configure the Website

Open `cart.js` and replace the default sandbox credentials with your own:

```javascript
// Change from:
const SQUARE_APP_ID = 'sandbox-sq0idb-5wUJF4vFZ7PqZqJpQTJBpLBjqkE'; // Public sandbox
const SQUARE_LOCATION_ID = 'LTAT71513H9FV'; // Public sandbox location

// To your credentials:
const SQUARE_APP_ID = 'sandbox-sq0idb-YOUR_APP_ID'; // Your Application ID
const SQUARE_LOCATION_ID = 'YOUR_LOCATION_ID'; // Your Location ID
```

### Step 4: Testing with Your Account

After configuring your credentials, test in sandbox mode:

- The sandbox URL is already configured: `https://sandbox.web.squarecdn.com/v1/square.js`
- No real payments will be processed
- Use Square's test card numbers

**Additional Test Card Numbers:**
- Mastercard: `5105 1051 0510 5100`
- Discover: `6011 1111 1111 1117`
- CVV: Any 3 digits
- Expiration: Any future date
- ZIP: Any 5 digits

### Step 5: Going to Production

When ready for real payments, update `index.html`:

Change:
```html
<script type="text/javascript" src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
```

To:
```html
<script type="text/javascript" src="https://web.squarecdn.com/v1/square.js"></script>
```

And update `cart.js` to use your production Application ID (remove `sandbox-` prefix).

### Step 6: Backend Integration (Important!)

⚠️ **Current Implementation Note**: The current implementation simulates payment processing on the client side. For production use, you **MUST** implement a server-side backend.

The `simulatePaymentProcessing()` function in `cart.js` includes a commented example of how to send the payment token to your server:

```javascript
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
```

Your server should then use Square's Payments API to process the payment securely.

## File Structure

```
basic_website/
├── index.html          # Main HTML file
├── styles.css          # All styles including glassmorphism effects
├── cart.js             # Shopping cart and Square payment logic
└── README.md           # This file
```

## Customization

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --black: #000000;
    --white: #ffffff;
    --gray-100: #f5f5f5;
    /* ... more gray shades ... */
}
```

### Products

Edit products in `index.html` by modifying the product cards with data attributes:

```html
<div class="product-card glass"
     data-product-id="1"
     data-product-name="Classic Roses"
     data-product-price="45"
     data-product-emoji="🌹">
```

### Currency

The current implementation uses USD ($). To change currency:

1. Update price displays in `index.html`
2. Update the `currency` parameter in the payment processing code

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Glassmorphism effects require browsers that support `backdrop-filter`.

## Security Notes

- Never commit your production Square credentials to version control
- Always use environment variables or configuration files (excluded from git) for sensitive data
- Implement server-side payment processing for production use
- Use HTTPS in production to protect sensitive data

## Resources

- [Square Web Payments SDK Documentation](https://developer.squareup.com/docs/web-payments/overview)
- [Square API Reference](https://developer.squareup.com/reference/square)
- [Square Developer Dashboard](https://developer.squareup.com/apps)

## License

This project is open source and available for personal and commercial use.

## Support

For Square-specific issues, consult the [Square Developer Forum](https://developer.squareup.com/forums).
