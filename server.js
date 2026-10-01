const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const JWT_SECRET = 'super_secret_jwt_key_123';

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Middleware: Authenticate user via JWT in cookies
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized. Please login.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session.' });
    req.user = user;
    next();
  });
}

// --- Auth Routes ---
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword],
    function (err) {
      if (err) return res.status(400).json({ error: 'Email already exists.' });
      res.status(201).json({ message: 'User registered successfully.' });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Logged in successfully', user: { id: user.id, name: user.name } });
  });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully.' });
});

app.get('/api/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ user: null });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.json({ user: null });
    res.json({ user });
  });
});

// --- Product Routes ---
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Product not found.' });
    res.json(row);
  });
});

// --- Order Routes ---
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty.' });

  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  db.run(
    'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
    [req.user.id, totalPrice],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const orderId = this.lastID;

      const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        stmt.run(orderId, item.productId, item.quantity, item.price);
      }
      stmt.finalize();

      res.status(201).json({ message: 'Order placed successfully', orderId });
    }
  );
});

// --- Order History Routes ---
app.get('/api/my-orders', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const orderId = req.params.id;

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, req.user.id],
    (err, order) => {
      if (err || !order) return res.status(404).json({ error: 'Order not found.' });

      db.all(
        `SELECT oi.id, oi.quantity, oi.price, p.name, p.image 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId],
        (err, items) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ order, items });
        }
      );
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));