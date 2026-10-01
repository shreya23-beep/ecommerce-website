// ==========================================
// 1. SHOPPING CART (localStorage)
// ==========================================

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId, name, price) {
  const cart = getCart();
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, name, price, quantity: 1 });
  }
  saveCart(cart);
  alert(`Added "${name}" to cart!`);
}

function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
    countEl.innerText = total;
  }
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// ==========================================
// 2. AUTHENTICATION & NAV STATE
// ==========================================

async function checkAuthStatus() {
  try {
    const res = await fetch('/api/me');
    const data = await res.json();
    const authLink = document.getElementById('auth-link');
    
    if (authLink && data.user) {
      authLink.innerText = `Logout (${data.user.name})`;
      authLink.href = '#';
      authLink.onclick = async (e) => {
        e.preventDefault();
        await fetch('/api/logout', { method: 'POST' });
        window.location.reload();
      };
    }
  } catch (err) {
    console.error('Error checking auth:', err);
  }
}

let isLoginMode = true;
function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  const formTitle = document.getElementById('form-title');
  const nameGroup = document.getElementById('name-group');
  const submitBtn = document.getElementById('submit-btn');
  const toggleLink = document.getElementById('toggle-link');

  if (formTitle) formTitle.innerText = isLoginMode ? 'Login' : 'Register';
  if (nameGroup) nameGroup.style.display = isLoginMode ? 'none' : 'block';
  if (submitBtn) submitBtn.innerText = isLoginMode ? 'Login' : 'Register';
  if (toggleLink) {
    toggleLink.innerText = isLoginMode
      ? "Don't have an account? Register"
      : 'Already have an account? Login';
  }
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const nameInput = document.getElementById('name');
  const name = nameInput ? nameInput.value.trim() : '';

  const endpoint = isLoginMode ? '/api/login' : '/api/register';
  const payload = isLoginMode ? { email, password } : { name, email, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      if (!isLoginMode) {
        alert('Registered successfully! Please log in.');
        toggleAuthMode();
      } else {
        alert('Logged in successfully!');
        window.location.href = 'index.html';
      }
    } else {
      alert(data.error || 'Authentication failed');
    }
  } catch (err) {
    alert('Network error. Please try again.');
  }
}

// ==========================================
// 3. PRODUCT CATALOG & DETAILS
// ==========================================

async function loadProducts() {
  const listEl = document.getElementById('product-list');
  if (!listEl) return;

  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (!products || products.length === 0) {
      listEl.innerHTML = '<p>No products available right now.</p>';
      return;
    }

    listEl.innerHTML = products.map(p => `
      <div class="card">
        <img src="${p.image}" alt="${p.name}">
        <div class="card-body">
          <div>
            <h3>${p.name}</h3>
            <p class="price">$${p.price.toFixed(2)}</p>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            <a href="product.html?id=${p.id}" class="btn btn-secondary" style="flex: 1;">Details</a>
            <button class="btn" style="flex: 1;" onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price})">Add</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    listEl.innerHTML = '<p>Failed to load products.</p>';
  }
}

async function loadProductDetails() {
  const container = document.getElementById('product-details');
  if (!container) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    container.innerHTML = '<p style="padding: 1.5rem;">Product ID is missing.</p>';
    return;
  }

  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) {
      container.innerHTML = '<p style="padding: 1.5rem;">Product not found.</p>';
      return;
    }
    const product = await res.json();

    container.innerHTML = `
      <img src="${product.image}" alt="${product.name}" style="width: 100%; max-height: 350px; object-fit: cover;">
      <div class="card-body">
        <h2>${product.name}</h2>
        <p style="margin: 1rem 0; color: #555; line-height: 1.5;">${product.description}</p>
        <div class="price">$${product.price.toFixed(2)}</div>
        <button class="btn" style="width: 100%; padding: 0.75rem;" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price})">Add to Cart</button>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<p style="padding: 1.5rem;">Error loading product details.</p>';
  }
}

// ==========================================
// 4. CART DISPLAY & CHECKOUT
// ==========================================

function renderCart() {
  const tbody = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!tbody) return;

  const cart = getCart();
  let total = 0;

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">Your cart is currently empty.</td></tr>`;
    if (totalEl) totalEl.innerText = 'Total: $0.00';
    return;
  }

  tbody.innerHTML = cart.map((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    return `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>$${item.price.toFixed(2)}</td>
        <td>${item.quantity}</td>
        <td>$${subtotal.toFixed(2)}</td>
        <td><button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;" onclick="removeFromCart(${index})">Remove</button></td>
      </tr>
    `;
  }).join('');

  if (totalEl) {
    totalEl.innerText = `Total: $${total.toFixed(2)}`;
  }
}

async function checkout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty. Add items before checking out.');
    return;
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });

    if (res.status === 401) {
      alert('Please log in before placing an order.');
      window.location.href = 'auth.html';
      return;
    }

    const data = await res.json();
    if (res.ok) {
      alert(`Success! Order #${data.orderId} placed.`);
      localStorage.removeItem('cart');
      window.location.href = 'orders.html';
    } else {
      alert(data.error || 'Failed to place order');
    }
  } catch (err) {
    alert('Network error during checkout.');
  }
}

// ==========================================
// 5. ORDER HISTORY
// ==========================================

async function loadUserOrders() {
  const container = document.getElementById('orders-container');
  if (!container) return;

  try {
    const res = await fetch('/api/my-orders');
    if (res.status === 401) {
      container.innerHTML = `
        <div class="card" style="padding: 2rem; text-align: center;">
          <p>Please <a href="auth.html" style="color: #2563eb; font-weight: bold;">log in</a> to view your past orders.</p>
        </div>`;
      return;
    }

    const orders = await res.json();
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="card" style="padding: 2rem; text-align: center;">
          <p>You haven't placed any orders yet.</p>
          <a href="index.html" class="btn" style="margin-top: 1rem;">Browse Products</a>
        </div>`;
      return;
    }

    let html = '';
    for (const order of orders) {
      const detailRes = await fetch(`/api/orders/${order.id}`);
      const detailData = await detailRes.json();
      const date = new Date(order.created_at).toLocaleString();

      html += `
        <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 0.75rem; margin-bottom: 1rem;">
            <div>
              <h3 style="margin-bottom: 0.3rem;">Order #${order.id}</h3>
              <small style="color: #666;">Placed on: ${date}</small>
            </div>
            <div style="text-align: right;">
              <span class="price" style="margin: 0; font-size: 1.3rem;">$${order.total_price.toFixed(2)}</span>
            </div>
          </div>

          <table style="margin-top: 0.5rem;">
            <thead>
              <tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              ${detailData.items.map(item => `
                <tr>
                  <td>${item.name}</td>                   <td>$${item.price.toFixed(2)}</td>
                  <td>${item.quantity}</td>                   <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p>Error loading orders.</p>';
  }
}