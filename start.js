const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ruta de la API de productos (ajusta esto a la ubicación real)
const apiProductosPath = path.join(__dirname, '../api-productos/index.js');
const apiProductosExists = fs.existsSync(apiProductosPath);

// Iniciar API de productos si existe
if (apiProductosExists) {
  console.log('Iniciando API de productos...');
  const apiProductosProcess = spawn('node', [apiProductosPath], { 
    stdio: 'inherit',
    env: { ...process.env, PORT: 3001 }
  });

  apiProductosProcess.on('error', (error) => {
    console.error('Error en el proceso de la API de productos:', error);
  });
} else {
  console.log('⚠️ La API de productos no está configurada o no se encuentra en la ruta esperada.');
}

// Iniciar el frontend
console.log('Iniciando servidor frontend...');
const frontendProcess = spawn('node', [path.join(__dirname, 'server.js')], { 
  stdio: 'inherit',
  env: { ...process.env, PORT: 3000 }
});

frontendProcess.on('error', (error) => {
  console.error('Error en el proceso del frontend:', error);
});

// Manejo de cierre limpio
process.on('SIGINT', () => {
  if (apiProductosExists) {
    apiProductosProcess.kill();
  }
  frontendProcess.kill();
  process.exit();
});