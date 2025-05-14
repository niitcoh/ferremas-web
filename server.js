const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000; // Frontend en puerto 3000

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración del proxy para la API de productos
app.use('/api', createProxyMiddleware({ 
  target: 'http://localhost:3001', 
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // Reescribir /api a / en la ruta de destino
  },
  // Logging adicional para depuración
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxy: ${req.method} ${req.path} -> ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Error de proxy:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error de conexión con la API', details: err.message });
    }
  }
}));

// Servir archivos estáticos después de la configuración del proxy
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para las páginas de autenticación y usuarios
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'profile.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'reset-password.html'));
});

// Rutas para las páginas de productos y catálogo
app.get('/productos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'productos.html'));
});

app.get('/categoria/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'categoria.html'));
});

app.get('/producto/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'producto.html'));
});

app.get('/buscar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'buscar.html'));
});

app.get('/ofertas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'ofertas.html'));
});

// Rutas utilitarias
app.get('/diagnostico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'diagnostico.html'));
});

app.get('/carrito', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'carrito.html'));
});

app.get('/contacto', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'contacto.html'));
});

app.get('/diagnostico-api', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'diagnostico-api.html'));
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/js/') && !req.path.startsWith('/css/') && !req.path.startsWith('/img/')) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'pages', '404.html'));
  }
  next();
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor frontend corriendo en http://localhost:${port}`);
  console.log(`Proxy configurado para API: http://localhost:3001/api -> http://localhost:${port}/api`);
});