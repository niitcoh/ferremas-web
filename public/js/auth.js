const API_URL = 'http://localhost:3003/api'; // URL base de la API de usuarios

// Función para registrar un nuevo usuario
async function registrarUsuario(userData) {
  try {
    console.log('Enviando datos de registro:', userData);
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar usuario');
    }
    
    // Guardar token en localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.usuario));
    
    return data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
}

// Función para iniciar sesión
async function iniciarSesion(credentials) {
  try {
    console.log('Iniciando sesión con:', credentials.email);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Credenciales inválidas');
    }
    
    // Guardar token en localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.usuario));
    
    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = '/';
}

// Función para verificar si el usuario está autenticado
function estaAutenticado() {
  const token = localStorage.getItem('authToken');
  return !!token;
}

// Función para obtener datos del usuario en sesión
function getUsuarioActual() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

// Función para actualizar perfil de usuario
async function actualizarPerfil(userId, userData) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_URL}/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar perfil');
    }
    
    // Actualizar datos en localStorage
    const currentUser = JSON.parse(localStorage.getItem('userData'));
    const updatedUser = {...currentUser, ...userData};
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    
    return data;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
}

// Función para validar el token
async function validarToken() {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return false;
    }
    
    const response = await fetch(`${API_URL}/auth/validate-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      cerrarSesion();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error al validar token:', error);
    cerrarSesion();
    return false;
  }
}