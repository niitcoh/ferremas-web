document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('error-message');
  
  // Verificar si ya está autenticado
  if (estaAutenticado()) {
    window.location.href = '/';
    return;
  }
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Limpiar mensaje de error anterior
    errorDiv.classList.add('d-none');
    
    // Validación básica del lado del cliente
    if (!emailInput.value.trim()) {
      errorDiv.textContent = 'El correo electrónico es obligatorio';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    if (!passwordInput.value) {
      errorDiv.textContent = 'La contraseña es obligatoria';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    try {
      const data = await iniciarSesion({ 
        email: emailInput.value, 
        password: passwordInput.value 
      });
      // Redirigir al usuario a la página principal
      window.location.href = '/';
    } catch (error) {
      // Mostrar mensaje de error
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('d-none');
    }
  });
});

async function verificarEstadoAPI() {
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('✅ API funcionando correctamente');
      const data = await response.json();
      console.log('Información de la API:', data);
    } else {
      console.error('❌ API responde pero con error:', response.status);
    }
  } catch (error) {
    console.error('❌ Error al conectar con la API:', error);
  }
}

verificarEstadoAPI();