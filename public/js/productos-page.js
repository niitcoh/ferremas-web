// Script que maneja la página de productos
document.addEventListener('DOMContentLoaded', async function() {
  // Configurar manejo de errores global
  window.addEventListener('error', function(e) {
    console.error('Error en la página:', e.message);
    mostrarErrorGeneral('Ha ocurrido un error en la página. Por favor, intenta nuevamente.');
  });

  try {
    console.log('Inicializando página de productos...');
    
    // Verificar que los elementos DOM necesarios existen
    const elementosRequeridos = [
      'productos-container',
      'loading',
      'no-products',
      'pagination'
    ];
    
    for (const id of elementosRequeridos) {
      if (!document.getElementById(id)) {
        console.warn(`Elemento ${id} no encontrado en el DOM`);
      }
    }
    
    // Verificar autenticación para mostrar el menú de usuario adecuado
    if (window.estaAutenticado && typeof estaAutenticado === 'function' && estaAutenticado()) {
      const usuario = getUsuarioActual();
      
      // Actualizar nombre de usuario
      const userNameElement = document.getElementById('user-name');
      if (userNameElement && usuario) {
        userNameElement.textContent = usuario.nombre;
      }
      
      // Mostrar dropdown de usuario y ocultar enlace de login
      const loginItem = document.getElementById('login-item');
      const userDropdown = document.getElementById('user-dropdown');
      
      if (loginItem) loginItem.classList.add('d-none');
      if (userDropdown) userDropdown.classList.remove('d-none');
      
      // Configurar evento de logout
      const logoutLink = document.getElementById('logout-link');
      if (logoutLink && typeof cerrarSesion === 'function') {
        logoutLink.addEventListener('click', function(e) {
          e.preventDefault();
          cerrarSesion();
        });
      }
    }
    
    // Cargar categorías
    await cargarCategorias().catch(error => {
      console.error('Error al cargar categorías:', error);
      mostrarErrorCategorias('No se pudieron cargar las categorías');
    });
    
    // Cargar productos (primera página)
    await cargarProductos(1).catch(error => {
      console.error('Error al cargar productos:', error);
      const loadingElement = document.getElementById('loading');
      const noProductsElement = document.getElementById('no-products');
      
      if (loadingElement) loadingElement.classList.add('d-none');
      if (noProductsElement) {
        noProductsElement.classList.remove('d-none');
        const mensajeElement = noProductsElement.querySelector('p');
        if (mensajeElement) {
          mensajeElement.textContent = 'Error al cargar productos. Intente nuevamente.';
        }
      }
    });
    
    // Configurar búsqueda
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    
    if (searchButton && searchInput) {
      searchButton.addEventListener('click', function() {
        const termino = searchInput.value.trim();
        if (termino) {
          window.location.href = `/buscar?q=${encodeURIComponent(termino)}`;
        }
      });
      
      // Permitir búsqueda también presionando Enter
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && searchButton) {
          searchButton.click();
        }
      });
    }
    
    // Configurar ordenamiento
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', function() {
        const currentPage = new URLSearchParams(window.location.search).get('page') || 1;
        cargarProductos(parseInt(currentPage));
      });
    }

    // Verificar si hay parámetros de página en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      cargarProductos(parseInt(pageParam));
    }
  } catch (error) {
    console.error('Error al inicializar la página de productos:', error);
    mostrarErrorGeneral('No se pudo cargar la página de productos. Por favor, intenta nuevamente más tarde.');
  }
});

