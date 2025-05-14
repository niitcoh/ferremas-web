// public/js/producto-detalle.js

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001';
const DEFAULT_IMAGE = '/img/placeholder.jpg';

// Variables globales
let productoActual = null;
let cantidadSeleccionada = 1;

// Función para obtener el ID del producto desde la URL
function getProductId() {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1];
}

// Función para cargar los detalles del producto
async function loadProductDetails() {
    const productoId = getProductId();
    
    if (!productoId) {
        showError('No se encontró el ID del producto');
        return;
    }
    
    try {
        // Obtener datos del producto
        const response = await fetch(`${API_BASE_URL}/productos/${productoId}`);
        
        if (!response.ok) {
            throw new Error('No se pudo cargar el producto');
        }
        
        const producto = await response.json();
        productoActual = producto;
        
        // Mostrar datos del producto
        displayProductDetails(producto);
        
        // Cargar especificaciones
        loadProductSpecifications(productoId);
        
        // Cargar imágenes
        loadProductImages(productoId);
        
        // Cargar productos relacionados
        loadRelatedProducts(producto.categoria_id, productoId);
        
        // Cargar información de la categoría para el breadcrumb
        if (producto.categoria_id) {
            loadCategoryInfo(producto.categoria_id);
        }
        
        // Mostrar sección de producto y ocultar carga
        document.getElementById('loading').classList.add('d-none');
        document.getElementById('producto-detalle').classList.remove('d-none');
        
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        showError('No se pudo cargar el producto');
    }
}

// Función para mostrar los detalles del producto
function displayProductDetails(producto) {
    // Actualizar título de la página
    document.title = `${producto.nombre} | FERREMAS`;
    
    // Actualizar breadcrumb
    document.getElementById('breadcrumb-producto').textContent = producto.nombre;
    
    // Información básica
    document.getElementById('producto-nombre').textContent = producto.nombre;
    document.getElementById('producto-codigo').textContent = producto.codigo;
    document.getElementById('producto-descripcion').textContent = producto.descripcion || 'Sin descripción disponible';
    
    // Precio
    if (producto.precio_oferta) {
        document.getElementById('producto-precio-oferta-container').classList.remove('d-none');
        document.getElementById('producto-precio-oferta-container').querySelector('div:first-child').textContent = `$${formatNumber(producto.precio)}`;
        document.getElementById('producto-precio-oferta').textContent = `$${formatNumber(producto.precio_oferta)}`;
        document.getElementById('producto-precio-normal').classList.add('d-none');
    } else {
        document.getElementById('producto-precio-normal').textContent = `$${formatNumber(producto.precio)}`;
    }
    
    // Stock
    document.getElementById('producto-stock').textContent = producto.stock || 0;
    
    // Badges
    if (producto.nuevo) {
        document.getElementById('badge-nuevo').classList.remove('d-none');
    }
    
    if (producto.destacado) {
        document.getElementById('badge-destacado').classList.remove('d-none');
    }
    
    // Marca
    if (producto.marca_id) {
        loadBrandInfo(producto.marca_id);
    }
    
    // Imagen principal (temporalmente)
    const imagenUrl = `/img/productos/${producto.codigo}.jpg`;
    document.getElementById('producto-imagen-principal').src = imagenUrl;
    document.getElementById('producto-imagen-principal').onerror = function() {
        this.src = DEFAULT_IMAGE;
    };
}

