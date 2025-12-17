# ShopEasy - E-commerce Website

A complete responsive e-commerce front-end built with HTML5, CSS3, Bootstrap 5, and vanilla JavaScript. This project mimics Amazon's layout and color theme with a modern, user-friendly interface.

## 🚀 Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Product Catalog**: Browse products across 4 categories (Electronics, Books, Fashion, Home)
- **Shopping Cart**: Add, remove, and update cart items with localStorage persistence
- **Checkout Flow**: Multi-step checkout with form validation
- **Mock Payment**: Secure payment simulation with multiple payment methods
- **Order Management**: Order confirmation with downloadable invoices
- **Search & Filters**: Product search and filtering by category, price, and brand
- **User-Friendly UI**: Amazon-inspired design with clean, modern aesthetics

## 📁 Project Structure

```
ecommerce-site/
├── index.html                # Home page
├── shop.html                 # Shop / Category listing
├── product.html              # Single product detail page
├── about.html                # About page
├── cart.html                 # Shopping cart page
├── checkout.html             # Checkout process
├── payment.html              # Payment selection & processing
├── order-confirm.html        # Order confirmation
├── assets/
│   ├── css/
│   │   └── styles.css       # Custom CSS with Amazon-like theme
│   ├── js/
│   │   └── app.js           # Client-side logic and cart management
│   ├── images/
│   │   └── placeholders/    # Product images (placeholder URLs)
│   └── data/
│       └── products.json    # Product dataset (24+ products)
├── components/
│   ├── header.html          # Navigation header
│   └── footer.html          # Site footer
├── README.md
└── LICENSE
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom styling with CSS Grid and Flexbox
- **Bootstrap 5**: Responsive framework and components
- **JavaScript (ES6+)**: Vanilla JS for all functionality
- **Font Awesome**: Icons and visual elements
- **Local Storage**: Cart and order persistence

## 🎨 Design Theme

- **Primary Color**: #FF9900 (Amazon Orange)
- **Dark Text**: #111827 (Nearly Black)
- **Background**: #F3F4F6 (Light Gray)
- **Borders**: #E5E7EB (Medium Gray)
- **Font**: Arial, Helvetica, sans-serif (Bootstrap default)

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. **Clone or Download** the project files to your local machine
2. **Open** `index.html` in your web browser
3. **Start Shopping!** The site is fully functional with mock data

### Quick Start

```bash
# Navigate to the project directory
cd ecommerce-site

# Open index.html in your default browser
# On Windows:
start index.html

# On macOS:
open index.html

# On Linux:
xdg-open index.html
```

## 📱 Pages Overview

### 🏠 Home Page (`index.html`)
- Hero banner with call-to-action
- Category shortcuts (Electronics, Books, Fashion, Home)
- Featured products grid
- Newsletter signup
- Company highlights

### 🛍️ Shop Page (`shop.html`)
- Product grid with filtering options
- Sidebar filters (category, price, brand)
- Sort options (price, rating, newest)
- Responsive product cards
- Search functionality

### 📦 Product Page (`product.html`)
- Large product image gallery
- Product details and specifications
- Customer reviews section
- Add to cart and buy now buttons
- Related product tabs

### 🛒 Cart Page (`cart.html`)
- Cart item management
- Quantity updates
- Coupon code application
- Order summary with totals
- Proceed to checkout

### 💳 Checkout Page (`checkout.html`)
- Multi-step checkout process
- Shipping address form
- Delivery method selection
- Order review and validation
- Progress indicator

### 💰 Payment Page (`payment.html`)
- Multiple payment methods
- Credit card form (mock validation)
- Secure payment simulation
- Order confirmation redirect

### ✅ Order Confirmation (`order-confirm.html`)
- Order details and summary
- Tracking information
- Downloadable invoice
- Continue shopping options

## 🛠️ Key Features

### Cart Management
- Add/remove products
- Update quantities
- Persistent storage (localStorage)
- Real-time badge updates
- Cart total calculations

### Product Filtering
- Category filtering
- Price range slider
- Brand selection
- Sort by price, rating, newest
- Search functionality

### Checkout Process
- Multi-step form validation
- Shipping address collection
- Delivery method selection
- Order summary
- Mock payment processing

### Responsive Design
- Mobile-first approach
- Bootstrap grid system
- Touch-friendly interface
- Optimized for all screen sizes

## 🎯 Functionality

### Shopping Cart
```javascript
// Add product to cart
addToCart(productId, quantity);

// Remove product from cart
removeFromCart(productId);

// Update cart quantity
updateCartQuantity(productId, newQuantity);

// Clear entire cart
clearCart();
```

### Product Management
```javascript
// Load products from JSON
loadProducts();

// Filter products
getFilteredProducts();

// Search products
performSearch(searchTerm);
```

### Order Processing
```javascript
// Create new order
createOrder(paymentMethod);

// Save order to localStorage
saveOrder(order);

// Process payment (mock)
processPayment();
```

## 🔧 Customization

### Adding New Products
Edit `assets/data/products.json` to add new products:

```json
{
  "id": "prod_025",
  "title": "New Product Name",
  "category": "Electronics",
  "brand": "Brand Name",
  "price": 99.99,
  "rating": 4.5,
  "stock": 50,
  "images": ["assets/images/placeholders/prod25a.jpg"],
  "description": "Product description...",
  "specs": {"key": "value"}
}
```

### Modifying Theme Colors
Update CSS variables in `assets/css/styles.css`:

```css
:root {
  --primary-color: #FF9900;    /* Main accent color */
  --dark-color: #111827;       /* Text color */
  --light-gray: #F3F4F6;       /* Background color */
  --medium-gray: #E5E7EB;      /* Border color */
}
```

### Adding New Categories
1. Add category to products.json
2. Update category filters in shop.html
3. Add category shortcuts in index.html

## 🧪 Testing

### Browser Testing
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Device Testing
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

### Feature Testing
- ✅ Product browsing and filtering
- ✅ Add to cart functionality
- ✅ Checkout process
- ✅ Payment simulation
- ✅ Order confirmation
- ✅ Responsive design

## 🔒 Security Notes

- **No Real Payment Processing**: All payments are simulated
- **No Sensitive Data Storage**: No real card details are stored
- **Client-Side Only**: No backend server required
- **Local Storage**: Cart and orders stored locally only

## 🚀 Deployment

### Static Hosting
This is a static website that can be deployed to:
- **GitHub Pages**
- **Netlify**
- **Vercel**
- **AWS S3**
- **Any web server**

### Deployment Steps
1. Upload all files to your web server
2. Ensure `index.html` is in the root directory
3. Configure your server to serve static files
4. Test all functionality in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bootstrap team for the responsive framework
- Font Awesome for the icon library
- Amazon for design inspiration
- All contributors and testers

## 📞 Support

For support, email support@shopeasy.com or create an issue in the repository.

---

**Built with ❤️ for the e-commerce community**