// Función para cargar categorías
async function cargarCategorias() {
  try {
    console.log('Cargando categorías...');
    const categorias = await obtenerCategorias();
    console.log('Categorías obtenidas:', categorias);
    
    // Verificar que tenemos categorías válidas
    if (!Array.isArray(categorias)) {
      throw new Error('La API no devolvió un array de categorías');
    }
    
    // Llenar menú de categorías en navbar
    const menuCategorias = document.getElementById('categorias-menu');
    if (!menuCategorias) {
      console.warn('Elemento categorias-menu no encontrado');
      return;
    }
    
    // Encontrar el divisor para saber dónde insertar las categorías
    const divider = menuCategorias.querySelector('hr');
    let dividerParent = divider ? divider.parentElement : null;
    
    // Si no hay divisor, intentar encontrar el elemento "Ver todos los productos"
    if (!dividerParent) {
      const verTodosLink = Array.from(menuCategorias.querySelectorAll('a')).find(
        a => a.textContent.includes('Ver todos los productos')
      );
      
      if (verTodosLink) {
        dividerParent = verTodosLink.parentElement;
      } else {
        // Si no hay divisor ni enlace "Ver todos", simplemente limpiar el menú
        menuCategorias.innerHTML = '';
      }
    }
    
    // Limpiar categorías existentes manteniendo el divisor
    if (dividerParent) {
      // Eliminar todos los elementos antes del divisor
      while (menuCategorias.firstChild && menuCategorias.firstChild !== dividerParent) {
        menuCategorias.removeChild(menuCategorias.firstChild);
      }
    }
    
    // Agregar nuevas categorías
    categorias.forEach(categoria => {
      // Verificar que la categoría tiene los datos necesarios
      if (!categoria || !categoria.nombre) {
        console.warn('Categoría inválida:', categoria);
        return;
      }
      
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dropdown-item';
      a.href = `/categoria/${categoria.slug || categoria.id}`;
      a.textContent = categoria.nombre;
      li.appendChild(a);
      
      if (dividerParent) {
        menuCategorias.insertBefore(li, dividerParent);
      } else {
        menuCategorias.appendChild(li);
      }
    });
    
    // Si no había divisor ni enlace "Ver todos", añadirlos ahora
    if (!dividerParent) {
      // Añadir divisor
      const dividerLi = document.createElement('li');
      dividerLi.innerHTML = '<hr class="dropdown-divider">';
      menuCategorias.appendChild(dividerLi);
      
      // Añadir enlace "Ver todos"
      const verTodosLi = document.createElement('li');
      const verTodosA = document.createElement('a');
      verTodosA.className = 'dropdown-item';
      verTodosA.href = '/productos';
      verTodosA.textContent = 'Ver todos los productos';
      verTodosLi.appendChild(verTodosA);
      menuCategorias.appendChild(verTodosLi);
    }
    
    // Llenar categorías en el footer
    const footerCategorias = document.getElementById('footer-categorias');
    if (footerCategorias) {
      footerCategorias.innerHTML = '';
      
      const categoriasAMostrar = categorias.slice(0, 4);
      categoriasAMostrar.forEach(categoria => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `/categoria/${categoria.slug || categoria.id}`;
        a.className = 'text-muted';
        a.textContent = categoria.nombre;
        li.appendChild(a);
        footerCategorias.appendChild(li);
      });
    }
    
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    mostrarErrorCategorias('No se pudieron cargar las categorías');
    throw error;
  }
}

