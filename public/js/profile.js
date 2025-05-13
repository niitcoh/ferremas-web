document.addEventListener('DOMContentLoaded', function() {
  if (!estaAutenticado()) {
    window.location.href = '/login';
    return;
  }
  
  // Cargar datos del usuario
  const usuario = getUsuarioActual();
  
  // Cargar datos personales
  document.getElementById('profile-nombre').value = usuario.nombre || '';
  document.getElementById('profile-apellido').value = usuario.apellido || '';
  document.getElementById('profile-rut').value = usuario.rut || '';
  document.getElementById('profile-email').value = usuario.email || '';
  document.getElementById('profile-telefono').value = usuario.telefono || '';
  
  // Cargar direcciones
  cargarDirecciones();
  
  // Configurar cerrar sesión
  document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    cerrarSesion();
  });
  
  // Configurar formulario de perfil
  document.getElementById('profile-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userData = {
      nombre: document.getElementById('profile-nombre').value,
      apellido: document.getElementById('profile-apellido').value,
      telefono: document.getElementById('profile-telefono').value
    };
    
    try {
      await actualizarPerfil(usuario.id, userData);
      
      const successDiv = document.getElementById('profile-success');
      successDiv.classList.remove('d-none');
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        successDiv.classList.add('d-none');
      }, 3000);
    } catch (error) {
      const errorDiv = document.getElementById('profile-error');
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('d-none');
    }
  });
  
  // Configurar formulario de cambio de contraseña
  document.getElementById('password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
      const errorDiv = document.getElementById('password-error');
      errorDiv.textContent = 'Las contraseñas no coinciden';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/usuarios/${usuario.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña');
      }
      
      // Limpiar campos
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-password').value = '';
      
      // Mostrar mensaje de éxito
      const successDiv = document.getElementById('password-success');
      successDiv.classList.remove('d-none');
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        successDiv.classList.add('d-none');
      }, 3000);
    } catch (error) {
      const errorDiv = document.getElementById('password-error');
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('d-none');
    }
  });
  
  // Configurar modal de direcciones
  const addressModal = new bootstrap.Modal(document.getElementById('address-modal'));
  
  // Botón para agregar dirección
  document.getElementById('add-address-btn').addEventListener('click', function() {
    // Limpiar formulario
    document.getElementById('address-form').reset();
    document.getElementById('address-id').value = '';
    document.getElementById('address-modal-title').textContent = 'Agregar dirección';
    
    // Mostrar modal
    addressModal.show();
  });
  
  // Guardar dirección
  document.getElementById('save-address-btn').addEventListener('click', async function() {
    const addressId = document.getElementById('address-id').value;
    const isNewAddress = !addressId;
    
    const addressData = {
      usuario_id: usuario.id,
      direccion: document.getElementById('address-direccion').value,
      comuna: document.getElementById('address-comuna').value,
      ciudad: document.getElementById('address-ciudad').value,
      region: document.getElementById('address-region').value,
      codigo_postal: document.getElementById('address-codigo-postal').value,
      telefono: document.getElementById('address-telefono').value,
      instrucciones: document.getElementById('address-instrucciones').value,
      predeterminada: document.getElementById('address-predeterminada').checked
    };
    
    try {
      const token = localStorage.getItem('authToken');
      
      let response;
      
      if (isNewAddress) {
        // Crear nueva dirección
        response = await fetch(`${API_URL}/direcciones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addressData)
        });
      } else {
        // Actualizar dirección existente
        response = await fetch(`${API_URL}/direcciones/${addressId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addressData)
        });
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar dirección');
      }
      
      // Cerrar modal
      addressModal.hide();
      
      // Recargar direcciones
      cargarDirecciones();
    } catch (error) {
      const errorDiv = document.getElementById('address-modal-error');
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('d-none');
    }
  });
});

