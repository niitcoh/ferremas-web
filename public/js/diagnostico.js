async function probarConexionAPI() {
  const endpoints = [
    '/api',
    '/api/categorias',
    '/api/productos',
    '/productos'
  ];
  
  const resultados = document.getElementById('diagnostico-resultados');
  resultados.innerHTML = '<h3>Probando conexiones a la API...</h3>';
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const status = response.status;
      let message = '';
      
      try {
        const data = await response.json();
        message = `Respuesta: ${JSON.stringify(data).substring(0, 100)}...`;
      } catch (e) {
        message = 'No se pudo parsear la respuesta como JSON';
      }
      
      resultados.innerHTML += `<div class="${response.ok ? 'alert alert-success' : 'alert alert-danger'}">
        <strong>${endpoint}</strong>: ${status} ${response.statusText}<br>
        ${message}
      </div>`;
    } catch (error) {
      resultados.innerHTML += `<div class="alert alert-danger">
        <strong>${endpoint}</strong>: Error - ${error.message}
      </div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const botonProbar = document.getElementById('boton-probar-api');
  if (botonProbar) {
    botonProbar.addEventListener('click', probarConexionAPI);
  }
});