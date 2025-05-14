// public/js/home.js
document.addEventListener('DOMContentLoaded', async function() {
  // Verificar si hay usuario logueado
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
  
  // Cargar contenido de la página principal con manejo de errores mejorado
  try {
    // Verificar la disponibilidad de la API
    const apiDisponible = await verificarAPI();
    
    if (apiDisponible) {
      // Si la API está disponible, cargar datos dinámicos
      await cargarCategorias();
      await cargarProductosDestacados();
    } else {
      // Si la API no está disponible, cargar datos estáticos
      mostrarErrorCargaAPI();
      cargarDatosEstaticos();
    }
  } catch (error) {
    console.error('Error al cargar contenido inicial:', error);
    mostrarErrorCargaAPI();
    cargarDatosEstaticos();
  }
});

// Función para verificar si la API está disponible
async function verificarAPI() {
  try {
    const response = await fetch('/api');
    return response.ok;
  } catch (error) {
    console.error('Error al verificar la API:', error);
    return false;
  }
}

// Función para cargar datos estáticos cuando la API no está disponible
function cargarDatosEstaticos() {
  // Cargar categorías estáticas
  const categoriasRow = document.querySelector('#categorias-principales .row');
  if (categoriasRow) {
    cargarCategoriasEstaticas(categoriasRow);
  }
  
  // Cargar productos estáticos
  const productosRow = document.querySelector('#productos-destacados .row');
  if (productosRow) {
    cargarProductosEstaticos(productosRow);
  }
  
  // Configurar el menú con categorías estáticas
  const menuCategorias = document.getElementById('categorias-menu');
  if (menuCategorias) {
    const divider = menuCategorias.querySelector('.dropdown-divider');
    
    // Limpiar elementos existentes antes del separador
    Array.from(menuCategorias.children).forEach(child => {
      if (child.querySelector('.dropdown-divider') === null && 
          !child.querySelector('a[href="/productos"]')) {
        menuCategorias.removeChild(child);
      }
    });
    
    // Agregar categorías estáticas
    const categorias = [
      { nombre: 'Herramientas', slug: 'herramientas' },
      { nombre: 'Materiales', slug: 'materiales' },
      { nombre: 'Seguridad', slug: 'seguridad' }
    ];
    
    categorias.forEach(categoria => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dropdown-item';
      a.href = `/categoria/${categoria.slug}`;
      a.textContent = categoria.nombre;
      li.appendChild(a);
      menuCategorias.insertBefore(li, divider.parentElement);
    });
  }
  
  // Configurar categorías en el footer
  const footerCategorias = document.getElementById('footer-categorias');
  if (footerCategorias) {
    footerCategorias.innerHTML = '';
    
    const categorias = [
      { nombre: 'Herramientas', slug: 'herramientas' },
      { nombre: 'Materiales', slug: 'materiales' },
      { nombre: 'Seguridad', slug: 'seguridad' },
      { nombre: 'Accesorios', slug: 'accesorios' }
    ];
    
    categorias.forEach(categoria => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/categoria/${categoria.slug}`;
      a.className = 'text-muted';
      a.textContent = categoria.nombre;
      li.appendChild(a);
      footerCategorias.appendChild(li);
    });
  }
}

// Función para mostrar un mensaje de error en caso de problemas con la API
function mostrarErrorCargaAPI() {
  // Crear un mensaje de alerta
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-warning alert-dismissible fade show';
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `
    <strong>¡Atención!</strong> No se pudo conectar con el servidor de productos. 
    Se están mostrando datos de ejemplo. <button type="button" id="retry-connection" class="btn btn-sm btn-warning ms-3">Reintentar</button>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Agregar el mensaje al inicio del contenido principal
  const container = document.querySelector('.container.py-5');
  container.insertBefore(alertDiv, container.firstChild);
  
  // Agregar evento para reintentar la conexión
  document.getElementById('retry-connection').addEventListener('click', function() {
    location.reload();
  });
}

// Función para cargar categorías estáticas en caso de error
function cargarCategoriasEstaticas(container) {
  // Limpiar el contenedor
  container.innerHTML = '';
  
  // Categorías estáticas como fallback
  const categorias = [
    { nombre: 'Herramientas', descripcion: 'Encuentra las mejores herramientas manuales y eléctricas para tus proyectos.' },
    { nombre: 'Materiales', descripcion: 'Todo lo que necesitas para tus proyectos de construcción y remodelación.' },
    { nombre: 'Seguridad', descripcion: 'Protégete con nuestra línea de equipos de seguridad de alta calidad.' }
  ];
  
  categorias.forEach(categoria => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';
    
    colDiv.innerHTML = `
      <div class="card h-100 text-center">
        <img src="https://placehold.co/300x200/007bff/white?text=${encodeURIComponent(categoria.nombre)}" 
             class="card-img-top" alt="${categoria.nombre}">
        <div class="card-body">
          <h5 class="card-title">${categoria.nombre}</h5>
          <p class="card-text">${categoria.descripcion}</p>
          <a href="/categoria/${categoria.nombre.toLowerCase()}" class="btn btn-primary">Ver Categoría</a>
        </div>
      </div>
    `;
    
    container.appendChild(colDiv);
  });
}