// Función para cargar direcciones del usuario
async function cargarDirecciones() {
  try {
    const usuario = getUsuarioActual();
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_URL}/direcciones/usuario/${usuario.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const direcciones = await response.json();
    
    const container = document.getElementById('address-container');
    const noAddresses = document.getElementById('no-addresses');
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    if (direcciones.length === 0) {
      noAddresses.classList.remove('d-none');
      return;
    }
    
    noAddresses.classList.add('d-none');
    
    // Mostrar direcciones
    direcciones.forEach(direccion => {
      const col = document.createElement('div');
      col.className = 'col-md-6 mb-3';
      
      const card = document.createElement('div');
      card.className = 'card h-100';
      if (direccion.predeterminada) {
        card.classList.add('border-primary');
      }
      
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      
      // Insignia de predeterminada
      if (direccion.predeterminada) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-primary float-end';
        badge.textContent = 'Predeterminada';
        cardBody.appendChild(badge);
      }
      
      // Contenido de la dirección
      const content = document.createElement('div');
      
      // Dirección completa
      const addressLine = document.createElement('p');
      addressLine.className = 'mb-1';
      addressLine.textContent = direccion.direccion;
      content.appendChild(addressLine);
      
      // Comuna, ciudad y región
      const locationLine = document.createElement('p');
      locationLine.className = 'mb-1 text-muted';
      locationLine.textContent = `${direccion.comuna}, ${direccion.ciudad}, ${direccion.region}`;
      content.appendChild(locationLine);
      
      // Código postal
      if (direccion.codigo_postal) {
        const postalCode = document.createElement('p');
        postalCode.className = 'mb-1 text-muted';
        postalCode.textContent = `CP: ${direccion.codigo_postal}`;
        content.appendChild(postalCode);
      }
      
      // Teléfono
      if (direccion.telefono) {
        const phone = document.createElement('p');
        phone.className = 'mb-1';
        phone.textContent = `Tel: ${direccion.telefono}`;
        content.appendChild(phone);
      }
      
      // Instrucciones
      if (direccion.instrucciones) {
        const instructions = document.createElement('p');
        instructions.className = 'mb-1 fst-italic';
        instructions.textContent = direccion.instrucciones;
        content.appendChild(instructions);
      }
      
      cardBody.appendChild(content);
      
      // Botones de acción
      const actions = document.createElement('div');
      actions.className = 'mt-3 d-flex justify-content-end';
      
      // Botón editar
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-sm btn-outline-primary me-2';
      editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
      editBtn.addEventListener('click', () => editarDireccion(direccion));
      actions.appendChild(editBtn);
      
      // Botón eliminar
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-outline-danger';
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
      deleteBtn.addEventListener('click', () => eliminarDireccion(direccion.id));
      actions.appendChild(deleteBtn);
      
      cardBody.appendChild(actions);
      
      card.appendChild(cardBody);
      col.appendChild(card);
      container.appendChild(col);
    });
  } catch (error) {
    console.error('Error al cargar direcciones:', error);
  }
}

// Función para editar dirección
function editarDireccion(direccion) {
  // Llenar formulario con datos de la dirección
  document.getElementById('address-id').value = direccion.id;
  document.getElementById('address-direccion').value = direccion.direccion;
  document.getElementById('address-comuna').value = direccion.comuna;
  document.getElementById('address-ciudad').value = direccion.ciudad;
  document.getElementById('address-region').value = direccion.region;
  document.getElementById('address-codigo-postal').value = direccion.codigo_postal || '';
  document.getElementById('address-telefono').value = direccion.telefono || '';
  document.getElementById('address-instrucciones').value = direccion.instrucciones || '';
  document.getElementById('address-predeterminada').checked = direccion.predeterminada;
  
  // Cambiar título del modal
  document.getElementById('address-modal-title').textContent = 'Editar dirección';
  
  // Mostrar modal
  const addressModal = new bootstrap.Modal(document.getElementById('address-modal'));
  addressModal.show();
}

// Función para eliminar dirección
async function eliminarDireccion(direccionId) {
  if (!confirm('¿Estás seguro de eliminar esta dirección?')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_URL}/direcciones/${direccionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error al eliminar dirección');
    }
    
    // Recargar direcciones
    cargarDirecciones();
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    alert(error.message);
  }
}