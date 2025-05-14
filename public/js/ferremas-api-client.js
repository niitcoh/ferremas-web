// public/js/ferremas-api-client.js

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001'; // URL de tu API
let currentPage = 1;
let searchTerm = '';
let sortOption = 'default';
let currentCategoriaId = null;
let currentCategoriaName = '';

// Imagen por defecto si no se encuentra la imagen del producto
const DEFAULT_IMAGE = '/img/placeholder.jpg';

// Función para cargar los productos
async function loadProducts(page = 1, search = '', sort = 'default', categoriaId = null) {
    const productosContainer = document.getElementById('productos-container');
    const loading = document.getElementById('loading');
    const noProducts = document.getElementById('no-products');
    const productsTitle = document.getElementById('products-title');
    
    // Mostrar indicador de carga
    if (productosContainer) productosContainer.innerHTML = '';
    if (loading) loading.classList.remove('d-none');
    if (noProducts) noProducts.classList.add('d-none');
    
    try {
        // Construir URL de la API
        let url;
        if (search) {
            url = `${API_BASE_URL}/productos/buscar?q=${encodeURIComponent(search)}&page=${page}&limit=12`;
        } else if (categoriaId) {
            url = `${API_BASE_URL}/categorias/${categoriaId}/productos?page=${page}&limit=12`;
        } else {
            url = `${API_BASE_URL}/productos?page=${page}&limit=12`;
        }
        
        // Realizar petición a la API
        const response = await fetch(url);
        const data = await response.json();
        
        // Ocultar indicador de carga
        if (loading) loading.classList.add('d-none');
        
        // Verificar si hay productos
        if (data.productos && data.productos.length > 0) {
            // Ordenar productos
            const productosOrdenados = sortProducts(data.productos || data.productos, sort);
            
            // Mostrar productos
            if (productosContainer) {
                productosContainer.innerHTML = '';
                productosOrdenados.forEach(producto => {
                    productosContainer.appendChild(createProductCard(producto));
                });
            }
            
            // Actualizar paginación
            updatePagination(data.pagination);
            
            // Actualizar título si estamos filtrando por categoría
            if (productsTitle && currentCategoriaName) {
                productsTitle.textContent = currentCategoriaName;
            } else if (productsTitle && search) {
                productsTitle.textContent = `Resultados para: "${search}"`;
            } else if (productsTitle) {
                productsTitle.textContent = 'Todos los Productos';
            }
        } else {
            // Mostrar mensaje de no productos
            if (noProducts) noProducts.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        if (loading) loading.classList.add('d-none');
        if (productosContainer) {
            productosContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Error al cargar los productos. Intente nuevamente.</p>
                </div>
            `;
        }
    }
}

// Función para cargar productos por categoría
async function loadProductsByCategoria(categoriaId, page = 1) {
    currentCategoriaId = categoriaId;
    
    try {
        // Primero, obtener el nombre de la categoría
        const categoriaResponse = await fetch(`${API_BASE_URL}/categorias/${categoriaId}`);
        const categoriaData = await categoriaResponse.json();
        
        if (categoriaData && categoriaData.nombre) {
            currentCategoriaName = categoriaData.nombre;
        }
        
        // Luego cargar los productos de esa categoría
        loadProducts(page, '', sortOption, categoriaId);
    } catch (error) {
        console.error('Error al cargar la categoría:', error);
    }
}

// Función para crear la tarjeta de un producto
function createProductCard(producto) {
    // Crear elemento de tarjeta
    const card = document.createElement('div');
    card.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
    
    // Determinar la URL de la imagen
    const imageUrl = `/img/productos/${producto.codigo}.jpg`;
    
    // HTML de la tarjeta
    card.innerHTML = `
        <div class="card h-100 product-card">
            <div class="position-relative">
                <img src="${imageUrl}" class="card-img-top" alt="${producto.nombre}" 
                    style="height: 200px; object-fit: contain;" loading="lazy" 
                    onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
                ${producto.destacado ? '<span class="badge bg-primary position-absolute top-0 start-0 m-2">Destacado</span>' : ''}
                ${producto.nuevo ? '<span class="badge bg-success position-absolute top-0 end-0 m-2">Nuevo</span>' : ''}
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text text-truncate">${producto.descripcion || 'Sin descripción'}</p>
                <div class="mt-auto">
                    ${producto.precio_oferta ? 
                      `<p class="mb-1"><del class="text-muted">$${formatNumber(producto.precio)}</del></p>
                       <p class="text-primary fw-bold fs-5">$${formatNumber(producto.precio_oferta)}</p>` :
                      `<p class="text-primary fw-bold fs-5">$${formatNumber(producto.precio)}</p>`}
                    <div class="d-flex gap-2 mt-2">
                        <a href="/producto/${producto.id}" class="btn btn-outline-primary flex-grow-1">
                            <i class="fas fa-eye me-1"></i>Ver detalles
                        </a>
                        <button class="btn btn-primary flex-grow-1 add-to-cart" data-id="${producto.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar evento al botón de agregar al carrito
    const addButton = card.querySelector('.add-to-cart');
    if (addButton) {
        addButton.addEventListener('click', () => addToCart(producto.id));
    }
    
    return card;
}

// Función para ordenar productos
function sortProducts(productos, sortOption) {
    const productosClone = [...productos];
    
    switch (sortOption) {
        case 'price_asc':
            return productosClone.sort((a, b) => (a.precio_oferta || a.precio) - (b.precio_oferta || b.precio));
        case 'price_desc':
            return productosClone.sort((a, b) => (b.precio_oferta || b.precio) - (a.precio_oferta || a.precio));
        case 'name_asc':
            return productosClone.sort((a, b) => a.nombre.localeCompare(b.nombre));
        case 'name_desc':
            return productosClone.sort((a, b) => b.nombre.localeCompare(a.nombre));
        default:
            return productosClone;
    }
}

// Función para actualizar la paginación
function updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // No mostrar paginación si solo hay una página
    if (!pagination || pagination.totalPages <= 1) return;
    
    // Botón Anterior
    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${pagination.page === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = `<button class="page-link" ${pagination.page === 1 ? 'disabled' : ''}>Anterior</button>`;
    paginationContainer.appendChild(prevButton);
    
    // Páginas
    for (let i = 1; i <= pagination.totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${pagination.page === i ? 'active' : ''}`;
        pageItem.innerHTML = `<button class="page-link">${i}</button>`;
        pageItem.addEventListener('click', () => {
            currentPage = i;
            if (currentCategoriaId) {
                loadProductsByCategoria(currentCategoriaId, i);
            } else {
                loadProducts(i, searchTerm, sortOption);
            }
        });
        paginationContainer.appendChild(pageItem);
    }
    
    // Botón Siguiente
    const nextButton = document.createElement('li');
    nextButton.className = `page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = `<button class="page-link" ${pagination.page === pagination.totalPages ? 'disabled' : ''}>Siguiente</button>`;
    paginationContainer.appendChild(nextButton);
    
    // Eventos para botones anterior y siguiente
    if (pagination.page > 1) {
        prevButton.addEventListener('click', () => {
            currentPage = pagination.page - 1;
            if (currentCategoriaId) {
                loadProductsByCategoria(currentCategoriaId, currentPage);
            } else {
                loadProducts(currentPage, searchTerm, sortOption);
            }
        });
    }
    
    if (pagination.page < pagination.totalPages) {
        nextButton.addEventListener('click', () => {
            currentPage = pagination.page + 1;
            if (currentCategoriaId) {
                loadProductsByCategoria(currentCategoriaId, currentPage);
            } else {
                loadProducts(currentPage, searchTerm, sortOption);
            }
        });
    }
}

// Función para agregar un producto al carrito
function addToCart(productId) {
    // Implementar lógica para agregar al carrito
    console.log(`Producto ${productId} agregado al carrito`);
    
    // Ejemplo: Guardar en localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }
    
    // Guardar carrito actualizado
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mostrar notificación
    alert('Producto agregado al carrito');
    
    // Actualizar contador del carrito (si existe)
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

// Función para formatear números
function formatNumber(number) {
    if (!number) return "0";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

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

// Inicializar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Verificar si estamos en la página de productos
        const productosContainer = document.getElementById('productos-container');
        if (!productosContainer) {
            console.log('No estamos en la página de productos');
            return; // No ejecutar el resto del código si no estamos en la página de productos
        }
        
        // Actualizar título si existe
        const productsTitle = document.getElementById('products-title');
        if (productsTitle) {
            productsTitle.textContent = 'Todos los Productos';
        }
        
        // Cargar categorías
        loadCategories();
        
        // Actualizar contador del carrito
        updateCartCounter();
        
        // Configurar búsqueda
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => {
                searchTerm = searchInput.value.trim();
                currentPage = 1;
                currentCategoriaId = null;
                currentCategoriaName = '';
                loadProducts(currentPage, searchTerm, sortOption);
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    searchTerm = searchInput.value.trim();
                    currentPage = 1;
                    currentCategoriaId = null;
                    currentCategoriaName = '';
                    loadProducts(currentPage, searchTerm, sortOption);
                }
            });
        }
        
        // Configurar ordenamiento
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                sortOption = sortSelect.value;
                if (currentCategoriaId) {
                    loadProductsByCategoria(currentCategoriaId, currentPage);
                } else {
                    loadProducts(currentPage, searchTerm, sortOption);
                }
            });
        }
        
        // Obtener parámetros de URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoriaId = urlParams.get('categoria');
        const q = urlParams.get('q');
        
        if (categoriaId) {
            // Cargar productos por categoría
            currentCategoriaId = categoriaId;
            loadProductsByCategoria(categoriaId, 1);
        } else if (q && searchInput) {
            // Cargar productos por búsqueda
            searchInput.value = q;
            searchTerm = q;
            loadProducts(1, searchTerm, sortOption);
        } else {
            // Cargar todos los productos
            loadProducts();
        }
    } catch (error) {
        console.error('Error al inicializar la página de productos:', error);
    }
});