// Función para cargar productos
async function cargarProductos(page = 1) {
  try {
    console.log(`Cargando productos página ${page}...`);
    
    // Obtener elementos del DOM necesarios
    const containerElement = document.getElementById('productos-container');
    const loadingElement = document.getElementById('loading');
    const noProductsElement = document.getElementById('no-products');
    
    // Verificar que existan los elementos necesarios
    if (!containerElement) {
      throw new Error('Elemento productos-container no encontrado');
    }
    
    // Mostrar indicador de carga
    if (loadingElement) {
      loadingElement.classList.remove('d-none');
    }
    
    // Ocultar mensaje de no productos
    if (noProductsElement) {
      noProductsElement.classList.add('d-none');
    }
    
    // Limpiar contenedor de productos
    containerElement.innerHTML = '';
    
    // Obtener ordenamiento seleccionado
    const sortSelect = document.getElementById('sort-select');
    const sortValue = sortSelect ? sortSelect.value : 'default';
    
    // Obtener productos desde la API
    const resultado = await obtenerProductos(page, 12);
    console.log('Productos obtenidos:', resultado);
    
    // Verificar que la respuesta tiene la estructura esperada
    if (!resultado || !resultado.productos) {
      throw new Error('Respuesta de API inválida');
    }
    
    // Ocultar indicador de carga
    if (loadingElement) {
      loadingElement.classList.add('d-none');
    }
    
    // Verificar si hay productos
    if (resultado.productos.length === 0) {
      if (noProductsElement) {
        noProductsElement.classList.remove('d-none');
      }
      return;
    }
    
    // Ordenar productos según selección
    let productosOrdenados = [...resultado.productos];
    switch (sortValue) {
      case 'price_asc':
        productosOrdenados.sort((a, b) => (a.precio_oferta || a.precio) - (b.precio_oferta || b.precio));
        break;
      case 'price_desc':
        productosOrdenados.sort((a, b) => (b.precio_oferta || b.precio) - (a.precio_oferta || a.precio));
        break;
      case 'name_asc':
        productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name_desc':
        productosOrdenados.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      default:
        // Mantener orden original
        break;
    }
    
    // Crear las tarjetas de productos usando la estructura de los datos de la API
    productosOrdenados.forEach(producto => {
      // Crear tarjeta de producto con placeholder de imagen
      const productCard = crearTarjetaProducto(producto);
      containerElement.appendChild(productCard);
    });
    
    // Cargar imágenes de los productos en segundo plano
    cargarImagenesProductos(productosOrdenados);
    
    // Crear paginación
    if (resultado.pagination) {
      generarPaginacion(resultado.pagination);
    }
    
  } catch (error) {
    console.error('Error al cargar productos:', error);
    const loadingElement = document.getElementById('loading');
    const noProductsElement = document.getElementById('no-products');
    
    if (loadingElement) {
      loadingElement.classList.add('d-none');
    }
    
    if (noProductsElement) {
      noProductsElement.classList.remove('d-none');
      const mensajeElement = noProductsElement.querySelector('p');
      if (mensajeElement) {
        mensajeElement.textContent = 'Error al cargar productos. Intente nuevamente.';
      }
    }
    
    throw error;
  }
}

// Función auxiliar para crear una tarjeta de producto
function crearTarjetaProducto(producto) {
  const col = document.createElement('div');
  col.className = 'col-md-3 mb-4';
  
  const card = document.createElement('div');
  card.className = 'card h-100';
  card.dataset.id = producto.id;
  
  // Imagen del producto (inicialmente placeholder)
  const img = document.createElement('img');
  img.className = 'card-img-top';
  img.src = `https://placehold.co/300x200/007bff/white?text=${encodeURIComponent(producto.nombre)}`;
  img.alt = producto.nombre;
  
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body d-flex flex-column';
  
  // Título del producto
  const title = document.createElement('h5');
  title.className = 'card-title';
  title.textContent = producto.nombre;
  
  // Precio
  const price = document.createElement('p');
  price.className = 'card-text text-danger fw-bold';
  
  if (producto.precio_oferta && producto.precio_oferta < producto.precio) {
    // Si hay precio de oferta
    const oldPrice = document.createElement('span');
    oldPrice.className = 'text-muted text-decoration-line-through me-2';
    oldPrice.textContent = `$${producto.precio.toLocaleString('es-CL')}`;
    
    const newPrice = document.createTextNode(`$${producto.precio_oferta.toLocaleString('es-CL')}`);
    
    price.appendChild(oldPrice);
    price.appendChild(newPrice);
  } else {
    // Precio normal
    price.textContent = `$${producto.precio.toLocaleString('es-CL')}`;
  }
  
  // Stock (si está disponible)
  if (producto.stock !== undefined) {
    const stock = document.createElement('p');
    stock.className = 'card-text small';
    
    if (producto.stock > 10) {
      stock.innerHTML = '<span class="text-success"><i class="fas fa-check-circle me-1"></i>En stock</span>';
    } else if (producto.stock > 0) {
      stock.innerHTML = `<span class="text-warning"><i class="fas fa-exclamation-circle me-1"></i>Quedan ${producto.stock} unidades</span>`;
    } else {
      stock.innerHTML = '<span class="text-danger"><i class="fas fa-times-circle me-1"></i>Sin stock</span>';
    }
    
    cardBody.appendChild(stock);
  }
  
  // Botones
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'mt-auto d-grid gap-2';
  
  const detailBtn = document.createElement('a');
  detailBtn.className = 'btn btn-outline-primary';
  detailBtn.href = `/producto/${producto.id}`;
  detailBtn.textContent = 'Ver Detalles';
  
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary';
  addBtn.textContent = 'Agregar al Carrito';
  
  // Deshabilitar botón si no hay stock
  if (producto.stock !== undefined && producto.stock <= 0) {
    addBtn.disabled = true;
    addBtn.textContent = 'Sin Stock';
  }
  
  // Configurar evento click
  addBtn.addEventListener('click', function() {
    if (typeof agregarAlCarrito === 'function') {
      agregarAlCarrito(
        producto.id, 
        producto.nombre, 
        producto.precio_oferta || producto.precio, 
        img.src
      );
    } else {
      console.error('Función agregarAlCarrito no disponible');
    }
  });
  
  // Añadir elementos al DOM
  buttonDiv.appendChild(detailBtn);
  buttonDiv.appendChild(addBtn);
  
  cardBody.appendChild(title);
  cardBody.appendChild(price);
  cardBody.appendChild(buttonDiv);
  
  card.appendChild(img);
  card.appendChild(cardBody);
  
  col.appendChild(card);
  
  return col;
}

