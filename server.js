// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Configuraciones básicas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANTE: Configurar el directorio estático con la ruta completa correcta
app.use(express.static(path.join(__dirname, 'public')));

// Ruta específica para imágenes de productos
app.use('/img/productos', express.static(path.join(__dirname, 'public', 'img', 'productos')));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Manejar todas las rutas de la aplicación frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
  console.log(`Ruta estática: ${path.join(__dirname, 'public')}`);
  console.log(`Ruta de imágenes: ${path.join(__dirname, 'public', 'img', 'productos')}`);
});