// Función para cargar las especificaciones del producto
async function loadProductSpecifications(productoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/${productoId}/especificaciones`);
        
        if (!response.ok) {
            throw new Error('No se pudieron cargar las especificaciones');
        }
        
        const especificaciones = await response.json();
        
        const especificacionesContainer = document.getElementById('producto-especificaciones');
        
        if (especificaciones.length === 0) {
            especificacionesContainer.innerHTML = '<p class="text-muted">No hay especificaciones disponibles</p>';
            return;
        }
        
        // Crear tabla de especificaciones
        let tableHtml = `
            <table class="table table-bordered table-sm">
                <tbody>
        `;
        
        especificaciones.forEach(spec => {
            tableHtml += `
                <tr>
                    <td class="fw-bold">${spec.nombre}</td>
                    <td>${spec.valor}</td>
                </tr>
            `;
        });
        
        tableHtml += `
                </tbody>
            </table>
        `;
        
        especificacionesContainer.innerHTML = tableHtml;
        
    } catch (error) {
        console.error('Error al cargar las especificaciones:', error);
        document.getElementById('producto-especificaciones').innerHTML = '<p class="text-muted">No se pudieron cargar las especificaciones</p>';
    }
}

// Función para cargar las imágenes del producto
async function loadProductImages(productoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/${productoId}/imagenes`);
        
        if (!response.ok) {
            throw new Error('No se pudieron cargar las imágenes');
        }
        
        const imagenes = await response.json();
        
        if (imagenes.length === 0) {
            return; // Ya tenemos una imagen por defecto
        }
        
        // Actualizar imagen principal con la primera imagen o la principal
        const imagenPrincipal = imagenes.find(img => img.es_principal) || imagenes[0];
        const mainImgElement = document.getElementById('producto-imagen-principal');
        
        const imagenUrl = `/img/productos/${productoActual.codigo}.jpg`;
        mainImgElement.src = imagenUrl;
        mainImgElement.onerror = function() {
            this.src = DEFAULT_IMAGE;
        };
        
        // Crear miniaturas para las demás imágenes
        const miniaturasContainer = document.getElementById('producto-miniaturas');
        miniaturasContainer.innerHTML = '';
        
        // Si solo hay una imagen, no mostrar miniaturas
        if (imagenes.length <= 1) {
            return;
        }
        
        // Agregar todas las imágenes como miniaturas
        imagenes.forEach((imagen, index) => {
            const imgUrl = `/img/productos/${productoActual.codigo}_${index + 1}.jpg`;
            
            const miniatura = document.createElement('div');
            miniatura.className = 'me-2';
            miniatura.innerHTML = `
                <img src="${imgUrl}" alt="Miniatura ${index + 1}" 
                     class="img-thumbnail ${imagen === imagenPrincipal ? 'border-primary' : ''}" 
                     style="width: 60px; height: 60px; object-fit: cover; cursor: pointer;"
                     onerror="this.src='${DEFAULT_IMAGE}'">
            `;
            
            // Evento para cambiar la imagen principal
            miniatura.querySelector('img').addEventListener('click', () => {
                mainImgElement.src = imgUrl;
                
                // Actualizar bordes de miniaturas
                document.querySelectorAll('#producto-miniaturas img').forEach(img => {
                    img.classList.remove('border-primary');
                });
                miniatura.querySelector('img').classList.add('border-primary');
            });
            
            miniaturasContainer.appendChild(miniatura);
        });
    } catch (error) {
        console.error('Error al cargar las imágenes:', error);
    }
}

// Función para cargar productos relacionados
async function loadRelatedProducts(categoriaId, currentProductId) {
    if (!categoriaId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${categoriaId}/productos?limit=4`);
        
        if (!response.ok) {
            throw new Error('No se pudieron cargar los productos relacionados');
        }
        
        const data = await response.json();
        
        // Filtrar para excluir el producto actual
        let productosRelacionados = data.productos || [];
        productosRelacionados = productosRelacionados.filter(p => p.id != currentProductId);
        
        if (productosRelacionados.length === 0) {
            return; // No hay productos relacionados
        }
        
        // Mostrar la sección de productos relacionados
        document.getElementById('productos-relacionados-section').classList.remove('d-none');
        
        // Llenar el contenedor de productos relacionados
        const container = document.getElementById('productos-relacionados-container');
        container.innerHTML = '';
        
        // Mostrar hasta 4 productos relacionados
        const productsToShow = productosRelacionados.slice(0, 4);
        
        productsToShow.forEach(producto => {
            const imageUrl = `/img/productos/${producto.codigo}.jpg`;
            
            const productCard = document.createElement('div');
            productCard.className = 'col-md-3 col-sm-6 mb-4';
            
            productCard.innerHTML = `
                <div class="card h-100">
                    <img src="${imageUrl}" class="card-img-top" alt="${producto.nombre}" 
                         style="height: 150px; object-fit: contain;" loading="lazy"
                         onerror="this.src='${DEFAULT_IMAGE}'">
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${producto.nombre}</h6>
                        <div class="mt-auto">
                            ${producto.precio_oferta ? 
                              `<p class="mb-1"><del class="text-muted small">$${formatNumber(producto.precio)}</del></p>
                               <p class="text-primary fw-bold">$${formatNumber(producto.precio_oferta)}</p>` :
                              `<p class="text-primary fw-bold">$${formatNumber(producto.precio)}</p>`}
                            <a href="/producto/${producto.id}" class="btn btn-sm btn-outline-primary w-100">Ver detalles</a>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Error al cargar productos relacionados:', error);
    }
}

// Función para cargar información de la categoría
async function loadCategoryInfo(categoriaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${categoriaId}`);
        
        if (!response.ok) {
            throw new Error('No se pudo cargar la información de la categoría');
        }
        
        const categoria = await response.json();
        
        // Actualizar breadcrumb
        const breadcrumbCategoria = document.getElementById('breadcrumb-categoria');
        breadcrumbCategoria.textContent = categoria.nombre;
        breadcrumbCategoria.href = `/productos?categoria=${categoriaId}`;
        
    } catch (error) {
        console.error('Error al cargar información de la categoría:', error);
    }
}

// Función para cargar información de la marca
async function loadBrandInfo(marcaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/marcas/${marcaId}`);
        
        if (!response.ok) {
            throw new Error('No se pudo cargar la información de la marca');
        }
        
        const marca = await response.json();
        
        // Actualizar enlace de la marca
        const marcaElement = document.getElementById('producto-marca');
        marcaElement.textContent = marca.nombre;
        marcaElement.href = `/productos?marca=${marcaId}`;
        
    } catch (error) {
        console.error('Error al cargar información de la marca:', error);
    }
}

