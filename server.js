import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import Product from './models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connecté à MongoDB"))
.catch(err => console.error("Erreur MongoDB :", err));

app.get('/api/products', async (req, res) => {
  const produits = await Product.find().sort({ createdAt: -1 });
  res.json(produits);
});

app.post('/api/admin/products', async (req, res) => {
  try {
    const { name, description, prices, password } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Mot de passe invalide" });
    }

    const parsedPrices = JSON.parse(prices || "[]");
    let media = '';

    if (req.files?.media) {
      const file = req.files.media;
      const filePath = path.join(__dirname, 'uploads', `${Date.now()}_${file.name}`);
      await file.mv(filePath);
      media = '/uploads/' + path.basename(filePath);
    }

    const nouveauProduit = new Product({ name, description, prices: parsedPrices, media });
    await nouveauProduit.save();
    res.json(nouveauProduit);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
