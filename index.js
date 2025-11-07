const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CART_FILE = path.join(DATA_DIR, 'cart.json');

// Initialize products if missing
if (!fs.existsSync(PRODUCTS_FILE)) {
  const products = [
    { id: 'p1', name: 'Basic Tee', price: 199.00 },
    { id: 'p2', name: 'Denim Jacket', price: 1299.00 },
    { id: 'p3', name: 'Running Shoes', price: 2499.00 },
    { id: 'p4', name: 'Sunglasses', price: 499.00 },
    { id: 'p5', name: 'Wrist Watch', price: 3499.00 }
  ];
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// Initialize cart if missing
if (!fs.existsSync(CART_FILE)) {
  fs.writeFileSync(CART_FILE, JSON.stringify({ items: [] }, null, 2));
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  res.json(products);
});

app.get('/api/cart', (req, res) => {
  const cart = readJSON(CART_FILE);
  const products = readJSON(PRODUCTS_FILE);
  // enrich items with product info
  const items = cart.items.map(ci => {
    const p = products.find(x => x.id === ci.productId);
    return {
      id: ci.id,
      productId: ci.productId,
      name: p ? p.name : 'Unknown',
      price: p ? p.price : 0,
      qty: ci.qty
    };
  });
  const total = items.reduce((s,i)=> s + (i.price * i.qty), 0);
  res.json({ items, total });
});

app.post('/api/cart', (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || !qty) return res.status(400).json({ error: 'productId and qty required' });
  const cart = readJSON(CART_FILE);
  const item = { id: uuidv4(), productId, qty: Number(qty) };
  cart.items.push(item);
  writeJSON(CART_FILE, cart);
  res.json({ success: true, item });
});

app.delete('/api/cart/:id', (req, res) => {
  const id = req.params.id;
  const cart = readJSON(CART_FILE);
  const before = cart.items.length;
  cart.items = cart.items.filter(i => i.id !== id);
  writeJSON(CART_FILE, cart);
  res.json({ success: true, removed: before - cart.items.length });
});

app.post('/api/checkout', (req, res) => {
  const { cartItems, name, email } = req.body;
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'cartItems required' });
  }
  const products = readJSON(PRODUCTS_FILE);
  let total = 0;
  const items = cartItems.map(ci => {
    const p = products.find(x=> x.id === ci.productId) || { name: 'Unknown', price: 0 };
    const lineTotal = (p.price || 0) * (ci.qty || 0);
    total += lineTotal;
    return { productId: ci.productId, name: p.name, price: p.price, qty: ci.qty, lineTotal };
  });
  const receipt = {
    id: uuidv4(),
    name: name || null,
    email: email || null,
    items,
    total,
    timestamp: new Date().toISOString()
  };
  // clear cart
  writeJSON(CART_FILE, { items: [] });
  res.json({ success: true, receipt });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
