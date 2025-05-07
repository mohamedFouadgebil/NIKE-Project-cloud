const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Log in.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/myAppDB')
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.log('❌ MongoDB connection error: ', err));

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    image: String,
    category: String
});
const Product = mongoose.model('Product', ProductSchema);

const InvoiceSchema = new mongoose.Schema({
    items: [{
        name: String,
        price: String,
        description: String,
        img: String
    }],
    total: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Invoice = mongoose.model('Invoice', InvoiceSchema);

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const newUser = new User({ email, password });
    await newUser.save();
    res.json({ success: true, message: 'User created' });
});

app.post('/api/invoices', async (req, res) => {
    try {
        const { items, total } = req.body;
        const newInvoice = new Invoice({ items, total });
        await newInvoice.save();
        res.json({ success: true, invoice: newInvoice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving invoice' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        const newProduct = new Product({ name, description, price, image, category });
        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ error: 'Error saving product' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: 'Error updating product' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
