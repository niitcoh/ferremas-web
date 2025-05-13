document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('register-form');
  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('password-confirm');
  const errorDiv = document.getElementById('error-message');
  
  // Verificar si ya está autenticado
  if (estaAutenticado()) {
    window.location.href = '/';
    return;
  }
  
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Limpiar mensaje de error anterior
    errorDiv.classList.add('d-none');
    
    // Validación básica del lado del cliente
    if (!nombreInput.value.trim()) {
      errorDiv.textContent = 'El nombre es obligatorio';
      errorDiv.classList.remove('d-none');
      return;
    }
    
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
    
    if (passwordInput.value !== passwordConfirmInput.value) {
      errorDiv.textContent = 'Las contraseñas no coinciden';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    const userData = {
      nombre: nombreInput.value,
      apellido: document.getElementById('apellido').value,
      rut: document.getElementById('rut').value,
      email: emailInput.value,
      telefono: document.getElementById('telefono').value,
      password: passwordInput.value,
      direccion: document.getElementById('direccion').value,
      comuna: document.getElementById('comuna').value,
      ciudad: document.getElementById('ciudad').value,
      region: document.getElementById('region').value
    };
    
    try {
      const data = await registrarUsuario(userData);
      // Redirigir al usuario a la página principal
      window.location.href = '/';
    } catch (error) {
      // Mostrar mensaje de error
      errorDiv.textContent = error.message || 'Error al registrar usuario';
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

// Ejecutar al cargar la página
verificarEstadoAPI();