
import express from 'express';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import Product from './models/Product.js';

const app = express();
const PORT = process.env.PORT || 10000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/broly69', {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur MongoDB :', err));

app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(session({ secret: 'broly69', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de sécurité
function checkAuth(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect('/admin/login');
}

// ROUTES
app.get('/', async (req, res) => {
  const produits = await Product.find().sort({ createdAt: -1 });
  res.render('index', { produits });
});

app.get('/admin', checkAuth, async (req, res) => {
  const produits = await Product.find().sort({ createdAt: -1 });
  res.render('admin', { produits });
});

app.get('/admin/login', (req, res) => {
  res.render('login');
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'broly69') {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.render('login', { error: 'Mot de passe incorrect' });
  }
});

app.post('/admin/add', checkAuth, async (req, res) => {
  const { name, description, prices } = req.body;
  let media = '';
  if (req.files && req.files.media) {
    const file = req.files.media;
    const fileName = Date.now() + '_' + file.name;
    const filePath = path.join(__dirname, 'uploads', fileName);
    await file.mv(filePath);
    media = '/uploads/' + fileName;
  }

  const priceArray = prices.split('\n').map(line => {
    const [label, value] = line.split(':');
    return { label: label.trim(), value: parseFloat(value) };
  });

  await Product.create({ name, description, media, prices: priceArray });
  res.redirect('/admin');
});

app.post('/admin/delete/:id', checkAuth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
