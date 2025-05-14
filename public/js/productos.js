// public/js/productos.js
// Al usar el proxy, simplemente usamos una ruta relativa
const API_PRODUCTOS_URL = '/api';

// Función para obtener todas las categorías
async function obtenerCategorias() {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/categorias`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Recurso no encontrado. Verifique que la API esté configurada correctamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerCategorias:', error);
    throw error;
  }
}

// Función para obtener subcategorías por categoría
async function obtenerSubcategorias(categoriaId) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/categorias/${categoriaId}/subcategorias`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerSubcategorias:', error);
    throw error;
  }
}

// Función para obtener productos destacados
async function obtenerProductosDestacados(limit = 10) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/productos/destacados?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerProductosDestacados:', error);
    throw error;
  }
}

// Función para obtener productos nuevos
async function obtenerProductosNuevos(limit = 10) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/productos/nuevos?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerProductosNuevos:', error);
    throw error;
  }
}

// Función para obtener todos los productos
async function obtenerProductos(page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/productos?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerProductos:', error);
    throw error;
  }
}

// Función para obtener productos por categoría
async function obtenerProductosPorCategoria(categoriaId, page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/categorias/${categoriaId}/productos?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerProductosPorCategoria:', error);
    throw error;
  }
}

// Función para obtener productos por subcategoría
async function obtenerProductosPorSubcategoria(subcategoriaId, page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/subcategorias/${subcategoriaId}/productos?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerProductosPorSubcategoria:', error);
    throw error;
  }
}

// Función para obtener detalles de un producto
async function obtenerProducto(productoId) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/productos/${productoId}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerProducto:', error);
    throw error;
  }
}

// Función para obtener imágenes de un producto
async function obtenerImagenesProducto(productoId) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/productos/${productoId}/imagenes`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerImagenesProducto:', error);
    throw error;
  }
}

// NUEVA FUNCIÓN: Buscar imágenes por nombre de producto
async function buscarImagenesPorNombreProducto(query) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/imagenes/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al buscar imágenes por nombre:', error);
    throw error;
  }
}

// NUEVA FUNCIÓN: Obtener URL completa de la imagen
function getFullImageUrl(imagePath) {
  // Si ya es una URL completa (http:// o https://)
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }
  
  // Si es una ruta relativa, añadir el dominio base de la API
  if (imagePath && imagePath.startsWith('/')) {
    return `http://localhost:3001${imagePath}`;
  }
  
  // Si no es una URL ni una ruta, probablemente es un placeholder
  return imagePath;
}

// Función para obtener especificaciones de un producto
async function obtenerEspecificacionesProducto(productoId) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/productos/${productoId}/especificaciones`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerEspecificacionesProducto:', error);
    throw error;
  }
}

// Función para buscar productos
async function buscarProductos(termino, page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_PRODUCTOS_URL}/productos/buscar?q=${encodeURIComponent(termino)}&page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en buscarProductos:', error);
    throw error;
  }
}