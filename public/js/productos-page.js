document.addEventListener('DOMContentLoaded', async function() {
  // Verificar autenticación para mostrar el menú de usuario adecuado
  if (estaAutenticado()) {
    const usuario = getUsuarioActual();
    
    // Actualizar nombre de usuario
    document.getElementById('user-name').textContent = usuario.nombre;
    
    // Mostrar dropdown de usuario y ocultar enlace de login
    document.getElementById('login-item').classList.add('d-none');
    document.getElementById('user-dropdown').classList.remove('d-none');
    
    // Configurar evento de logout
    document.getElementById('logout-link').addEventListener('click', function(e) {
      e.preventDefault();
      cerrarSesion();
    });
  }
  
  // Cargar categorías
  cargarCategorias();
  
  // Cargar productos (primera página)
  cargarProductos(1);
  
  // Configurar búsqueda
  document.getElementById('search-button').addEventListener('click', function() {
    const termino = document.getElementById('search-input').value.trim();
    if (termino) {
      window.location.href = `/buscar?q=${encodeURIComponent(termino)}`;
    }
  });
  
  // Permitir búsqueda también presionando Enter
  document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      document.getElementById('search-button').click();
    }
  });
  
  // Configurar ordenamiento
  document.getElementById('sort-select').addEventListener('change', function() {
    const currentPage = new URLSearchParams(window.location.search).get('page') || 1;
    cargarProductos(currentPage);
  });
});

// Función para cargar categorías
async function cargarCategorias() {
  try {
    const categorias = await obtenerCategorias();
    
    // Llenar menú de categorías en navbar
    const menuCategorias = document.getElementById('categorias-menu');
    const divider = menuCategorias.querySelector('hr');
    
    // Limpiar categorías existentes pero mantener el divider y el "Ver todos"
    while (menuCategorias.firstChild !== divider) {
      menuCategorias.removeChild(menuCategorias.firstChild);
    }
    
    // Agregar nuevas categorías
    categorias.forEach(categoria => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dropdown-item';
      a.href = `/categoria/${categoria.slug}`;
      a.textContent = categoria.nombre;
      li.appendChild(a);
      menuCategorias.insertBefore(li, divider);
    });
    
    // Llenar categorías en el footer
    const footerCategorias = document.getElementById('footer-categorias');
    footerCategorias.innerHTML = '';
    
    categorias.slice(0, 4).forEach(categoria => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/categoria/${categoria.slug}`;
      a.className = 'text-muted';
      a.textContent = categoria.nombre;
      li.appendChild(a);
      footerCategorias.appendChild(li);
    });
    
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// Función para cargar productos
async function cargarProductos(page = 1) {
  try {
    // Mostrar indicador de carga
    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('no-products').classList.add('d-none');
    document.getElementById('productos-container').innerHTML = '';
    
    // Obtener ordenamiento seleccionado
    const sortSelect = document.getElementById('sort-select');
    const sortValue = sortSelect.value;
    
    // Obtener productos
    const resultado = await obtenerProductos(page, 12);
    
    // Ocultar indicador de carga
    document.getElementById('loading').classList.add('d-none');
    
    // Verificar si hay productos
    if (resultado.productos.length === 0) {
      document.getElementById('no-products').classList.remove('d-none');
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
    
    // Mostrar productos
    const container = document.getElementById('productos-container');
    
    // Obtener todas las imágenes principales de los productos
    const imagenesPromesas = productosOrdenados.map(async producto => {
      try {
        const imagenes = await obtenerImagenesProducto(producto.id);
        return {
          productoId: producto.id,
          imagenes: imagenes || []
        };
      } catch (error) {
        console.error(`Error al obtener imágenes para producto ${producto.id}:`, error);
        return {
          productoId: producto.id,
          imagenes: []
        };
      }
    });
    
    // Esperar a que todas las promesas se resuelvan
    const imagenesResultados = await Promise.all(imagenesPromesas);
    
    // Crear un mapa para acceder fácilmente a las imágenes por ID de producto
    const imagenesMap = new Map();
    imagenesResultados.forEach(resultado => {
      imagenesMap.set(resultado.productoId, resultado.imagenes);
    });
    
    productosOrdenados.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col-md-3';
      
      const card = document.createElement('div');
      card.className = 'card h-100';
      
      // Imagen del producto
      const img = document.createElement('img');
      img.className = 'card-img-top';
      
      // Buscar la imagen principal del producto
      const imagenes = imagenesMap.get(producto.id) || [];
      const imagenPrincipal = imagenes.find(img => img.es_principal) || imagenes[0];
      
      if (imagenPrincipal) {
        img.src = getFullImageUrl(imagenPrincipal.url);
      } else {
        // Usar placeholder si no hay imágenes
        img.src = `https://placehold.co/300x200/007bff/white?text=${encodeURIComponent(producto.nombre)}`;
      }
      
      img.alt = producto.nombre;
      
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body d-flex flex-column';
      
      // El resto del código para crear la tarjeta permanece igual...
      // ...
      
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
      addBtn.onclick = function() {
        agregarAlCarrito(producto.id, producto.nombre, producto.precio_oferta || producto.precio, img.src);
      };
      
      // Añadir elementos al DOM
      buttonDiv.appendChild(detailBtn);
      buttonDiv.appendChild(addBtn);
      
      cardBody.appendChild(title);
      cardBody.appendChild(price);
      cardBody.appendChild(buttonDiv);
      
      card.appendChild(img);
      card.appendChild(cardBody);
      
      col.appendChild(card);
      container.appendChild(col);
    });
    
    // Crear paginación
    generarPaginacion(resultado.pagination);
    
  } catch (error) {
    console.error('Error al cargar productos:', error);
    document.getElementById('loading').classList.add('d-none');
    document.getElementById('no-products').classList.remove('d-none');
    document.getElementById('no-products').querySelector('p').textContent = 'Error al cargar productos. Intente nuevamente.';
  }
}

// Función para generar la paginación
function generarPaginacion(pagination) {
  const paginationElement = document.getElementById('pagination');
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
    }
  });
  
  nextLi.appendChild(nextLink);
  paginationElement.appendChild(nextLi);
}