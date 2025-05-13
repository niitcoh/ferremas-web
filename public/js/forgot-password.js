document.addEventListener('DOMContentLoaded', function() {
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const emailInput = document.getElementById('email');
  const errorDiv = document.getElementById('error-message');
  const successDiv = document.getElementById('success-message');
  
  // Verificar si ya está autenticado
  if (estaAutenticado()) {
    window.location.href = '/';
    return;
  }
  
  forgotPasswordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Limpiar mensajes anteriores
    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');
    
    // Validación básica del lado del cliente
    if (!emailInput.value.trim()) {
      errorDiv.textContent = 'El correo electrónico es obligatorio';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailInput.value })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar solicitud');
      }
      
      // Mostrar mensaje de éxito
      successDiv.classList.remove('d-none');
      forgotPasswordForm.reset();
      
    } catch (error) {
      // Mostrar mensaje de error
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('d-none');
    }
  });
});