// Función para mostrar mensaje de error
function showError(message) {
    document.getElementById('loading').classList.add('d-none');
    
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
}

// Función para formatear números
function formatNumber(number) {
    if (!number) return "0";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Función para agregar producto al carrito
function addToCart(cantidad) {
    if (!productoActual) return;
    
    // Validar cantidad
    if (cantidad <= 0) {
        alert('La cantidad debe ser mayor a 0');
        return;
    }
    
    if (productoActual.stock && cantidad > productoActual.stock) {
        alert('No hay suficiente stock disponible');
        return;
    }
    
    // Obtener carrito actual
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id == productoActual.id);
    
    if (existingItem) {
        existingItem.quantity += cantidad;
    } else {
        cart.push({
            id: productoActual.id,
            quantity: cantidad
        });
    }
    
    // Guardar carrito actualizado
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mostrar notificación
    alert(`Se ${existingItem ? 'actualizó' : 'agregó'} "${productoActual.nombre}" al carrito (${cantidad} unidad/es)`);
    
    // Actualizar contador del carrito
    updateCartCounter();
}

// Función para actualizar el contador del carrito
function updateCartCounter() {
    const cartCounter = document.getElementById('cart-counter');
    if (!cartCounter) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (totalItems > 0) {
        cartCounter.textContent = totalItems;
        cartCounter.classList.remove('d-none');
    } else {
        cartCounter.classList.add('d-none');
    }
}

// Inicializar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Verificar si estamos en la página de detalle de producto
        if (!window.location.pathname.includes('/producto/')) {
            return;
        }
        
        // Cargar detalles del producto
        loadProductDetails();
        
        // Actualizar contador del carrito
        updateCartCounter();
        
        // Configurar eventos para cantidad
        const cantidadInput = document.getElementById('cantidad');
        const btnDisminuir = document.getElementById('btn-disminuir');
        const btnAumentar = document.getElementById('btn-aumentar');
        
        if (cantidadInput && btnDisminuir && btnAumentar) {
            cantidadInput.addEventListener('change', () => {
                cantidadSeleccionada = parseInt(cantidadInput.value) || 1;
                cantidadInput.value = cantidadSeleccionada;
            });
            
            btnDisminuir.addEventListener('click', () => {
                cantidadSeleccionada = Math.max(1, cantidadSeleccionada - 1);
                cantidadInput.value = cantidadSeleccionada;
            });
            
            btnAumentar.addEventListener('click', () => {
                cantidadSeleccionada = cantidadSeleccionada + 1;
                cantidadInput.value = cantidadSeleccionada;
            });
        }
        
        // Configurar botón de agregar al carrito
        const btnAgregarCarrito = document.getElementById('btn-agregar-carrito');
        if (btnAgregarCarrito) {
            btnAgregarCarrito.addEventListener('click', () => {
                addToCart(cantidadSeleccionada);
            });
        }
        
        // Configurar botón de copiar enlace
        const btnCopiarEnlace = document.getElementById('btn-copiar-enlace');
        if (btnCopiarEnlace) {
            btnCopiarEnlace.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.href)
                    .then(() => {
                        alert('Enlace copiado al portapapeles');
                    })
                    .catch(err => {
                        console.error('Error al copiar el enlace:', err);
                    });
            });
        }
        
        // Cargar categorías para el menú
        loadCategories();
        
    } catch (error) {
        console.error('Error al inicializar la página de detalle del producto:', error);
    }
});

// Cargar categorías
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        const categorias = await response.json();
        
        // Llenar menú de categorías
        const categoriasMenu = document.getElementById('categorias-menu');
        const footerCategorias = document.getElementById('footer-categorias');
        
        if (categoriasMenu) {
            categoriasMenu.innerHTML = '';
            categorias.forEach(categoria => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item" href="/productos?categoria=${categoria.id}">${categoria.nombre}</a>`;
                categoriasMenu.appendChild(li);
            });
            categoriasMenu.innerHTML += '<li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="/productos">Ver todos los productos</a></li>';
        }
        
        if (footerCategorias) {
            footerCategorias.innerHTML = '';
            const categoriasToShow = categorias.slice(0, 5); // Mostrar solo 5 categorías en el footer
            categoriasToShow.forEach(categoria => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="/productos?categoria=${categoria.id}" class="text-muted">${categoria.nombre}</a>`;
                footerCategorias.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}