// Función para cargar productos estáticos en caso de error
function cargarProductosEstaticos(container) {
  // Limpiar el contenedor
  container.innerHTML = '';
  
  // Productos estáticos como fallback
  const productos = [
    { id: 1, nombre: 'Taladro Percutor Bosch', precio: 89990 },
    { id: 2, nombre: 'Set Destornilladores Stanley', precio: 24990 },
    { id: 3, nombre: 'Cemento Polpaico 25kg', precio: 8990 },
    { id: 4, nombre: 'Casco de Seguridad 3M', precio: 12990 }
  ];
  
  productos.forEach(producto => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-3';
    
    colDiv.innerHTML = `
      <div class="card h-100" data-id="${producto.id}">
        <img src="https://placehold.co/300x200/007bff/white?text=${encodeURIComponent(producto.nombre)}" 
             class="card-img-top" alt="${producto.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${producto.nombre}</h5>
          <p class="card-text text-danger fw-bold">$${producto.precio.toLocaleString('es-CL')}</p>
          <div class="mt-auto d-grid gap-2">
            <a href="/producto/${producto.id}" class="btn btn-outline-primary">Ver Detalles</a>
            <button class="btn btn-primary add-to-cart-btn">Agregar al Carrito</button>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(colDiv);
  });
  
  // Configurar eventos para botones "Agregar al carrito"
  container.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.card');
      const id = card.dataset.id;
      const nombre = card.querySelector('.card-title').textContent;
      const precio = parseInt(card.querySelector('.card-text.text-danger').textContent.replace(/\D/g, ''));
      const imagen = card.querySelector('.card-img-top').src;
      
      agregarAlCarrito(id, nombre, precio, imagen);
    });
  });
}

// La siguiente función sólo se ejecutará si la API está disponible
async function cargarCategorias() {
  try {
    const categorias = await obtenerCategorias();
    
    // Actualizar menú de categorías en navbar
    const menuCategorias = document.getElementById('categorias-menu');
    if (menuCategorias) {
      // Encontrar el separador y el enlace "Ver todos los productos"
      const divider = menuCategorias.querySelector('.dropdown-divider');
      
      // Limpiar elementos existentes antes del separador
      Array.from(menuCategorias.children).forEach(child => {
        if (child.querySelector('.dropdown-divider') === null && 
            !child.querySelector('a[href="/productos"]')) {
          menuCategorias.removeChild(child);
        }
      });
      
      // Agregar nuevas categorías antes del separador
      categorias.forEach(categoria => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = `/categoria/${categoria.slug}`;
        a.textContent = categoria.nombre;
        li.appendChild(a);
        menuCategorias.insertBefore(li, divider.parentElement);
      });
    }
    
    // Actualizar sección de categorías principales en la página de inicio
    const categoriasRow = document.querySelector('#categorias-principales .row');
    if (categoriasRow) {
      categoriasRow.innerHTML = '';
      
      // Mostrar solo las primeras 3 categorías en la página principal
      const principalesCategorias = categorias.slice(0, 3);
      
      principalesCategorias.forEach(categoria => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4';
        
        colDiv.innerHTML = `
          <div class="card h-100 text-center">
            <img src="${categoria.imagen || `https://placehold.co/300x200/007bff/white?text=${encodeURIComponent(categoria.nombre)}`}" 
                 class="card-img-top" alt="${categoria.nombre}">
            <div class="card-body">
              <h5 class="card-title">${categoria.nombre}</h5>
              <p class="card-text">${categoria.descripcion || `Encuentra los mejores productos de ${categoria.nombre}`}</p>
              <a href="/categoria/${categoria.slug}" class="btn btn-primary">Ver Categoría</a>
            </div>
          </div>
        `;
        
        categoriasRow.appendChild(colDiv);
      });
    }
    
    // Actualizar categorías en el footer
    const footerCategorias = document.getElementById('footer-categorias');
    if (footerCategorias) {
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
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    throw error;
  }
}

// La siguiente función sólo se ejecutará si la API está disponible
async function cargarProductosDestacados() {
  // Implementación existente...
}