// Función auxiliar para cargar imágenes de productos
async function cargarImagenesProductos(productos) {
  if (!productos || productos.length === 0) return;
  
  try {
    // Para cada producto, intentar obtener sus imágenes
    for (const producto of productos) {
      try {
        // Buscar la tarjeta del producto
        const card = document.querySelector(`.card[data-id="${producto.id}"]`);
        if (!card) continue;
        
        const img = card.querySelector('img');
        if (!img) continue;
        
        // Intentar cargar imágenes desde la API
        const imagenes = await obtenerImagenesProducto(producto.id).catch(() => []);
        console.log(`Imágenes para producto ${producto.id}:`, imagenes);
        
        // Imagen principal, si existe
        const imagenPrincipal = imagenes.length > 0
          ? imagenes.find(img => img.es_principal) || imagenes[0]
          : null;
        
        // Actualizar la imagen usando el mapeador
        if (imagenPrincipal) {
          img.src = getFullImageUrl(imagenPrincipal, producto);
        } else {
          // Si no hay imágenes, usar el mapeador con solo el producto
          img.src = getFullImageUrl(null, producto);
        }
        
        // Añadir el nombre del producto como alt para accesibilidad
        img.alt = producto.nombre || 'Producto';
        
      } catch (error) {
        console.error(`Error al procesar imágenes del producto ${producto.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error global al cargar imágenes:', error);
  }
}

// Función para generar la paginación
function generarPaginacion(pagination) {
  const paginationElement = document.getElementById('pagination');
  if (!paginationElement) {
    console.warn('Elemento pagination no encontrado');
    return;
  }
  
  // Limpiar paginación existente
  paginationElement.innerHTML = '';
  
  // Si solo hay una página, no mostrar paginación
  if (pagination.totalPages <= 1) {
    return;
  }
  
  // Botón "Anterior"
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${pagination.page <= 1 ? 'disabled' : ''}`;
  
  const prevLink = document.createElement('a');
  prevLink.className = 'page-link';
  prevLink.href = '#';
  prevLink.setAttribute('aria-label', 'Anterior');
  prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span>';
  
  prevLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (pagination.page > 1) {
      cargarProductos(pagination.page - 1);
      
      // Actualizar URL sin recargar página
      const url = new URL(window.location);
      url.searchParams.set('page', pagination.page - 1);
      window.history.pushState({}, '', url);
    }
  });
  
  prevLi.appendChild(prevLink);
  paginationElement.appendChild(prevLi);
  
  // Determinar qué páginas mostrar
  let startPage = Math.max(1, pagination.page - 2);
  let endPage = Math.min(pagination.totalPages, startPage + 4);
  
  // Ajustar si estamos cerca del final
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // Generar números de página
  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement('li');
    pageLi.className = `page-item ${i === pagination.page ? 'active' : ''}`;
    
    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.href = '#';
    pageLink.textContent = i;
    
    pageLink.addEventListener('click', function(e) {
      e.preventDefault();
      cargarProductos(i);
      
      // Actualizar URL sin recargar página
      const url = new URL(window.location);
      url.searchParams.set('page', i);
      window.history.pushState({}, '', url);
    });
    
    pageLi.appendChild(pageLink);
    paginationElement.appendChild(pageLi);
  }
  
  // Botón "Siguiente"
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${pagination.page >= pagination.totalPages ? 'disabled' : ''}`;
  
  const nextLink = document.createElement('a');
  nextLink.className = 'page-link';
  nextLink.href = '#';
  nextLink.setAttribute('aria-label', 'Siguiente');
  nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span>';
  
  nextLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (pagination.page < pagination.totalPages) {
      cargarProductos(pagination.page + 1);
      
      // Actualizar URL sin recargar página
      const url = new URL(window.location);
      url.searchParams.set('page', pagination.page + 1);
      window.history.pushState({}, '', url);
    }
  });
  
  nextLi.appendChild(nextLink);
  paginationElement.appendChild(nextLi);
}

// Función para mostrar error general
function mostrarErrorGeneral(mensaje) {
  const container = document.querySelector('.container.my-5');
  if (!container) {
    console.error('No se encontró contenedor para mostrar error:', mensaje);
    alert(mensaje); // Fallback a alert si no hay contenedor
    return;
  }
  
  const alerta = document.createElement('div');
  alerta.className = 'alert alert-danger mb-4';
  alerta.role = 'alert';
  alerta.innerHTML = `
    <i class="fas fa-exclamation-triangle me-2"></i>
    ${mensaje}
  `;
  
  // Insertar al principio del contenedor
  container.insertBefore(alerta, container.firstChild);
  
  // Eliminar después de 10 segundos
  setTimeout(() => {
    if (alerta.parentNode) {
      alerta.remove();
    }
  }, 10000);
}

// Función para mostrar error de categorías
function mostrarErrorCategorias(mensaje) {
  console.log('Mostrando error de categorías:', mensaje);
  const menuCategorias = document.getElementById('categorias-menu');
  if (!menuCategorias) {
    console.error('No se encontró el menú de categorías');
    return;
  }
  
  // Buscar el divisor
  const divider = menuCategorias.querySelector('hr');
  const dividerParent = divider ? divider.parentElement : null;
  
  // Agregar mensaje de error
  const errorLi = document.createElement('li');
  errorLi.className = 'px-3 py-2 text-danger small';
  errorLi.innerHTML = `<i class="fas fa-exclamation-circle me-1"></i> ${mensaje}`;
  
  if (dividerParent) {
    menuCategorias.insertBefore(errorLi, dividerParent);
  } else {
    menuCategorias.appendChild(errorLi);
  }
  
  // Agregar categorías estáticas como fallback
  const categorias = [
    { nombre: 'Herramientas', slug: 'herramientas' },
    { nombre: 'Materiales', slug: 'materiales' },
    { nombre: 'Seguridad', slug: 'seguridad' }
  ];
  
  // Agregar categorías estáticas
  categorias.forEach(categoria => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'dropdown-item';
    a.href = `/categoria/${categoria.slug}`;
    a.textContent = categoria.nombre;
    li.appendChild(a);
    
    if (dividerParent) {
      menuCategorias.insertBefore(li, dividerParent);
    } else {
      menuCategorias.appendChild(li);
    }
  });
}