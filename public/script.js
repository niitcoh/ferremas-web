document.addEventListener('DOMContentLoaded', function() {
  // Inicializar tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });

  // Inicializar el carrusel
  var myCarousel = new bootstrap.Carousel(document.getElementById('mainCarousel'), {
    interval: 5000
  });
  
  // Inicializar funcionalidad de carrito
  inicializarCarrito();
});

// Función para agregar al carrito
function agregarAlCarrito(id, nombre, precio, imagen) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Verificar si el producto ya está en el carrito
  const productoEnCarrito = carrito.find(item => item.id === id);
  
  if (productoEnCarrito) {
    // Actualizar cantidad si ya existe
    productoEnCarrito.cantidad += 1;
  } else {
    // Agregar nuevo producto al carrito
    carrito.push({
      id,
      nombre,
      precio,
      imagen: imagen || `https://placehold.co/300x200/007bff/white?text=${encodeURIComponent(nombre)}`,
      cantidad: 1
    });
  }
  
  // Guardar carrito en localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Mostrar notificación
  mostrarNotificacion(`${nombre} añadido al carrito`);
  
  // Actualizar contador de carrito
  actualizarContadorCarrito();
}

// Función para mostrar notificación
function mostrarNotificacion(mensaje) {
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
}

// Función para actualizar contador de carrito
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
  
  // Buscar o crear el badge
  let cartBadge = document.querySelector('#cart-badge');
  
  if (totalItems > 0) {
    if (!cartBadge) {
      // Crear badge si no existe
      cartBadge = document.createElement('span');
      cartBadge.id = 'cart-badge';
      cartBadge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
      cartBadge.style.fontSize = '0.6rem';
      
      const cartLink = document.querySelector('#cart-link');
      cartLink.style.position = 'relative';
      cartLink.appendChild(cartBadge);
    }
    
    cartBadge.textContent = totalItems;
  } else if (cartBadge) {
    // Eliminar badge si el carrito está vacío
    cartBadge.remove();
  }
}

// Función para inicializar carrito
function inicializarCarrito() {
  // Agregar listener a todos los botones de "Agregar al Carrito"
  const botonesAgregar = document.querySelectorAll('.card .btn-primary');
  
  botonesAgregar.forEach(boton => {
    boton.addEventListener('click', function(e) {
      const card = this.closest('.card');
      const id = card.dataset.id || Math.random().toString(36).substring(2, 15);
      const nombre = card.querySelector('.card-title').textContent;
      const precioText = card.querySelector('.card-text.text-danger').textContent;
      const precio = parseInt(precioText.replace(/\D/g, ''));
      const imagen = card.querySelector('.card-img-top').src;
      
      agregarAlCarrito(id, nombre, precio, imagen);
    });
  });
  
  // Actualizar contador de carrito al cargar la página
  actualizarContadorCarrito();
}