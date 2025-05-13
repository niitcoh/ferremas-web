document.addEventListener('DOMContentLoaded', function() {
  const resetPasswordForm = document.getElementById('reset-password-form');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const errorDiv = document.getElementById('error-message');
  const successDiv = document.getElementById('success-message');
  const tokenInput = document.getElementById('token');
  
  // Obtener token de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (!token) {
    errorDiv.textContent = 'Token no proporcionado. Por favor, utiliza el enlace que se te envió por correo electrónico.';
    errorDiv.classList.remove('d-none');
    resetPasswordForm.style.display = 'none';
    return;
  }
  
  tokenInput.value = token;
  
  resetPasswordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Limpiar mensajes anteriores
    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');
    
    // Validación básica del lado del cliente
    if (!newPasswordInput.value) {
      errorDiv.textContent = 'La nueva contraseña es obligatoria';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    if (newPasswordInput.value !== confirmPasswordInput.value) {
      errorDiv.textContent = 'Las contraseñas no coinciden';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: tokenInput.value,
          newPassword: newPasswordInput.value
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña');
      }
      
      // Mostrar mensaje de éxito
      successDiv.classList.remove('d-none');
      resetPasswordForm.style.display = 'none';
      
    } catch (error) {
      // Mostrar mensaje de error
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('d-none');
    }
  });
});