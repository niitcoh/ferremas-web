// productos.js - Funciones para consumir la API de productos
// Url de la API (actualizada al puerto 3001)
const API_URL = 'http://localhost:3001/api';

// Función para manejar errores de fetch
const handleFetchError = (response) => {
  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Función para obtener todas las categorías
async function obtenerCategorias() {
  try {
    console.log('Obteniendo categorías desde:', `${API_URL}/categorias`);
    const response = await fetch(`${API_URL}/categorias`);
    return handleFetchError(response);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
}

// Función para obtener productos con paginación
async function obtenerProductos(page = 1, limit = 12) {
  try {
    console.log(`Obteniendo productos página ${page} desde:`, `${API_URL}/productos?page=${page}&limit=${limit}`);
    const response = await fetch(`${API_URL}/productos?page=${page}&limit=${limit}`);
    return handleFetchError(response);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
}

// Función para obtener un producto por su ID
async function obtenerProductoPorId(id) {
  try {
    const response = await fetch(`${API_URL}/productos/${id}`);
    return handleFetchError(response);
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error);
    throw error;
  }
}

// Función para obtener las imágenes de un producto
async function obtenerImagenesProducto(productoId) {
  try {
    console.log(`Obteniendo imágenes del producto ${productoId} desde:`, `${API_URL}/productos/${productoId}/imagenes`);
    const response = await fetch(`${API_URL}/productos/${productoId}/imagenes`);
    return handleFetchError(response);
  } catch (error) {
    console.error(`Error al obtener imágenes del producto ${productoId}:`, error);
    throw error;
  }
}

function getFullImageUrl(imagen, producto) {
  // Usar el mapeador de imágenes si está disponible
  if (window.imagenMapper) {
    return imagenMapper.getImageUrl(imagen, producto);
  }
  
  // Implementación de respaldo para cuando el mapeador no esté disponible
  
  // Si recibimos un objeto imagen completo
  if (imagen && typeof imagen === 'object') {
    // Si tiene url, usarla
    if (imagen.url) {
      return getFullImageUrl(imagen.url, producto);
    }
    // Si no tiene ninguna URL, usar un placeholder
    return `https://placehold.co/300x200/007bff/white?text=${encodeURIComponent('Producto')}`;
  }
  
  // Si la URL es nula o vacía, devolver un placeholder
  if (!imagen) {
    const categoriaTexto = producto && producto.categoria_id ? `Cat ${producto.categoria_id}` : 'Producto';
    return `https://placehold.co/300x200/007bff/white?text=${encodeURIComponent(categoriaTexto)}`;
  }
  
  // Si ya es una URL completa, devolverla tal cual
  if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
    return imagen;
  }
  
  // Obtener solo el nombre del archivo
  const nombreArchivo = imagen.split('/').pop().split('\\').pop();
  
  // Crear un placeholder con el nombre del producto o archivo
  const textoProducto = producto && producto.nombre ? producto.nombre : nombreArchivo;
  return `https://placehold.co/300x200/007bff/white?text=${encodeURIComponent(textoProducto)}`;
}


// Función para obtener productos por categoría
async function obtenerProductosPorCategoria(categoriaId, page = 1, limit = 12) {
  try {
    const response = await fetch(`${API_URL}/categorias/${categoriaId}/productos?page=${page}&limit=${limit}`);
    return handleFetchError(response);
  } catch (error) {
    console.error(`Error al obtener productos de la categoría ${categoriaId}:`, error);
    throw error;
  }
}

// Función para obtener productos destacados
async function obtenerProductosDestacados(limit = 10) {
  try {
    const response = await fetch(`${API_URL}/productos/destacados?limit=${limit}`);
    return handleFetchError(response);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    throw error;
  }
}

// Función para obtener productos nuevos
async function obtenerProductosNuevos(limit = 10) {
  try {
    const response = await fetch(`${API_URL}/productos/nuevos?limit=${limit}`);
    return handleFetchError(response);
  } catch (error) {
    console.error('Error al obtener productos nuevos:', error);
    throw error;
  }
}

// Función para buscar productos
async function buscarProductos(query, page = 1, limit = 12) {
  try {
    const response = await fetch(`${API_URL}/productos/buscar?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return handleFetchError(response);
  } catch (error) {
    console.error('Error al buscar productos:', error);
    throw error;
  }
}

// Función para agregar un producto al carrito
function agregarAlCarrito(id, nombre, precio, imagen) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Verificar si el producto ya está en el carrito
  const productoExistente = carrito.find(item => item.id === id);
  
  if (productoExistente) {
    // Incrementar cantidad si ya existe
    productoExistente.cantidad += 1;
  } else {
    // Agregar nuevo producto al carrito
    carrito.push({
      id,
      nombre,
      precio,
      imagen,
      cantidad: 1
    });
  }
  
  // Guardar carrito actualizado
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Mostrar notificación
  mostrarNotificacion(`${nombre} añadido al carrito`);
  
  // Actualizar contador del carrito
  actualizarContadorCarrito();
}

// Función para mostrar notificación 
function mostrarNotificacion(mensaje) {
  // Verificar si Bootstrap está disponible
  if (typeof bootstrap !== 'undefined') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'toast align-items-center text-white bg-success';
    notificacion.setAttribute('role', 'alert');
    notificacion.setAttribute('aria-live', 'assertive');
    notificacion.setAttribute('aria-atomic', 'true');
    notificacion.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${mensaje}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    // Crear contenedor si no existe
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Agregar notificación al contenedor
    toastContainer.appendChild(notificacion);
    
    // Mostrar notificación
    const toast = new bootstrap.Toast(notificacion);
    toast.show();
    
    // Eliminar notificación después de ocultarse
    notificacion.addEventListener('hidden.bs.toast', function() {
      notificacion.remove();
    });
  } else {
    // Si Bootstrap no está disponible, usar alert
    alert(mensaje);
  }
}

// Función para actualizar contador de carrito
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
  
  const cartLink = document.getElementById('cart-link');
  if (cartLink) {
    cartLink.innerHTML = `<i class="fas fa-shopping-cart me-1"></i> Carrito ${totalItems > 0 ? `(${totalItems})` : ''}`;
  }
}